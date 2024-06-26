import p5 from 'p5';
import { sketch, isCodingMode, isSubmitted, timerCount, submitCode, TIME_LIMIT } from './inputInterface.js';

const playerNum = 1;

setInterval(() => {
  if (!isCodingMode) return;
  if (timerCount >= TIME_LIMIT) {
    if (!isSubmitted) submitCode();
    return;
  }
  timerCount++;
}, 1000);

new p5((p) => { sketch(p, playerNum); }, 'sketch-container');
