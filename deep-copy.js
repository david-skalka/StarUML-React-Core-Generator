function _deepCopy(input, maxDepth, depth, excl) {
    if (maxDepth === undefined) {
      maxDepth = 5;
    }
    if (depth === undefined) {
      depth = 0;
    }
  
    if (depth > maxDepth) {
      return null;
    }
  
    // Handle the 3 simple types, and null or undefined
    if (input === null || input === undefined || typeof input !== "object") {
      return input;
    }
  
    // Date
    if (input instanceof Date) {
      var dateCopy = new Date();
      dateCopy.setTime(input.getTime());
      return dateCopy;
    }
  
    // Array
    if (input instanceof Array) {
      var arrayCopy = [];
      for (var i = 0, len = input.length; i < len; i++) {
        arrayCopy[i] = _deepCopy(input[i], maxDepth, depth + 1, excl);
      }
      return arrayCopy;
    }
    // Object
    if (input instanceof Object) {
      var newObj = {};
      for (var prop in input) {
  
        if (excl.includes(prop)) {
          continue;
        }
  
        if (input.hasOwnProperty(prop)) newObj[prop] = _deepCopy(input[prop], maxDepth, depth + 1, excl);
      }
      return newObj;
    }
  }

module.exports = _deepCopy;