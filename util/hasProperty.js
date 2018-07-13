/**
 * Copyright(c) ZZIEUT
 * MIT License https://github.com/zzieut/zzieut-dynamodb/blob/master/LICENSE
 */

/**
 * Object hasOwnProperty
 * @param {*} obj
 * @param {string} key
 * @returns {boolean}
 */
function hasProperty(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

module.exports = hasProperty;
