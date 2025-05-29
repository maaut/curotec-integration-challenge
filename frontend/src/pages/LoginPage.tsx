import React from "react";
import { Form, Input, Button, Typography, Card, Row, Col } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../providers/AuthContext";
import { useNavigate } from "react-router-dom";
import type { LoginDto } from "../services/authApi";

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: LoginDto) => {
    try {
      await login(values);
      navigate("/"); // Redirect to homepage or dashboard after login
    } catch (error) {
      // Error message is handled by AuthContext
      console.error("Login page error:", error);
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
            Login
          </Title>
          <Form
            name="login"
            initialValues={{ remember: true }}
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
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isLoading}
              >
                Log in
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;
