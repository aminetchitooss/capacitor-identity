#!/usr/bin/env node
import chalk from 'chalk';
import gradient from 'gradient-string';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';
import Utils from './utils.js';

const allowedArgs = ['-n', '--name'];

async function start() {
  const spinner = createSpinner('Versioning your apps and cool stuff..').start();

  try {
    const [, , bundleId, appName] = process.argv;
    console.log('%cindex.js line:22 process.argv', 'color: #007acc;', process.argv);
    if (!Utils.isValidBundleIdentifier(bundleId))
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
        functionName: get_Updated_BundleId_And_App_Name_iOS_pList_File,
        multi: true
      },
      {
        pathFilePrefix: 'ios',
        fileName: 'project.pbxproj',
        functionName: get_Updated_Version_iOS_proj_File_With_New_Version
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

function get_Updated_BundleId_And_App_Name_iOS_pList_File(iosFile, bundleId, appName) {
  iosFile = iosFile.replace(/<key>CFBundleIdentifier<\/key>\s*<string>.*?<\/string>/, function (match, cg1) {
    const versionUpdatedContent = match.replace(/<string>(.*?)<\/string>/, (_, capturedValue) => {
      return `<string>${bundleId}<\/string>`;
    });
    return versionUpdatedContent;
  });
  iosFile = iosFile.replace(/<key>CFBundleDisplayName<\/key>\s*<string>.*?<\/string>/, function (match, cg1) {
    const versionUpdatedContent = match.replace(/<string>(.*?)<\/string>/, (_, capturedValue) => {
      return `<string>${appName}<\/string>`;
    });
    return versionUpdatedContent;
  });

  return iosFile;
}

function get_Updated_Version_iOS_proj_File_With_New_Version(iosFile, bundleId) {
  iosFile = iosFile.replace(/PRODUCT_BUNDLE_IDENTIFIER = (.*?);/, (_, capturedValue) => {
    return `PRODUCT_BUNDLE_IDENTIFIER = ${bundleId};`;
  });

  return iosFile;
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
        functionName: replace_BundleId_In_gradle_File
      },
      {
        pathFilePrefix: 'android/app/src/main/res/values',
        fileName: 'strings.xml',
        functionName: replace_BundleId_And_App_Name_In_Strings_File,
        multi: true
      },
      {
        pathFilePrefix: 'android/app/src/main/java/com',
        fileName: 'MainActivity.java',
        functionName: replace_BundleId_In_MainActivity_File
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

function replace_BundleId_In_gradle_File(gradleFile, bundleId) {
  gradleFile = gradleFile.replace(/namespace (["'])(.*)["']/, 'namespace $1' + bundleId + '$1');
  gradleFile = gradleFile.replace(/applicationId (["'])(.*)["']/, 'applicationId $1' + bundleId + '$1');
  return gradleFile;
}

function replace_BundleId_In_MainActivity_File(mainActivityFile, bundleId) {
  mainActivityFile = mainActivityFile.replace(/package (.*?);/, () => {
    return `package ${bundleId};`;
  });
  return mainActivityFile;
}

function replace_BundleId_And_App_Name_In_Strings_File(stringsFile, bundleId, appName) {
  stringsFile = stringsFile.replace(/<string name="package_name">.*?<\/string>/, () => {
    return `<string name="package_name">${bundleId}<\/string>`;
  });

  stringsFile = stringsFile.replace(/<string name="custom_url_scheme">.*?<\/string>/, () => {
    return `<string name="custom_url_scheme">${bundleId}<\/string>`;
  });

  stringsFile = stringsFile.replace(/<string name="app_name">.*?<\/string>/, () => {
    return `<string name="app_name">${appName}<\/string>`;
  });

  stringsFile = stringsFile.replace(/<string name="title_activity_main">.*?<\/string>/, () => {
    return `<string name="title_activity_main">${appName}<\/string>`;
  });

  return stringsFile;
}

const version = await start();
endProcess(version);
