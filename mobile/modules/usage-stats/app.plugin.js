const { AndroidConfig, withAndroidManifest } = require('expo/config-plugins');
module.exports = function withUsageStats(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    AndroidConfig.Permissions.addPermission(manifest, 'android.permission.PACKAGE_USAGE_STATS');
    return cfg;
  });
};
