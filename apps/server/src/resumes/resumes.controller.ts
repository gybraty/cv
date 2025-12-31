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
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';

@ApiBearerAuth('JWT-auth')
@Controller('resumes')
@UseGuards(AuthGuard)
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new resume' })
  create(
    @CurrentUser() user: { sub: string; email: string },
    @Body() createResumeDto: CreateResumeDto,
  ) {
    return this.resumesService.create(user.sub, createResumeDto, user.email);
  }

  @Get()
  @ApiOperation({ summary: 'Get all resumes' })
  findAll(@CurrentUser() user: { sub: string; email: string }) {
    return this.resumesService.findAll(user.sub, user.email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resume by id' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; email: string },
  ) {
    return this.resumesService.findOne(id, user.sub, user.email);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update resume by id' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; email: string },
    @Body() updateResumeDto: UpdateResumeDto,
  ) {
    return this.resumesService.update(
      id,
      user.sub,
      updateResumeDto,
      user.email,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete resume by id' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; email: string },
  ) {
    return this.resumesService.remove(id, user.sub, user.email);
  }
}
