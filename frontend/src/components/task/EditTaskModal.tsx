import React, { useEffect } from "react";
import { Modal, Form, Input, Button, Checkbox } from "antd";
import type { Task } from "../../types/task.types";

export interface TaskFormValues {
  title: string;
  description: string;
  completed: boolean;
  inviteeEmail?: string | null;
}

interface EditTaskModalProps {
  visible: boolean;
  onCancel: () => void;
  onUpdate: (values: TaskFormValues) => Promise<void>;
  task: Task | null;
  loading: boolean;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  visible,
  onCancel,
  onUpdate,
  task,
  loading,
}) => {
  const [form] = Form.useForm<TaskFormValues>();

  useEffect(() => {
    if (task && visible) {
      form.setFieldsValue({
        title: task.title,
        description: task.description || "",
        completed: task.completed,
        inviteeEmail: task.invitee?.email || null,
      });
    } else if (!visible) {
      form.resetFields();
    }
  }, [task, visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      await onUpdate(values);
    } catch (error) {
      console.error("Validation Failed:", error);
    }
  };

  return (
    <Modal
      title="Edit Task"
      open={visible}
      onCancel={onCancel}
      confirmLoading={loading}
      footer={[
        <Button key="back" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Update Task
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="editTaskForm">
        <Form.Item
          name="title"
          label="Title"
          rules={[
            { required: true, message: "Please input the title of the task!" },
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
        <Form.Item
          name="inviteeEmail"
          label="Invitee Email (optional)"
          rules={[
            { type: "email", message: "Please enter a valid email address." },
          ]}
        >
          <Input placeholder="collaborator@example.com (leave blank to remove/keep unassigned)" />
        </Form.Item>
        <Form.Item name="completed" valuePropName="checked">
          <Checkbox>Completed</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditTaskModal;
