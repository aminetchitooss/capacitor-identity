#!/usr/bin/env node
import chalk from 'chalk';
import gradient from 'gradient-string';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';
import { readFile } from 'fs/promises';
import Utils from './utils.js';

const allowedArgs = ['-n', '--name'];

async function start() {
  try {
    const [, , bundleId] = process.argv;
    console.log('%cindex.js line:22 process.argv', 'color: #007acc;', process.argv);
    if (!Utils.isValidBundleIdentifier(bundleId))
      throw Error('Inavlid Bundle Identifier, try something like this "com.example.app" ');

    await updateBundleIdForAndroid(bundleId);

    console.log(`${bundleId} => good!`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

/**
 * Updates bundleId for Android
 * @private
 * @param {String} bundleId The new bundleId
 */
async function updateBundleIdForAndroid(bundleId) {
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
        functionName: replace_BundleId_In_Strings_File
      },
      {
        pathFilePrefix: 'android/app/src/main/java/com',
        fileName: 'MainActivity.java',
        functionName: replace_BundleId_In_MainActivity_File
      }
    ];
    for (const file of elementsToUpdate) {
      const { pathFilePrefix, fileName, functionName } = file;
      const androidFile = await Utils.findFile(pathFilePrefix, fileName, async filePath => {
        await Utils.handleChangingFileWithPattern(filePath, bundleId, functionName);
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

function replace_BundleId_In_Strings_File(stringsFile, bundleId) {
  stringsFile = stringsFile.replace(/<string name="package_name">.*?<\/string>/, () => {
    return `<string name="package_name">${bundleId}<\/string>`;
  });

  stringsFile = stringsFile.replace(/<string name="custom_url_scheme">.*?<\/string>/, () => {
    return `<string name="custom_url_scheme">${bundleId}<\/string>`;
  });

  return stringsFile;
}

await start();
process.exit(0);
