import redis from 'redis';
import readlineSync from 'readline-sync';
import chalk from 'chalk';

const redisFuntion = {
  SET: 0,
  GET: 1,
  GET_ALL: 2,
  DELETE: 3,
  SET_HASH: 4,
  GET_HASH: 5,
  INC_HASH: 6,
  DEL_HASH: 7,
  ADD_LIST: 8,
  GET_LIST: 9,
  ASK_NAME: 10,
}

const getKey = (obj, val) => Object.keys(obj).find(key => obj[key] === val);

const askName = () => {
  let input = readlineSync.question('May I have your name? ');
  console.log(`Hi ${input}!`);
}

const isNumeric = num => (typeof (num) === 'number' || typeof (num) === "string" && num.trim() !== '') && !isNaN(num);

const client = redis.createClient({
  socket: {
    host: 'redis-15531.c296.ap-southeast-2-1.ec2.cloud.redislabs.com',
    port: 15531
  },
  password: 'LQoFNbT7CYmJiBwORKuPXiiC6wwfvS4Q'
});

client.on('error', err => {
  console.log(chalk.redBright.bgWhite.bold('Error ' + err));
});

const redisGet = async () => {
  const inputGetKey = readlineSync.question(chalk.magentaBright('Key: '));
  await client.connect();
  const value = await client.get(inputGetKey);

  if (!value) {
    console.log(chalk.redBright.bgWhite.bold(` No value for key: ' ${inputGetKey} `));
  } else {
    console.log(chalk.cyanBright(`Value of key ${inputGetKey}: ${value}`));
  }

  await client.quit();
}

const redisGetAll = async () => {
  await client.connect();
  const value = await client.keys("*");
  console.log(chalk.cyanBright(`List of keys: ${value.join("\n")}`));
  await client.quit();
}

const redisSet = async () => {
  const inputSetKey = readlineSync.question(chalk.magentaBright('Key: '));
  const inputSetValue = readlineSync.question(chalk.magentaBright('Value: '));

  await client.connect();
  await client.set(inputSetKey, inputSetValue);
  console.log(chalk.cyanBright(`Recorded to redis with key: ${inputSetKey} - value: ${inputSetValue}`));
  await client.quit();
}

const redisDelete = async () => {
  const inputDelKey = readlineSync.question(chalk.magentaBright('Key: '));
  await client.connect();
  let result = await client.del(inputDelKey);

  if (result === 0) {
    console.log(chalk.redBright.bgWhite.bold(` Key ' ${inputDelKey} not exist `));
  } else {
    console.log(chalk.cyanBright(`Deleted record for key: ${inputDelKey}`));
  }

  await client.quit();
}

const redisSetHash = async () => {
  const inputHashKey = readlineSync.question(chalk.magentaBright('Hash key: '));

  console.log(chalk.cyanBright('Set field/value: s - End: e'));
  let fieldValue = {};
  readlineSync.promptCLLoop({
    s: () => {
      const inputHashFieldKey = readlineSync.question(chalk.magentaBright('Hash field key: '));
      const inputHashValue = readlineSync.question(chalk.magentaBright('Hash value: '));
      fieldValue[`${inputHashFieldKey}`] = inputHashValue;
    },
    e: () => true
  });

  console.log(fieldValue);
  await client.connect();
  await client.hSet(inputHashKey, fieldValue);

  console.log(chalk.cyanBright(`Recorded new hash with key: ${inputHashKey}`));

  await client.quit();
}

const redisGetHash = async () => {
  const inputHashGetKey = readlineSync.question(chalk.magentaBright('Hash key: '));
  await client.connect();
  let value = await client.hGetAll(inputHashGetKey);

  if (Object.entries(value).length === 0) {
    console.log(chalk.redBright.bgWhite.bold(` No value for key: ' ${inputHashGetKey} `));
  } else {
    console.log(chalk.cyanBright(`Value of key ${inputHashGetKey}: ${JSON.stringify(value)}`));
  }

  await client.quit();
}

