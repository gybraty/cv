import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.png',
    description: 'URL to avatar image',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class UpdateSettingsDto {
  @ApiProperty({
    example: 'dark',
    enum: ['light', 'dark', 'system'],
    description: 'UI theme preference',
    required: false,
  })
  @IsOptional()
  @IsEnum(['light', 'dark', 'system'])
  theme?: string;

  @ApiProperty({
    example: true,
    description: 'Whether onboarding is completed',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  onboardingCompleted?: boolean;
}

export class UpdateUserDto {
  @ApiProperty({ type: UpdateProfileDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProfileDto)
  profile?: UpdateProfileDto;

  @ApiProperty({ type: UpdateSettingsDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSettingsDto)
  settings?: UpdateSettingsDto;
}
