import React, { useEffect, useState } from 'react';
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { Table } from "antd";
import './dashboard.css';

const Dashboard = () => {
    const [user, setUser] = useState({
        id: '',
        firstname: '',
        lastname: ''
    });

    const [events, setEvents] = useState([]);
    const [aircons, setAircons] = useState([]);
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [totals, setTotals] = useState({
        Scheduled: 0,
        Completed: 0,
        Canceled: 0,
    });
    const [monthlyData, setMonthlyData] = useState([]);
    const [assignedTasksByDay, setAssignedTasksByDay] = useState([]);

    const [loading, setLoading] = useState(true); // Add a loading state
    const [error, setError] = useState(null); // Add an error state

    const API_BASE_URL = "https://capstone-sever.onrender.com/api"; // Define base URL

    const fetchDashboardData = async () => {
        setLoading(true); // Start loading
        setError(null); // Clear any previous errors
        try {
            const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
            const eventsData = eventsResponse.data;

            const airconResponse = await axios.get(`${API_BASE_URL}/aircon`);
            const airconsData = airconResponse.data;

            setAircons(airconsData); //setting aircons data

            const statusCounts = {
                Scheduled: 0,
                Completed: 0,
                Canceled: 0,
            };

            const monthlyCounts = {
                January: 0,
                February: 0,
                March: 0,
                April: 0,
                May: 0,
                June: 0,
                July: 0,
                August: 0,
                September: 0,
                October: 0,
                November: 0,
                December: 0,
            };

            eventsData.forEach((event) => {
                if (statusCounts.hasOwnProperty(event.status)) {
                    statusCounts[event.status]++;
                }

                const month = new Date(event.start).toLocaleString('default', { month: 'long' });
                if (monthlyCounts.hasOwnProperty(month)) {
                    monthlyCounts[month]++;
                }
            });

            const chartData = Object.keys(monthlyCounts).map((month) => ({
                month,
                count: monthlyCounts[month],
            }));

            setEvents(eventsData);
            setTotals(statusCounts);
            setMonthlyData(chartData);

        } catch (error) {
            console.error("Error fetching events:", error);
            setError(error.message || "An error occurred while fetching data.");
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const fetchAssignedTasks = async (technicianId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/events/assigned/${technicianId}`);
            setAssignedTasks(response.data);
            calculateAssignedTasksByDay(response.data);
        } catch (error) {
            console.error("Error fetching assigned tasks:", error);
            setError(error.message || "An error occurred while fetching data.");
        }
    };

    const calculateAssignedTasksByDay = (tasks) => {
        const dayCounts = {
            Sunday: 0,
            Monday: 0,
            Tuesday: 0,
            Wednesday: 0,
            Thursday: 0,
            Friday: 0,
            Saturday: 0,
        };

        tasks.forEach((task) => {
            const day = new Date(task.start).toLocaleString('default', { weekday: 'long' });
            if (dayCounts.hasOwnProperty(day)) {
                dayCounts[day]++;
            }
        });

        const chartData = Object.keys(dayCounts).map((day) => ({
            day,
            count: dayCounts[day],
        }));

        setAssignedTasksByDay(chartData);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('firstname');
        localStorage.removeItem('lastname');
        localStorage.removeItem('id');
        window.location.href = '/login';
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            window.location.href = '/login';
        } else {
            const id = localStorage.getItem('id');
            const firstname = localStorage.getItem('firstname');
            const lastname = localStorage.getItem('lastname');
            setUser({ id, firstname, lastname });

            // Fetch data
            fetchDashboardData();
            fetchAssignedTasks(id);
        }
    }, []);

    const assignedTaskColumns = [

        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                let color = "";
                let statusText = status;

                // Determine the color based on status
                if (status === "Completed") {
                    color = "green";
                } else if (status === "Canceled") {
                    color = "red";
                } else if (status === "Scheduled") {
                    color = "orange";
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
            title: "Start Date",
            dataIndex: "start",
            key: "start",
            render: (text) => new Date(text).toLocaleString(),
        },
        {
            title: "End Date",
            dataIndex: "end",
            key: "end",
            render: (text) => new Date(text).toLocaleString(),
        },
        {
            title: "Model",
            dataIndex: ["aircon", "model"],
            key: "airconModel",
        },
        {
            title: "Serial Number",
            dataIndex: ["aircon", "serialNumber"],
            key: "serialNumber",
        },
        {
            title: "Location",
            dataIndex: ["aircon", "location"],
            key: "location",
        },
    ];

    if (loading) {
        return <div>Loading Dashboard Data...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const tickFormatter = (value) => {
        return Math.floor(value);
    }
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{`${label} : ${payload[0].value}`}</p>
                </div>
            );
        }

        return null;
    };

    return (
        <div>
            <div className='total-bar'>
                <h2>Total Maintenance</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={tickFormatter} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="count" fill="#1a252f" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="tasks-overview-card">
                <h2>All Maintenance Tasks Summary</h2>
                <div className="tasks-container">
                    {/* <div className="task-card">
                        <p><strong>Total Tasks:</strong> {totals.Scheduled + totals.Completed + totals.Canceled}</p>
                    </div> */}
                    <div className="task-card">
                        <p><strong>Completed Tasks:</strong> {totals.Completed}</p>
                    </div>
                    <div className="task-card">
                        <p><strong>Scheduled Tasks:</strong> {totals.Scheduled}</p>
                    </div>
                    <div className="task-card">
                        <p><strong>Canceled Tasks:</strong> {totals.Canceled}</p>
                    </div>
                </div>
            </div>
            {/* <div>
                <h2>Aircons</h2>
                <p><strong>Total Aircons:</strong> {aircons.length}</p>
            </div> */}
            <ResponsiveContainer width='100%'>
                <div className="task-overview">
                    <div className='assigned-bar'>
                        <h2>Assigned Maintenance</h2>
                        <BarChart width={750} height={350} data={assignedTasksByDay}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis tickFormatter={tickFormatter} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="count" fill="#1a252f" />
                        </BarChart>
                    </div>
                    <div className="tasks-list">
                        <h2>Assigned Maintenance Tasks</h2>
                        <Table
                            dataSource={assignedTasks}
                            columns={assignedTaskColumns}
                            rowKey="_id" // Assuming each task has a unique _id

                        />
                    </div>
                </div>
            </ResponsiveContainer>
            {/* <h1>Welcome to the Dashboard</h1>
            <div>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Name:</strong> {user.firstname} {user.lastname}</p>
            </div>
            <button onClick={handleLogout}>Logout</button> */}
        </div>
    );
};

export default Dashboard;
