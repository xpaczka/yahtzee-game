import dice1 from 'url:../img/dice1.png';
import dice2 from 'url:../img/dice2.png';
import dice3 from 'url:../img/dice3.png';
import dice4 from 'url:../img/dice4.png';
import dice5 from 'url:../img/dice5.png';
import dice6 from 'url:../img/dice6.png';

import * as model from './model.js';
import { performCheck, checkSum } from './performCheck.js';

const rollBtn = document.querySelector('.roll-dice-btn');
const dices = document.querySelectorAll('.dice');
const scoreBoard = document.querySelector('.score-board');
const rollsLeftElement = document.querySelector('.rolls-left span');
const rollsLeftText = document.querySelector('.rolls-left');
const images = [dice1, dice2, dice3, dice4, dice5, dice6];

let rollsLeft = 3;

// Display handling functions
const clear = function () {
  dices.forEach(dice => {
    dice.classList.remove('selected');
    dice.classList.add('hidden');
  });
  model.rolls.forEach(roll => (roll.checked = false));
};

const displayDices = function () {
  for (let i = 0; i < model.rolls.length; i++) {
    if (model.rolls[i].checked) continue;
    model.rolls[i].value = Math.floor(Math.random() * 6 + 1);
    const img = dices[i].querySelector('img');
    img.src = images[model.rolls[i].value - 1];
  }
};

const generateScoreBoard = function () {
  scoreBoard.innerHTML = '';
  model.scoreBoard.forEach(el => {
    const html = `
    <div class="score-container ${!el.available ? 'selected' : ''}" data-score="${el.id}">
      <div class="score-name">${el.name}</div>
      <div class="score-value">${el.score}</div>
    </div>
    `;

    scoreBoard.insertAdjacentHTML('beforeend', html);
  });
};

// Game handling functions
const rollDice = function () {
  if (rollsLeft < 1) return;
  dices.forEach(dice => dice.classList.remove('hidden'));
  displayDices();

  rollsLeft--;
  rollsLeftElement.innerHTML = rollsLeft;
  performCheck();
  generateScoreBoard();
};

const selectDice = function (e) {
  const dice = e.target.closest('.dice');
  const diceIndex = dice.dataset.dice - 1;
  model.rolls[diceIndex].checked = !model.rolls[diceIndex].checked;
  dices[diceIndex].classList.toggle('selected');
};

const handleScore = function (e) {
  if (rollsLeft === 3) return;
  const target = e.target.closest('.score-container');
  if (!target) return;

  const element = model.scoreBoard.find(el => el.id === target.dataset.score);
  if (element.available === false) return;
  element.available = false;
  target.classList.add('selected');

  rollsLeft = 3;
  rollsLeftElement.innerHTML = rollsLeft;
  clear();
  checkSum();
  generateScoreBoard();
  checkGameFinish();
};

const checkGameFinish = function () {
  const scores = model.scoreBoard.filter(el => el.id !== 'bonus' && el.id !== 'sum').map(el => el.available);
  const finished = scores.every(score => score === false);

  if (!finished) return;
  rollBtn.removeEventListener('click', rollDice);
  scoreBoard.removeEventListener('click', handleScore);
  const sum = model.scoreBoard.find(el => el.id === 'sum');
  sum.available = false;
  rollsLeftText.innerHTML = `Game finished! Your score: ${sum.score}`;
  rollBtn.removeEventListener('click', rollDice);
  rollBtn.style.display = 'none';
};

const init = function () {
  clear();
  generateScoreBoard();

  dices.forEach(dice => dice.addEventListener('click', selectDice));
  rollBtn.addEventListener('click', rollDice);
  scoreBoard.addEventListener('click', handleScore);
};

init();
