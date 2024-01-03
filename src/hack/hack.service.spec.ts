import { Test, TestingModule } from '@nestjs/testing';
import { HackService } from './hack.service';

describe('HackService', () => {
  let service: HackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HackService],
    }).compile();

    service = module.get<HackService>(HackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
