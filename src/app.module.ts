import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HackService } from './hack/hack.service';
import { HackController } from './hack/hack.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AppController, HackController],
  providers: [AppService, HackService],
})
export class AppModule {}
