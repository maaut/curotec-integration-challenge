import React from "react";
import { List, Button, Checkbox, Typography, Popconfirm } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useTasks } from "../../hooks/useTasks";
import type { Task } from "../../types/task.types";

const { Text } = Typography;

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit }) => {
  const { toggleComplete, deleteTask, loading } = useTasks();

  const handleToggleComplete = () => {
    toggleComplete(task.id);
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  return (
    <List.Item
      actions={[
        <Button
          icon={<EditOutlined />}
          onClick={() => onEdit(task)}
          disabled={loading}
          style={{ marginRight: 8 }}
        />,
        <Popconfirm
          title="Delete the task"
          description="Are you sure to delete this task?"
          onConfirm={handleDelete}
          okText="Yes"
          cancelText="No"
          disabled={loading}
        >
          <Button icon={<DeleteOutlined />} danger disabled={loading} />
        </Popconfirm>,
      ]}
      style={{ opacity: task.completed ? 0.5 : 1 }}
    >
      <List.Item.Meta
        avatar={
          <Checkbox
            checked={task.completed}
            onChange={handleToggleComplete}
            disabled={loading}
          />
        }
        title={<Text delete={task.completed}>{task.title}</Text>}
        description={task.description}
      />
    </List.Item>
  );
};

export default TaskItem;
