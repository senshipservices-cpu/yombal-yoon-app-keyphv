
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Use turborepo to restore the cache when possible
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
];

// Ensure proper handling of font files
config.resolver.assetExts.push('ttf', 'otf', 'woff', 'woff2');

// Increase timeout for asset loading
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Set longer timeout for font files
      if (req.url && (req.url.includes('.ttf') || req.url.includes('.otf'))) {
        res.setTimeout(30000); // 30 seconds
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
