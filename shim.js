// Simple shim for React Native
// No complex polyfills needed since we're not using Privy anymore

import 'react-native-get-random-values';
import '@ethersproject/shims';
import 'react-native-url-polyfill/auto';

if (typeof __dirname === 'undefined') global.__dirname = '/';
if (typeof __filename === 'undefined') global.__filename = '';

// Global process object for ethers.js
if (typeof global.process === 'undefined') {
  global.process = require('process');
}

global.process.browser = false;
global.process.env = global.process.env || {};
global.process.env.NODE_ENV = __DEV__ ? 'development' : 'production';
