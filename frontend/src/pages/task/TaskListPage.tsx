import React from "react";
import { Layout, theme } from "antd";
// import "./TaskListPage.css";
import TaskList from "../../components/task/TaskList";

const { Content } = Layout;
const { useToken } = theme;

const TaskListPage: React.FC = () => {
  const { token } = useToken();

  return (
    <Layout
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: token.colorBgContainer,
      }}
    >
      <Content
        style={{
          padding: "24px",
        }}
      >
        <TaskList />
      </Content>
    </Layout>
  );
};

export default TaskListPage;
