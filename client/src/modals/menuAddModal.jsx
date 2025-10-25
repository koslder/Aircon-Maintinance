import React, { useEffect } from "react";
import { Modal, Input, Form } from "antd";

export const AddModal = ({ visible, onCancel, onFinish }) => {
    const [form] = Form.useForm();

    const handleFormSubmit = (values) => {
        onFinish(values);
        onCancel();
    };

    useEffect(() => {
        if (!visible) {
            form.resetFields(); // Clear form when the modal is closed
        }
    }, [visible, form]);

    return (
        <Modal
            title="Add New Menu Item"
            open={visible}
            onOk={form.submit}
            onCancel={onCancel}
            okText="Add"
            cancelText="Cancel"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFormSubmit}
            >
                <Form.Item
                    label="Menu"
                    name="menuItem"
                    rules={[{ required: true, message: "Please enter the Menu Item" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Price"
                    name="price"
                    rules={[{ required: true, message: "Please enter the Price" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Estimated Time"
                    name="estimatedTime"
                    rules={[{ required: true, message: "Please enter the Estimated Time" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Image Link"
                    name="imageLink"
                    rules={[{ required: true, message: "Please enter the Image Link" }]}
                >
                    <Input placeholder="Enter Image URL" />
                </Form.Item>
            </Form>
        </Modal>
    );
};
