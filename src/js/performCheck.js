import * as model from './model.js';
import { isEqual } from 'lodash';

const findObject = function (id) {
  return model.scoreBoard.find(el => el.id === id);
};

// Aces, two, threes, fours, fives, sixes
const checkNumbers = function (id, value) {
  const object = findObject(id);
  if (object.available === false) return;

  const dices = model.rolls.map(roll => roll.value);
  const values = dices.filter(el => el === value);
  const score = values.length * value;
  object.score = score;
};

// Three of a kind, four of a kind
const checkOfKind = function (id, value) {
  const object = findObject(id);
  if (object.available === false) return;

  let score = 0;
  const dices = model.rolls.map(roll => roll.value);
  const valuesObject = {};

  for (let i = 0; i < dices.length; i++) {
    if (valuesObject[dices[i]]) valuesObject[dices[i]]++;
    else valuesObject[dices[i]] = 1;
  }

  for (const [_, occurence] of Object.entries(valuesObject)) {
    if (occurence >= value) score = dices.reduce((a, b) => a + b);
  }

  object.score = score;
};

// Small straight, large straight
const checkStraight = function (id, values, length, score) {
  const object = findObject(id);
  if (object.available === false) return;

  const dices = model.rolls.map(roll => roll.value);
  const pattern = values;

  const unique = [...new Set(dices)].sort((a, b) => a - b).slice(0, length);
  if (unique.length !== length) return (object.score = 0);

  for (let i = 0; i < pattern.length; i++) {
    if (isEqual(pattern[i], unique)) {
      object.score = score;
      break;
    }
  }
};

// Bonus
const checkBonus = function () {
  const object = findObject('bonus');
  if (object.available === false) return;

  const numbers = [
    findObject('ace'),
    findObject('two'),
    findObject('three'),
    findObject('four'),
    findObject('five'),
    findObject('six'),
  ];
  const values = numbers.map(el => el.score);
  const completed = numbers.every(el => el.available === false);

  if (!completed) return;
  const sum = values.reduce((a, b) => a + b);
  object.score = sum >= 63 ? 35 : 0;
  object.available = false;
};

// Full house
const checkFullHouse = function () {
  const object = findObject('full-house');
  if (object.available === false) return;

  const dices = model.rolls.map(roll => roll.value);
  const valuesObject = {};
  const valuesArray = [];

  for (let i = 0; i < dices.length; i++) {
    if (valuesObject[dices[i]]) valuesObject[dices[i]]++;
    else valuesObject[dices[i]] = 1;
  }

  for (const [_, occurence] of Object.entries(valuesObject)) {
    if (occurence === 2 || occurence === 3) valuesArray.push(occurence);
  }

  valuesArray.sort((a, b) => a - b);
  object.score = isEqual(valuesArray, [2, 3]) ? 25 : 0;
};

// Yahtzee
const checkYahtzee = function () {
  const object = findObject('yahtzee');
  if (object.available === false) return;

  const dices = model.rolls.map(roll => roll.value);
  const score = dices.every(el => el === dices[0]) ? 50 : 0;
  object.score = score;
};

// Chance
const checkChance = function () {
  const object = findObject('chance');
  if (object.available === false) return;

  const dices = model.rolls.map(roll => roll.value);
  const score = dices.reduce((a, b) => a + b);
  object.score = score;
};

export const checkSum = function () {
  const object = findObject('sum');
  const values = model.scoreBoard.filter(el => !el.available).map(el => el.score);
  object.score = values.reduce((a, b) => a + b);
};

export const performCheck = function () {
  checkNumbers('ace', 1);
  checkNumbers('two', 2);
  checkNumbers('three', 3);
  checkNumbers('four', 4);
  checkNumbers('five', 5);
  checkNumbers('six', 6);
  checkBonus();
  checkOfKind('three-of', 3);
  checkOfKind('four-of', 4);
  checkFullHouse();
  checkStraight(
    'small-straight',
    [
      [1, 2, 3, 4],
      [2, 3, 4, 5],
      [3, 4, 5, 6],
    ],
    4,
    30
  );
  checkStraight(
    'large-straight',
    [
      [1, 2, 3, 4, 5],
      [2, 3, 4, 5, 6],
    ],
    5,
    40
  );
  checkYahtzee();
  checkChance();
};
