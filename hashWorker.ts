// hashWorker.ts
import { parentPort } from 'worker_threads';
import * as crypto from 'crypto';

const alphabet = 'abcdefghijklmnopqrstuvwxyz';

function generateHash(password: string, saltHex: string): string {
  const saltBuffer = Buffer.from(saltHex, 'hex');
  return crypto
    .createHash('sha256')
    .update(Buffer.concat([saltBuffer, Buffer.from(password, 'utf-8')]))
    .digest('hex');
}

function indexToCombination(index, alphabetSize, passwordLength) {
  let combination = '';
  for (let i = passwordLength - 1; i >= 0; i--) {
    const charPosition = Math.floor(index / Math.pow(alphabetSize, i));
    index -= charPosition * Math.pow(alphabetSize, i);
    combination += alphabet[charPosition];
  }
  return combination;
}

parentPort.on('message', (data) => {
  const { salt, targetHash, start, end, alphabet, length, workerId } = data;
  let currentIndex = start;
  while (currentIndex < end) {
    const password = indexToCombination(currentIndex, alphabet.length, length);
    if (generateHash(password, salt) === targetHash) {
      parentPort.postMessage({ password, workerId });
      break;
    }

    currentIndex++;
    if (currentIndex % 5000000 === 0) {
      console.log(
        `Worker ${workerId} - Nombre de combinaisons testées: ${
          currentIndex - start
        }`,
      );
    }
  }
});
