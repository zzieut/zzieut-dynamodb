/*!
 * Copyright(c) ZZIEUT
 * MIT License https://github.com/zzieut/zzieut-dynamodb/blob/master/LICENSE
 */

const AWS = require('aws-sdk');
const util = require('../util');
const func = require('./func');

const DynamoDBAppClass = (() => {
  function DynamoDBApp(options, name, namespace) {
    this.namespace = namespace;
    this.name = name;
    const oldConfig = util.deepCopy(AWS.config);
    AWS.config.update(options);
    this.options = util.deepCopy(AWS.config);
    this.Converter = AWS.DynamoDB.Converter;
    this.DynamoDB = new AWS.DynamoDB();
    this.DocumentClient = new AWS.DynamoDB.DocumentClient();
    AWS.config.update(oldConfig);
  }

  Object.keys(func).forEach((name) => {
    DynamoDBApp.prototype[name] = function f(...arg) {
      return func[name].call(this, ...arg);
    };
  });

  return DynamoDBApp;
})();

function createNamespace() {
  const apps = {};
  const namespace = {};

  function removeApp(name) {
    const targetApp = namespace.app(name);
    if (targetApp) {
      // delete operation
    }
    delete apps[name];
  }
  /**
   * Get the App object for a given name
   * @param {string} name
   * @returns {DynamoDBAppClass}
   */
  function app(name) {
    if (!util.hasProperty(apps, name)) {
      return null;
    }
    return apps[name];
  }

  /**
   * create new aws dynamodb object
   * @param {{}} options
   * @param {string} name
   * @returns {DynamoDBAppClass}
   */
  function initializeApp(options, name) {
    if (name === undefined || typeof name !== 'string' || name === '') {
      return null;
    }
    if (util.hasProperty(apps, name)) {
      removeApp(name);
    }
    const newApp = new DynamoDBAppClass(options, name, namespace);
    apps[name] = newApp;
    return newApp;
  }

  namespace.app = app;
  namespace.initializeApp = initializeApp;

  return namespace;
}

module.exports = createNamespace;
