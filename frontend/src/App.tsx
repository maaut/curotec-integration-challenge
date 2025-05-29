import React from "react";
import { Layout } from "antd";
import "./App.css";
import { TaskProvider } from "./providers/TaskContext";
import TaskListPage from "./pages/task/TaskListPage";

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  return (
    <TaskProvider>
      <Layout className="layout">
        <Header>
          <h1 style={{ color: "white", margin: 6 }}>Task Management App</h1>
        </Header>
        <Content style={{ padding: "0" }}>
          <TaskListPage />
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Mauricio Torres @ Curotec Technical Assessment
        </Footer>
      </Layout>
    </TaskProvider>
  );
};

export default App;
