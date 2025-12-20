import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from './supabase.service';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [ConfigModule],
  providers: [SupabaseService, AuthGuard],
  exports: [SupabaseService, AuthGuard],
})
export class AuthModule {}
