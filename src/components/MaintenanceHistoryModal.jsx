import React from "react";
import { Modal, Table, Typography } from "antd";

const { Text } = Typography;

const MaintenanceHistoryModal = ({ visible, onClose, maintenanceHistory }) => {
    const columns = [
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Start",
            dataIndex: "start",
            key: "start",
            render: (text) => new Date(text).toLocaleString(),
        },
        {
            title: "End",
            dataIndex: "end",
            key: "end",
            render: (text) => new Date(text).toLocaleString(),
        },
        {
            title: "Technician",
            key: "technicians",
            render: (record) =>
                record.technicians.map(
                    (tech) => `${tech.firstname} ${tech.lastname}`
                ).join(", "),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
        },
        {
            title: "Notes",
            dataIndex: "notes",
            key: "notes",
        },
    ];

    return (
        <Modal
            title="Maintenance History"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={1500}
        >
            {maintenanceHistory.length > 0 ? (
                <Table
                    dataSource={maintenanceHistory}
                    columns={columns}
                    rowKey="_id"
                    pagination={false}
                />
            ) : (
                <Text>No maintenance history available.</Text>
            )}
        </Modal>
    );
};

export default MaintenanceHistoryModal;
