import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(AuthGuard)
  @Get('private')
  getPrivate(@Request() req): any {
    return req.user;
  }
}
