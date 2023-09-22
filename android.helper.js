const AndroidHelper = {
  get_Updated_BundleId_And_App_Name_iOS_pList_File: function (iosFile, bundleId, appName) {
    if (bundleId)
      iosFile = iosFile.replace(/<key>CFBundleIdentifier<\/key>\s*<string>.*?<\/string>/, function (match, cg1) {
        const versionUpdatedContent = match.replace(/<string>(.*?)<\/string>/, (_, capturedValue) => {
          return `<string>${bundleId}<\/string>`;
        });
        return versionUpdatedContent;
      });
    if (appName)
      iosFile = iosFile.replace(/<key>CFBundleDisplayName<\/key>\s*<string>.*?<\/string>/, function (match, cg1) {
        const versionUpdatedContent = match.replace(/<string>(.*?)<\/string>/, (_, capturedValue) => {
          return `<string>${appName}<\/string>`;
        });
        return versionUpdatedContent;
      });

    return iosFile;
  },
  get_Updated_Version_iOS_proj_File_With_New_Version: function (iosFile, bundleId) {
    if (!bundleId) return iosFile;

    iosFile = iosFile.replace(/PRODUCT_BUNDLE_IDENTIFIER = (.*?);/, (_, capturedValue) => {
      return `PRODUCT_BUNDLE_IDENTIFIER = ${bundleId};`;
    });

    return iosFile;
  }
};

export default AndroidHelper;
