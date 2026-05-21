import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    required: false,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    required: false,
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10;

  @ApiProperty({ required: false, default: '' })
  @IsOptional()
  @IsString()
  search?: string = '';

  @ApiProperty({
    required: false,
    description: 'Fecha de inicio para filtrar registros creados desde esta fecha (formato: YYYY-MM-DD)',
    type: String,
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    required: false,
    description: 'Fecha de fin para filtrar registros creados hasta esta fecha (formato: YYYY-MM-DD)',
    type: String,
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
