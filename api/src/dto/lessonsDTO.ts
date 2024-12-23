import {
  IsOptional,
  IsNumber,
  IsArray,
  Matches,
  IsInt,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';

export default class LessonsDTO {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}(\s*,\s*\d{4}-\d{2}-\d{2})?$/, {
    message:
      'Date should be in the format YYYY-MM-DD, optionally followed by another date separated by a comma.',
  })
  date?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsIn([0, 1])
  status?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((id: string) => {
        const parsed = parseInt(id.trim(), 10);
        if (isNaN(parsed)) {
          return id.trim();
        }
        return parsed;
      });
    }
    return value;
  })
  @IsArray()
  @IsInt({ each: true })
  teacherIds?: number[];

  @IsOptional()
  @Matches(/^(\d+|\d+,\d+)$/, {
    message:
      'studentsCount must be either one number or two numbers separated by commas.',
  })
  studentsCount?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  lessonsPerPage: number = 5;
}
