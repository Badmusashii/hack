import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

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

      const password = await this.findPassword(salt, hash);
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

  private generateHash(password: string, saltHex: string) {
    const saltBuffer = Buffer.from(saltHex, 'hex');
    return crypto
      .createHash('sha256')
      .update(Buffer.concat([saltBuffer, Buffer.from(password, 'utf-8')]))
      .digest('hex');
  }

  private *generateAllCombinations(alphabet: string) {
    for (let a = 0; a < alphabet.length; a++) {
      for (let b = 0; b < alphabet.length; b++) {
        for (let c = 0; c < alphabet.length; c++) {
          for (let d = 0; d < alphabet.length; d++) {
            for (let e = 0; e < alphabet.length; e++) {
              for (let f = 0; f < alphabet.length; f++) {
                yield alphabet[a] +
                  alphabet[b] +
                  alphabet[c] +
                  alphabet[d] +
                  alphabet[e] +
                  alphabet[f];
              }
            }
          }
        }
      }
    }
  }

  public async findPassword(
    salt: string,
    targetHash: string,
  ): Promise<string | null> {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    let count = 0;
    const combinations = this.generateAllCombinations(alphabet);

    for (const password of combinations) {
      count++;
      if (count % 1000000 === 0) {
        console.log(`Nombre de combinaisons testées: ${count}`);
      }
      const hash = this.generateHash(password, salt);
      if (hash === targetHash) {
        console.log(`Password trouvé ! : ${password}`);
        return password;
      }
    }
    return null;
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
