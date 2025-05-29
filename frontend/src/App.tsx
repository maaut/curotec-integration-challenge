import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { Layout, Menu, Button } from "antd";
import "./App.css";
import TaskListPage from "./pages/task/TaskListPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./providers/AuthContext";

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  const { isAuthenticated, logout, isLoading } = useAuth();

  const navItems = [{ key: "tasks", label: <Link to="/">Tasks</Link> }];

  // Dynamically add Login/Register or Logout button to the header
  const authMenuItems = [];
  if (isLoading) {
    // Optionally, show a loading indicator in the menu or nothing
  } else if (isAuthenticated) {
    authMenuItems.push({
      key: "logout",
      label: (
        <Button
          type="link"
          onClick={logout}
          style={{ color: "rgba(255, 255, 255, 0.65)" }}
        >
          Logout
        </Button>
      ),
    });
  } else {
    authMenuItems.push({ key: "login", label: <Link to="/login">Login</Link> });
    authMenuItems.push({
      key: "register",
      label: <Link to="/register">Register</Link>,
    });
  }

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <Header
          style={{ display: "flex", alignItems: "center", padding: "0 24px" }}
        >
          <div
            className="logo"
            style={{ color: "white", marginRight: "auto", fontSize: "1.5rem" }}
          >
            <Link to="/" style={{ color: "white", textDecoration: "none" }}>
              Task Manager
            </Link>
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            items={navItems}
            style={{ lineHeight: "64px", borderBottom: "none" }}
            selectable={false}
          />
          <Menu
            theme="dark"
            mode="horizontal"
            items={authMenuItems}
            style={{
              lineHeight: "64px",
              borderBottom: "none",
              marginLeft: "auto",
            }}
            selectable={false}
          />
        </Header>
        <Content style={{ padding: "24px", marginTop: "16px" }}>
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated && !isLoading ? (
                  <Navigate to="/" replace />
                ) : (
                  <LoginPage />
                )
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated && !isLoading ? (
                  <Navigate to="/" replace />
                ) : (
                  <RegisterPage />
                )
              }
            />

            <Route path="/" element={<ProtectedRoute />}>
              <Route index element={<TaskListPage />} />
              {/* Example of another protected route */}
              {/* <Route path="profile" element={<UserProfilePage />} /> */}
            </Route>

            {/* Redirect to tasks if authenticated and trying to access a non-existent path */}
            {/* Or show a 404 component */}
            <Route
              path="*"
              element={
                isAuthenticated && !isLoading ? (
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
