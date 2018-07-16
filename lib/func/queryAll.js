/**
 * Copyright(c) ZZIEUT
 * MIT License https://github.com/zzieut/zzieut-dynamodb/blob/master/LICENSE
 */

function executor(queryParams, callback) {
  const dynamoDB = this.DynamoDB;

  const result = {};

  const query = (param, repeated) => new Promise((resolve, reject) => {
    dynamoDB.query(param, (err, data) => {
      if (err) {
        reject(err);
      } else {
        result[`r${repeated}`] = data;
        resolve(data);
      }
    });
  });

  const repeat = (param, repeated) => query(param, repeated)
    .then((data) => {
      if (data.LastEvaluatedKey) {
        return repeat({
          ...param,
          ExclusiveStartKey: data.LastEvaluatedKey,
        }, repeated + 1);
      }
      return data;
    });

  const promise = new Promise((resolve, reject) => {
    repeat(queryParams, 0).then(() => {
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
