import { AdminBreadcrumbs, getApiLink } from 'zyra';
import RefundRequest from './refundRequest';
import AbuseReports from './abuseReports';
import StoreReviews from './storeReviews ';
import './customerServices.scss';
import '../AdminDashboard/adminDashboard.scss';
import Qna from './qnaTable';
import { useEffect, useState } from 'react';
import axios from 'axios';

const CustomerServices = () => {
    const [abuseCount, setAbuseCount] = useState(0);
    const [qnaCount, setQnaCount] = useState(0);
    const [withdrawCount, setWithdrawCount] = useState(0);

    // Fetch total count on mount
    useEffect(() => {
        axios
            .get(getApiLink(appLocalizer, 'report-abuse'), {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                params: { count: true },
            })
            .then((res) => {
                const total = res.data || 0;
                setAbuseCount(total);
            })
            .catch(() => {
                console.error('Failed to load total rows');
            });
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'qna'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true },
        })
            .then((response) => {
                setQnaCount(response.data || 0);
            })
            .catch(() => {
                console.error('Failed to load total rows');
            });

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { pending_withdraw: true } //important: use this param
        })
            .then((response) => {
                const count = response.data.length || 0; // response.data is an array of stores with pending withdraw
                setWithdrawCount(count);
            })
            .catch(() => setWithdrawCount(0));
    }, []);

    const CustomerServicesStats = [
        {
            id: 'reviews',
            label: 'Pending Reviews(static)',
            count: 12,
            icon: 'adminlib-star',
        },
        {
            id: 'support',
            label: 'Open Support Tickets(static)',
            count: 5,
            icon: 'adminlib-support',
        },
        {
            id: 'withdrawals',
            label: 'Withdrawal Requests',
            count: withdrawCount,
            icon: 'adminlib-global-community',
        },
        {
            id: 'refunds',
            label: 'Refund Requests(static)',
            count: 3,
            icon: 'adminlib-catalog',
        },
        {
            id: 'abuse',
            label: 'Abuse Reports',
            count: abuseCount,
            icon: 'adminlib-calendar',
        },
        {
            id: 'qna',
            label: 'Customer qna',
            count: qnaCount,
            icon: 'adminlib-calendar',
        },
    ];

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-customer-service"
                tabTitle="Customer Service"
                description={'Manage store reviews, support requests, financial transactions, and reported issues.'}
            />
            <div className="work-board">
                <div className="row">
                    <div className="overview-card-wrapper">
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
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Store Reviews
                                </div>
                                <div className="des">View and manage all customer reviews for stores.</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <StoreReviews />
                    </div>
                </div>

                <div className="row">
                    <div className="column">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Refund Requests
                                </div>
                                <div className="des">Track and handle customer refund requests.</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <RefundRequest />
                    </div>
                    <div className="column">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Abuse Reports
                                </div>
                                <div className="des">Monitor reported issues or complaints about products or stores.</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <AbuseReports />
                    </div>
                </div>

                <div className="row">
                    <div className="column">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Customer Questions
                                </div>
                                <div className="des">View, manage, and respond to customer questions about products.</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <Qna />
                    </div>
                </div>
            </div>
        </>
    );
};

export default CustomerServices;
