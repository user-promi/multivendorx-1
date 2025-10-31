import { Link, useLocation } from 'react-router-dom';
import { FileInput, getApiLink, SelectInput, Tabs } from 'zyra';
import Brand from '../../../assets/images/brand-logo.png';
import BrandSmall from '../../../assets/images/brand-icon.png';
import StoreSettings from './storeSettings';

import PaymentSettings from './paymentSettings';
import StoreSquad from './storeStaff';
import PolicySettings from './policySettings';
import ShippingSettings from './shippingSettings';
import StoreRegistration from './storeRegistrationForm';
import Facilitator from './facilitator';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Overview from './overview';
import Membership from './membership';
import Financial from './financial';

const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Pending", value: "pending" },
    { label: "Rejected", value: "rejected" },
    { label: "Suspended", value: "suspended" },
];

const EditStore = () => {
    const [data, setData] = useState({});
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [bannerMenu, setBannerMenu] = useState(false);
    const [actionMenu, setActionMenu] = useState(false);
    const [logoMenu, setLogoMenu] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [editInfo, setEditInfo] = useState(false);

    const [editName, setEditName] = useState(false);
    const [editDesc, setEditDesc] = useState(false);

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // If clicked inside name or desc editing area, ignore
            if (target.closest('.store-name') || target.closest('.store-description')) return;

            if (editName || editDesc) {
                autoSave({ name: data.name, description: data.description });
            }

            setEditName(false);
            setEditDesc(false);
        };

        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, [editName, editDesc, data]);
    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if ((event.target as HTMLElement).closest('.edit-section')) return;
            setBannerMenu(false);
            setActionMenu(false);
            setLogoMenu(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const location = useLocation();
    const hash = location.hash.replace(/^#/, '');

    const editParts = hash.match(/edit\/(\d+)/);
    const editId = editParts ? editParts[1] : null;

    const hashParams = new URLSearchParams(hash);
    const currentTab = hashParams.get('subtab') || 'store';

    const prepareUrl = (tabId: string) => `?page=multivendorx#&tab=stores&edit/${editId}/&subtab=${tabId}`;

    const autoSave = (updatedData: { [key: string]: string }) => {
        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `store/${editId}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: updatedData,
        }).then((res) => {
            if (res.data.success) {
                setSuccessMsg('Store saved successfully!');
            }
        })
    };

    useEffect(() => {
        if (!editId) return;

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `store/${editId}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((res: any) => {
                const data = res.data || {};
                setData(data);
            })
    }, [editId]);

    const runUploader = (key: string) => {
        const frame = (window as any).wp.media({
            title: 'Select or Upload Image',
            button: { text: 'Use this image' },
            multiple: false,
        });

        frame.on('select', function () {
            const attachment = frame.state().get('selection').first().toJSON();

            const updated = { ...data, [key]: attachment.url };
            setData(updated);
            autoSave(updated);
        });

        frame.open();
    };
    const tabData = [
        {
            type: 'file',
            content: {
                id: 'overview',
                name: 'Overview',
                desc: 'Store Info',
                hideTabHeader: true,
                icon: 'adminlib-credit-card',
            },
        },
        {
            type: 'file',
            content: {
                id: 'store',
                name: 'General',
                desc: 'Store Info',
                hideTabHeader: true,
                icon: 'adminlib-credit-card',
            },
        },
        {
            type: 'file',
            content: {
                id: 'payment',
                name: 'Payment',
                desc: 'Payment Methods',
                hideTabHeader: true,
                icon: 'adminlib-credit-card',
            },
        },
        {
            type: 'file',
            content: {
                id: 'shipping',
                name: 'Shipping',
                desc: 'Store Shipping',
                hideTabHeader: true,
                icon: 'adminlib-credit-card',
            },
        },
        {
            type: 'file',
            content: {
                id: 'store-policy',
                name: 'Policy',
                desc: 'Policy',
                hideTabHeader: true,
                icon: 'adminlib-credit-card',
            },
        },
        {
            type: 'file',
            content: {
                id: 'staff',
                name: 'Staff',
                desc: 'Staff',
                hideTabHeader: true,
                icon: 'adminlib-credit-card',
            },
        },
        {
            type: 'file',
            content: {
                id: 'store-application',
                name: 'Application',
                desc: 'Application',
                hideTabHeader: true,
                icon: 'adminlib-credit-card',
            },
        },
        {
            type: 'file',
            content: {
                id: 'store-facilitator',
                name: 'Facilitator',
                desc: 'Facilitator',
                hideTabHeader: true,
                icon: 'adminlib-credit-card',
            },
        },
    ];

    const getForm = (tabId: string) => {
        switch (tabId) {
            case 'overview':
                return <Overview id={editId} />;
            case 'store':
                return <StoreSettings id={editId} />;
            case 'staff':
                return <StoreSquad id={editId} />;
            case 'payment':
                return <PaymentSettings id={editId} />;
            case 'shipping':
                return <ShippingSettings id={editId} />;
            case 'store-policy':
                return <PolicySettings id={editId} />;
            case 'store-application':
                return <StoreRegistration id={editId} />;
            case 'store-facilitator':
                return <Facilitator id={editId} />;
            // case 'membership':
            //     return <Membership id={editId} />;
            // case 'financial':
            //     return <Financial id={editId} />;
            default:
                return <div></div>;
        }
    };
    return (
        <>
            <div className="store-page">
                <Tabs
                    tabData={tabData}
                    currentTab={currentTab}
                    getForm={getForm}
                    prepareUrl={prepareUrl}
                    appLocalizer={appLocalizer}
                    tabTitleSection={
                        <>
                            {/* <div className="tab-title">
                            <div className="content">
                                <div className="tab-wrapper">
                                    <div className="title"><i className="adminlib-storefront"></i>{data.name}</div>
                                    <div className="dsc">{data.description}</div>
                                </div>
                                <div className="status-wrapper">
                                    
                                    {editId && (
                                        <>
                                            <a
                                                href={`?page=multivendorx#&tab=stores&view&id=${editId}`}
                                                className="tooltip-btn admin-badge green"
                                            >
                                                <i className="adminlib-storefront"></i>
                                                <span className="tooltip">Store Details</span>
                                            </a>
                                            {data.status == 'active' &&
                                                <a
                                                    href={`${appLocalizer.site_url}/store/${data.slug}`}
                                                    target="_blank"
                                                    className="tooltip-btn admin-badge yellow"
                                                >
                                                    <i className="adminlib-eye"></i>
                                                    <span className="tooltip">View Public Store</span>
                                                </a>
                                            }
                                        </>
                                    )}
                                </div>
                            </div>
                        </div> */}
                            <div className="general-wrapper">
                                <div className="store-header">
                                    <div className="banner"
                                        style={{
                                            background: `url("${data.banner}")`,
                                        }}>
                                        <div className="edit-section">
                                            <div className="edit-wrapper">
                                                <span className="admin-btn btn-purple" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setBannerMenu(true);
                                                    setLogoMenu(false);
                                                }}><i className="adminlib-create"></i>Edit banner image</span>
                                                {bannerMenu && (
                                                    <ul>
                                                        {/* <li><i className="adminlib-cloud-upload"></i> Upload</li> */}
                                                        <li
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                runUploader('banner');
                                                                setBannerMenu(false);
                                                            }}>
                                                            <i className="adminlib-cloud-upload"
                                                            ></i> Upload
                                                        </li>
                                                        <li className="delete"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const updated = { ...data, banner: "" };
                                                                setData(updated);
                                                                autoSave(updated);
                                                                setBannerMenu(false);
                                                            }}>
                                                            <i className="adminlib-delete"></i> Delete</li>
                                                    </ul>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                    <div className="details-wrapper">
                                        <div className="left-section">
                                            <div className="store-logo">
                                                <img src={data.image} alt="" />
                                                <div className="edit-section">
                                                    <div className="edit-wrapper">
                                                        <span className="admin-btn btn-purple" onClick={(e) => {
                                                            e.stopPropagation();
                                                            setLogoMenu((prev) => !prev);
                                                            setBannerMenu(false);
                                                        }}><i className="adminlib-create"></i></span>
                                                        {logoMenu && (
                                                            <ul>
                                                                <li
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        runUploader('image');
                                                                        setLogoMenu(false);
                                                                    }}>
                                                                    <i className="adminlib-cloud-upload"
                                                                    ></i> Upload
                                                                </li>
                                                                <li className="delete"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const updated = { ...data, image: "" };
                                                                        setData(updated);
                                                                        autoSave(updated);
                                                                        setLogoMenu(false);
                                                                    }}>
                                                                    <i className="adminlib-delete"></i> Delete</li>
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="details">
                                                <div className="name">
                                                    <div className="store-name" onClick={() => setEditName(true)}>
                                                        {editName ? (
                                                            <input
                                                                type="text"
                                                                value={data.name || ""}
                                                                onChange={(e) => setData({ ...data, name: e.target.value })}
                                                                className="basic-input"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            data.name || "Store Name"
                                                        )}

                                                        <span
                                                            className={`edit-icon  ${editName ? '' : 'admin-badge blue'}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (editName) autoSave({ name: data.name, description: data.description });
                                                                setEditName(!editName);
                                                            }}
                                                        >
                                                            <i className={editName ? "" : "adminlib-create"}></i>
                                                        </span>
                                                    </div>
                                                    <span className="admin-badge green">{data.status}</span>
                                                    <div className="admin-badge green"><i className="adminlib-store-inventory"></i></div>
                                                    <div className="admin-badge blue"><i className="adminlib-geo-my-wp"></i></div>
                                                    <div className="admin-badge yellow"><i className="adminlib-staff-manager"></i></div>
                                                </div>

                                                <div className="des" onClick={() => setEditDesc(true)}>
                                                    {editDesc ? (
                                                        <textarea
                                                            value={data.description || ""}
                                                            onChange={(e) => setData({ ...data, description: e.target.value })}
                                                            className="textarea-input"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        data.description || "Enter store description"
                                                    )}

                                                    <span
                                                        className={`edit-icon admin-badge ${editDesc ? '' : 'blue'}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (editDesc) autoSave({ name: data.name, description: data.description });
                                                            setEditDesc(!editDesc);
                                                        }}
                                                    >
                                                        <i className={editDesc ? "" : "adminlib-create"}></i>
                                                    </span>
                                                </div>
                                                <ul className="contact-details">
                                                    <li>
                                                        <div className="reviews-wrapper">
                                                            <i className="review adminlib-star"></i>
                                                            <i className="review adminlib-star"></i>
                                                            <i className="review adminlib-star"></i>
                                                            <i className="review adminlib-star"></i>
                                                            <i className="review adminlib-star"></i>
                                                            5 Review
                                                        </div>
                                                    </li>
                                                </ul>
                                                {/* <div className="des">
                                                    <b>Store url: </b>http://localhost:8889/store/HomeShop/reviews/ <i className="adminlib-external"></i>
                                                </div> */}
                                            </div>
                                        </div>
                                        <div className="right-section">
                                            <div className="tag-wrapper">

                                            </div>
                                            {/* <div className="status-wrapper">
                                                <span>Status: </span>
                                                <SelectInput
                                                    name="status"
                                                    value={data.status}
                                                    options={statusOptions}
                                                    type="single-select"
                                                    onChange={(newValue: any) => {
                                                        if (!newValue || Array.isArray(newValue)) return;

                                                        const updated = { ...data, status: newValue.value };
                                                        setData(updated);
                                                        autoSave(updated);
                                                    }}
                                                />
                                            </div> */}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </>
                    }
                    Link={Link}
                    settingName={'Store'}
                    hideTitle={true}
                    hideBreadcrumb={true}
                // action={

                //     <>
                //         <div className="edit-wrapper" ref={wrapperRef}>
                //             <span className="" onClick={(e) => {
                //                 e.stopPropagation();
                //                 setActionMenu((prev) => !prev);
                //                 setLogoMenu(false);
                //                 setBannerMenu(false);
                //             }}><i className="adminlib-more-vertical"></i></span>
                //             {actionMenu && (
                //                 <ul>
                //                     {data.status == 'active' &&
                //                         <li>
                //                             <a href={`${appLocalizer.site_url}/store/${data.slug}`}><i className="adminlib-eye"></i> View Store</a>
                //                         </li>
                //                     }
                //                     <li><i className="adminlib-mail"></i> Send Mail</li>
                //                 </ul>
                //             )}
                //         </div>
                //     </>
                // }
                />
            </div>
        </>
    );
};

export default EditStore;