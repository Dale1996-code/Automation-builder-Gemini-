// vite-env-shim.js
const { Module } = require('module');

// Override module require/compile to strip import.meta.env
const originalCompile = Module.prototype._compile;

Module.prototype._compile = function(content, filename) {
  let transformedContent = content;
  if (content.includes('import.meta.env')) {
    transformedContent = content.replace(/import\.meta\.env\.VITE_GEMINI_API_KEY/g, "'test-key'");
  }
  return originalCompile.call(this, transformedContent, filename);
};
