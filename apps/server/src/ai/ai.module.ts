import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ResumesModule } from '../resumes/resumes.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ResumesModule, ConfigModule, AuthModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
