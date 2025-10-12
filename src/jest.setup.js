import '@testing-library/jest-dom';

// Add missing globals for Node environment
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

// Mock the global requestAnimationFrame for testing
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
};
