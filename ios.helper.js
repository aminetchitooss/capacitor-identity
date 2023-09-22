const IosHelper = {
  replace_BundleId_In_gradle_File: function (gradleFile, bundleId) {
    if (!bundleId) return gradleFile;
    gradleFile = gradleFile.replace(/namespace (["'])(.*)["']/, 'namespace $1' + bundleId + '$1');
    gradleFile = gradleFile.replace(/applicationId (["'])(.*)["']/, 'applicationId $1' + bundleId + '$1');
    return gradleFile;
  },

  replace_BundleId_In_MainActivity_File: function (mainActivityFile, bundleId) {
    if (!bundleId) return mainActivityFile;
    mainActivityFile = mainActivityFile.replace(/package (.*?);/, () => {
      return `package ${bundleId};`;
    });
    return mainActivityFile;
  },

  replace_BundleId_And_App_Name_In_Strings_File: function (stringsFile, bundleId, appName) {
    if (bundleId) {
      stringsFile = stringsFile.replace(/<string name="package_name">.*?<\/string>/, () => {
        return `<string name="package_name">${bundleId}<\/string>`;
      });

      stringsFile = stringsFile.replace(/<string name="custom_url_scheme">.*?<\/string>/, () => {
        return `<string name="custom_url_scheme">${bundleId}<\/string>`;
      });
    }
    if (appName) {
      stringsFile = stringsFile.replace(/<string name="app_name">.*?<\/string>/, () => {
        return `<string name="app_name">${appName}<\/string>`;
      });

      stringsFile = stringsFile.replace(/<string name="title_activity_main">.*?<\/string>/, () => {
        return `<string name="title_activity_main">${appName}<\/string>`;
      });
    }

    return stringsFile;
  }
};

export default IosHelper;
