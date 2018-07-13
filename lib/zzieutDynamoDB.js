/**
 * Copyright(c) ZZIEUT
 * MIT License https://github.com/zzieut/zzieut-dynamodb/blob/master/LICENSE
 */

const AWS = require('aws-sdk');
const config = require('./config');

const dynamoDB = new AWS.DynamoDB();

function sdk() {
  return dynamoDB;
}

module.exports = {
  config,
  sdk,
};
