import { writeFile, stat, readdir, readFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

const warningList = ['capacitor.config.ts', 'build.gradle', 'strings.xml', 'Info.plist', 'project.pbxproj'];
const excludedFolders = ['Pod', 'capacitor-cordova-ios-plugins', 'DerivedData'];

const Utils = {
  isValidBundleIdentifier: function (bundleIdentifier) {
    const iOSBundleRegex = /^(?=.{1,255}$)[a-z\d]+(-[a-z\d]+)*(\.[a-z\d]+(-[a-z\d]+)*)+$/i;
    return iOSBundleRegex.test(bundleIdentifier);
  },
  /**
   * Returns if the file was found
   * @private
   * @return {Boolean} true if file found
   */
  findFile: async function (startDir, fileName, _, cb) {
    const files = await readdir(startDir);

    for (const file of files.filter(d => !excludedFolders.some(f => d.indexOf(f) > -1))) {
      const filePath = join(startDir, file);
      const isDirectory = (await stat(filePath)).isDirectory();

      if (isDirectory) {
        const foundFile = await Utils.findFile(filePath, fileName, _, cb);
        if (foundFile) return foundFile;
      } else if (file === fileName) {
        await cb(filePath);
        return true;
      }
    }

    return false;
  },

  findAllFiles: async function (startDir, fileName, results, cb) {
    if (!results) results = [];
    const files = await readdir(startDir);

    for (const file of files.filter(d => !excludedFolders.some(f => d.indexOf(f) > -1))) {
      const filePath = join(startDir, file);
      const isDirectory = (await stat(filePath)).isDirectory();

      if (isDirectory) {
        await Utils.findAllFiles(filePath, fileName, results, cb);
      } else if (file === fileName) {
        await cb(filePath);
        results.push(filePath);
      }
    }

    return results;
  },

  replaceDataFile: async function (filePath, newData, oldData, IS_VERBOSE) {
    try {
      if (oldData == newData) {
        if (!IS_VERBOSE) return;
        warningList.forEach(element => {
          if (filePath.indexOf(element) > -1)
            return console.log(
              `\n\n - ${chalk.bgRgb(255, 165, 0)(filePath.split('/')[0].toUpperCase())} ${chalk.yellowBright(
                chalk.underline(filePath)
              )} has not been updated\n`
            );
        });
      }
      await writeFile(filePath, newData, 'utf8');
    } catch (error) {
      throw error;
    }
  },

  handleChangingFileWithPattern: async function (filePath, bundleId, appName, functionName, IS_VERBOSE) {
    const fileData = await readFile(filePath, 'utf8');
    const updatedContent = appName ? functionName(fileData, bundleId, appName) : functionName(fileData, bundleId);
    await Utils.replaceDataFile(filePath, updatedContent, fileData, IS_VERBOSE);
  },

  parseCommandLineArgs: function () {
    const args = process.argv.slice(2).join('=').split('=').join(' ').split(' ');
    const verbose = args.some(a => a == '--verbose');
    const argsDict = {
      bundleId: '',
      appName: '',
      verbose: false
    };

    let currentKey;

    for (const arg of args) {
      if (arg.startsWith('--')) {
        // If the argument starts with '--', it's a key
        currentKey = arg.slice(2);
        argsDict[currentKey] = null; // Initialize with null value
      } else if (currentKey !== null) {
        // If we have a current key, set its value
        argsDict[currentKey] = arg;
        currentKey = null; // Reset the current key
      }
    }
    argsDict.verbose = argsDict.verbose?.toString() != 'false' ? verbose : false;
    return argsDict;
  }
};

export default Utils;
