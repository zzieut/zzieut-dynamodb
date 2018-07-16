/**
 * Copyright(c) ZZIEUT
 * MIT License https://github.com/zzieut/zzieut-dynamodb/blob/master/LICENSE
 */

/**
 * @param {Object} scanParams
 * @param {string} scanParams.TableName
 * @param {Object.<string, *>} scanParams.Conditions
 * @param {string|string[]} scanParams.WantsToGet
 * @param {Object} scanParams.Evaluators
 * @param {number} numThread
 * @param {Function} callback
 */

const scanAll = require('./scanAll');

function executor(scanParams, numThread, callback) {
  const converter = this.Converter;

  let conditions = [];
  if (scanParams && scanParams.Conditions) {
    conditions = Object.keys(scanParams.Conditions);
  }

  let evals = [];
  if (scanParams && scanParams.Evaluators) {
    evals = Object.keys(scanParams.Evaluators);
  }

  let wants = [];
  if (scanParams && scanParams.WantsToGet) {
    wants = wants.concat(scanParams.WantsToGet);
  }

  const promise = new Promise((resolve, reject) => {
    const params = {
      TableName: scanParams.TableName,
    };

    if (conditions.length > 0) {
      params.ExpressionAttributeNames = {};
      params.ExpressionAttributeValues = {};
      params.FilterExpression = conditions.map((attr, index) => {
        params.ExpressionAttributeNames[`#${index}`] = attr;
        params.ExpressionAttributeValues[`:${index}`] = converter.input(scanParams.Conditions[attr]);
        return `#${index} = :${index}`;
      }).join(' AND ');
    }

    const proj = {};
    wants.forEach((a) => {
      proj[a] = true;
    });
    evals.forEach((a) => {
      proj[a] = true;
    });

    if (wants.length > 0) {
      params.ProjectionExpression = Object.keys(proj).join(', ');
    }

    scanAll.call(this, params, numThread, (err, data) => {
      if (err) {
        reject(err);
      } else if (data.Count > 0 && data.Items) {
        const items = data.Items.map(i => converter.unmarshall(i));
        const evaluated = items.filter((item) => {
          for (let i = 0; i < evals.length; i += 1) {
            const key = evals[i];
            if (scanParams.Evaluators[key](item[key]) === false) {
              return false;
            }
          }
          return true;
        });
        if (wants.length > 0) {
          const projection = evaluated.map((item) => {
            const obj = {};
            wants.forEach((want) => {
              obj[want] = item[want];
            });
            const keys = Object.keys(obj);
            if (keys.length === 1) {
              return obj[keys[0]];
            }
            return obj;
          });
          resolve(projection);
        } else {
          resolve(evaluated);
        }
      } else {
        resolve([]);
      }
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
