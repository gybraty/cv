import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from './auth/auth.guard';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Get hello message' })
  @ApiResponse({ status: 200, description: 'Return hello message.' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get private data' })
  @ApiResponse({ status: 200, description: 'Return user data.' })
  @UseGuards(AuthGuard)
  @Get('private')
  getPrivate(@Request() req): any {
    return req.user;
  }
}
