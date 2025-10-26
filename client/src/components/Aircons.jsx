import axios from "axios";
import { useEffect, useState } from "react";
import { Table, Button, Modal, Input, Form, Popconfirm, message } from "antd";
import MaintenanceHistoryModal from "./MaintenanceHistoryModal";


const { Search } = Input;

const Aircons = () => {
    const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
    const [airconData, setAirconData] = useState([]);
    const [airconFilteredData, setAirconFilteredData] = useState([]);
    const [maintenanceHistory, setMaintenanceHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModal, setIsAddModal] = useState(false);
    const [isUpdateModal, setIsUpdateModal] = useState(false);
    const [currentAircon, setCurrentAircon] = useState(null);
    const [form] = Form.useForm();

    const fetchAircons = async () => {
        try {
            const response = await axios.get("https://capstone-sever.onrender.com/api/aircon");
            setAirconData(response.data);
            setAirconFilteredData(response.data);
        } catch (error) {
            console.error("Error fetching Aircon:", error);
        }
    };

    useEffect(() => {
        fetchAircons();
    }, []);

    const handleSearch = (value) => {
        setSearchQuery(value);
        const filtered = airconData.filter((airconData) =>
            Object.values(airconData)
                .join(" ")
                .toLowerCase()
                .includes(value.toLowerCase())
        );
        setAirconFilteredData(filtered);
    };

    const openAddModal = () => {
        setIsAddModal(true);
        form.resetFields();
    };

    const closeAddModal = () => {
        setIsAddModal(false);
    };

    const handleAddAircon = async (values) => {
        try {
            await axios.post("https://capstone-sever.onrender.com/api/aircon", values);
            message.success("Aircon added successfully!");
            fetchAircons();
            closeAddModal();
        } catch (error) {
            console.error("Error adding Aircon:", error);
            message.error("Failed to add Aircon.");
        }
    };

    const openUpdateModal = (record) => {
        setCurrentAircon(record);
        setIsUpdateModal(true);
        form.setFieldsValue(record);
    };

    const closeUpdateModal = () => {
        setIsUpdateModal(false);
        setCurrentAircon(null);
    };

    const handleUpdateAircon = async (values) => {
        try {
            await axios.patch(`https://capstone-sever.onrender.com/api/aircon/${currentAircon._id}`, values);
            message.success("Aircon updated successfully!");
            fetchAircons();
            closeUpdateModal();
        } catch (error) {
            console.error("Error updating Aircon:", error);
            message.error("Failed to update Aircon.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://capstone-sever.onrender.com/api/aircon/${id}`);
            message.success("Aircon deleted successfully!");
            fetchAircons();
        } catch (error) {
            console.error("Error deleting Aircon:", error);
            message.error("Failed to delete Aircon.");
        }
    };

    const fetchMaintenanceHistory = async (id) => {
        try {
            const response = await axios.get(`https://capstone-sever.onrender.com/api/aircon/${id}`);
            setMaintenanceHistory(response.data.maintenanceHistory || []);
            setIsHistoryModalVisible(true);
        } catch (error) {
            console.error("Error fetching maintenance history:", error);
            message.error("Failed to load maintenance history.");
        }
    };



    const columns = [
        {
            title: "Brand",
            dataIndex: "brand",
            key: "brand",
        },
        {
            title: "Model",
            dataIndex: "model",
            key: "model",
        },
        {
            title: "Serial Number",
            dataIndex: "serialNumber",
            key: "serialNumber",
        },
        {
            title: "Location",
            dataIndex: "location",
            key: "location",
        },
        {
            title: "Installation Date",
            dataIndex: "installationDate",
            key: "installationDate",
            render: (text) => new Date(text).toLocaleDateString(),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                let color = "";
                let statusText = status;

                // Determine the color based on status
                if (status === "Active") {
                    color = "green";
                } else if (status === "Inactive") {
                    color = "red";
                } else if (status === "Under Maintenance") {
                    color = "orange"; // You can choose a different color here
                    statusText = "Maintenance"; // Display different text for maintenance
                }

                return (
                    <span style={{ display: "flex", alignItems: "center" }}>
                        <span
                            style={{
                                display: "inline-block",
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                backgroundColor: color,
                                marginRight: 8,
                            }}
                        ></span>
                        {statusText}
                    </span>
                );
            },
        },
        {
            title: "Action",
            key: "actions",
            render: (text, record) => (
                <span>
                    <Button type="primary" onClick={() => openUpdateModal(record)} style={{ marginRight: 8 }}>
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

                    <Button type="primary" onClick={() => fetchMaintenanceHistory(record._id)} style={{ marginLeft: 8 }}>
                        View History
                    </Button>
                </span>
            ),
        },
    ];

    return (
        <div>
            <h1>Aircons</h1>

            <div style={{ marginBottom: 16 }}>
                <Search
                    placeholder="Search Aircons"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ width: 360 }}
                />
                <Button type="primary" onClick={openAddModal} style={{ marginLeft: 16 }}>
                    Add New Aircon
                </Button>
            </div>

            <Table
                dataSource={airconFilteredData}
                columns={columns}
                rowKey="_id"
            />

            <Modal
                title="Add New Aircon"
                open={isAddModal}
                onCancel={closeAddModal}
                onOk={() => {
                    form.validateFields().then(handleAddAircon).catch((info) => console.log(info));
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="brand" label="Brand" rules={[{ required: true, message: "Please input the brand!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="model" label="Model" rules={[{ required: true, message: "Please input the model!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="serialNumber" label="Serial Number" rules={[{ required: true, message: "Please input the serial number!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="location" label="Location" rules={[{ required: true, message: "Please input the location!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="installationDate" label="Installation Date" rules={[{ required: true, message: "Please input the installation date!" }]}>
                        <Input type="date" />
                    </Form.Item>
                    <Form.Item name="status" label="Status" rules={[{ required: true, message: "Please select the status!" }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Update Aircon"
                open={isUpdateModal}
                onCancel={closeUpdateModal}
                onOk={() => {
                    form.validateFields().then(handleUpdateAircon).catch((info) => console.log(info));
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="brand" label="Brand" rules={[{ required: true, message: "Please input the brand!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="model" label="Model" rules={[{ required: true, message: "Please input the model!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="serialNumber" label="Serial Number" rules={[{ required: true, message: "Please input the serial number!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="location" label="Location" rules={[{ required: true, message: "Please input the location!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="installationDate" label="Installation Date" rules={[{ required: true, message: "Please input the installation date!" }]}>
                        <Input type="date" />
                    </Form.Item>
                    <Form.Item name="status" label="Status" rules={[{ required: true, message: "Please select the status!" }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
            <MaintenanceHistoryModal
                visible={isHistoryModalVisible}
                onClose={() => setIsHistoryModalVisible(false)}
                maintenanceHistory={maintenanceHistory}
            />

        </div>
    );
};

export default Aircons;
