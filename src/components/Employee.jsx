import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Table, Button, Modal, Input, Form, Popconfirm, message, Select } from "antd";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const { Search } = Input;

const Employee = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModal, setIsAddModal] = useState(false);
    const [isUpdateModal, setIsUpdateModal] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [form] = Form.useForm();

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/admins`);
            const normalized = response.data.map((item) => ({
                ...item,
                _id: item._id || item.id || `temp-${Math.random().toString(36).slice(2, 9)}-${Date.now()}`,
            }));
            setEmployees(normalized);
            setFilteredData(normalized);
        } catch (error) {
            console.error("Error fetching employees:", error);
            message.error("Failed to fetch employees");
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Delete Employee
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${BACKEND_URL}/api/admins/${id}`);

            // Remove from master list and re-apply search filter
            setEmployees((prev) => {
                const next = prev.filter((employee) => employee._id !== id);
                setFilteredData(() => {
                    if (!searchQuery) return next;
                    return next.filter((employee) =>
                        Object.values(employee).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
                    );
                });
                return next;
            });

            message.success("Employee deleted successfully!");
        } catch (error) {
            console.error("Error deleting employee:", error);
            message.error("Failed to delete employee.");
        }
    };

    // Handle search functionality
    const handleSearch = (value) => {
        setSearchQuery(value);
        const filtered = employees.filter((employee) =>
            Object.values(employee)
                .join(" ")
                .toLowerCase()
                .includes(value.toLowerCase())
        );
        setFilteredData(filtered);
    };

    // Add Employee Modal
    const openAddModal = () => {
        setIsAddModal(true);
        form.resetFields();
    };

    const closeAddModal = () => {
        setIsAddModal(false);
    };

    const handleAddSubmit = async (values) => {
        try {
            const formattedValues = {
                ...values,
                birthdate: values.birthdate ? dayjs(values.birthdate).format("YYYY-MM-DD") : null,
            };

            const response = await axios.post(`${BACKEND_URL}/api/admins`, formattedValues);
            // Merge server response with the formattedValues so we don't lose fields the server doesn't return
            const created = { ...formattedValues, ...response.data };
            const newEmployee = {
                ...created,
                _id: response.data._id || response.data.id || `temp-${Math.random().toString(36).slice(2, 9)}-${Date.now()}`,
            };

            // Append to master list and reapply filter
            setEmployees((prev) => {
                const next = [...prev, newEmployee];
                setFilteredData(() => {
                    if (!searchQuery) return next;
                    return next.filter((employee) =>
                        Object.values(employee).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
                    );
                });
                return next;
            });

            message.success("Employee added successfully!");
            closeAddModal();
        } catch (error) {
            console.error("Error adding employee:", error);
            message.error("Failed to add employee.");
        }
    };

    // Update Employee Modal
    const openUpdateModal = (employee) => {
        setCurrentEmployee(employee);
        setIsUpdateModal(true);
        form.setFieldsValue({
            ...employee,
            birthdate: employee.birthdate ? dayjs(employee.birthdate).format("YYYY-MM-DD") : null,
        });
    };

    const closeUpdateModal = () => {
        setIsUpdateModal(false);
        setCurrentEmployee(null);
    };

    const handleUpdateSubmit = async (values) => {
        try {
            const formattedValues = {
                ...values,
                birthdate: values.birthdate ? dayjs(values.birthdate).format("YYYY-MM-DD") : null,
            };

            const response = await axios.patch(
                `${BACKEND_URL}/api/admins/${currentEmployee._id}`,
                formattedValues
            );

            // Merge currentEmployee, formattedValues and server response so no fields are lost
            const merged = { ...currentEmployee, ...formattedValues, ...response.data };
            const updatedEmployee = { ...merged, _id: currentEmployee._id };

            setEmployees((prev) => {
                const next = prev.map((employee) => (employee._id === currentEmployee._id ? updatedEmployee : employee));
                setFilteredData(() => {
                    if (!searchQuery) return next;
                    return next.filter((employee) =>
                        Object.values(employee).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
                    );
                });
                return next;
            });

            message.success("Employee updated successfully!");
            closeUpdateModal();
        } catch (error) {
            console.error("Error updating employee:", error);
            message.error("Failed to update employee.");
        }
    };

    const capitalizeFirstLetter = (text) => {
        if (!text) return "";
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    const columns = [
        {
            title: "First Name",
            dataIndex: "firstname",
            key: "firstname",
            render: (text) => capitalizeFirstLetter(text),
        },
        {
            title: "Last Name",
            dataIndex: "lastname",
            key: "lastname",
            render: (text) => capitalizeFirstLetter(text),
        },
        {
            title: "Birthdate",
            dataIndex: "birthdate",
            key: "birthdate",
            render: (text) => dayjs(text).format("MM/DD/YYYY"),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (text) => capitalizeFirstLetter(text),
        },
        {
            title: "Action",
            key: "actions",
            render: (text, record) => (
                <span>
                    <Button type="primary" style={{ marginRight: 8 }} onClick={() => openUpdateModal(record)}>
                        Update
                    </Button>
                    <Popconfirm
                        title="Are you sure to delete?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger>Delete</Button>
                    </Popconfirm>
                </span>
            ),
        },
    ];


    return (
        <div>
            <h1>Employee Dashboard</h1>

            <div style={{ marginBottom: 16 }}>
                <Search
                    placeholder="Search employees"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ width: 360 }}
                />
                <Button type="primary" onClick={openAddModal} style={{ marginLeft: 16 }}>
                    Add New Employee
                </Button>
            </div>

            <Table
                dataSource={filteredData}
                columns={columns}
                rowKey="_id"
                scroll={{ x: 1500 }}
            />

            {/* Add Modal */}
            <Modal
                title="Add New Employee"
                open={isAddModal}
                onCancel={closeAddModal}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleAddSubmit}>
                    <Form.Item label="First Name" name="firstname" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Last Name" name="lastname" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Birthdate" name="birthdate">
                        <Input type="date" />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Username" name="username" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Password" name="password" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item label="Role" name="role" rules={[{ required: true }]}>
                        <Select placeholder="Select a role" style={{ width: '100%' }}>
                            <Select.Option value="admin">Admin</Select.Option>
                            <Select.Option value="user">User</Select.Option>
                            <Select.Option value="editor">Editor</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Add Employee
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Update Modal */}
            <Modal
                title="Update Employee"
                open={isUpdateModal}
                onCancel={closeUpdateModal}
                onOk={() => {
                    form.validateFields().then(handleUpdateSubmit).catch((info) => console.error("Validation Error:", info));
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="First Name" name="firstname" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Last Name" name="lastname" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Birthdate" name="birthdate">
                        <Input type="date" />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Role" name="role" rules={[{ required: true }]}>
                        <Select placeholder="Select a role" style={{ width: '100%' }}>
                            <Select.Option value="admin">Admin</Select.Option>
                            <Select.Option value="user">User</Select.Option>
                            <Select.Option value="editor">Editor</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Employee;
