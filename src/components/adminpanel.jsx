import MenuPanel from '../components/menu';
import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { DatePicker, Modal, Button, Layout, Menu, Table, Popconfirm, Input, Form, Flex, message } from "antd";
import { MenuOutlined, DashboardOutlined, UserOutlined } from "@ant-design/icons";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

console.log('Backend URL:', BACKEND_URL);

const { Search } = Input;
const { Header, Sider, Content } = Layout;

const AdminPanel = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState("1");
    const [admins, setAdmins] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModal, setIsModal] = useState(false);
    const [isAddModal, setIsAddModal] = useState(false);
    const [form] = Form.useForm();
    const [currentAdmin, setCurrentAdmin] = useState(null);


    const updateModal = () => {
        setIsModal(true);
    };

    const openAddModal = () => {
        setIsAddModal(true);
        form.resetFields();
    };

    const closeAddModal = () => {
        setIsAddModal(false);
    };

    const closeModal = () => {
        setIsModal(false);
        form.resetFields();
        setCurrentAdmin(null);
    };

    const fetchAdmins = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/admins`);
            const normalized = response.data.map(item => ({
                ...item,
                _id: item._id || item.id || `temp-${Math.random().toString(36).slice(2, 9)}-${Date.now()}`,
            }));
            setAdmins(normalized);
            setFilteredData(normalized);

        } catch (error) {
            console.error("Error fetching admins:", error);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleAddSubmit = async (values) => {
        try {
            const formattedValues = {
                ...values,
                birthdate: values.birthdate ? dayjs(values.birthdate).format("MM/DD/YYYY") : null,
            };

            const response = await axios.post(`${BACKEND_URL}/api/admins`, formattedValues);
            const created = { ...formattedValues, ...response.data };
            const newAdmin = {
                ...created,
                _id: response.data._id || response.data.id || `temp-${Math.random().toString(36).slice(2, 9)}-${Date.now()}`,
            };

            setAdmins((prev) => {
                const next = [...prev, newAdmin];
                setFilteredData(() => {
                    if (!searchQuery) return next;
                    return next.filter((admin) =>
                        Object.values(admin).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
                    );
                });
                return next;
            });

            message.success("Admin added successfully");
            closeAddModal();
        } catch (error) {
            console.error("Error adding admin:", error);
            message.error("Failed to add admin");
        }
    };

    const handleUpdate = async (id) => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/admins/${id}`);
            const adminToUpdate = response.data;
            if (adminToUpdate) {
                setCurrentAdmin(adminToUpdate);
                form.setFieldsValue({
                    ...adminToUpdate,
                    birthdate: adminToUpdate.birthdate ? dayjs(adminToUpdate.birthdate) : null,
                    firstname: adminToUpdate.firstname,
                    lastname: adminToUpdate.lastname,
                    age: adminToUpdate.age,
                    email: adminToUpdate.email,
                    username: adminToUpdate.username,
                    password: adminToUpdate.password,
                    address: adminToUpdate.address,
                    role: adminToUpdate.role,
                });
                updateModal();
            }
        } catch (error) {
            console.error("Error fetching admin details:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${BACKEND_URL}/api/admins/${id}`);
            setAdmins((prev) => {
                const next = prev.filter((admin) => admin._id !== id);
                setFilteredData(() => {
                    if (!searchQuery) return next;
                    return next.filter((admin) =>
                        Object.values(admin).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
                    );
                });
                return next;
            });

            message.success("Admin deleted successfully");
        } catch (error) {
            console.error("Error deleting admin:", error);
            message.error("Failed to delete admin");
        }
    };

    const handleFormSubmit = async (values) => {
        try {
            const formattedValues = {
                ...values,
                birthdate: values.birthdate ? dayjs(values.birthdate).format("MM/DD/YYYY") : null,
            };

            const response = await axios.patch(
                `${BACKEND_URL}/api/admins/${currentAdmin._id}`,
                formattedValues
            );
            // Merge currentAdmin, formattedValues and server response
            const merged = { ...currentAdmin, ...formattedValues, ...response.data };
            const updatedAdmin = { ...merged, _id: currentAdmin._id };

            setAdmins((prev) => {
                const next = prev.map((admin) => (admin._id === currentAdmin._id ? updatedAdmin : admin));
                setFilteredData(() => {
                    if (!searchQuery) return next;
                    return next.filter((admin) =>
                        Object.values(admin).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
                    );
                });
                return next;
            });

            message.success("Admin updated successfully");
            closeModal();
        } catch (error) {
            console.error("Error updating admin:", error);
            message.error("Failed to update admin");
        }
    };

    const handleSearch = (value) => {
        setSearchQuery(value);
        const filtered = admins.filter((admin) =>
            Object.values(admin)
                .join(" ")
                .toLowerCase()
                .includes(value.toLowerCase())
        );
        setFilteredData(filtered);
    };

    const columns = [
        {
            title: "First Name",
            dataIndex: "firstname",
            key: "firstname",
        },
        {
            title: "Last Name",
            dataIndex: "lastname",
            key: "lastname",
        },
        {
            title: "Birthdate",
            dataIndex: "birthdate",
            key: "birthdate",
            render: (text) => dayjs(text).format("MM/DD/YYYY"),
        },
        {
            title: "Age",
            dataIndex: "age",
            key: "age",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Username",
            dataIndex: "username",
            key: "username",
        },
        {
            title: "Password",
            dataIndex: "password",
            key: "password",
        },
        {
            title: "Address",
            dataIndex: "address",
            key: "address",
        }, {
            title: "Role",
            dataIndex: "role",
            key: "role",
        },
        {
            title: "Action",
            key: "actions",
            width: 250,
            render: (text, record) => (
                <span>
                    <Button
                        type="primary"
                        onClick={() => handleUpdate(record._id)}
                        style={{
                            width: 105,
                            height: 40,
                            borderRadius: 100,
                            backgroundColor: "#6a628aff",
                        }}
                    >
                        Update
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this admin?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            danger
                            type="primary"
                            style={{ width: 105, height: 40, marginLeft: 8, borderRadius: 100 }}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </span>
            ),
        },
    ];

    const handleMenuClick = (e) => {
        setSelectedKey(e.key);
    };

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header
                style={{
                    background: "#fff",
                    padding: "0 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <MenuOutlined
                    className="trigger"
                    onClick={toggleCollapsed}
                    style={{ fontSize: "20px", cursor: "pointer" }}
                />

            </Header>

            <Layout>
                <Sider
                    collapsed={collapsed}
                    onCollapse={toggleCollapsed}
                    style={{ backgroundColor: "#72CACF" }}
                >
                    <Menu
                        style={{ backgroundColor: "#72CACF" }}
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
                                label: "Menu",
                            },
                        ]}
                    />
                </Sider>
                <Content
                    style={{
                        margin: "16px",
                        padding: "25px 45px",
                        background: "#fff",
                        borderRadius: "8px",
                    }}
                >
                    {selectedKey === "1" && (
                        <div className="adminpanel">
                            <h1>Dashboard</h1>
                            <Flex
                                gap={"middle"}
                                style={{ marginTop: 25, marginBottom: 40 }}
                            >
                                <Search
                                    placeholder="Search by menu item"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    style={{ width: 360, height: 56 }}
                                    size="large"
                                    className="Search-box"
                                />
                                <Button
                                    type="primary"
                                    onClick={openAddModal}
                                    style={{
                                        width: 160,
                                        height: 40,
                                        borderRadius: 28,
                                        backgroundColor: "#72CACF",
                                    }}
                                >
                                    Add New
                                </Button>
                            </Flex>

                            <Table
                                dataSource={filteredData}
                                columns={columns}
                                rowKey="_id"
                                virtual
                                scroll={{ x: 2000, y: 500 }}
                            />
                        </div>
                    )}
                    {selectedKey === "2" && (<MenuPanel />)}
                </Content>
            </Layout>

            <Modal
                title="Add New Admin"
                open={isAddModal}
                onOk={form.submit}
                onCancel={closeAddModal}
                okText="Add"
                cancelText="Cancel"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddSubmit}
                >
                    <Form.Item
                        label="First Name"
                        name="firstname"
                        rules={[{ required: true, message: "Please enter the first name" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Last Name"
                        name="lastname"
                        rules={[{ required: true, message: "Please enter the last name" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Birthdate" name="birthdate">
                        <DatePicker
                            format="MM/DD/YYYY"
                            placeholder="Select birthdate"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Age"
                        name="age"
                        rules={[{ required: true, message: "Please enter the age" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Please enter the email" },
                            { type: "email", message: "Enter a valid email" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: "Please enter the username" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: "Please enter the password" }]}
                    >
                        <Input.Password placeholder="Enter a password" />
                    </Form.Item>
                    <Form.Item
                        label="Address"
                        name="address"
                        rules={[{ required: true, message: "Please enter the address" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Role"
                        name="role"
                        rules={[
                            {
                                required: true,
                                message: "Please enter the role",
                            },
                            {
                                validator: (_, value) => {
                                    const allowedRoles = ["admin", "user", "editor"];
                                    if (!value || allowedRoles.includes(value.toLowerCase())) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error(`Role must be one of: ${allowedRoles.join(", ")}`)
                                    );
                                },
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Update Modal */}
            <Modal
                title="Update Admin"
                open={isModal}
                onOk={form.submit} // Submit form
                onCancel={closeModal}
                okText="Update"
                cancelText="Cancel"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit} // Handle form submission
                >
                    <Form.Item
                        label="First Name"
                        name="firstname"
                        rules={[{ required: true, message: "Please enter the first name" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Last Name"
                        name="lastname"
                        rules={[{ required: true, message: "Please enter the last name" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Birthdate"
                        name="birthdate"
                    >
                        <DatePicker
                            format="MM/DD/YYYY"
                            placeholder="Select birthdate"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Age"
                        name="age"
                        rules={[{ required: true, message: "Please enter the age" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Please enter the email" },
                            { type: "email", message: "Enter a valid email" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: "Please enter the username" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            { required: true, message: "Please enter the password" },
                        ]}
                    >
                        <Input.Password placeholder="Enter a new password" />
                    </Form.Item>
                    <Form.Item
                        label="Address"
                        name="address"
                        rules={[{ required: true, message: "Please enter the address" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Role"
                        name="role"
                        rules={[
                            {
                                required: true,
                                message: "Please enter the role",
                            },
                            {
                                validator: (_, value) => {
                                    const allowedRoles = ["admin", "user", "editor"]; // Add allowed roles here
                                    if (!value || allowedRoles.includes(value.toLowerCase())) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error(`Role must be one of: ${allowedRoles.join(", ")}`)
                                    );
                                },
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default AdminPanel;
