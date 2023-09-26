const IosHelper = {
  replace_BundleId_And_App_Name: function (iosFile, bundleId, appName) {
    if (bundleId)
      iosFile = iosFile.replace(/<key>CFBundleIdentifier<\/key>\s*<string>.*?<\/string>/, function (match) {
        const updatedContent = match.replace(/<string>(.*?)<\/string>/, () => {
          return `<string>${bundleId}<\/string>`;
        });
        return updatedContent;
      });
    if (appName)
      iosFile = iosFile.replace(/<key>CFBundleDisplayName<\/key>\s*<string>.*?<\/string>/, function (match) {
        const updatedContent = match.replace(/<string>(.*?)<\/string>/, () => {
          return `<string>${appName}<\/string>`;
        });
        return updatedContent;
      });

    return iosFile;
  },
  replace_Bundle_identifier: function (iosFile, bundleId) {
    if (!bundleId) return iosFile;

    iosFile = iosFile.replace(/PRODUCT_BUNDLE_IDENTIFIER = (.*?);/, () => {
      return `PRODUCT_BUNDLE_IDENTIFIER = ${bundleId};`;
    });

    return iosFile;
  }
};

export default IosHelper;
