import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsEnum(['light', 'dark', 'system'])
  theme?: string;

  @IsOptional()
  @IsBoolean()
  onboardingCompleted?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProfileDto)
  profile?: UpdateProfileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSettingsDto)
  settings?: UpdateSettingsDto;
}
