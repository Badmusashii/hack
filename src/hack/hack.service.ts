import { Injectable } from '@nestjs/common';
import { Worker } from 'worker_threads';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HackService {
  constructor(private http: HttpService) {}

  public async getChallengeAndSolve() {
    console.log('demarage du hack');
    try {
      const response = await firstValueFrom(
        this.http.post('https://shallenge.onrender.com/challenges'),
      );
      const { id, salt, hash } = response.data;

      const password = await this.findPasswordUsingWorker(salt, hash);
      if (password) {
        console.log(`Password trouvé !: ${password}`);
        this.submitResponse(id, password);
      } else {
        console.log('Password introuvable');
      }
    } catch (error) {
      console.error('Error :', error);
    }
  }

  //   private generateHash(password: string, saltHex: string) {
  //     const saltBuffer = Buffer.from(saltHex, 'hex');
  //     return crypto
  //       .createHash('sha256')
  //       .update(Buffer.concat([saltBuffer, Buffer.from(password, 'utf-8')]))
  //       .digest('hex');
  //   }

  private *generateAllCombinations(
    alphabet: string,
    length: number,
    prefix = '',
  ) {
    if (length === 0) {
      yield prefix;
      return;
    }

    for (let i = 0; i < alphabet.length; i++) {
      const next = prefix + alphabet[i];
      yield* this.generateAllCombinations(alphabet, length - 1, next);
    }
  }

  public async findPasswordUsingWorker(
    salt: string,
    targetHash: string,
  ): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const worker = new Worker('./path/to/hashWorker.js');
      worker.postMessage({
        salt,
        targetHash,
        alphabet: 'abcdefghijklmnopqrstuvwxyz',
        length: 6,
      });

      worker.on('message', (password) => {
        resolve(password);
      });

      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  private async submitResponse(challengeId: string, password: string) {
    try {
      const response = await firstValueFrom(
        this.http.post(
          `https://shallenge.onrender.com/challenges/${challengeId}/answer`,
          JSON.stringify(password),
          { headers: { 'Content-Type': 'application/json' } },
        ),
      );
      console.log("Response de l'API:", response.data);
    } catch (error) {
      console.error('Error :', error);
    }
  }
}
