import { AdminBreadcrumbs, getApiLink } from 'zyra';
import Products from './products';
import Vendors from './vendors';
import Coupons from './coupon';
import Transactions from './transaction';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Notification = () => {
    const [productCount, setProductCount] = useState<number>(0);
    const [couponCount, setCouponCount] = useState<number>(0);
    const [transactionCount, setTransactionCount] = useState<number>(0);
    const [storeCount, setStoreCount] = useState<number>(0);

    const [activeTab, setActiveTab] = useState("products");
    const [tasks, setTasks] = useState<string[]>([]);
    const [showInput, setShowInput] = useState(false);
    const [task, setTask] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!appLocalizer.user_id) return;

        const userEndpoint = `${appLocalizer.apiUrl}/wp/v2/users/${appLocalizer.user_id}`;

        axios.get(userEndpoint, {
            headers: { 'X-WP-Nonce': appLocalizer.nonce }
        }).then(res => {
            setTasks(res.data.meta?.multivendorx_dashboard_tasks || []);
        }).catch(err => console.error(err));
    }, [appLocalizer.user_id]);


    const saveTasks = (updatedTasks: string[]) => {
        const userEndpoint = `${appLocalizer.apiUrl}/wp/v2/users/${appLocalizer.user_id}`;

        axios.patch(userEndpoint,
            { meta: { multivendorx_dashboard_tasks: updatedTasks } },
            { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
        ).then(res => {
            setTasks(res.data.meta.multivendorx_dashboard_tasks);
        }).catch(err => console.error(err));
    };


    const handleConfirm = async () => {
        if (!task.trim()) return;

        setLoading(true);
        try {
            await saveTasks([...tasks, task]);
            setTask("");
            setShowInput(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (index: number) => {
        const updatedTasks = tasks.filter((_, idx) => idx !== index);
        saveTasks(updatedTasks);
    };



    // In Notification.tsx
    const refreshCounts = () => {
        axios({
            method: 'GET',
            url: `${appLocalizer.apiUrl}/wc/v3/products`,
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { per_page: 1, meta_key: 'multivendorx_store_id', status: 'pending' }
        })
            .then((response) => {
                const totalCount = parseInt(response.headers['x-wp-total'], 10) || 0;
                setProductCount(totalCount);
            });

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'coupons'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true },
        }).then((response) => setCouponCount(response.data || 0));

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true, status: 'pending' },
        }).then((response) => setStoreCount(response.data || 0));

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'transaction'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true, status: 'Pending' },
        }).then((response) => setTransactionCount(response.data || 0));
    };

    const tabs = [
        { id: "products", label: "Products", content: <Products onUpdated={refreshCounts} /> },
        { id: "stores", label: "Stores", content: <Vendors onUpdated={refreshCounts} /> },
        { id: "coupons", label: "Coupons", content: <Coupons onUpdated={refreshCounts} /> },
        { id: "transactions", label: "Withdrawal(static)", content: <Transactions onUpdated={refreshCounts} /> },
    ];
    // run once on mount
    useEffect(() => {
        refreshCounts();
    }, []);
    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-bar-chart"
                tabTitle="Actions Dashboard"
                description={'Manage all pending administrative actions including approvals, payouts, and notifications.'}
            />

            {/* Workboard Stats */}
            <div className="work-board">

                <div className="row">
                    <div className="column">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Account Overview
                                </div>
                            </div>
                            {/* <div className="right">
                                <span>Updated 1 month ago</span>
                            </div> */}
                        </div>
                        <div className="overview-card-wrapper">
                            <div className="action">
                                <div className="title">
                                    {productCount}
                                    <i className="adminlib-cart"></i>
                                </div>
                                <div className="description">
                                    Pending Products
                                </div>
                            </div>
                            <div className="action">
                                <div className="title">
                                    {storeCount}
                                    <i className="adminlib-tools"></i>
                                </div>
                                <div className="description">
                                    Pending Stores
                                </div>
                            </div>
                        </div>
                        <div className="overview-card-wrapper">
                            <div className="action">
                                <div className="title">
                                    {couponCount}
                                    <i className="adminlib-catalog"></i>
                                </div>
                                <div className="description">
                                    Pending Coupons
                                </div>
                            </div>
                            <div className="action">
                                <div className="title">
                                    {transactionCount}
                                    <i className="adminlib-module"></i>
                                </div>
                                <div className="description">
                                    Pending Withdrawal(static)
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="column">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Tasks
                                </div>
                            </div>
                            <div className="right">
                                <div className="admin-btn btn-purple">
                                    <i className="adminlib-plus-circle-o"></i>
                                    Add task
                                </div>
                            </div>
                        </div>
                        <div className="task-list-wrapper">
                            <ul className="task-list">
                                {tasks.map((t, idx) => (
                                    <li key={idx} className="task-item">
                                        <input type="checkbox" />
                                        <span>{t}</span>
                                        <i
                                            className="adminlib-delete delete-icon"
                                            onClick={() => handleDelete(idx)}
                                        ></i>
                                    </li>
                                ))}
                            </ul>

                            {showInput && (
                                <span className="add-mode">
                                    <input
                                        type="text"
                                        value={task}
                                        onChange={(e) => setTask(e.target.value)}
                                        placeholder="Enter task"
                                        className="basic-input"
                                        autoFocus
                                        disabled={loading} // disable input while saving
                                    />
                                    <div className="buttons-wrapper">
                                        <button
                                            className="admin-btn btn-red"
                                            onClick={() => setShowInput(false)}
                                            disabled={loading} // disable cancel while saving
                                        >
                                            <i className="adminlib-close"></i> Cancel
                                        </button>
                                        <button
                                            className="admin-btn btn-purple"
                                            onClick={handleConfirm}
                                            disabled={!task.trim() || loading} // disable add button if empty or loading
                                        >
                                            {loading ? <i className="adminlib-spinner spinning"></i> : <i className="adminlib-plus-circle-o"></i>} Add
                                        </button>
                                    </div>
                                </span>
                            )}

                            {!showInput && (
                                <button className="admin-btn btn-purple" onClick={() => setShowInput(true)}>
                                    + Add Task
                                </button>
                            )}

                        </div>
                    </div>

                    <div className="column">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Notification
                                </div>
                            </div>
                            <div className="right">
                                <div className="admin-btn btn-purple">
                                    <i className="adminlib-eye"></i>
                                    Show all notification
                                </div>
                            </div>
                        </div>
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
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="column">
                        <div className="action-tab-wrapper">
                            <div className="card-header">
                                <div className="left">
                                    <div className="title">
                                        Account Overview
                                    </div>
                                </div>
                                <div className="right">
                                    <i className="adminlib-more-vertical"></i>
                                </div>
                            </div>
                            {/* Tab Titles */}
                            <div className="tab-titles">
                                {tabs.map((tab) => (
                                    <div
                                        key={tab.id}
                                        className={`title ${activeTab === tab.id ? "active" : ""}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <p><i className="adminlib-cart"></i>{tab.label}</p>
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