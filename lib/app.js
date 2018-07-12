/*!
 * Copyright(c) ZZIEUT
 * MIT License https://github.com/zzieut/zzieut-dynamodb/blob/master/LICENSE
 */

const DynamoDBAppClass = (() => {
  function DynamoDBApp(options, name, aws) {
    this.aws = aws;
    this.name = name;
    this.options = options; // deep copy needed
  }

  return DynamoDBApp;
})();
