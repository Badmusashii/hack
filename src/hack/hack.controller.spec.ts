import { Test, TestingModule } from '@nestjs/testing';
import { HackController } from './hack.controller';

describe('HackController', () => {
  let controller: HackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HackController],
    }).compile();

    controller = module.get<HackController>(HackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
