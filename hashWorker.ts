// hashWorker.ts
import { parentPort } from 'worker_threads';
import * as crypto from 'crypto';

function generateHash(password: string, saltHex: string): string {
  const saltBuffer = Buffer.from(saltHex, 'hex');
  return crypto
    .createHash('sha256')
    .update(Buffer.concat([saltBuffer, Buffer.from(password, 'utf-8')]))
    .digest('hex');
}

parentPort.on('message', (data) => {
  const { salt, targetHash, alphabet, length } = data;

  for (const password of generateAllCombinations(alphabet, length)) {
    if (generateHash(password, salt) === targetHash) {
      parentPort.postMessage(password);
      break;
    }
  }
});

function* generateAllCombinations(
  alphabet: string,
  length: number,
  prefix = '',
): Generator<string> {
  if (length === 0) {
    yield prefix;
    return;
  }

  for (let i = 0; i < alphabet.length; i++) {
    yield* generateAllCombinations(alphabet, length - 1, prefix + alphabet[i]);
  }
}
