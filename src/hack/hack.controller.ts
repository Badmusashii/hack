import { Controller, Get } from '@nestjs/common';
import { HackService } from './hack.service';

@Controller('hack')
export class HackController {
  constructor(private hackService: HackService) {}

  @Get('/solve')
  async solveChallenge() {
    return this.hackService.getChallengeAndSolve();
    // return this.hackService.findPassword(
    //   '66138ffc20d80994f35b43db20d11f84',
    //   '4d5fbf98348e26ddb22702d733ec05051bf9fd3b989533346cb08b4d948f0a74',
    // );
  }
}
