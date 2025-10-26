import React, { useState, useEffect } from "react";
import './dashboardPage.css';

import {
    DesktopOutlined,
    PieChartOutlined,
    UserOutlined,
    DashboardOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme, Modal } from "antd";

import avatarImage from '../components/img/pfp.png';

// Import components from the components folder
import Dashboard from "../components/dashboard";
import Employee from "../components/Employee";
import Scheduler from "../components/Scheduler";
import Aircons from "../components/Aircons";


const { Header, Content, Sider } = Layout;

const DashboardPage = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState("1");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [user, setUser] = useState({ firstname: '', lastname: '', avatar: avatarImage });


    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/login';
        }

        const firstname = localStorage.getItem('firstname');
        const lastname = localStorage.getItem('lastname');

        if (firstname && lastname) {
            setUser({ firstname, lastname, avatar: avatarImage });
        }
    }, []);

    const handleOk = () => {
        localStorage.clear(); // Clear user data
        setIsModalVisible(false);
        window.location.href = '/login';
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleMenuClick = (e) => {
        setSelectedKey(e.key);
    };

    const breadcrumbLabels = {
        "1": "Dashboard",
        "2": "Employee",
        "3": "Scheduler",
        "4": "Aircons",
    };

    // Map selectedKey to components
    const componentMap = {
        "1": <Dashboard />,
        "2": <Employee />,
        "3": <Scheduler />,
        "4": <Aircons />,
    };

    const breadcrumbItems = [
        { title: breadcrumbLabels["1"] },
        selectedKey !== "1" && { title: breadcrumbLabels[selectedKey] },
    ].filter(Boolean);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
            >
                <div className="demo-logo-vertical" />
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={["1"]}
                    onClick={handleMenuClick}
                    items={[
                        {
                            key: "1",
                            icon: <UserOutlined />,
                            label: "Dashboard",
                        },
                        {
                            key: "2",
                            icon: <DashboardOutlined />,
                            label: "Employees",
                        },
                        {
                            key: "3",
                            icon: <PieChartOutlined />,
                            label: "Scheduler",
                        },
                        {
                            key: "4",
                            icon: <DesktopOutlined />,
                            label: "Aircons",
                        },
                    ]}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: 15,
                        background: colorBgContainer,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 20,
                    }}
                >
                    {/* User Info */}
                    <div>
                        <h1 style={{ margin: 0, fontSize: 20 }}>{user.firstname} {user.lastname}</h1>
                    </div>
                    {/* Profile Picture */}
                    <img
                        src={user.avatar}
                        alt="Profile"
                        style={{ width: 40, height: 40, borderRadius: '50%', cursor: 'pointer' }}
                        onClick={showModal}
                    />
                </Header>

                <Content
                    style={{
                        margin: "0 16px",
                    }}
                >
                    <Breadcrumb
                        style={{
                            margin: "16px 0",
                        }}
                        items={breadcrumbItems}
                    />
                    <div
                        style={{
                            padding: 24,
                            minHeight: "80vh",
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {/* Dynamically render the component based on selectedKey */}
                        {componentMap[selectedKey] || <div>Component not found</div>}
                    </div>
                </Content>
            </Layout>
            {/* Logout Modal */}
            <Modal
                title="Logout"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <p>Are you sure you want to logout?</p>
            </Modal>
        </Layout>
    );
};

export default DashboardPage;
