import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ToggleSetting, getApiLink, SelectInput, Tabs, RadioInput, CommonPopup, useModules } from 'zyra';
import { Skeleton } from '@mui/material';

import StoreSettings from './storeSettings';
import PaymentSettings from './paymentSettings';
import StoreSquad from './storeStaff';
import PolicySettings from './policySettings';
import ShippingSettings from './shippingSettings';
import StoreRegistration from './storeRegistrationForm';
import Facilitator from './facilitator';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import Overview from './overview';
import Membership from './membership';
import Financial from './financial';
import "../viewStore.scss";

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
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteOption, setDeleteOption] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [editName, setEditName] = useState(false);
    const [editDesc, setEditDesc] = useState(false);
    const [selectedOwner, setSelectedOwner] = useState(null);
    const location = useLocation();
    const [prevName, setPrevName] = useState("");
    const [prevDesc, setPrevDesc] = useState("");

    useEffect(() => {
        if (editName) {
            setPrevName(data?.name || "");
        }
        if (editDesc) {
            setPrevDesc(data?.description || "");
        }
    }, [editName, editDesc]);

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // If clicked inside name or desc editing area, ignore
            if (target.closest('.store-name') || target.closest('.des')) return;

            if (editName || editDesc) {
                autoSave({ name: data.name, description: data.description });
            }

            setEditName(false);
            setEditDesc(false);
        };

        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, [data]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if ((event.target as HTMLElement).closest('.edit-section') || (event.target as HTMLElement).closest('.edit-wrapper')) return;
            setBannerMenu(false);
            setActionMenu(false);
            setLogoMenu(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const hash = location.hash.replace(/^#/, '');

    const editParts = hash.match(/edit\/(\d+)/);
    const editId = editParts ? editParts[1] : null;

    const hashParams = new URLSearchParams(hash);
    const currentTab = hashParams.get('subtab');
    const prepareUrl = (tabId: string) => `?page=multivendorx#&tab=stores&edit/${editId}/&subtab=${tabId}`;
    const navigate = useNavigate();
    const { modules } = useModules();

    const autoSave = (updatedData: { [key: string]: string }) => {
        if (!editId) return;

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
                const currentTab = (data?.status === 'pending' || data?.status === 'rejected' ? 'application-details' : 'store-overview');

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

    const handleStoreDelete = () => {
        if (data?.status === 'active' || data?.status === 'under_review' || data?.status === 'suspended' || data?.status === 'deactivated') {
            setDeleteModal(true);
        } else {
            deleteStoreApiCall('direct');
        }
    };

    const deleteStoreApiCall = (option) => {

        const payload = {
            delete: true,
            deleteOption: option,
        };

        // If changing store owner, get selected value from ref
        if (option === "set_store_owner" && selectedOwner) {
            payload.new_owner_id = selectedOwner.value;
        }

        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `store/${editId}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: payload,
        }).then((res) => {
            if (res.data.success) {
                setDeleteModal(false);
                navigate(`?page=multivendorx#&tab=stores`);
            }
        });
    };

    const tabData = useMemo(() => [
        {
            type: 'file',
            content: {
                id: 'store-overview',
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
        ...(modules.includes('store-policy')
            ? [
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
            ]
            : []),
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
                id: 'application-details',
                name: 'Application Details',
                desc: 'Application',
                hideTabHeader: true,
                icon: 'adminlib-credit-card',
            },
        },
        ...(modules.includes('facilitator')
            ? [
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
            ]
            : []),
    ], [modules]);


    const handleUpdateData = useCallback((updatedFields: any) => {
        setData(prev => ({ ...prev, ...updatedFields }));
    }, []);

    // const visibleTabs = useMemo(() => {
    //     if (data?.status === 'pending' || data?.status === 'rejected' || data?.status === 'permanently_rejected') {
    //         return tabData.filter(tab => tab.content.id === 'application-details');
    //     }
    //     return tabData;
    // }, [tabData, data?.status]);

    const visibleTabs = useMemo(() => {
        const updatedTabs = tabData.map(tab =>
            tab.content.id === 'application-details'
                ? {
                    ...tab,
                    content: {
                        ...tab.content,
                        name:
                            data?.status === 'active'
                                ? 'Archive Data'
                                : 'Application Details',
                    },
                }
                : tab
        );

        if (
            data?.status === 'pending' ||
            data?.status === 'rejected' ||
            data?.status === 'permanently_rejected'
        ) {
            return updatedTabs.filter(tab => tab.content.id === 'application-details');
        }

        return updatedTabs;
    }, [tabData, data?.status]);


    // const getForm = (tabId: string) => {
    //     switch (tabId) {
    //         case 'store-overview':
    //             return <Overview id={editId} storeData={data} />;
    //         case 'store':
    //             return <StoreSettings id={editId} data={data} onUpdate={handleUpdateData} />;
    //         case 'staff':
    //             return <StoreSquad id={editId} />;
    //         case 'payment':
    //             return <PaymentSettings id={editId} data={data} />;
    //         case 'shipping':
    //             return <ShippingSettings id={editId} data={data} />;
    //         case 'store-policy':
    //             return <PolicySettings id={editId} data={data} />;
    //         case 'application-details':
    //             return <StoreRegistration id={editId} />;
    //         case 'store-facilitator':
    //             return <Facilitator id={editId} data={data} />;
    //         default:
    //             return <div></div>;
    //     }
    // };
    const [expanded, setExpanded] = useState(false);

    const words = data?.description?.split(" ") || [];
    const shouldTruncate = words.length > 50;
    const displayText = expanded
        ? data?.description
        : words.slice(0, 50).join(" ");

    const getForm = useCallback((tabId: string) => {
        switch (tabId) {
            case 'store-overview':
                return <Overview id={editId} storeData={data} />;
            case 'store':
                return <StoreSettings id={editId} data={data} onUpdate={handleUpdateData} />;
            case 'staff':
                return <StoreSquad id={editId} />;
            case 'payment':
                return <PaymentSettings id={editId} data={data} />;
            case 'shipping':
                return <ShippingSettings id={editId} data={data} />;
            case 'store-policy':
                return <PolicySettings id={editId} data={data} />;
            case 'application-details':
                return <StoreRegistration id={editId} />;
            case 'store-facilitator':
                return <Facilitator id={editId} data={data} />;
            default:
                return <div></div>;
        }
    }, [editId, data, handleUpdateData]);
    return (
        <>
            <div className="store-page">
                <Tabs
                    // tabData={tabData}
                    tabData={visibleTabs}
                    currentTab={currentTab}
                    getForm={getForm}
                    prepareUrl={prepareUrl}
                    appLocalizer={appLocalizer}
                    premium={false}
                    tabTitleSection={
                        <>
                            <div className="general-wrapper">
                                <div className="store-header">
                                    <div
                                        className="banner"
                                        style={{
                                            background: data?.banner && `url("${data.banner}")`,
                                        }}
                                    >
                                        {Object.keys(data).length === 0 ? (
                                            <Skeleton variant="rectangular" width="100%" height={200} />
                                        ) : !data.banner ? (
                                            <div className="default-img-1500x900" />
                                        ) : null}

                                        <div className="edit-section">
                                            <div className="edit-wrapper">
                                                <span className="admin-btn btn-purple" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setBannerMenu(true);
                                                    setLogoMenu(false);
                                                }}><i className="adminlib-edit"></i>Edit banner image</span>
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
                                                {data?.image ? (
                                                    <img src={data.image} alt="" />
                                                ) : (
                                                    <div className="placeholder-400x400" />
                                                )}

                                                <div className="edit-section">
                                                    <div className="edit-wrapper">
                                                        <span className="admin-btn btn-purple" onClick={(e) => {
                                                            e.stopPropagation();
                                                            setLogoMenu((prev) => !prev);
                                                            setBannerMenu(false);
                                                        }}><i className="adminlib-edit"></i></span>
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
                                                                value={data?.name || ""}
                                                                onChange={(e) => setData({ ...data, name: e.target.value })}
                                                                onBlur={() => {
                                                                    if (!data?.name?.trim()) {
                                                                        setData({ ...data, name: prevName });
                                                                    }
                                                                    setEditName(false);
                                                                }}
                                                                className="basic-input"
                                                                autoFocus
                                                            />
                                                        ) : data?.name ? (
                                                            data.name
                                                        ) : (
                                                            <Skeleton variant="text" width={150} />
                                                        )}

                                                        <span
                                                            className={`edit-icon  ${editName ? '' : 'admin-badge blue'}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (editName && !data?.name?.trim()) {
                                                                    // if closing edit and input empty, restore previous name
                                                                    setData({ ...data, name: prevName });
                                                                }
                                                                setEditName(!editName);
                                                            }}
                                                        >
                                                            <i className={editName ? "" : "adminlib-edit"}></i>
                                                        </span>
                                                    </div>

                                                    {/* <span className="admin-badge green">{data.status}</span> */}
                                                    {data.status === 'active' ? (
                                                        <span className="status admin-badge green">Active</span>
                                                    ) : data.status === 'pending' ? (
                                                        <span className="status  admin-badge yellow">Pending</span>
                                                    ) : data.status === 'rejected' ? (
                                                        <span className="status  admin-badge red">Rejected</span>
                                                    ) : data.status === 'suspended' ? (
                                                        <span className="status  admin-badge blue">Suspended</span>
                                                    ) : data.status === 'permanently_rejected' ? (
                                                        <span className="status  admin-badge red">Permanently Rejected</span>
                                                    ) : data.status === 'under_review' ? (
                                                        <span className="status  admin-badge yellow">Under Review</span>
                                                    ) : data.status === 'deactivated' ? (
                                                        <span className="status  admin-badge red">Permanently Deactivated</span>
                                                    ) : (
                                                        <Skeleton variant="text" width={100} />
                                                    )}

                                                    {modules.includes('marketplace-compliance') && (
                                                        <>
                                                            <div className="admin-badge green"><i className="adminlib-store-inventory"></i></div>
                                                            <div className="admin-badge blue"><i className="adminlib-geo-my-wp"></i></div>
                                                            <div className="admin-badge yellow"><i className="adminlib-staff-manager"></i></div>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="des" onClick={() => setEditDesc(true)}>

                                                    {editDesc ? (
                                                        <textarea
                                                            value={data.description || ""}
                                                            onChange={(e) =>
                                                                setData({ ...data, description: e.target.value })
                                                            }
                                                            onBlur={() => {
                                                                if (!data?.description?.trim()) {
                                                                    setData({ ...data, description: prevDesc });
                                                                }
                                                                setEditDesc(false);
                                                            }}
                                                            className="textarea-input"
                                                            autoFocus
                                                        />
                                                    ) : Object.keys(data).length === 0 ? (
                                                        <Skeleton variant="text" width={150} />
                                                    ) : data?.description ? (
                                                        <div>
                                                            <span>
                                                                {displayText}
                                                                {shouldTruncate && !expanded ? "..." : ""}
                                                            </span>
                                                            {shouldTruncate && (
                                                                <button
                                                                    onClick={() => setExpanded(!expanded)}
                                                                    className="read-more-btn"
                                                                >
                                                                    {expanded ? "Read less" : "Read more"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span>&nbsp;</span>
                                                    )}

                                                    <span
                                                        className={`edit-icon ${editDesc ? '' : 'admin-badge blue'}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (editDesc && !data?.description?.trim()) {
                                                                setData({ ...data, description: prevDesc });
                                                            }
                                                            setEditDesc(!editDesc);
                                                        }}
                                                    >
                                                        <i className={editDesc ? "" : "adminlib-edit"}></i>
                                                    </span>
                                                </div>
                                                <ul className="contact-details">
                                                    <li>
                                                        <div className="reviews-wrapper">
                                                            {data.total_reviews > 0 ? (
                                                                <>
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <i
                                                                            key={i}
                                                                            className={`review adminlib-star${i < Math.round(data.overall_reviews) ? ' filled' : ''
                                                                                }`}
                                                                        ></i>
                                                                    ))}
                                                                    <span>
                                                                        {data.overall_reviews} ({data.total_reviews}{' '}
                                                                        {data.total_reviews === 1 ? 'Review' : 'Reviews'})
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span><i className="adminlib-star-o"></i> <i className="adminlib-star-o"></i> <i className="adminlib-star-o"></i> <i className="adminlib-star-o"></i> <i className="adminlib-star-o"></i> (0) Review</span>
                                                            )}
                                                        </div>
                                                    </li>
                                                </ul>


                                                <div className="des">
                                                    <b>Storefront link: </b>
                                                    {appLocalizer.store_page_url + '/'}
                                                    {data?.slug ? (
                                                        <>
                                                            {data.slug}{' '}

                                                            {(data?.status != 'pending' && data?.status != 'rejected' && data?.status != 'permanently_rejected') && (

                                                                <span className="edit-icon admin-badge blue" onClick={() => {
                                                                    navigate(`?page=multivendorx#&tab=stores&edit/${data.id}/&subtab=store`, {
                                                                        state: { highlightTarget: "store-slug" },
                                                                    });

                                                                    setTimeout(() => {
                                                                        navigate(`?page=multivendorx#&tab=stores&edit/${data.id}/&subtab=store`, {
                                                                            replace: true,
                                                                        });
                                                                    }, 500);
                                                                }}>
                                                                    <i className="adminlib-edit" ></i>
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <Skeleton
                                                            variant="text"
                                                            width={100}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="right-section">
                                            <div className="tag-wrapper">

                                            </div>
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
                    action={
                        <>
                            <div className="edit-wrapper" ref={wrapperRef}>
                                <span className="" onClick={(e) => {
                                    e.stopPropagation();
                                    setActionMenu((prev) => !prev);
                                    setLogoMenu(false);
                                    setBannerMenu(false);
                                }}><i className="action-icon adminlib-more-vertical"></i></span>
                                {actionMenu && (
                                    <ul>
                                        {data.status == 'active' &&
                                            <li>
                                                <a
                                                    href={`${appLocalizer.store_page_url}/${data.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <i className="adminlib-storefront"></i> View Storefront <i className="external adminlib-external"></i>
                                                </a>
                                            </li>
                                        }
                                        <li onClick={() => {
                                            navigate(`?page=multivendorx#&tab=stores&edit/${data.id}/&subtab=store`, {
                                                state: { highlightTarget: "store-status" },
                                            });

                                            setTimeout(() => {
                                                navigate(`?page=multivendorx#&tab=stores&edit/${data.id}/&subtab=store`, {
                                                    replace: true,
                                                });
                                            }, 5000);
                                        }}>
                                            <i className="adminlib-form-multi-select"></i> Manage status
                                        </li>
                                        <li>
                                            <a
                                                href={`${appLocalizer.admin_url}edit.php?post_type=product&multivendorx_store_id=${data.id}`}
                                                className="product-link"
                                            >
                                                <i className="adminlib-single-product"></i> Products
                                            </a>
                                        </li>

                                        <li onClick={() => {
                                            navigate(`?page=multivendorx#&tab=reports`);
                                        }}
                                        ><i className="adminlib-order"></i> Orders</li>
                                        <li onClick={handleStoreDelete}><i className="adminlib-delete"></i> Delete store</li>
                                    </ul>
                                )}
                            </div>
                        </>
                    }
                />

                <CommonPopup
                    open={deleteModal}
                    onClose={() => setDeleteModal(false)}
                    width="600px"
                    height="50%"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-storefront"></i>
                                Manage store deletion
                            </div>
                            <p>Choose the appropriate action to take when deleting this store.</p>
                            <i
                                onClose={() => setDeleteModal(false)}
                                className="icon adminlib-close"
                            ></i>
                        </>
                    }
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setDeleteModal(false)}
                                className="admin-btn btn-red"
                            >
                                Cancel
                            </button>
                            <button onClick={() => {
                                if (deleteOption) {
                                    deleteStoreApiCall(deleteOption);
                                }
                            }} className="admin-btn btn-purple">
                                Delete
                            </button>
                        </>
                    }

                >
                    <div className="content">
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="title">Deletion method</label>
                                <ToggleSetting
                                    wrapperClass="setting-form-input"
                                    descClass="settings-metabox-description"
                                    // key='store_delete_option'
                                    options={[
                                        {
                                            value: 'set_store_owner',
                                            key: 'set_store_owner',
                                            label: 'Change store owner',
                                        },
                                        {
                                            value: 'product_assign_admin',
                                            key: 'product_assign_admin',
                                            label: 'Assign product to Admin',
                                        },
                                        {
                                            value: 'permanent_delete',
                                            key: 'permanent_delete',
                                            label: 'Permanently Delete',
                                        },
                                    ]}
                                    value={deleteOption}
                                    onChange={(value) => {
                                        setDeleteOption(value);
                                        setSelectedOwner(null);
                                    }}
                                />
                                {/* <RadioInput
                                    wrapperClass="settings-form-group-radio"
                                    inputWrapperClass="radio-basic-input-wrap"
                                    inputClass="setting-form-input"
                                    descClass="settings-metabox-description"
                                    activeClass="radio-select-active"
                                    name='store_delete_option'
                                    keyName='store_delete_option'
                                    options={[
                                        {
                                            key: 'set_store_owner',
                                            name: 'set_store_owner',
                                            value: 'set_store_owner',
                                            label: 'Change Store owner',
                                        },
                                        {
                                            key: 'product_assign_admin',
                                            name: 'product_assign_admin',
                                            value: 'product_assign_admin',
                                            label: 'Product Assign to Admin',
                                        },
                                        {
                                            key: 'permanent_delete',
                                            name: 'permanent_delete',
                                            value: 'permanent_delete',
                                            label: 'Permanently Delete',
                                        },
                                    ]}
                                    onChange={(e) => {
                                        setDeleteOption(e.target.value);
                                        setSelectedOwner(null);
                                    }}
                                /> */}
                            </div>
                            <div className="form-group">
                                {deleteOption == 'set_store_owner' && (
                                    <>
                                        <label htmlFor="title">Assign new store owner</label>
                                        <SelectInput
                                            name="new_owner"
                                            value={selectedOwner?.value}
                                            options={appLocalizer.store_owners}
                                            type="single-select"
                                            onChange={(val) => {
                                                if (val) {
                                                    setSelectedOwner(val);
                                                }
                                            }}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </CommonPopup>
            </div>
        </>
    );
};

export default EditStore;