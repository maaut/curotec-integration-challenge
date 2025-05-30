import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout, Skeleton, ConfigProvider, theme as antTheme } from "antd";
import "./App.css";
import TaskListPage from "./pages/task/TaskListPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import AppHeader from "./components/layout/AppHeader.tsx";

const { Content, Footer } = Layout;
const { defaultAlgorithm, darkAlgorithm } = antTheme;

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("appTheme") as
      | "light"
      | "dark"
      | null;
    if (storedTheme) {
      setCurrentTheme(storedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setCurrentTheme(newTheme);
    localStorage.setItem("appTheme", newTheme);
  };

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
    <ConfigProvider
      theme={{
        algorithm: currentTheme === "light" ? defaultAlgorithm : darkAlgorithm,
        token: {
          colorPrimary: currentTheme === "light" ? "#1890ff" : "#177ddc",
        },
      }}
    >
      <Router>
        <Layout style={{ minHeight: "100vh" }}>
          <AppHeader currentTheme={currentTheme} toggleTheme={toggleTheme} />
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
                  isAuthenticated ? (
                    <Navigate to="/" replace />
                  ) : (
                    <RegisterPage />
                  )
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
    </ConfigProvider>
  );
};

export default App;
