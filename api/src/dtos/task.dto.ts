export interface CreateTaskDto {
  title: string;
  description?: string;
  completed?: boolean;
  inviteeEmail?: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  inviteeId?: string;
  invitee?: {
    id: string;
    email: string;
  };
}
