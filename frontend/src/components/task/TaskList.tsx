import React, { useEffect, useState } from "react";
import {
  List,
  Spin,
  Alert,
  Typography,
  Button,
  Modal,
  Form,
  Input,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import TaskItem from "./TaskItem";
import { useTasks } from "../../providers/TaskContext";
import type { Task } from "../../types/task.types";

const { Title } = Typography;

interface TaskFormValues {
  title: string;
  description: string;
}

const TaskList: React.FC = () => {
  const { tasks, loading, error, fetchTasks, addTask, updateTask } = useTasks();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [addForm] = Form.useForm<TaskFormValues>();
  const [editForm] = Form.useForm<TaskFormValues>();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleAddCancel = () => {
    setIsAddModalVisible(false);
    addForm.resetFields();
  };

  const handleAddTask = async (values: TaskFormValues) => {
    await addTask(values);
    setIsAddModalVisible(false);
    addForm.resetFields();
  };

  const showEditModal = (task: Task) => {
    setEditingTask(task);
    editForm.setFieldsValue({
      title: task.title,
      description: task.description || "",
    });
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingTask(null);
    editForm.resetFields();
  };

  const handleUpdateTask = async (values: TaskFormValues) => {
    if (editingTask) {
      await updateTask({ ...editingTask, ...values });
    }
    setIsEditModalVisible(false);
    setEditingTask(null);
    editForm.resetFields();
  };

  if (loading && !tasks.length) {
    return (
      <Spin
        tip="Loading tasks..."
        style={{ display: "block", marginTop: "20px" }}
      />
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        style={{ marginTop: "20px" }}
      />
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Title level={2}>Task List</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Task
        </Button>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={tasks}
        renderItem={(task) => (
          <TaskItem key={task.id} task={task} onEdit={showEditModal} />
        )}
        loading={loading}
      />
      <Modal
        title="Add New Task"
        onCancel={handleAddCancel}
        open={isAddModalVisible}
        footer={null}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAddTask}>
          <Form.Item
            name="title"
            label="Title"
            rules={[
              {
                required: true,
                message: "Please input the title of the task!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[
              {
                required: true,
                message: "Please input the description of the task!",
              },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ marginRight: 8 }}
            >
              Add Task
            </Button>
            <Button onClick={handleAddCancel} disabled={loading}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      {editingTask && (
        <Modal
          title="Edit Task"
          onCancel={handleEditCancel}
          open={isEditModalVisible}
          footer={null}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleUpdateTask}
            initialValues={{
              title: editingTask.title,
              description: editingTask.description || "",
            }}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[
                {
                  required: true,
                  message: "Please input the title of the task!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                {
                  required: true,
                  message: "Please input the description of the task!",
                },
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ marginRight: 8 }}
              >
                Update Task
              </Button>
              <Button onClick={handleEditCancel} disabled={loading}>
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default TaskList;
