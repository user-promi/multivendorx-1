import { AdminBreadcrumbs, getApiLink, useModules, Tabs } from 'zyra';
import RefundRequest from './refundRequest';
import './customerServices.scss';
import '../AdminDashboard/adminDashboard.scss';
import Qna from './qnaTable';
import StoreReviews from './storeReviews ';
import { useLocation, Link } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

const CustomerServices = () => {

    const { modules } = useModules();

    const location = new URLSearchParams(useLocation().hash.substring(1));

    const tabData = [
        {
            type: 'file',
            module: "marketplace-refund",
            content: {
                id: 'refund-requests',
                name: 'Refund Requests',
                desc: 'Need your decision',
                icon: 'marketplace-refund',
                tabTitle: 'Refund tracker',
                tabDes: 'Monitor refund trends and stay informed on store returns.',
            },
        },
        {
            type: 'file',
            module: "question-answer",
            content: {
                id: 'questions',
                name: 'Questions',
                desc: 'Waiting for your response',
                icon: 'question',
                tabTitle: 'Product questions in queue',
                tabDes: 'Waiting for your response',
            },
        },
        {
            type: 'file',
            module: "store-review",
            content: {
                id: 'review',
                name: 'Store Reviews',
                icon: "store-review",
                desc: 'Track and manage reviews for all stores.',
                tabTitle: 'Store reviews at a glance',
                tabDes: 'Track and manage reviews for all stores.',
            },
        },
        {
            type: 'file',
            module: 'customer-support',
            content: {
                id: 'support-ticket',
                name: 'Support Ticket',
                des: "Flagged for abuse review",
                icon: "vacation",
            },
        },
    ].filter(tab => !tab.module || modules.includes(tab.module));

    const getForm = (tabId: string) => {
        switch (tabId) {
            case 'refund-requests':
                return <RefundRequest />;
            case 'questions':
                return <Qna />;
            case 'review':
                return <StoreReviews />;
            case 'support-ticket':
                return <div className="row"><div className="column"><h1>Upcoming Feature</h1></div></div>;
            default:
                return <div></div>;
        }
    };

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-customer-service"
                tabTitle={__('Customer Service', 'multivendorx')}
                description={__('Manage store reviews, support requests, financial transactions, and reported issues.', 'multivendorx')}
            />
            {tabData.length > 0 ? (
                <Tabs
                    tabData={tabData}
                    currentTab={location.get('subtab') as string}
                    getForm={getForm}
                    prepareUrl={(subTab: string) =>
                        `?page=multivendorx#&tab=customer-support&subtab=${subTab}`
                    }
                    appLocalizer={appLocalizer}
                    supprot={[]}
                    Link={Link}
                    hideTitle={true}
                    hideBreadcrumb={true}
                    template={'template-2'}
                    premium={false}
                    menuIcon={true}
                />
            ) : (
                <div className="general-wrapper">
                    <div className="permission-wrapper">
                        <i className="adminlib-info red"></i>
                        <div className="title">
                            {__('Looks like customer support isn’t set up yet! Turn on a support module to start assisting your customers.', 'multivendorx')}
                        </div>
                        <a href={appLocalizer.module_page_url} className="admin-btn btn-purple">
                            {__('Enable Now', 'multivendorx')}
                        </a>
                    </div>
                </div>
            )}
        </>
    );    
};

export default CustomerServices;
