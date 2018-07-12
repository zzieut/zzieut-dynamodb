
function copy(src) {
  if (!(src instanceof Object)) {
    return src;
  }

  let dist;
  switch (src.constructor) {
    case Date:
    {
      dist = new Date(src.getTime());
      break;
    }
    case Function:
    {
      dist = src;
      break;
    }
    default:
    {
      dist = new src.constructor();
      Object.keys(src).forEach((key) => {
        dist[key] = copy(src[key]);
      });
    }
  }
  return dist;
}

/**
 * return deeply copied value
 * @param value
 * @returns {*}
 */
function deepCopy(value) {
  return copy(value);
}

exports.deepCopy = deepCopy;
