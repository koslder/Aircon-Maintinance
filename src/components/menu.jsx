import React, { useEffect, useState } from "react";
import { Button, Table, Input, Popconfirm, Flex, Form } from "antd";
import axios from "axios";
import { UpdateModal } from "../modals/menuUpdateModal";
import { AddModal } from "../modals/menuAddModal";

const { Search } = Input;

const MenuPanel = () => {
    const [selectedMenuItem, setSelectedMenuItem] = useState(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [menuData, setMenuData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await axios.get("https://capstone-sever.onrender.com/api/menu");
                setMenuData(response.data.data);
                setFilteredData(response.data.data); // Initialize filtered data
            } catch (error) {
                console.error("Error fetching menu:", error);
            }
        };

        fetchMenu();
    }, []);

    const handleSearch = (value) => {
        setSearchQuery(value);
        const filtered = menuData.filter((menuItem) =>
            Object.values(menuItem)
                .join(" ")
                .toLowerCase()
                .includes(value.toLowerCase())
        );
        setFilteredData(filtered);
    };

    const handleUpdate = (id) => {
        const menuToUpdate = menuData.find((menu) => menu._id === id);

        if (menuToUpdate) {
            setSelectedMenuItem(menuToUpdate);
            form.setFieldsValue({
                ...menuToUpdate,
            });
            setIsUpdateModalOpen(true);
        }
    };

    const handleUpdateSubmit = async (values) => {
        try {
            const updatedMenu = { ...values }; // Includes imageLink
            const response = await axios.patch(
                `https://capstone-sever.onrender.com/api/menu/${selectedMenuItem._id}`,
                updatedMenu
            );
            if (response.data.success) {
                setMenuData((prevData) =>
                    prevData.map((menu) =>
                        menu._id === selectedMenuItem._id ? { ...menu, ...updatedMenu } : menu
                    )
                );
                setIsUpdateModalOpen(false); // Close the modal after successful update
            }
        } catch (error) {
            console.error("Error updating menu item:", error);
        }
    };

    const handleAddSubmit = async (values) => {
        try {
            const newMenu = [values]; // Wrap the form values in an array as expected by the API
            const response = await axios.post(
                "https://capstone-sever.onrender.com/api/menu",
                newMenu
            );
            if (response.data.success) {
                setMenuData((prevData) => [...prevData, ...response.data.data]);
                setIsAddModalOpen(false); // Close the modal after successful add
            }
        } catch (error) {
            console.error("Error adding new menu item:", error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`https://capstone-sever.onrender.com/api/menu/${id}`);
            if (response.data.success) {
                setMenuData(prevData => prevData.filter(item => item._id !== id));
            }
            console.log(`Deleted menu item with id: ${id}`);
        } catch (error) {
            console.error("Error deleting menu item:", error);
        }
    };

    const menuColumns = [
        {
            title: "Menu",
            dataIndex: "menuItem",
            key: "menuItem",
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
        },
        {
            title: "Estimated Time",
            dataIndex: "estimatedTime",
            key: "estimatedTime",
        },
        {
            title: "Image Path",
            dataIndex: "imageLink",
            key: "imageLink",
        },
        {
            title: "Date Created",
            dataIndex: "created_at",
            key: "created_at",
            render: (text) => formatDate(text),
        },
        {
            title: "Date Updated",
            dataIndex: "updated_at",
            key: "updated_at",
            render: (text) => formatDate(text),
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
                        title="Are you sure you want to delete this menu item?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            danger
                            type="primary"
                            style={{
                                width: 105,
                                height: 40,
                                marginLeft: 8,
                                borderRadius: 100,
                            }}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </span>
            ),
        },
    ];

    return (
        <div className="Menu">
            <h1>Menu</h1>
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
                    style={{
                        width: 160,
                        height: 40,
                        borderRadius: 28,
                        backgroundColor: "#72CACF",
                    }}
                    onClick={() => setIsAddModalOpen(true)}
                >
                    Add New
                </Button>
            </Flex>
            <Table
                dataSource={filteredData}
                columns={menuColumns}
                rowKey="_id"
            />

            {isUpdateModalOpen && (
                <UpdateModal
                    visible={isUpdateModalOpen}
                    item={selectedMenuItem}
                    onCancel={() => setIsUpdateModalOpen(false)}
                    onFinish={handleUpdateSubmit}
                />
            )}

            {isAddModalOpen && (
                <AddModal
                    visible={isAddModalOpen}
                    onCancel={() => setIsAddModalOpen(false)}
                    onFinish={handleAddSubmit}
                />
            )}
        </div>
    );
};

export default MenuPanel;
