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

        // axios({
        //     method: 'GET',
        //     url: getApiLink(appLocalizer, `transaction/${id}`),
        //     headers: { 'X-WP-Nonce': appLocalizer.nonce },
        // })
        //     .then((response) => {
        //         setData(response?.data || {});
        //     })

        // axios({
        //     method: "GET",
        //     url: getApiLink(appLocalizer, `store/${id}`),
        //     headers: { "X-WP-Nonce": appLocalizer.nonce },
        // })
        //     .then((response) => {
        //         setStoreData(response.data || {});
        //     })

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'transaction'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: 1,
                row: 3,
                store_id: id,
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

    const overviewData = [
        {
            icon: "adminlib-book red",
            number: formatCurrency(storeData.transactions?.balance ?? 0),
            text: "Wallet balance",
        },
        {
            icon: "adminlib-global-community yellow",
            number: formatCurrency(storeData.transactions?.locking_balance ?? 0),
            text: "Upcoming balance",
        },
        {
            icon: "adminlib-global-community blue",
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
                                        onClick={() => { navigate(`?page=multivendorx#&tab=transaction-history`) }}
                                    ></i>
                                </div>
                            </div>
                            {recentDebits && recentDebits.length > 0 ? (
                                recentDebits.map((txn) => (
                                    <div key={txn.id} className="store-owner-details">
                                        <div className="profile">
                                            <div className="avater">
                                                <span className="adminlib-calendar"></span>
                                            </div>
                                            <div className="details">
                                                <div className="name">
                                                    {formatCurrency(txn.balance)}
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
                                            <div
                                                className={`admin-badge ${txn.status?.toLowerCase() === "completed"
                                                    ? "green"
                                                    : txn.status?.toLowerCase() === "upcoming"
                                                        ? "yellow"
                                                        : "red"
                                                    }`}
                                            >
                                                {txn.status}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-products">No recent payout</div>
                            )}

                        </div>

                        {/* <div className="column">
                            <div className="card-header">
                                <div className="left">
                                    <div className="title">
                                        Latest products
                                    </div>
                                </div>
                                <div className="right">
                                    <i className="adminlib-external"></i>
                                </div>
                            </div>
                        </div> */}
                        <div className="column">
                            <div className="card-header">
                                <div className="left">
                                    <div className="title">
                                        Latest products
                                    </div>
                                </div>
                                <div className="right">
                                    <i
                                        className="adminlib-external"
                                        onClick={() => {
                                            window.location.href = `${appLocalizer.site_url.replace(/\/$/, '')}/wp-admin/edit.php?post_type=product`;
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
                                        <div key={product.id} className="store-owner-details">
                                            {/* Left side */}
                                            <div className="profile">
                                                <div className="avater">
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
                                                        {/* {product.date_created
                                                            ? new Date(product.date_created).toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                    month: "short",
                                                                    day: "2-digit",
                                                                    year: "numeric",
                                                                }
                                                            )
                                                            : "-"} */}
                                                        sku: {product.sku}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right side */}
                                            <div className="right-details">
                                                <div
                                                    className="price"
                                                    dangerouslySetInnerHTML={{ __html: product.price_html }}
                                                />
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
                                            Latest Reviews
                                        </div>
                                    </div>
                                    <div className="right">
                                        <i className="adminlib-external"
                                            onClick={() => { navigate(`?page=multivendorx#&tab=customer-support&subtab=review`) }}
                                        ></i>
                                    </div>
                                </div>

                                <div className="store-owner-details owner">
                                    <LatestReview store_id={id} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="row">
                        {modules.includes('marketplace-refund') && (
                            <div className="column">
                                <div className="card-header">
                                    <div className="left">
                                        <div className="title">
                                            Latest Refund
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
                                <i className="adminlib-external"></i>
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
                                        <div
                                            className="sku"
                                            onClick={() => {
                                                navigate(`?page=multivendorx#&tab=stores&edit/${id}/&subtab=application-details`);
                                            }}
                                        >
                                            <i className="adminlib-external"></i>
                                        </div>
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
                                    Primary owner
                                </div>
                            </div>
                            <div className="right">
                                <i className="adminlib-external"
                                    onClick={() => { navigate(`?page=multivendorx#&tab=stores&edit/${id}/&subtab=staff`) }}
                                ></i>
                            </div>
                        </div>

                        <div className="store-owner-details owner">
                            <div className="profile">
                                <div className="avater">
                                    <span>JD</span>
                                </div>
                                <div className="details">
                                    <div className="name">{storeData.primary_owner_info?.data?.display_name ?? <Skeleton variant="text" width={150} />
                                    }</div>
                                    <div className="des">Owner</div>
                                </div>
                            </div>
                            <ul className="contact-details">
                                <li>
                                    <i className="adminlib-mail"></i>{storeData.primary_owner_info?.data?.user_email ?? <Skeleton variant="text" width={150} />}
                                </li>
                                {/* <li>
                                    <i className="adminlib-form-phone"></i> +1 (555) 987-6543
                                </li> */}
                            </ul>
                        </div>
                    </div>


                    {/* <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Repeating
                                </div>
                            </div>
                            <div className="right">
                                <i className="adminlib-external"></i>
                            </div>
                        </div>

                        <div className="store-owner-details">
                            <div className="profile">
                                <div className="avater">
                                    <span className="adminlib-form-recaptcha"></span>
                                </div>
                                <div className="details">
                                    <div className="name">Repeats every two weeks</div>
                                    <div className="des">Monday @ 9.00 - 11.00 Am</div>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
        </>
    );

}

export default Overview;