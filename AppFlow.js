import readlineSync from 'readline-sync';
import { redisActions } from './RedisFunction.js';
import chalk from 'chalk';
import boxen from 'boxen';

const boxenOptions = {
  padding: 1,
  margin: 0,
  borderStyle: 'double',
  borderColor: 'greenBright',
  title: 'Greetings',
  titleAlignment: 'center',
  aligment: 'center'
};

const startMsg = chalk.greenBright.bold('Welcome to Redis Labs Demo - Basics functionalities');
const msgBox = boxen(startMsg, boxenOptions);

const continuePrompt = async () => {
  readlineSync.promptCLLoop({
    y: async () => {
      await appStart();
    },
    n: () => {
      console.log(chalk.greenBright('\nExit app\n'));
      return true;
    }
  }, {
    defaultInput: 'n',
    limit: ['y', 'n'],
    limitMessage: 'y or n'
  });
}

const showChoices = async () => {
  let functions = ['Set', 'Get', 'Get all', 'Delete', 'Set Hash', 'Get Hash', 'Increment Hash', 'Delete Hash', 'Add List', 'Get List', 'Ask name'];

  let index = readlineSync.keyInSelect(functions, 'Choose function:');
  await redisActions(index);

  console.log(chalk.yellow('\nContinue app? (y/n - Default: n)'));
}

export const appStart = async () => {
  console.log(msgBox);
  await showChoices();
  await continuePrompt();
}