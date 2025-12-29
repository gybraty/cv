import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { Resume, ResumeSchema } from './schemas/resume.schema';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule for AuthGuard

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Resume.name, schema: ResumeSchema }]),
    AuthModule,
  ],
  controllers: [ResumesController],
  providers: [ResumesService],
  exports: [ResumesService],
})
export class ResumesModule {}
