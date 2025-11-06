import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, FileInput, SelectInput, SuccessNotice, getApiLink, Tabs } from 'zyra';
import PendingApproval from './StoreStatus/PendingApproval';
import Rejected from './StoreStatus/Rejected';
import UnderReview from './StoreStatus/UnderReview';
import PermanentlyRejected from './StoreStatus/PermanentlyRejected';
import Active from './StoreStatus/Active';
import Suspended from './StoreStatus/Suspended';
import Deactivated from './StoreStatus/Deactivated';
import { useLocation, Link } from 'react-router-dom';

const StoreStatus = () => {
    const id = appLocalizer.store_id;
    const [formData, setFormData] = useState<{ [key: string]: string }>({});
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);

    const location = new URLSearchParams( useLocation().hash.substring( 1 ) );

    useEffect(() => {
        if (!id) return;

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `store/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((res) => {
                const data = res.data || {};
                setFormData((prev) => ({ ...prev, ...data }));
            })
    }, [id]);

    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);
    

    const tabData = [
        {
            type: 'heading',
            name: 'Activation Flow',
        },
        {
            type: 'file',
            content: {
                id: 'pending-approval',
                name: 'Pending Approval',
                desc: 'Stores awaiting admin review',
                // hideTabHeader: true,
                icon: 'tools',
            },
        },
        {
            type: 'file',
            content: {
                id: 'rejected',
                name: 'Rejected',
                desc: 'Applications needing revision',
                // hideTabHeader: true,
                icon: 'tools',
            },
        },
        {
            type: 'file',
            content: {
                id: 'permanently-rejected',
                name: 'Permanently Rejected',
                desc: 'Permanently denied applications.',
                // hideTabHeader: true,
                icon: 'form-address',
            },
        },
        {
            type: 'heading',
            name: 'Post-Activation Flow',
        },
        {
            type: 'file',
            content: {
                id: 'active',
                name: 'Active',
                desc: 'Fully operational stores.',
                // hideTabHeader: true,
                icon: 'form-address',
            },
        },
        {
            type: 'file',
            content: {
                id: 'under-review',
                name: 'Under Review',
                desc: 'Temporary compliance check.',
                // hideTabHeader: true,
                icon: 'form-address',
            },
        },
        {
            type: 'file',
            content: {
                id: 'suspended',
                name: 'Suspended',
                desc: 'Policy violation enforcement',
                // hideTabHeader: true,
                icon: 'form-address',
            },
        },
        {
            type: 'file',
            content: {
                id: 'deactivated',
                name: 'Deactivated',
                desc: 'Permanently closed',
                // hideTabHeader: true,
                icon: 'form-address',
            },
        },
    ];

    const getForm = (tabId: string) => {
        switch (tabId) {
            case 'pending-approval':
                return <PendingApproval/>;
            case 'rejected':
                return <Rejected/>;
            case 'permanently-rejected':
                return <PermanentlyRejected />;
            case 'active':
                return <Active />;
            case 'under-review':
                return <UnderReview />;
            case 'suspended':
                return <Suspended />;
            case 'deactivated':
                return <Deactivated />;
            default:
                return <div></div>;
        }
    };

    return (
        <>
            <div className="horizontal-tabs">
                <Tabs
                    tabData={tabData}
                    currentTab={ location.get( 'tabId' ) as string }
                    getForm={getForm}
                    prepareUrl={ ( tabid: string ) =>
                    `?page=multivendorx#&tab=settings&subtab=store-status-control&tabId=${ tabid }`}
                    appLocalizer={appLocalizer}
                    settingName="Settings"
                    supprot={[]}
                    Link={Link}
                    submenuRender={true} />
            </div>
        </>
    );
};

export default StoreStatus;