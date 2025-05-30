import React from "react";
import { Link } from "react-router-dom";
import { Layout, Button, Space, Switch, theme } from "antd";
import { useAuth } from "../../hooks/useAuth";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { useToken } = theme;

interface AppHeaderProps {
  currentTheme: "light" | "dark";
  toggleTheme: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ currentTheme, toggleTheme }) => {
  const { isAuthenticated, logout } = useAuth();
  const { token } = useToken();

  const headerBackgroundColor =
    currentTheme === "light" ? "#f0f2f5" : "#1f1f1f";

  const headerTextColor =
    currentTheme === "light"
      ? "rgba(0, 0, 0, 0.85)"
      : "rgba(255, 255, 255, 0.85)";

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 1001,
        width: "100%",
        backgroundColor: headerBackgroundColor,
        borderBottom:
          currentTheme === "light"
            ? `1px solid ${token.colorBorder}`
            : `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div className="logo" style={{ fontSize: "1.5rem" }}>
        <Link to="/" style={{ color: headerTextColor, textDecoration: "none" }}>
          Task Manager
        </Link>
      </div>

      <Space size="middle" align="center">
        <Link to="/">
          <Button type="text" style={{ color: headerTextColor }}>
            Tasks
          </Button>
        </Link>

        {isAuthenticated ? (
          <Button
            type="text"
            onClick={logout}
            style={{ color: headerTextColor }}
          >
            Logout
          </Button>
        ) : (
          <>
            <Link to="/login">
              <Button type="text" style={{ color: headerTextColor }}>
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button type="text" style={{ color: headerTextColor }}>
                Register
              </Button>
            </Link>
          </>
        )}
        <Switch
          checkedChildren={<SunOutlined />}
          unCheckedChildren={<MoonOutlined />}
          checked={currentTheme === "dark"}
          onChange={toggleTheme}
        />
      </Space>
    </Header>
  );
};

export default AppHeader;
