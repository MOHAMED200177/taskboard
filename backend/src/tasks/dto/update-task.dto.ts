import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../task.entity';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @IsOptional()
  @ValidateIf((o) => o.assigneeId !== null)
  @IsUUID()
  assigneeId?: string | null;
}
