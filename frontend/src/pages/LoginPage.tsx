import React from "react";
import { Form, Input, Button, Typography, Card, Row, Col } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../providers/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import type { LoginDto } from "../services/authApi";

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: LoginDto) => {
    try {
      await login(values);
      navigate("/");
    } catch (error) {
      console.error("Login page error:", error);
    }
  };

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        minHeight: "calc(100vh - 144px)",
        padding: "20px 0",
      }}
    >
      <Col xs={22} sm={16} md={12} lg={8} xl={7} xxl={6}>
        <Card
          bordered={false}
          style={{
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            padding: "20px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Title level={2} style={{ marginBottom: "8px" }}>
              Welcome Back!
            </Title>
            <Text type="secondary">Please log in to continue.</Text>
          </div>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            size="large"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please input your Email!" },
                { type: "email", message: "The input is not valid E-mail!" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="you@example.com" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}
              style={{ marginBottom: "24px" }}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: "16px" }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isLoading}
                size="large"
              >
                Log In
              </Button>
            </Form.Item>
          </Form>
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <Text type="secondary">
              Don't have an account? <Link to="/register">Register now</Link>
            </Text>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;
