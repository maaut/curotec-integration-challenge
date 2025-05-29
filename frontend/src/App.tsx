import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout, Skeleton } from "antd";
import "./App.css";
import TaskListPage from "./pages/task/TaskListPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./providers/AuthContext";
import AppHeader from "./components/layout/AppHeader.tsx";

const { Content, Footer } = Layout;

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout
        style={{
          minHeight: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Skeleton active />
      </Layout>
    );
  }

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <AppHeader />
        <Content style={{ padding: "24px", marginTop: "16px" }}>
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
              }
            />
            <Route path="/" element={<ProtectedRoute />}>
              <Route index element={<TaskListPage />} />
            </Route>
            <Route
              path="*"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Task Management App ©{new Date().getFullYear()} Curotec Challenge
        </Footer>
      </Layout>
    </Router>
  );
};

export default App;