const redisIncrementHash = async () => {
  try {
    const inputHashGetKey = readlineSync.question(chalk.magentaBright('Hash key: '));
    const inputHashGetField = readlineSync.question(chalk.magentaBright('Hash field: '));
    const increment = readlineSync.questionInt(chalk.magentaBright('Increment by: '));
  
    await client.connect();
    let valueExist = await client.hExists(inputHashGetKey, inputHashGetField);
    if (!valueExist) {
      console.log(chalk.redBright.bgWhite.bold('Record not exist'));
      await client.quit();
      return;
    }

    var newValue = await client.hIncrBy(inputHashGetKey, inputHashGetField, increment);
    console.log(chalk.cyanBright(`New value: ${JSON.stringify(newValue)}`));
    await client.quit();
  } catch (error) {
    console.log(chalk.redBright.bgWhite.bold(`${error}`));
    await client.quit();
  }
}

const redisDelHash = async () => {
  const inputHashDelKey = readlineSync.question(chalk.magentaBright('Hash key: '));
  const inputHashDelField = readlineSync.question(chalk.magentaBright('Hash field: '));

  try {
    await client.connect();
    let valueExist = await client.hExists(inputHashDelKey, inputHashDelField);
    if (!valueExist) {
      console.log(chalk.redBright.bgWhite.bold('Record not exist'));
      await client.quit();
      return;
    }
  
    const result = await client.hDel(inputHashDelKey, inputHashDelField);
    console.log(chalk.cyanBright(`Deleted: ${JSON.stringify(result)}`));
    await client.quit();
  } catch (error) {
    console.log(chalk.redBright.bgWhite.bold(`${error}`));
    await client.quit();
  }
}

const redisAddList = async () => {
  const inputListKey = readlineSync.question(chalk.magentaBright('List key: '));

  console.log(chalk.cyanBright('Set value: s - End: e'));
  let fieldValue = [];
  readlineSync.promptCLLoop({
    s: () => {
      const inputListValue = readlineSync.question(chalk.magentaBright('List field: '));
      fieldValue.push(inputListValue);
    },
    e: () => true
  });

  try {
    await client.connect();
    await client.rPush(inputListKey, fieldValue);
    console.log(chalk.cyanBright(`Added list ${inputListKey}`));
    await client.quit();
  } catch (error) {
    console.log(chalk.redBright.bgWhite.bold(`${error}`));
    await client.quit();
  }
}

const redisGetList = async () => {
  const inputListKey = readlineSync.question(chalk.magentaBright('List key: '));
  try {
    await client.connect();
    const result = await client.lRange(inputListKey, 0, -1);
    console.log(chalk.cyanBright(`Get list ${inputListKey}: ${result.join(", ")}`));
    await client.quit();
  } catch (error) {
    console.log(chalk.redBright.bgWhite.bold(`${error}`));
    await client.quit();
  }
}

export const redisActions = async input => {
  switch (input) {
    case 0:
      console.log(chalk.cyanBright(`Start doing: ${getKey(redisFuntion, input)}`));
      await redisSet();
      break;
    case 1:
      console.log(chalk.cyanBright(`Start doing: ${getKey(redisFuntion, input)}`));
      await redisGet();
      break;
    case 2:
      console.log(chalk.cyanBright(`Start doing: ${getKey(redisFuntion, input)}`));
      await redisGetAll();
      break;
    case 3:
      console.log(chalk.cyanBright(`Start doing: ${getKey(redisFuntion, input)}`));
      await redisDelete();
      break;
    case 4:
      console.log(chalk.cyanBright(`Start doing: ${getKey(redisFuntion, input)}`));
      await redisSetHash();
      break;
    case 5:
      console.log(chalk.cyanBright(`Start doing: ${getKey(redisFuntion, input)}`));
      await redisGetHash();
      break;
    case 6:
      console.log(chalk.cyanBright(`Start doing: ${getKey(redisFuntion, input)}`));
      await redisIncrementHash();
      break;
    case 7:
      console.log(chalk.cyanBright(`Start doing: ${getKey(redisFuntion, input)}`));
      await redisDelHash();
      break;
    case 8:
      console.log(chalk.cyanBright(`Start doing: ${getKey(redisFuntion, input)}`));
      await redisAddList();
      break;
    case 9:
      console.log(chalk.cyanBright(`Start doing: ${getKey(redisFuntion, input)}`));
      await redisGetList();
      break;
    case 10:
      console.log(chalk.cyanBright(`Start doing: ${getKey(redisFuntion, input)}`));
      askName();
      break;
  }

}