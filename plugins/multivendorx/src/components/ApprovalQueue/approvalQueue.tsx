import { AdminBreadcrumbs, getApiLink } from 'zyra';
import Products from './products';
import Vendors from './vendors';
import Coupons from './coupon';
import Transactions from './transaction';
import { useEffect, useState } from 'react';
import axios from 'axios';

const ApprovalQueue = () => {
    const [productCount, setProductCount] = useState<number>(0);
    const [couponCount, setCouponCount] = useState<number>(0);
    const [transactionCount, setTransactionCount] = useState<number>(0);
    const [storeCount, setStoreCount] = useState<number>(0);

    const [activeTab, setActiveTab] = useState("");
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
            url: `${appLocalizer.apiUrl}/wc/v3/coupons`,
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { per_page: 1, meta_key: 'multivendorx_store_id', status: 'pending' }
        })
            .then((response) => {
                const totalCount = parseInt(response.headers['x-wp-total'], 10) || 0;
                setCouponCount(totalCount);
            });

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true, status: 'pending' },
        }).then((response) => setStoreCount(response.data || 0));

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { pending_withdraw: true } //important: use this param
        })
            .then((response) => {
                const count = response.data.length || 0; // response.data is an array of stores with pending withdraw
                setTransactionCount(count);
            })
            .catch(() => setTransactionCount(0));
    };
    const tabs = [
        ...(appLocalizer.settings_databases_value['general']['approve_store'] === "manually"
            ? [{
                id: "products",
                label: "Stores",
                icon: "adminlib-calendar red",
                des: "Eager to join the marketplace",
                count: storeCount,
                content:
                    <>
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Questions
                                </div>
                                <div className="des">Waiting for your response</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <Products onUpdated={refreshCounts} />
                    </>
            }]
            : []
        ),
        {
            id: "stores",
            label: "Stores",
            icon: "adminlib-calendar yellow",
            count: 9,
            des: "Awaiting verification check",
            content:
                <>
                    <div className="card-header">
                        <div className="left">
                            <div className="title">
                                Stores
                            </div>
                            <div className="des">Waiting for your response</div>
                        </div>
                        <div className="right">
                            <i className="adminlib-more-vertical"></i>
                        </div>
                    </div>
                    <Vendors onUpdated={refreshCounts} />
                </>
        },
        ...(Array.isArray(appLocalizer.settings_databases_value['privacy-settings'] ['enable_profile_deactivation_request'])
            && appLocalizer.settings_databases_value['privacy-settings']['enable_profile_deactivation_request'].includes("enable_profile_deactivation_request")
            ? [{
                id: "coupons",
                label: "Stores",
                icon: "adminlib-calendar green",
                count: 9,
                des: "Requested deactivation",
                content:
                    <>
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Stores
                                </div>
                                <div className="des">Waiting for your response</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <Coupons onUpdated={refreshCounts} />
                    </>
            }]
            : []
        ),
        ...(Array.isArray(appLocalizer.settings_databases_value['store-capability'] ['products'])
            && appLocalizer.settings_databases_value['store-capability'] ['products'].includes("publish_products")
            ? [{
                id: "product-approval",
                label: "Products",
                icon: "adminlib-calendar blue",
                count: productCount,
                des: "Waiting to be published",

                content:
                    <>
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Products
                                </div>
                                <div className="des">Waiting for your response</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <Transactions onUpdated={refreshCounts} />
                    </>
            }]
            : []
        ),
        ...(Array.isArray(appLocalizer.settings_databases_value['store-capability'] ['coupons'])
            && appLocalizer.settings_databases_value['store-capability'] ['coupons'].includes("publish_coupons")
            ? [{
                id: "coupon-approval",
                label: "Coupons",
                icon: "adminlib-calendar red",
                des: "Need a quick approval",
                count: couponCount,
                content:
                    <>
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Coupons
                                </div>
                                <div className="des">Waiting for your response</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <Transactions onUpdated={refreshCounts} />
                    </>
            }]
            : []
        ),
        {
            id: "wholesale-customer",
            label: "Customers",
            icon: "adminlib-calendar yellow",
            des: "Ready to become wholesalers",

            count: 9,
            content:
                <>
                    <div className="card-header">
                        <div className="left">
                            <div className="title">
                                Customers
                            </div>
                            <div className="des">Ready to become wholesalers</div>
                        </div>
                        <div className="right">
                            <i className="adminlib-more-vertical"></i>
                        </div>
                    </div>
                    <Transactions onUpdated={refreshCounts} />
                </>
        },
        ...(appLocalizer.settings_databases_value['disbursement']['withdraw_type'] === "manual"
            ? [        {
                id: "withdrawal",
                label: "Withdrawals",
                icon: "adminlib-calendar blue",
                des: "Queued for disbursement",
                count: transactionCount,
                content:
                    <>
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Withdrawals
                                </div>
                                <div className="des">Waiting for your response</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <Transactions onUpdated={refreshCounts} />
                    </>
            }]
            : []
        ),
    ];
    useEffect(() => {
        if (!tabs.find(tab => tab.id === activeTab)) {
            setActiveTab(tabs[0]?.id || "");
        }
    }, [tabs, activeTab]);

    // run once on mount
    useEffect(() => {
        refreshCounts();
    }, []);
    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-bar-chart"
                tabTitle="Approval Queue"
                description={'Manage all pending administrative actions including approvals, payouts, and notifications.'}
            />

            {/* Workboard Stats */}
            <div className="general-wrapper">

                {/* <div className="row">
                    <div className="column">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Review Store Submissions
                                </div>
                            </div>
                            <div className="right">
                                <span>Updated 1 month ago</span>
                            </div>
                        </div>
                        <div className="overview-card-wrapper">
                            <div className="action">
                                <div className="title">
                                    {productCount}
                                    <i className="adminlib-cart"></i>
                                </div>
                                <div className="description">
                                    Products Submitted
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
                                    Coupon Approvals
                                </div>
                            </div>
                            <div className="action">
                                <div className="title">
                                    {transactionCount}
                                    <i className="adminlib-module"></i>
                                </div>
                                <div className="description">
                                    Withdrawal Requests
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
                                    <i className="adminlib-plus-circle-o"></i> Add Task
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
                </div> */}


                <div className="row">
                    <div className="overview-card-wrapper tab">
                        {/* {CustomerServicesStats.map(stat => (
                            <div className="action" key={stat.id}>
                                <div className="title">
                                    {stat.count}
                                    <i className={stat.icon}></i>
                                </div>
                                <div className="description">
                                    {stat.label}
                                </div>
                            </div>
                        ))} */}
                        {tabs.map((tab) => (
                            <div className={`tab-action ${activeTab === tab.id ? "active" : ""}`} key={tab.id} onClick={() => setActiveTab(tab.id)}>
                                <div className="details-wrapper">
                                    <i className={tab.icon}></i>
                                    <div className="title">{tab.count} {tab.label}</div>
                                </div>
                                <div className="description">
                                    {tab.des}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="row">
                    <div className="column">
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
        </>
    );
};

export default ApprovalQueue;