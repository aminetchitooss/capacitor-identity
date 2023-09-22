#!/usr/bin/env node
import chalk from 'chalk';
import gradient from 'gradient-string';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';
import Utils from './utils.js';
import IosHelper from './ios.helper.js';
import AndroidHelper from './android.helper.js';

const allowedArgs = ['--bundleId', '--appName'];

async function start() {
  const spinner = createSpinner('Versioning your apps and cool stuff..').start();

  try {
    let { bundleId, appName } = parseCommandLineArgs();

    if (!appName && !bundleId)
      throw Error(`
    Empty arguments , you have to add at least one argument
    Example:

    npx capacitor-rename ${chalk.bgCyan('--bundleId')} com.test.app ${chalk.bgCyan('--appName')} myApp
    `);

    if (!!bundleId && !Utils.isValidBundleIdentifier(bundleId))
      throw Error('Inavlid Bundle Identifier, try something like this "com.example.app" ');

    await updateBundleIdForIOS(bundleId, appName);
    await updateBundleIdForAndroid(bundleId, appName);

    spinner.success({ text: `You're all set` });
    return bundleId;
  } catch (error) {
    spinner.error({ text: `💀💀💀 Game over, Something clearly went wrong!` });
    console.log(error);
    process.exit(1);
  }
}

function endProcess(version) {
  figlet(`${version}`, (err, data) => {
    console.log(gradient.atlas.multiline(data) + '\n');

    console.log(
      chalk.green(`Coding ain't about knowledge; it's about making the command line look cool
      `)
    );
    process.exit(0);
  });
}

function parseCommandLineArgss() {
  const args = process.argv.slice(2);
  const argsDict = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      const [key, value] = arg.includes('=') ? arg.split('=') : [arg, args[i + 1]];

      if (key.startsWith('--')) {
        const argKey = key.slice(2);
        argsDict[argKey] = value || ''; // Use an empty string if no value is provided
      }
    }
  }

  return argsDict;
}
function parseCommandLineArgs() {
  const args = process.argv.slice(2).join('=').split('=').join(' ').split(' ');
  const argsDict = {
    bundleId: '',
    appName: ''
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

  return argsDict;
}

/**********************************************iOS******************************************************* */

/**
 * Updates bundleId for Android
 * @private
 * @param {String} bundleId The new bundleId
 */
async function updateBundleIdForIOS(bundleId, appName) {
  try {
    const elementsToUpdate = [
      {
        pathFilePrefix: 'ios',
        fileName: 'Info.plist',
        functionName: AndroidHelper.get_Updated_BundleId_And_App_Name_iOS_pList_File,
        multi: true
      },
      {
        pathFilePrefix: 'ios',
        fileName: 'project.pbxproj',
        functionName: AndroidHelper.get_Updated_Version_iOS_proj_File_With_New_Version
      }
    ];
    for (const file of elementsToUpdate) {
      const { pathFilePrefix, fileName, functionName } = file;
      const androidFile = await (file.multi ? Utils.findAllFiles : Utils.findFile)(
        pathFilePrefix,
        fileName,
        [],
        async filePath => {
          await Utils.handleChangingFileWithPattern(filePath, bundleId, file.multi ? appName : null, functionName);
        }
      );
      if (!androidFile) throw Error('Make sure you run this command in root folder.\n File name :' + fileName);
    }
  } catch (error) {
    throw error;
  }
}

/**********************************************Android**************************************************** */

/**
 * Updates bundleId for Android
 * @private
 * @param {String} bundleId The new bundleId
 */
async function updateBundleIdForAndroid(bundleId, appName) {
  try {
    const elementsToUpdate = [
      {
        pathFilePrefix: 'android/app',
        fileName: 'build.gradle',
        functionName: IosHelper.replace_BundleId_In_gradle_File
      },
      {
        pathFilePrefix: 'android/app/src/main/res/values',
        fileName: 'strings.xml',
        functionName: IosHelper.replace_BundleId_And_App_Name_In_Strings_File,
        multi: true
      },
      {
        pathFilePrefix: 'android/app/src/main/java/com',
        fileName: 'MainActivity.java',
        functionName: IosHelper.replace_BundleId_In_MainActivity_File
      }
    ];
    for (const file of elementsToUpdate) {
      const { pathFilePrefix, fileName, functionName } = file;
      const androidFile = await Utils.findFile(pathFilePrefix, fileName, null, async filePath => {
        await Utils.handleChangingFileWithPattern(filePath, bundleId, file.multi ? appName : null, functionName);
      });
      if (!androidFile) throw Error('Make sure you run this command in root folder.\n File name :' + fileName);
    }
  } catch (error) {
    throw error;
  }
}

const version = await start();
endProcess(version);
