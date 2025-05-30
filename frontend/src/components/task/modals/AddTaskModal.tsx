import React from "react";
import { Modal, Form, Input, Button } from "antd";

interface AddTaskFormValues {
  title: string;
  description: string;
}

interface AddTaskModalProps {
  visible: boolean;
  onCancel: () => void;
  onAdd: (values: AddTaskFormValues) => Promise<void>;
  loading: boolean;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  onCancel,
  onAdd,
  loading,
}) => {
  const [form] = Form.useForm<AddTaskFormValues>();

  const handleSubmit = async (values: AddTaskFormValues) => {
    await onAdd(values);
    form.resetFields();
  };

  return (
    <Modal
      title="Add New Task"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTaskModal;
