export interface CreateTaskDto {
  title: string;
  description?: string;
  completed?: boolean;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {}
