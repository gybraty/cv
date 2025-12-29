import {
  Controller,
  Post,
  Param,
  UseGuards,
  HttpCode,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { AiService, ResumeData } from './ai.service';
import { ResumesService } from '../resumes/resumes.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import type { CurrentUserType } from '../users/decorators/current-user.decorator';

import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@Controller('resumes')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly resumesService: ResumesService,
  ) {}

  @Post(':id/analyze')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async analyzeResume(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    const userId = user.sub;

    const resume = await this.resumesService.findOne(id, userId);

    if (!resume.rawData || resume.rawData.trim() === '') {
      throw new BadRequestException('Please add text to your resume first');
    }

    const structuredData: ResumeData = await this.aiService.analyze(
      resume.rawData,
    );

    const updatedResume = await this.resumesService.update(id, userId, {
      structuredData: structuredData,
      status: 'analyzed',
    });

    return updatedResume;
  }
}
