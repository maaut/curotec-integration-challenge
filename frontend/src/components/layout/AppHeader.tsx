import React from "react";
import { Link } from "react-router-dom";
import { Layout, Button, Space } from "antd";
import { useAuth } from "../../providers/AuthContext";

const { Header } = Layout;

const AppHeader: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 1,
        width: "100%",
      }}
    >
      <div className="logo" style={{ color: "white", fontSize: "1.5rem" }}>
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>
          Task Manager
        </Link>
      </div>

      <Space size="middle">
        <Link to="/">
          <Button type="text" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
            Tasks
          </Button>
        </Link>

        {isAuthenticated ? (
          <Button
            type="text"
            onClick={logout}
            style={{ color: "rgba(255, 255, 255, 0.85)" }}
          >
            Logout
          </Button>
        ) : (
          <>
            <Link to="/login">
              <Button
                type="text"
                style={{ color: "rgba(255, 255, 255, 0.85)" }}
              >
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button
                type="text"
                style={{ color: "rgba(255, 255, 255, 0.85)" }}
              >
                Register
              </Button>
            </Link>
          </>
        )}
      </Space>
    </Header>
  );
};

export default AppHeader;
