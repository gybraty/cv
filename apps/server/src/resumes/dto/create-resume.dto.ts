import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateResumeDto {
  @ApiProperty({
    example: 'My Awesome Resume',
    description: 'The title of the resume',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;
}
