import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient;

  constructor(private constantConfig: ConfigService) {}

  getClient(): SupabaseClient {
    if (this.client) {
      return this.client;
    }

    const SUPABASE_URL = this.constantConfig.get<string>('SUPABASE_URL');
    const SUPABASE_KEY = this.constantConfig.get<string>('SUPABASE_KEY');

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      this.logger.error('Supabase URL or Key is missing');
      throw new Error('Supabase configuration is missing');
    }

    this.client = createClient(SUPABASE_URL, SUPABASE_KEY);
    return this.client;
  }
}
