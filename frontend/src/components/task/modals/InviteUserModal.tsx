import React from "react";
import { Modal, Form, Input, Button } from "antd";
import type { Task } from "../../../types/task.types";

interface InviteUserModalProps {
  visible: boolean;
  onCancel: () => void;
  onInvite: (taskId: string, inviteeEmail: string) => Promise<void>;
  task: Task | null;
  loading: boolean;
}

interface InviteFormValues {
  inviteeEmail: string;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  visible,
  onCancel,
  onInvite,
  task,
  loading,
}) => {
  const [form] = Form.useForm<InviteFormValues>();

  const handleSubmit = async (values: InviteFormValues) => {
    if (task) {
      await onInvite(task.id, values.inviteeEmail);
      form.resetFields();
      onCancel();
    }
  };

  return (
    <Modal
      title="Invite User to Task"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="inviteeEmail"
          label="Email"
          rules={[
            {
              required: true,
              message: "Please input the email of the user to invite!",
            },
            {
              type: "email",
              message: "Please enter a valid email address!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ marginRight: 8 }}
          >
            Invite User
          </Button>
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InviteUserModal;
