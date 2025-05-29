import React from "react";
import { Layout } from "antd";
import "./TaskListPage.css";
import TaskList from "../../components/task/TaskList";

const { Content } = Layout;

const TaskListPage: React.FC = () => {
  return (
    <Layout className="task-list-page-layout">
      <Content className="task-list-page-content">
        <TaskList />
      </Content>
    </Layout>
  );
};

export default TaskListPage;
