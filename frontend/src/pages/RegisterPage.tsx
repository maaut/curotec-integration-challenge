import React from "react";
import { Form, Input, Button, Typography, Card, Row, Col } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../providers/AuthContext";
import { useNavigate } from "react-router-dom";
import type { RegisterDto } from "../services/authApi";

const { Title } = Typography;

// Type for the registration form values, including confirmPassword
interface RegisterFormValues extends RegisterDto {
  confirmPassword?: string;
}

const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: RegisterFormValues) => {
    // The 'confirmPassword' field is only for validation,
    // it should not be sent to the backend.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = values;
    try {
      await register(registerData);
      navigate("/");
    } catch (error) {
      console.error("Register page error:", error);
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: "80vh" }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card>
          <Title
            level={2}
            style={{ textAlign: "center", marginBottom: "24px" }}
          >
            Register
          </Title>
          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please input your Email!" },
                { type: "email", message: "The input is not valid E-mail!" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={["password"]}
              hasFeedback
              rules={[
                { required: true, message: "Please confirm your Password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "The two passwords that you entered do not match!"
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm Password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isLoading}
              >
                Register
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default RegisterPage;
