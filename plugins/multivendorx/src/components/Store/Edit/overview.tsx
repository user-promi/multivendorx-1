import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { BasicInput, SelectInput, getApiLink, SuccessNotice, useModules } from 'zyra';
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
                                    <div className="title">
                                        Recent payouts
                                    </div>
                                </div>
                                <div className="right">
                                    <i className="adminlib-external"
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
                                                <div className="name">
                                                    Bank Transfer
                                                </div>
                                                <div className="des">
                                                    {new Date(txn.date).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "2-digit",
                                                        year: "numeric",
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="right-details">
                                            <div className="price"> {formatCurrency(txn.amount)}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-products">No recent payout</div>
                            )}
                        </div>
                        <div className="column">
                            <div className="card-header">
                                <div className="left">
                                    <div className="title">
                                        Latest products
                                    </div>
                                </div>
                                <div className="right">
                                    <i className="adminlib-external"
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
                                    console.log(product);
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
                                                        <a
                                                            href={editUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {product.name}
                                                        </a>
                                                    </div>

                                                    <div className="des">
                                                        sku: {product.sku}
                                                    </div>

                                                    {/* Optional extra text */}
                                                    {/* <div className="small-text">Additional info</div> */}
                                                </div>
                                            </div>

                                            <div className="right-details">
                                                <div className="price">{formatCurrency(product.price ?? 0)}</div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="no-products">No recent products found.</p>
                            )}
                        </div>


                    </div>

                    <div className="row">
                        {modules.includes('store-review') && (
                            <div className="column">
                                <div className="card-header">
                                    <div className="left">
                                        <div className="title">
                                            Latest reviews
                                        </div>
                                    </div>
                                    <div className="right">
                                        <i className="adminlib-external"
                                            onClick={() => { navigate(`?page=multivendorx#&tab=customer-support&subtab=review`) }}
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
                                        <div className="title">
                                            Latest refunds
                                        </div>
                                    </div>
                                    <div className="right">
                                        <i className="adminlib-external"
                                            onClick={() => { navigate(`?page=multivendorx#&tab=customer-support&subtab=refund-requests`) }}
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
                                        Store hours
                                    </div>
                                    <div className="des">
                                        Manage your weekly schedule and special hours
                                    </div>
                                </div>
                                {/* <div className="des">
                                    Manage your weekly schedule and special hours
                                </div> */}
                            </div>

                            {/* <div className="store-owner-details">
                                <div className="profile">
                                    <div className="avater">
                                        <span className="adminlib-calendar"></span>
                                    </div>
                                    <div className="details">
                                        <div className="name">$5,420</div>
                                        <div className="des">Oct 15, 2024</div>
                                    </div>
                                </div>
                                <div className="right-details">
                                    <div className="price">$356 .35</div>
                                    <div className="div">Lorem, ipsum dolor.</div>
                                </div>
                            </div> */}

                            <div className="store-time-wrapper">

                                <div className="row">
                                    <div className="time-wrapper">
                                        <div className="des">Current status</div>
                                        <div className="time"><span className="admin-badge green">Open</span></div>
                                    </div>
                                    <div className="time-wrapper">
                                        <div className="des">Next opening</div>
                                        <div className="time">Mon 9:00 AM</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Store information
                                </div>
                            </div>
                            <div className="right">
                                <i className="adminlib-external"
                                    onClick={() => { navigate(`?page=multivendorx#&tab=stores&edit/${id}/&subtab=store`) }}
                                ></i>
                            </div>
                        </div>

                        <div className="overview-wrapper">
                            {/* <div className="items">
                                <div className="title">
                                    View application
                                </div>
                                <div className="details">

                                </div>
                            </div> */}

                            <div className="items">
                                <div className="title">
                                    Created on
                                </div>
                                <div className="details">
                                    <div className="sku">
                                        {storeData.create_time}
                                        <a
                                            className="sku"
                                            onClick={() => {
                                                navigate(`?page=multivendorx#&tab=stores&edit/${id}/&subtab=application-details`);
                                            }}
                                        >
                                            Application Data
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="items">
                                <div className="title">
                                    Lifetime earnings
                                </div>
                                <div className="details">
                                    <div className="sku">
                                        {formatCurrency(storeData.commission?.commission_total ?? 0)}
                                    </div>
                                </div>
                            </div>
                            {appLocalizer.khali_dabba && (
                                <div className="items">
                                    <div className="title">
                                        Vacation mode
                                    </div>
                                    <div className="details">
                                        <span className="admin-badge red">Inactive</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* <div className="analytics-container">
                            <div className="analytics-item">
                                <div className="analytics-icon">
                                    <i className="adminlib-tools green"></i>
                                </div>
                                <div className="details">
                                    <div className="number">{formatCurrency(storeData.commission?.commission_total ?? 0)}</div>
                                    <div className="text">Lifetime earnings</div>
                                </div>
                            </div>
                        </div> */}

                        {appLocalizer.khali_dabba && (
                            <div className="description-wrapper">
                                <div className="title">
                                    <i className="adminlib-error"></i>
                                    Gold plan
                                    <span className="admin-badge green">Active</span>
                                </div>
                                <div className="des">Renews on Dec 15, 2024</div>
                            </div>
                        )}
                    </div>
                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Store staff
                                </div>
                            </div>
                            <div className="right">
                                <i className="adminlib-external"
                                    onClick={() => { navigate(`?page=multivendorx#&tab=stores&edit/${id}/&subtab=staff`) }}
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
                                        <div className="admin-badge green">Primary Owner</div> <span className="admin-badge blue">
                                            <i className="adminlib-edit"
                                                onClick={() => {
                                                    navigate(`?page=multivendorx#&tab=stores&edit/${id}/&subtab=staff`, {
                                                        state: { highlightTarget: "primary-owner" },
                                                    });

                                                    setTimeout(() => {
                                                        navigate(`?page=multivendorx#&tab=stores&edit/${id}/&subtab=staff`, {
                                                            replace: true,
                                                        });
                                                    }, 500);
                                                }}></i></span>
                                    </div>
                                    <div className="des">Email: {storeData.primary_owner_info?.data?.user_email ?? <Skeleton variant="text" width={150} />}</div>
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