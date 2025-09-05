import { AdminBreadcrumbs } from 'zyra';
import WithdrawalRequests from './withdrawalRequests';
import Products from './products';
import Vendors from './vendors';
import Coupons from './coupon';
import Transactions from './transaction';
import { useEffect, useState } from 'react';

const Notification = () => {


    const [activeTab, setActiveTab] = useState("products");


    const tabs = [
        { id: "products", label: "Products", content: <Products /> },
        { id: "vendors", label: "Vendors", content: <Vendors /> },
        { id: "coupons", label: "Coupons", content: <Coupons /> },
        { id: "transactions", label: "Transaction", content: <Transactions /> },
    ];
    const workboardStats = [
        {
            id: 'reviews',
            label: 'Pending Products',
            count: 12,
        },
        {
            id: 'reviews',
            label: 'Pending Vendors',
            count: 12,
        },
        {
            id: 'reviews',
            label: 'Pending Coupons',
            count: 12,
        },
        {
            id: 'reviews',
            label: 'Pending Transaction',
            count: 12,
        },
    ];

    const withdrawalExtraStats = [
        { id: 'reverse', label: 'Reverse Withdrawal', value: '₹0.00' },
        { id: 'collected', label: 'Total Collected', value: '₹25,440.00' },
        { id: 'remaining', label: 'Remaining Balance', value: '₹12,850.00' },
        { id: 'transactions', label: 'Total Transactions', value: '156' },
    ];
    const tasks = [
        {
            id: 1,
            title: "Fix login bug",
            priority: "High",
            dueDate: "2025-09-10",
        },
        {
            id: 2,
            title: "Update dashboard UI",
            priority: "Medium",
            dueDate: "2025-09-15",
        },
        {
            id: 3,
            title: "Write unit tests",
            priority: "Low",
            dueDate: "2025-09-20",
        },
        {
            id: 4,
            title: "Deploy staging server",
            priority: "High",
            dueDate: "2025-09-08",
        },
    ];
    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-cart"
                tabTitle="Notification Dashboard"
            />

            {/* Workboard Stats */}
            <div className="work-board">
                <div className="row">
                    <div className="column">
                        <div className="title"><i className="adminlib-person"></i> Account Overview</div>
                        <div className="action-card-wrapper">
                            <div className="action">
                                <div className="title">
                                    3
                                    <i className="adminlib-cart"></i>
                                </div>
                                <div className="description">
                                    Pending Products
                                </div>
                            </div>
                            <div className="action">
                                <div className="title">
                                    52
                                    <i className="adminlib-tools"></i>
                                </div>
                                <div className="description">
                                    Pending Vendors
                                </div>
                            </div>
                        </div>
                        <div className="action-card-wrapper">
                            <div className="action">
                                <div className="title">
                                    99
                                    <i className="adminlib-catalog"></i>
                                </div>
                                <div className="description">
                                    Pending Coupons
                                </div>
                            </div>
                            <div className="action">
                                <div className="title">
                                    3
                                    <i className="adminlib-module"></i>
                                </div>
                                <div className="description">
                                    Pending Transaction
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="column">
                        <div className="title"><i className="adminlib-book"></i> Tasks</div>
                        <div className="task-manager">

                            {/* Task Table */}
                            <table className="task-table">
                                {/* <thead>
                                    <tr>
                                        <th>Task Title</th>
                                        <th>Priority</th>
                                        <th>Due Date</th>
                                    </tr>
                                </thead> */}
                                <tbody>
                                    {tasks.map((task) => (
                                        <tr
                                            key={task.id}
                                            className="task-row"
                                            onClick={() => setShowDetails(task)}
                                        >
                                            <td>{task.title}</td>
                                            <td>
                                                <span className={`priority ${task.priority.toLowerCase()}`}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td>{task.dueDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="buttons-wrapper">
                                <div className="admin-btn btn-purple">
                                    <i className="adminlib-plus-circle-o"></i>
                                    Add task
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="column">
                        <div className="title"><i className="adminlib-notification"></i> Notification</div>
                        <div className="notification-wrapper">
                            <ul>
                                <li>
                                    <div className="icon-wrapper">
                                        <i className="adminlib-form-paypal-email blue"></i>
                                    </div>
                                    <div className="details">
                                        <div className="notification-title">Lorem ipsum dolor sit amet.</div>
                                        <div className="des">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</div>
                                        <span>1d ago</span>
                                    </div>

                                </li>
                                <li>
                                    <div className="icon-wrapper">
                                        <i className="adminlib-mail orange"></i>
                                    </div>
                                    <div className="details">
                                        <div className="notification-title">Lorem ipsum dolor sit amet.</div>
                                        <div className="des">Lorem ipsum dolor sit amet, consectetur adipisicing elit</div>
                                        <span>34min ago</span>
                                    </div>
                                </li>
                                <li>
                                    <div className="icon-wrapper">
                                        <i className="adminlib-form-paypal-email green"></i>
                                    </div>
                                    <div className="details">
                                        <div className="notification-title">Lorem ipsum dolor sit amet.</div>
                                        <div className="des">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</div>
                                        <span>34min ago</span>
                                    </div>
                                </li>
                                <li>
                                    <div className="icon-wrapper">
                                        <i className="adminlib-calendar red"></i>
                                    </div>
                                    <div className="details">
                                        <div className="notification-title">Lorem ipsum dolor sit amet.</div>
                                        <div className="des">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</div>
                                        <span>34min ago</span>
                                    </div>
                                </li>
                            </ul>

                            <div className="buttons-wrapper">
                                <div className="admin-btn btn-purple">
                                    <i className="adminlib-eye"></i>
                                    Show all notification
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="column">
                        <div className="action-tab-wrapper">
                            {/* Tab Titles */}
                            <div className="tab-titles">
                                {tabs.map((tab) => (
                                    <div
                                        key={tab.id}
                                        className={`title ${activeTab === tab.id ? "active" : ""}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <h2>{tab.label}</h2>
                                    </div>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="tab-content">
                                {tabs.map(
                                    (tab) =>
                                        activeTab === tab.id && (
                                            <div key={tab.id} className="tab-panel">
                                                {tab.content}
                                            </div>
                                        )
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default Notification;
