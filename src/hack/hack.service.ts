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

  public async findPasswordUsingWorker(
    salt: string,
    targetHash: string,
  ): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const numWorkers = 4; // Nombre de coeurs du CPU
      const alphabet = 'abcdefghijklmnopqrstuvwxyz';
      const passwordLength = 6;
      const workers: Worker[] = []; // Stockage des références des workers
      const totalCombinations = Math.pow(alphabet.length, passwordLength);
      const segmentLength = Math.ceil(totalCombinations / numWorkers);
      let found = false;
      for (let i = 0; i < numWorkers; i++) {
        const start = i * segmentLength;
        const end =
          i + 1 === numWorkers ? totalCombinations : start + segmentLength;

        const worker = new Worker('./dist/hashWorker.js');
        workers.push(worker); // Stocker la référence du worker
        worker.postMessage({
          salt,
          targetHash,
          start,
          end,
          alphabet,
          length: passwordLength,
          workerId: i, // Numéro unique du worker
        });

        worker.on('message', (response) => {
          if (!found) {
            found = true;
            resolve(response.password);
            // Arrêter les autres workers
            workers.forEach((w) => w.terminate());
          }
        });

        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0 && !found) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      }
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
