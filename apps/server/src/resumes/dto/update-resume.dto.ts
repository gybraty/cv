import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateResumeDto {
  @ApiProperty({
    example: 'Updated Resume Title',
    description: 'The new title of the resume',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 'Experience: Software Engineer...',
    description: 'Raw text content for analysis',
    required: false,
  })
  @IsOptional()
  @IsString()
  rawData?: string;

  @ApiProperty({
    example: { name: 'John Doe', skills: ['NestJS'] },
    description: 'Structured JSON data extracted from raw text',
    required: false,
  })
  @IsOptional()
  @IsObject()
  structuredData?: any;
  @ApiProperty({
    example: 'analyzed',
    description: 'Status of the resume',
    enum: ['draft', 'analyzed', 'exported'],
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;
}
