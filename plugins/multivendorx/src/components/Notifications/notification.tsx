import { AdminBreadcrumbs } from 'zyra';
import WithdrawalRequests from './withdrawalRequests';
import Products from './products';
import Vendors from './vendors';
import Coupons from './coupon';
import Transactions from './transaction';
import { useEffect, useState } from 'react';

const Notification = () => {

    
    const [activeTab, setActiveTab] = useState("products");
    const [noticeHTML, setNoticeHTML] = useState('');
    useEffect(() => {
        const notice = document.querySelector('#screen-meta + .wrap .notice, #wpbody-content .notice');
        if (notice) {
            setNoticeHTML(notice.outerHTML);
            notice.remove();
        }
    }, []);

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


    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-cart"
                tabTitle="Notification Dashboard"
            />
            {noticeHTML && <div className="wp-admin-notice" dangerouslySetInnerHTML={{ __html: noticeHTML }} />}

            {/* Workboard Stats */}
            <div className="work-board">
                <div className="row">
                    <div className="column w-45">
                        <h3>Account Overview</h3>
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
