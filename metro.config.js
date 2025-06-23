const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    alias: {
      '@babel/runtime': '@babel/runtime-corejs3',
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
