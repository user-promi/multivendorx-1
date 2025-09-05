import { AdminBreadcrumbs } from 'zyra';
import StoreSupport from './storeSupport';
import RefundRequest from './refundRequest';
import AbuseReports from './abuseReports';
import StoreReviews from './storeReviews ';
import './customerServices.scss';
import { useEffect, useState } from 'react';

const CustomerServices = () => {

    const CustomerServicesStats = [
    {
        id: 'reviews',
        label: 'Pending Reviews',
        count: 12,
        icon: 'adminlib-star',
    },
    {
        id: 'support',
        label: 'Open Support Tickets',
        count: 5,
        icon: 'adminlib-support',
    },
    {
        id: 'withdrawals',
        label: 'Withdrawal Requests',
        count: 8,
        icon: 'adminlib-global-community', 
    },
    {
        id: 'refunds',
        label: 'Refund Requests',
        count: 3,
        icon: 'adminlib-catalog', 
    },
    {
        id: 'abuse',
        label: 'Abuse Reports',
        count: 2,
        icon: 'adminlib-calendar',
    },
];

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-cart"
                tabTitle="Customer Service"
            />
            <div className="work-board">
                <div className="row">
                    <div className="action-card-wrapper">
                        {CustomerServicesStats.map(stat => (
                            <div className="action" key={stat.id}>
                                <div className="title">
                                    {stat.count}
                                    <i className={stat.icon}></i>
                                </div>
                                <div className="description">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="row">
                    <div className="column">
                        <div className="title"><i className="adminlib-storefront"></i> Store Reviews</div>
                        <StoreReviews />
                    </div>
                    <div className="column">
                        <div className="title"><i className="adminlib-storefront"></i> Store Support</div>
                        <StoreSupport />
                    </div>
                </div>

                <div className="row">
                    <div className="column">
                        <div className="title"><i className="adminlib-storefront"></i> Refund Requests</div>
                        <RefundRequest />
                    </div>
                    <div className="column">
                        <div className="title"><i className="adminlib-storefront"></i> Abuse Reports</div>
                        <AbuseReports />
                    </div>
                </div>
            </div>
        </>
    );
};

export default CustomerServices;
