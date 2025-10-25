import React, { useState, useEffect } from "react";
import { Modal, Input, Form } from "antd";

export const UpdateModal = ({ visible, item, onCancel, onFinish }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (item) {
            form.setFieldsValue(item);
        }
    }, [item, form]);

    const handleFormSubmit = (values) => {
        onFinish(values);
        onCancel();
    };

    return (
        <Modal
            title="Update Menu Item"
            open={visible}
            onOk={form.submit}
            onCancel={onCancel}
            okText="Update"
            cancelText="Cancel"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFormSubmit} // Handle form submission
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

