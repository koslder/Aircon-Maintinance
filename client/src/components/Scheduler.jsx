import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { Modal, Input, Form, Button, Select, message } from "antd";
import './scheduler.css';

const { Option } = Select;

const Scheduler = () => {
    const [events, setEvents] = useState([]);
    const [aircons, setAircons] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [maintenanceHistory, setMaintenanceHistory] = useState([]);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [form] = Form.useForm();
    const [notifiedEvents, setNotifiedEvents] = useState(new Set());
    const [taskOptions, setTaskOptions] = useState([]);

    const API_BASE_URL = "https://capstone-sever.onrender.com/api";


    const formatDateForInput = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventRes, airconRes, adminRes, taskRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/events`),
                    axios.get(`${API_BASE_URL}/aircon`),
                    axios.get(`${API_BASE_URL}/admins`),
                    axios.get(`${API_BASE_URL}/tasks`)
                ]);
                setEvents(eventRes.data);
                setAircons(airconRes.data);
                setAdmins(adminRes.data);
                setTaskOptions(taskRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        const askNotificationPermission = () => {
            if (!("Notification" in window)) {
                message.error("This browser does not support notifications.");
                return;
            }

            if (Notification.permission === "granted") {
                // Do nothing if permission is already granted
                return;
            }

            if (Notification.permission === "denied") {
                message.error("Notification permission has been denied. Please enable it in your browser settings.");
                return;
            }

            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    message.success("Notification permission granted.");
                } else if (permission === "denied") {
                    message.error("Notification permission denied.");
                }
            });
        };


        askNotificationPermission();
        fetchData();
    }, []);

    useEffect(() => {
        const checkUpcomingEvents = () => {
            const now = new Date();
            const nowUTC = now.toISOString();

            const upcomingEvents = events.filter(event => {
                const eventStart = new Date(event.start);
                return eventStart > new Date(nowUTC) &&
                    eventStart <= new Date(new Date(nowUTC).getTime() + 60 * 60000) &&
                    !notifiedEvents.has(event._id);
            });

            upcomingEvents.forEach(event => {
                sendNotification(event);
                notifiedEvents.add(event._id); // Mark this event as notified
                setNotifiedEvents(new Set(notifiedEvents));
            });
        };

        const intervalId = setInterval(checkUpcomingEvents, 1000);

        return () => clearInterval(intervalId);
    }, [events, notifiedEvents]);

    // Function to send a notification
    const sendNotification = (event) => {
        const notificationBody = `
            Title: ${event.title || "No Title"}
            Task Description: ${event.description || "No Description"}
            Start Date: ${new Date(event.start).toLocaleString('en-US', { timeZone: 'Asia/Manila' })}
            End Date: ${new Date(event.end).toLocaleString('en-US', { timeZone: 'Asia/Manila' })}
            Serial Number: ${event.serialNumber || "N/A"}
            Technicians: ${event.technicians ? event.technicians.join(", ") : "No Technicians Assigned"}
            Status: ${event.status || "Unknown"}
            Notes: ${event.notes || "No Notes"}
        `;

        const notification = new Notification("Upcoming Event", {
            body: notificationBody,
        });

        notification.onclick = () => {
            console.log(`Notification clicked for event ID: ${event._id}`);
            setCurrentEvent(event);
            setIsViewModalVisible(true)
        };
    };


    // Handle clicking on an empty cell to create a new event
    const handleDateSelect = (selectInfo) => {
        form.resetFields();
        form.setFieldsValue({
            start: formatDateForInput(selectInfo.startStr),
            end: formatDateForInput(selectInfo.endStr),
        });
        setIsCreateModalVisible(true);
    };

    // Handle form submission for adding a new event
    const handleAddEvent = async (values) => {
        const startDate = new Date(values.start).toISOString();
        const endDate = new Date(values.end).toISOString();

        try {
            await axios.post("https://capstone-sever.onrender.com/api/events", {
                ...values,
                start: startDate,
                end: endDate,
            });

            // Refetch all events from the server after adding a new one
            const updatedEventsResponse = await axios.get("https://capstone-sever.onrender.com/api/events");
            setEvents(updatedEventsResponse.data);

            setIsCreateModalVisible(false);
        } catch (error) {
            console.error("Error adding event:", error);
        }
    };



    // Handle clicking on an event to view its details
    const handleEventClick = (clickInfo) => {
        setCurrentEvent(clickInfo.event);
        fetchMaintenanceHistory(clickInfo.event);
        setIsViewModalVisible(true);
    };

    // Handle event deletion
    const handleDelete = async () => {
        try {
            const eventId = currentEvent._def.extendedProps._id; // Backend ID
            await axios.delete(`https://capstone-sever.onrender.com/api/events/${eventId}`);

            // Remove the event from the state
            setEvents((prevEvents) => prevEvents.filter((event) => event._id !== eventId));
            setIsViewModalVisible(false);
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    const fetchMaintenanceHistory = async (event) => {
        try {
            const aircon = event.extendedProps.aircon;
            const aircondId = typeof aircon === 'object' ? aircon._id : aircon;

            const response = await axios.get(`https://capstone-sever.onrender.com/api/aircon/${aircondId}`);

            if (response.data.maintenanceHistory) {
                const filteredHistory = response.data.maintenanceHistory
                    .filter((entry) => entry.status === "Completed")
                    .reduce((unique, item) => {
                        return unique.some((u) => u._id === item._id) ? unique : [...unique, item];
                    }, []);
                setMaintenanceHistory(filteredHistory);
            } else {
                setMaintenanceHistory([]);
            }
        } catch (error) {
            console.error("Error fetching maintenance history:", error);
        }
    };


    return (
        <div>
            <h1>Event Scheduler</h1>
            <FullCalendar
                timeZone="local"
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: 'short',
                }}
                events={events}
                editable={false}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                select={handleDateSelect}
                eventClick={handleEventClick}
                eventDidMount={(info) => {
                    if (info.event.extendedProps.status === "Completed") {
                        info.el.style.backgroundColor = "#42e147";
                        info.el.style.borderColor = "#42e147";
                    }
                    if (info.event.extendedProps.status === "Canceled") {
                        info.el.style.backgroundColor = "red";
                        info.el.style.borderColor = "red";
                    }
                }}
            />


            {/* Modal for creating a new event */}
            <Modal
                title="Add New Event"
                open={isCreateModalVisible}
                onCancel={() => setIsCreateModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsCreateModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={() => form.submit()}>
                        Add
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical" onFinish={handleAddEvent}>
                    <Form.Item label="Title" name="title" rules={[{ required: true, message: "Please enter a title!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: "Please select at least one task!" }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select Tasks"
                        >
                            {taskOptions.map((task) => (
                                <Option key={task} value={task}>
                                    {task}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Start Date"
                        name="start"
                        rules={[{ required: true, message: "Please select a start date!" }]}
                    >
                        <Input type="datetime-local" />
                    </Form.Item>
                    <Form.Item
                        label="End Date"
                        name="end"
                        rules={[{ required: true, message: "Please select an end date!" }]}
                    >
                        <Input type="datetime-local" />
                    </Form.Item>
                    <Form.Item label="Aircon" name="aircon" rules={[{ required: true }]}>
                        <Select placeholder="Select Aircon">
                            {aircons.map((aircon) => (
                                <Option key={aircon._id} value={aircon._id}>
                                    {aircon.serialNumber} - {aircon.brand} {aircon.model}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Technicians" name="technicians" rules={[{ required: true }]}>
                        <Select mode="multiple" placeholder="Select Technicians">
                            {admins.map((admin) => (
                                <Option key={admin._id} value={admin._id}>
                                    {admin.firstname} {admin.lastname}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Status" name="status" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Scheduled">Scheduled</Option>
                            <Option value="Completed">Completed</Option>
                            <Option value="Canceled">Canceled</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Notes" name="notes">
                        <Input.TextArea placeholder="Additional Notes" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal for viewing event details */}
            <Modal
                title="View Maintenance Details"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={[
                    <Button key="delete" danger onClick={handleDelete}>
                        Delete
                    </Button>,
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        Close
                    </Button>,
                ]}
            >
                {currentEvent ? (
                    <div>
                        {/* <p><strong>{currentEvent.extendedProps._id}</strong></p> */}
                        <p><strong>Title:</strong> {currentEvent.title || "N/A"}</p>
                        <p><strong>Task Description:</strong>
                            {currentEvent.extendedProps.description ? (
                                currentEvent.extendedProps.description.map((task, index) => (
                                    <li key={index}>{task}</li>
                                ))
                            ) : (
                                "N/A"
                            )}
                        </p>
                        <p><strong>Start Date:</strong> {currentEvent.start ? currentEvent.start.toLocaleString() : "N/A"}</p>
                        <p><strong>End Date:</strong> {currentEvent.end ? currentEvent.end.toLocaleString() : "N/A"}</p>
                        <p><strong>Aircon Serial Number:</strong> {currentEvent.extendedProps?.aircon?.serialNumber || "N/A"}</p>
                        <p><strong>Technicians: </strong>
                            {currentEvent.extendedProps.technicians.length
                                ? currentEvent.extendedProps.technicians.map((tech) => `${tech.firstname} ${tech.lastname}`).join(", ")
                                : "N/A"}
                        </p>
                        <p><strong>Status:</strong> {currentEvent.extendedProps?.status || "N/A"}</p>
                        <p><strong>Notes:</strong> {currentEvent.extendedProps?.notes || "N/A"}</p>

                        {/* Maintenance History Section */}
                        <div style={{ marginTop: "20px" }}>
                            <h3>Maintenance History</h3>

                            {maintenanceHistory.length > 0 ? (
                                maintenanceHistory
                                    .filter(entry => entry._id !== currentEvent.extendedProps._id)
                                    .slice(0, 3)
                                    .map((entry, index) => (
                                        <div
                                            key={entry._id}
                                            className={entry._id}
                                            style={{
                                                marginBottom: "10px",
                                                padding: "10px",
                                                border: "1px solid #ddd",
                                                borderRadius: "5px",
                                            }}
                                        >
                                            <p>{entry._id}</p>
                                            <p><strong>Task Description:</strong>
                                                {entry.description ? (
                                                    entry.description.map((task, idx) => (
                                                        <li key={idx}>{task}</li>
                                                    ))
                                                ) : (
                                                    "N/A"
                                                )}
                                            </p>
                                            <p><strong>Date: </strong>
                                                {entry.start ? new Date(entry.start).toLocaleDateString(undefined, {
                                                    year: "numeric",
                                                    month: "2-digit",
                                                    day: "2-digit"
                                                }) : "N/A"}
                                            </p>
                                            <p><strong>Start Time: </strong>
                                                {entry.start ? new Date(entry.start).toLocaleTimeString(undefined, {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                }) : "N/A"}
                                            </p>
                                            <p><strong>End Time: </strong>
                                                {entry.end ? new Date(entry.end).toLocaleTimeString(undefined, {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                }) : "N/A"}
                                            </p>
                                            <p><strong>Technicians: </strong>
                                                {entry.technicians.length
                                                    ? entry.technicians.map((tech) => `${tech.firstname} ${tech.lastname}`).join(", ")
                                                    : "N/A"}
                                            </p>
                                            <p><strong>Notes: </strong> {entry.notes || "N/A"}</p>
                                            <p><strong>Status: </strong> {entry.status || "N/A"}</p>
                                        </div>
                                    ))
                                    .length === 0 ? (
                                    <p>No maintenance history available for this aircon.</p>
                                ) : null
                            ) : (
                                <p>No maintenance history available for this aircon.</p>
                            )}

                        </div>

                        {/* Status Update Section */}
                        {currentEvent.extendedProps?.status === "Scheduled" && (
                            <Form
                                layout="inline"
                                onFinish={async (values) => {
                                    try {
                                        const eventId = currentEvent.extendedProps._id;

                                        const response = await axios.patch(
                                            `https://capstone-sever.onrender.com/api/events/${eventId}`,
                                            { status: values.status }
                                        );

                                        // Update local state
                                        setEvents((prevEvents) =>
                                            prevEvents.map((event) =>
                                                event._id === eventId ? { ...event, status: response.data.status } : event
                                            )
                                        );

                                        setIsViewModalVisible(false); // Close modal
                                    } catch (error) {
                                        console.error("Error updating status:", error);
                                    }
                                }}
                            >
                                <Form.Item
                                    name="status"
                                    initialValue="Scheduled"
                                    rules={[{ required: true, message: "Please select a status!" }]}
                                >
                                    <Select style={{ width: 200 }}>
                                        <Option value="Completed">Completed</Option>
                                        <Option value="Canceled">Canceled</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit">
                                        Update Status
                                    </Button>
                                </Form.Item>
                            </Form>
                        )}
                    </div>
                ) : (
                    <p>No event details available.</p>
                )}
            </Modal>
        </div>
    );
};

export default Scheduler;
