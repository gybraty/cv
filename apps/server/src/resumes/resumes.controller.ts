import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';

@Controller('resumes')
@UseGuards(AuthGuard)
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  create(
    @CurrentUser() user: { sub: string },
    @Body() createResumeDto: CreateResumeDto,
  ) {
    return this.resumesService.create(user.sub, createResumeDto);
  }

  @Get()
  findAll(@CurrentUser() user: { sub: string }) {
    return this.resumesService.findAll(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.resumesService.findOne(id, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
    @Body() updateResumeDto: UpdateResumeDto,
  ) {
    return this.resumesService.update(id, user.sub, updateResumeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.resumesService.remove(id, user.sub);
  }
}
