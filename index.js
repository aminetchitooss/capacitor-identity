#!/usr/bin/env node
import chalk from 'chalk';
import gradient from 'gradient-string';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';
import Utils from './utils.js';
import AndroidHelper from './android.helper.js';
import IosHelper from './ios.helper.js';
let IS_VERBOSE = false;
const allowedArgs = ['--bundleId', '--appName'];

async function start() {
  const spinner = createSpinner('Updating name and id of your apps and cool stuff..').start();

  try {
    let { bundleId, appName, verbose } = Utils.parseCommandLineArgs();
    IS_VERBOSE = verbose;
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
    return bundleId || appName;
  } catch (error) {
    spinner.error({ text: `💀💀💀 Game over, Something clearly went wrong!` });
    console.log(error);
    process.exit(1);
  }
}

function endProcess(data) {
  figlet(`${data}`, (err, data) => {
    console.log(gradient.atlas.multiline(data) + '\n');

    console.log(chalk.green(`Coding ain't about knowledge; it's about tchitos making the command line look cool`));
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
        functionName: IosHelper.replace_BundleId_And_App_Name,
        multi: true
      },
      {
        pathFilePrefix: 'ios',
        fileName: 'project.pbxproj',
        functionName: IosHelper.replace_Bundle_identifier
      }
    ];
    for (const file of elementsToUpdate) {
      const { pathFilePrefix, fileName, functionName } = file;
      const androidFile = await (file.multi ? Utils.findAllFiles : Utils.findFile)(
        pathFilePrefix,
        fileName,
        [],
        async filePath => {
          await Utils.handleChangingFileWithPattern(
            filePath,
            bundleId,
            file.multi ? appName : null,
            functionName,
            IS_VERBOSE
          );
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
        functionName: AndroidHelper.replace_BundleId_In_gradle_File
      },
      {
        pathFilePrefix: 'android/app/src/main/res/values',
        fileName: 'strings.xml',
        functionName: AndroidHelper.replace_BundleId_And_App_Name,
        multi: true
      },
      {
        pathFilePrefix: 'android/app/src/main/java/com',
        fileName: 'MainActivity.java',
        functionName: AndroidHelper.replace_BundleId_In_MainActivity_File
      }
    ];
    for (const file of elementsToUpdate) {
      const { pathFilePrefix, fileName, functionName } = file;
      const androidFile = await Utils.findFile(pathFilePrefix, fileName, null, async filePath => {
        await Utils.handleChangingFileWithPattern(
          filePath,
          bundleId,
          file.multi ? appName : null,
          functionName,
          IS_VERBOSE
        );
      });
      if (!androidFile) throw Error('Make sure you run this command in root folder.\n File name :' + fileName);
    }
  } catch (error) {
    throw error;
  }
}

const result = await start();
endProcess(result);
