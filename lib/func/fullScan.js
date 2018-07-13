/**
 * Copyright(c) ZZIEUT
 * MIT License https://github.com/zzieut/zzieut-dynamodb/blob/master/LICENSE
 */

function executor(scanParams, callback) {
  const dynamoDB = this.DynamoDB;

  const scan = param => new Promise((resolve, reject) => {
    dynamoDB.scan(param, (err, data) => {
      if (err) {
        reject(err);
      } else if (data.LastEvaluatedKey) {
        scan({
          ...param,
          ExclusiveStartKey: data.LastEvaluatedKey,
        }).then((value) => {
          resolve({
            Items: data.Items.concat(value.Items || []),
            Count: data.Count + value.Count,
            ScannedCount: data.ScannedCount + value.ScannedCount,
          });
        }).catch((reason) => {
          reject(reason);
        });
      } else {
        resolve(data);
      }
    });
  });

  const promise = scan(scanParams);

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
  } return promise;
}

module.exports = executor;
