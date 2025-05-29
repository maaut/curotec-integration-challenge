import React, { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";
import type { Task } from "../../types/task.types";

export interface TaskFormValues {
  title: string;
  description: string;
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
      });
    } else if (!visible) {
      form.resetFields();
    }
  }, [task, visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
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
      </Form>
    </Modal>
  );
};

export default EditTaskModal;
