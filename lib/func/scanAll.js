/**
 * Copyright(c) ZZIEUT
 * MIT License https://github.com/zzieut/zzieut-dynamodb/blob/master/LICENSE
 */

function executor(scanParams, numThread, callback) {
  const dynamoDB = this.DynamoDB;

  const cNumThread = (typeof numThread !== 'number' || Number.isNaN(numThread) || numThread < 1) ? 1 : Math.floor(numThread);

  const result = {};

  const scan = (param, segment, repeated) => new Promise((resolve, reject) => {
    dynamoDB.scan(param, (err, data) => {
      if (err) {
        reject(err);
      } else {
        result[`${segment}-${repeated}`] = data;
        resolve(data);
      }
    });
  });

  const repeat = (param, segment, repeated) => scan(param, segment, repeated)
    .then((data) => {
      if (data.LastEvaluatedKey) {
        return repeat({
          ...param,
          ExclusiveStartKey: data.LastEvaluatedKey,
        }, segment, repeated + 1);
      }
      return data;
    });

  const promise = new Promise((resolve, reject) => {
    const segments = [];
    for (let i = 0; i < cNumThread; i += 1) {
      const segParams = {
        ...scanParams,
        TotalSegments: cNumThread,
        Segment: i,
      };
      segments.push(repeat(segParams, i, 0));
    }
    Promise.all(segments).then(() => {
      const keys = Object.keys(result);
      const sum = {
        Count: 0,
        ScannedCount: 0,
      };
      sum.Items = [].concat(...keys.map((key) => {
        sum.Count += result[key].Count;
        sum.ScannedCount += result[key].ScannedCount;
        return result[key].Items;
      }));
      resolve(sum);
    }).catch((reason) => {
      reject(reason);
    });
  });

  if (typeof callback === 'function') {
    return new Promise((resolve, reject) => {
      promise.then((value) => {
        callback(null, value);
        resolve(value);
      }).catch((reason) => {
        callback(reason);
        reject(reason);
      });
    });
  }
  return promise;
}

module.exports = executor;
