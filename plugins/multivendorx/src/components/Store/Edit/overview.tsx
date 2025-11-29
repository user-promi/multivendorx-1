import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { getApiLink, useModules } from 'zyra';
import { Skeleton } from '@mui/material';
import { formatCurrency } from '../../../services/commonFunction';
import LatestReview from './latestReview';
import LatestRefundRequest from './latestLefundRequest';

interface OverviewProps {
    id: string | null;
    storeData?: any;
}

const Overview: React.FC<OverviewProps> = ({ id, storeData }) => {
    const navigate = useNavigate();
    const { modules } = useModules();

    const [recentDebits, setRecentDebits] = useState<any[]>([]);
    const [recentProducts, setRecentProducts] = useState<any[]>([]);

    useEffect(() => {
        if (!id) return;

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'transaction'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: 1,
                row: 3,
                store_id: id,
                transaction_type: 'Withdrawal',
                transaction_status: 'Completed',
                filter_status: 'Dr',
                orderBy: 'created_at',
                order: 'DESC',
            },
        })
            .then((response) => {
                setRecentDebits(response.data.transaction || []);
            })
            .catch((error) => {
                console.error('Error fetching recent debit transactions:', error);
                setRecentDebits([]);
            });

        axios({
            method: 'GET',
            url: `${appLocalizer.apiUrl}/wc/v3/products`,
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: 1,
                per_page: 3,
                orderby: 'date',
                order: 'desc',
                meta_key: 'multivendorx_store_id',
                value: id,
            },
        })
            .then((response) => {
                setRecentProducts(response.data);
            })
            .catch((error) => {
                console.error('Failed to fetch recent products:', error);
            });

    }, []);
    useEffect(() => {
        const highlightId = location.state?.highlightTarget;
        if (highlightId) {
            const target = document.getElementById(highlightId);

            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "center" });
                target.classList.add("highlight");
                const handleClick = () => {
                    target.classList.remove("highlight");
                    document.removeEventListener("click", handleClick);
                };
                setTimeout(() => {
                    document.addEventListener("click", handleClick);
                }, 100);
            }

        }
    }, [location.state]);
    const overviewData = [
        {
            icon: "adminlib-wallet red",
            number: formatCurrency(storeData.transactions?.balance ?? 0),
            text: "Wallet balance",
        },
        {
            icon: "adminlib-dollar yellow",
            number: formatCurrency(storeData.transactions?.locking_balance ?? 0),
            text: "Upcoming balance",
        },
        {
            icon: "adminlib-wallet-in blue",
            number: formatCurrency(storeData.request_withdrawal_amount ?? 0),
            text: "Requested payout",
        },
    ];

    return (
        <>
            <div className="container-wrapper ">
                <div className="card-wrapper w-65">
                    <div className="analytics-container">
                        {overviewData.map((item, idx) => (
                            <div key={idx} className="analytics-item">
                                <div className="analytics-icon">
                                    <i className={item.icon}></i>
                                </div>
                                <div className="details">
                                    <div className="number">{item.number}</div>
                                    <div className="text">{item.text}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="row">
                        <div className="column">
                            <div className="card-header">
                                <div className="left">
                                    <div className="title">{__('Recent payouts', 'multivendorx')}</div>
                                </div>
                                <div className="right">
                                    <i
                                        className="adminlib-external"
                                        onClick={() => {
                                            navigate(`?page=multivendorx#&tab=transaction-history&store_id=${id}`);
                                        }}
                                    ></i>
                                </div>
                            </div>
                            {recentDebits && recentDebits.length > 0 ? (
                                recentDebits.map((txn) => (
                                    <div key={txn.id} className="info-item">
                                        <div className="details-wrapper">
                                            <div className="details">
                                                <div className="name">{__('Bank Transfer', 'multivendorx')}</div>
                                                <div className="des">
                                                    {new Date(txn.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: '2-digit',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="right-details">
                                            <div className="price">{formatCurrency(txn.amount)}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-products">{__('No recent payout', 'multivendorx')}</div>
                            )}
                        </div>

                        <div className="column">
                            <div className="card-header">
                                <div className="left">
                                    <div className="title">{__('Latest products', 'multivendorx')}</div>
                                </div>
                                <div className="right">
                                    <i
                                        className="adminlib-external"
                                        onClick={() => {
                                            navigate(`?page=multivendorx#&tab=transaction-history&store_id=${id}`);
                                        }}
                                    ></i>
                                </div>
                            </div>
                            {recentProducts.length > 0 ? (
                                recentProducts.map((product) => {
                                    const productImage =
                                        product.images && product.images.length > 0
                                            ? product.images[0].src
                                            : null;
                                    const editUrl = `${appLocalizer.site_url.replace(/\/$/, '')}/wp-admin/post.php?post=${product.id}&action=edit`;

                                    return (
                                        <div key={product.id} className="info-item">
                                            <div className="details-wrapper">
                                                <div className="avatar">
                                                    {productImage ? (
                                                        <img src={productImage} alt={product.name} />
                                                    ) : (
                                                        <i className="item-icon adminlib-single-product"></i>
                                                    )}
                                                </div>

                                                <div className="details">
                                                    <div className="name">
                                                        <a href={editUrl} target="_blank" rel="noopener noreferrer">
                                                            {product.name}
                                                        </a>
                                                    </div>
                                                    <div className="des">
                                                        {__('sku', 'multivendorx')}: {product.sku}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="right-details">
                                                <div className="price">{formatCurrency(product.price ?? 0)}</div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="no-products">{__('No recent products found.', 'multivendorx')}</p>
                            )}
                        </div>
                    </div>

                    <div className="row">
                        {modules.includes('store-review') && (
                            <div className="column">
                                <div className="card-header">
                                    <div className="left">
                                        <div className="title">{__('Latest reviews', 'multivendorx')}</div>
                                    </div>
                                    <div className="right">
                                        <i
                                            className="adminlib-external"
                                            onClick={() => {
                                                navigate(`?page=multivendorx#&tab=customer-support&subtab=review`);
                                            }}
                                        ></i>
                                    </div>
                                </div>
                                <LatestReview store_id={id} />
                            </div>
                        )}
                    </div>

                    <div className="row">
                        {modules.includes('marketplace-refund') && (
                            <div className="column">
                                <div className="card-header">
                                    <div className="left">
                                        <div className="title">{__('Latest refunds', 'multivendorx')}</div>
                                    </div>
                                    <div className="right">
                                        <i
                                            className="adminlib-external"
                                            onClick={() => {
                                                navigate(`?page=multivendorx#&tab=customer-support&subtab=refund-requests`);
                                            }}
                                        ></i>
                                    </div>
                                </div>
                                <div className="store-owner-details owner">
                                    <LatestRefundRequest store_id={id} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="card-wrapper w-35">
                    {appLocalizer.khali_dabba && (
                        <div className="card-content">
                            <div className="card-header">
                                <div className="left">
                                    <div className="title">
                                        {__('Store hours', 'multivendorx')}
                                    </div>
                                    <div className="des">
                                        {__('Manage your weekly schedule and special hours', 'multivendorx')}
                                    </div>
                                </div>
                            </div>
                            <div className="store-time-wrapper">
                                <div className="row">
                                    <div className="time-wrapper">
                                        <div className="des">{__('Current status', 'multivendorx')}</div>
                                        <div className="time">
                                            <span className="admin-badge green">{__('Open', 'multivendorx')}</span>
                                        </div>
                                    </div>
                                    <div className="time-wrapper">
                                        <div className="des">{__('Next opening', 'multivendorx')}</div>
                                        <div className="time">{__('Mon 9:00 AM', 'multivendorx')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    {__('Store information', 'multivendorx')}
                                </div>
                            </div>
                            <div className="right">
                                <i
                                    className="adminlib-external"
                                    onClick={() => {
                                        navigate(`?page=multivendorx#&tab=stores&edit/${id}/&subtab=store`);
                                    }}
                                ></i>
                            </div>
                        </div>

                        <div className="overview-wrapper">
                            <div className="items">
                                <div className="title">{__('Created on', 'multivendorx')}</div>
                                <div className="details">
                                    <div className="sku">
                                        {storeData.create_time}
                                        <a
                                            className="sku"
                                            onClick={() => {
                                                navigate(`?page=multivendorx#&tab=stores&edit/${id}/&subtab=application-details`);
                                            }}
                                        >
                                            {__('Application Data', 'multivendorx')}
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="items">
                                <div className="title">{__('Lifetime earnings', 'multivendorx')}</div>
                                <div className="details">
                                    <div className="sku">{formatCurrency(storeData.commission?.commission_total ?? 0)}</div>
                                </div>
                            </div>
                            {appLocalizer.khali_dabba && (
                                <div className="items">
                                    <div className="title">{__('Vacation mode', 'multivendorx')}</div>
                                    <div className="details">
                                        <span className="admin-badge red">{__('Inactive', 'multivendorx')}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {appLocalizer.khali_dabba && (
                            <div className="description-wrapper">
                                <div className="title">
                                    <i className="adminlib-error"></i>
                                    {__('Gold plan', 'multivendorx')}
                                    <span className="admin-badge green">{__('Active', 'multivendorx')}</span>
                                </div>
                                <div className="des">{__('Renews on Dec 15, 2024', 'multivendorx')}</div>
                            </div>
                        )}
                    </div>
                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">{__('Store staff', 'multivendorx')}</div>
                            </div>
                            <div className="right">
                                <i
                                    className="adminlib-external"
                                    onClick={() => {
                                        navigate(`?page=multivendorx#&tab=stores&edit/${id}/&subtab=staff`);
                                    }}
                                ></i>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="details-wrapper">
                                <div className="avatar">
                                    <i className="item-icon adminlib-person"></i>
                                </div>
                                <div className="details">
                                    <div className="name">
                                        {storeData.primary_owner_info?.data?.display_name ?? <Skeleton variant="text" width={150} />}
                                        <div className="admin-badge green">{__('Primary Owner', 'multivendorx')}</div>
                                        <span className="admin-badge blue">
                                            <i
                                                className="adminlib-edit"
                                                onClick={() => {
                                                    navigate(`?page=multivendorx#&tab=stores&edit/${id}/&subtab=staff`, {
                                                        state: { highlightTarget: 'primary-owner' },
                                                    });
                                                    setTimeout(() => {
                                                        navigate(`?page=multivendorx#&tab=stores&edit/${id}/&subtab=staff`, { replace: true });
                                                    }, 500);
                                                }}
                                            ></i>
                                        </span>
                                    </div>
                                    <div className="des">
                                        {__('Email', 'multivendorx')}: {storeData.primary_owner_info?.data?.user_email ?? <Skeleton variant="text" width={150} />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

}

export default Overview;