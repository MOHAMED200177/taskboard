import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from '../task.entity';

export enum TaskSortField {
  CREATED_AT = 'createdAt',
  DUE_DATE = 'dueDate',
  PRIORITY = 'priority',
  TITLE = 'title',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class FilterTaskDto {
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  // Searches title + description (case-insensitive, partial match)
  @IsString()
  @IsOptional()
  search?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @IsEnum(TaskSortField)
  @IsOptional()
  sortBy?: TaskSortField = TaskSortField.CREATED_AT;

  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;
}
