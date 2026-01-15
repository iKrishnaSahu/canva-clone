import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Workspace from "./Workspace";
import Toolbar from "../features/editor/Toolbar";
import "./Layout.css";

const Layout: React.FC = () => {
  return (
    <div className="layout-container">
      <Header />
      <Toolbar />
      <div className="main-content">
        <Sidebar />
        <Workspace />
      </div>
    </div>
  );
};

export default Layout;
