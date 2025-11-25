import { useEffect, useState } from "react";
import { __ } from '@wordpress/i18n';
import { BasicInput, SelectInput, getApiLink } from "zyra";
import axios from "axios";
import { formatCurrency } from '../services/commonFunction';

interface OrderDetailsProps {
    order?: any; // optionally pass order data
    onBack?: () => void; // optional back button
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onBack }) => {
    const [orderData, setOrderData] = useState<any>(order || null);
    const [customerData, setCustomerData] = useState<any>();
    const orderId = order?.id;

    const [statusSelect, setStatusSelect] = useState(false);
    const [isRefund, setIsRefund] = useState(false);
    const [refundItems, setRefundItems] = useState({});
    const [refundDetails, setRefundDetails] = useState({
        refundAmount: 0,
        restock: true,
        reason: "",
    });

    // When any item total changes, recalculate refundAmount
    const handleItemChange = (id, field, value) => {
        setRefundItems((prev) => {
            const updated = {
                ...prev,
                [id]: {
                    ...prev[id],
                    [field]: value,
                },
            };

            // Recalculate total refund amount
            const refundAmount = Object.values(updated).reduce((sum, item) => {
                return sum + (item.total ? Number(item.total) : 0);
            }, 0);

            setRefundDetails((prevDetails) => ({
                ...prevDetails,
                refundAmount,
            }));

            return updated;
        });
    };


    const handleRefundSubmit = () => {
        const payload = {
            orderId: orderId,
            items: refundItems,
            refundAmount: refundDetails.refundAmount,
            restock: refundDetails.restock,
            reason: refundDetails.reason,
        };
        console.log("Refund Data Sent:", payload);
        axios({
            method: 'POST',
            url: getApiLink(appLocalizer, 'refund'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: { payload }
        })
            .then((response) => {
                if (response.data.success) {
                    window.location.reload();
                }
            })
        // onRefund(payload); // send to your API here
    };

    const [values, setValues] = useState({
        commission: 50,
        discount: 5,
        shipping: 0,
        total: 95,
        earned: 50,
    });

    const fetchOrder = async () => {
        try {
            const res = await axios.get(`${appLocalizer.apiUrl}/wc/v3/orders/${orderId}`, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
            });
            setOrderData(res.data);

            const customerId = res.data.customer_id;

            const customer = await axios.get(`${appLocalizer.apiUrl}/wc/v3/customers/${customerId}`, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
            });
            setCustomerData(customer.data);

        } catch (error) {
            console.error("Error fetching order:", error);
        }
    };
console.log('orderData', orderData)
    useEffect(() => {
        if (!orderId) return;

        fetchOrder();
    }, [orderId]);

    const handleStatusChange = async (newStatus) => {
        const response = await axios.put(
            `${appLocalizer.apiUrl}/wc/v3/orders/${orderId}`,
            { status: newStatus },
            { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
        );

        if (response) {
            setStatusSelect(false)
            fetchOrder()
        }
    };

    const handleChange = (field: keyof typeof values, val: number) => {
        const newVals = { ...values, [field]: val };
        const baseTotal = 100; // example base price
        newVals.total = baseTotal - newVals.discount + newVals.shipping;
        newVals.earned = newVals.commission;
        setValues(newVals);
    };
    const formatDateTime = (iso?: string | null) => {
        if (!iso) return '-';
        try {
            const d = new Date(iso);
            return d.toLocaleString(); // adjust locale/options if you want specific format
        } catch {
            return iso;
        }
    };

    const statusBadgeClass = (status?: string) => {
        switch ((status || '').toLowerCase()) {
            case 'completed': return 'admin-badge green';
            case 'on-hold': return 'admin-badge orange';
            case 'processing': return 'admin-badge blue';
            case 'cancelled': return 'admin-badge red';
            default: return 'admin-badge';
        }
    };

    return (
        <>
            {!appLocalizer.edit_order_capability ? (
                <p>No access to view the order</p>
            ) : (
                <>
                    <div className="page-title-wrapper">
                        <div className="page-title">
                            <div className="title">
                                Order #{orderData?.number ?? orderId ?? "—"}
                                {!statusSelect &&
                                    <div className={statusBadgeClass(orderData?.status)}
                                        onClick={() => setStatusSelect(true)}
                                    >
                                        {/* choose icon and label dynamically */}
                                        {orderData?.status === 'completed' ? <i className="adminlib-check"></i> : <i className="adminlib-info"></i>}
                                        {` ${(orderData?.status || 'Unknown').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`}
                                    </div>
                                }
                                {statusSelect &&
                                    <div className="status-edit">
                                        <SelectInput
                                            name="status"
                                            options={[
                                                { label: 'Processing', value: 'processing' },
                                                { label: 'On Hold', value: 'on-hold' },
                                                { label: 'Completed', value: 'completed' },
                                                { label: 'Cancelled', value: 'cancelled' },
                                            ]}
                                            value={orderData?.status}
                                            type="single-select"
                                            onChange={(newValue: any) => {
                                                handleStatusChange(newValue.value)
                                            }}
                                        />
                                    </div>
                                }
                            </div>

                            <div className="des">
                                {formatDateTime(orderData?.date_created)}
                            </div>
                        </div>
                        <div className="buttons-wrapper">
                            {onBack && (
                                <button className="tooltip-btn admin-badge blue" onClick={onBack}>
                                    <i className="adminlib-eye"></i>
                                    <span className="tooltip"> Back to Orders </span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="container-wrapper">
                        <div className="card-wrapper w-65">
                            <div className="card-content">
                                <div className="table-wrapper view-order-table">
                                    <table className="admin-table">
                                        <thead className="admin-table-header">
                                            <tr className="header-row">
                                                <td className="header-col">Item</td>
                                                <td className="header-col">Cost</td>
                                                <td className="header-col">Qty</td>
                                                <td className="header-col">Total</td>
                                                <td className="header-col">Tax</td>
                                            </tr>
                                        </thead>

                                        <tbody className="admin-table-body">
                                            {orderData?.line_items?.length > 0 ? (
                                                orderData.line_items.map((item) => (
                                                    <tr key={item.id} className="admin-row simple">
                                                        <td className="admin-column">
                                                            <div className="item-details">
                                                                <div className="image">
                                                                    <img
                                                                        src={item?.image?.src}
                                                                        alt={item?.name}
                                                                        width={40}
                                                                    />
                                                                </div>
                                                                <div className="detail">
                                                                    <div className="name">{item.name}</div>
                                                                    {item?.sku && <div className="sku">SKU: {item.sku}</div>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        {/* Cost (not editable) */}
                                                        <td className="admin-column">
                                                            {`$${parseFloat(item.price).toFixed(2)}`}
                                                        </td>

                                                        {/* Qty (editable only in refund mode) */}
                                                        <td className="admin-column">
                                                          <div className="price"> x {item.quantity} </div>

                                                            {isRefund && (
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    className="basic-input"
                                                                    value={refundItems[item.id]?.quantity ?? 0}
                                                                    onChange={(e) =>
                                                                        handleItemChange(item.id, "quantity", +e.target.value)
                                                                    }
                                                                />
                                                            )}
                                                        </td>

                                                        {/* Total (editable only in refund mode) */}
                                                        <td className="admin-column">
                                                          <div className="price">   ${parseFloat(item.subtotal).toFixed(2)} </div>

                                                            {isRefund && (
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    className="basic-input"
                                                                    value={refundItems[item.id]?.total ?? 0}
                                                                    onChange={(e) =>
                                                                        handleItemChange(item.id, "total", +e.target.value)
                                                                    }
                                                                />
                                                            )}
                                                        </td>
                                                        <td className="admin-column">
                                                         <div className="price"> ${parseFloat(item.subtotal_tax).toFixed(2)} </div>

                                                            {isRefund && (
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    className="basic-input"
                                                                    value={refundItems[item.id]?.tax ?? 0}
                                                                    onChange={(e) =>
                                                                        handleItemChange(item.id, "tax", +e.target.value)
                                                                    }
                                                                />
                                                            )}
                                                        </td>

                                                    </tr>
                                                ))
                                            ) : (
                                                <tr className="admin-row simple"> 
                                                    <td colSpan={4}>
                                                        No items found.
                                                    </td>
                                                </tr>
                                            )}
                                            {orderData?.shipping_lines?.length > 0 && (
                                                orderData.shipping_lines.map((item) => (
                                                    <tr className="admin-row simple">
                                                        <td className="admin-column" colSpan={3}>
                                                            <div className="item-details">
                                                                <div className="icon">
                                                                    <i className="adminlib-cart green"></i>
                                                                </div>
                                                                <div className="detail">
                                                                    <div className="name">{item.method_title}</div>
                                                                    {/* {item?.meta_data?.map((data) => (
                                                                        <div className="sub-text" key={data.id}>
                                                                            <span>{data.display_key || data.key}:</span> {data.display_value || data.value}
                                                                        </div>
                                                                    ))} */}
                                                                        {/* <div className="sub-text"><span>_vendor_order_shipping_item_id:</span> 337</div> */}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="admin-column"></td>
                                                        <td className="admin-column"></td>
                                                        <td className="admin-column">
                                                            {isRefund ? (
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    className="basic-input"
                                                                    // value="$95"
                                                                    value={refundItems[item.id]?.shipping_total ?? 0}
                                                                    onChange={(e) =>
                                                                        handleItemChange(item.id, "shipping_total", +e.target.value)
                                                                    }
                                                                />
                                                            ) : (
                                                                item.total
                                                            )}
                                                        </td>
                                                        <td className="admin-column">
                                                            {isRefund ? (
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    className="basic-input"
                                                                    value={refundItems[item.id]?.total_tax ?? 0}
                                                                    onChange={(e) =>
                                                                        handleItemChange(item.id, "total_tax", +e.target.value)
                                                                    }
                                                                />
                                                            ) : (
                                                                item.total_tax
                                                            )}
                                                        </td>
                                                    </tr>
                                                )))}
                                        </tbody>
                                    </table>
                                </div>


                                <div className="coupons-calculation-wrapper">
                                    <div className="left">
                                        {!isRefund ? (
                                            <button
                                                className="admin-btn btn-purple"
                                                onClick={() => setIsRefund(true)}
                                            >
                                                Refund
                                            </button>
                                        ) : (
                                            <div className="buttons-wrapper left">
                                                <button
                                                    className="admin-btn btn-green"
                                                    onClick={handleRefundSubmit}
                                                >
                                                    Refund ${refundDetails.refundAmount.toFixed(2)} manually
                                                </button>
                                                <button
                                                    className="admin-btn btn-red"
                                                    onClick={() => setIsRefund(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {isRefund && (
                                        <div className="right">
                                            <table className="refund-table">
                                                <tbody>
                                                    <tr>
                                                        <td>Restock refunded items:</td>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={refundDetails.restock}
                                                                onChange={(e) =>
                                                                    setRefundDetails({
                                                                        ...refundDetails,
                                                                        restock: e.target.checked,
                                                                    })
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr><td>Amount already refunded:</td><td>-$0.00</td></tr>
                                                    <tr>

                                                        <td>Total available to refund:</td>
                                                        <td>$20.00</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Refund amount:</td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="basic-input"
                                                                value={refundDetails.refundAmount}
                                                                onChange={(e) =>
                                                                    setRefundDetails({
                                                                        ...refundDetails,
                                                                        refundAmount: +e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Reason for refund (optional):</td>
                                                        <td>
                                                            <textarea
                                                                className="textarea-input"
                                                                placeholder="Reason for refund"
                                                                value={refundDetails.reason}
                                                                onChange={(e) =>
                                                                    setRefundDetails({
                                                                        ...refundDetails,
                                                                        reason: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {!isRefund ? (
                                        <div className="right">
                                            <table>
                                                <tbody>
                                                    <tr><td>Commission:</td><td>{formatCurrency(orderData?.commission_amount)}</td></tr>
                                                    <tr><td>Shipping:</td><td>{formatCurrency(orderData?.shipping_total)}</td></tr>
                                                    <tr><td>Total:</td><td>{formatCurrency(orderData?.total)}</td></tr>
                                                    <tr><td>Total Earned:</td><td>{formatCurrency(orderData?.commission_total)}</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    ) :
                                        (
                                            <></>
                                            // <table className="refund-table">
                                            //     <tbody>
                                            //         <tr><td>Amount already refunded:</td><td>-$50</td></tr>
                                            //         <tr><td>Total available to refund:</td><td>$60</td></tr>
                                            //         <tr>
                                            //             <td>Refund amount:</td>
                                            //             <td>
                                            //                 <input
                                            //                     type="number"
                                            //                     className="basic-input"
                                            //                     value={values.shipping}
                                            //                     onChange={(e) => handleChange("shipping", +e.target.value)}
                                            //                 />
                                            //             </td>
                                            //         </tr>
                                            //         <tr><td>Reason for refund (optional):</td><td>${values.total.toFixed(2)}</td></tr>
                                            //     </tbody>
                                            // </table>
                                        )}

                                </div>
                                {/* <div className="coupons-calculation-wrapper">
                                <div className="left">
                                    {!isRefund && (
                                        <div className="coupon">Coupon(s): <a href="#" className="admin-badge blue">COUPON30</a></div>
                                    )}
                                    <div className="admin-btn btn-purple" onClick={() => setIsRefund(!isRefund)}>
                                        {isRefund ? "Refund Manuall" : "Refund"}
                                    </div>
                                </div> */}
                                {/* <div className="right">
                                    {!isRefund ? (
                                        <table>
                                            <tbody>
                                                <tr><td>Commission:</td><td>$29</td></tr>
                                                <tr><td>Discount:</td><td>$29</td></tr>
                                                <tr><td>Total Earned:</td><td>$529</td></tr>
                                            </tbody>
                                        </table>
                                    ) :
                                     (
                                        <></>
                                        // <table className="refund-table">
                                        //     <tbody>
                                        //         <tr><td>Amount already refunded:</td><td>-$50</td></tr>
                                        //         <tr><td>Total available to refund:</td><td>$60</td></tr>
                                        //         <tr>
                                        //             <td>Refund amount:</td>
                                        //             <td>
                                        //                 <input
                                        //                     type="number"
                                        //                     className="basic-input"
                                        //                     value={values.shipping}
                                        //                     onChange={(e) => handleChange("shipping", +e.target.value)}
                                        //                 />
                                        //             </td>
                                        //         </tr>
                                        //         <tr><td>Reason for refund (optional):</td><td>${values.total.toFixed(2)}</td></tr>
                                        //     </tbody>
                                        // </table>
                                    )}
                                </div> */}
                                {/* </div> */}
                            </div>
                        </div>

                        <div className="card-wrapper w-35">
                            <div className="card-content">
                                <div className="card-header">
                                    <div className="left">
                                        <div className="title">
                                            Customer details
                                        </div>
                                    </div>
                                </div>
                                <div className="store-owner-details">
                                    <div className="profile">
                                        <div className="avater">
                                            <img
                                                src={customerData?.avatar_url}
                                                alt={`${orderData?.billing?.first_name || "Customer"} avatar`}
                                            />
                                        </div>

                                        <div className="details">
                                            <div className="name">
                                                {orderData?.billing?.first_name || orderData?.billing?.last_name
                                                    ? `${orderData?.billing?.first_name ?? ""} ${orderData?.billing?.last_name ?? ""}`
                                                    : "Guest Customer"}
                                            </div>
                                            <div className="des"> Customer ID: #{orderData?.customer_id && orderData.customer_id !== 0 ? orderData.customer_id : "—"}</div>
                                            {orderData?.billing?.email && (
                                                <div className="des">
                                                    <i className="adminlib-mail" /> {orderData.billing.email}
                                                </div>
                                            )}

                                            {orderData?.billing?.phone && (
                                                <div className="des">
                                                    <i className="adminlib-phone" /> {orderData.billing.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card-content">
                                <div className="card-header">
                                    <div className="left">
                                        <div className="title">
                                            Billing address
                                        </div>
                                    </div>
                                    {/* <div className="right">
                                        <i className="adminlib-external"></i>
                                    </div> */}
                                </div>
                                <div className="overview-wrapper">

                                    <div className="items">
                                        <div className="title">
                                            Address
                                        </div>
                                        <div className="details">
                                            {orderData?.billing?.address_1 ||
                                                orderData?.billing?.city ||
                                                orderData?.billing?.postcode ||
                                                orderData?.billing?.country ? (
                                                <div className="address">
                                                    {orderData.billing.first_name || orderData.billing.last_name ? (
                                                        <>
                                                            {orderData.billing.first_name} {orderData.billing.last_name}
                                                        </>
                                                    ) : null}
                                                    {orderData.billing.company && <> , {orderData.billing.company} </>}
                                                    {orderData.billing.address_1 && <> , {orderData.billing.address_1} </>}
                                                    {orderData.billing.address_2 && <> , {orderData.billing.address_2} </>}
                                                    {orderData.billing.city && (
                                                        <>
                                                            {orderData.billing.city}
                                                            {orderData.billing.state ? `, ${orderData.billing.state}` : ""}
                                                        </>
                                                    )}
                                                    {orderData.billing.postcode && <>, {orderData.billing.postcode} </>}
                                                    {orderData.billing.country && <> , {orderData.billing.country}</>}
                                                </div>
                                            ) : (
                                                <div className="address">No billing address provided</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="items">
                                        <div className="title">
                                            Payment method
                                        </div>
                                        <div className="details">
                                            <div className="admin-badge blue">
                                                {orderData?.payment_method_title || "Not specified"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="card-content">
                                <div className="card-header">
                                    <div className="left">
                                        <div className="title">
                                            Shipping address
                                        </div>
                                    </div>
                                </div>
                                <div>45 Roker Terrace</div>
                                <div>Latheronwheel</div>
                                <div>KW5 8NW, London</div>
                                <div>UK</div>
                            </div>

                            <div className="card-content">
                                <div className="card-header">
                                    <div className="left">
                                        <div className="title">
                                            Shipping Tracking
                                        </div>
                                    </div>
                                    {/* <div className="right">
                                        <i className="adminlib-external"></i>
                                    </div> */}
                                </div>
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">Create Shipping</label>
                                        <SelectInput name="country" options={[]} type="single-select" />
                                    </div>
                                </div>
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">Tracking Number</label>
                                        <BasicInput name="name" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
                                    </div>
                                </div>
                                <div className="buttons-wrapper">
                                    <div className="admin-btn btn-purple">Create Shipment</div>
                                </div>
                            </div>

                            <div className="card-content">
                                <div className="card-header">
                                    <div className="left">
                                        <div className="title">
                                            Order notes
                                        </div>
                                    </div>
                                    {/* <div className="right">
                                        <i className="adminlib-external"></i>
                                    </div> */}
                                </div>

                                {orderData?.order_notes && orderData.order_notes.length > 0 ? (
                                    <div className="notification-wrapper">
                                        <ul>
                                            {orderData.order_notes.map((note: any, index: number) => (
                                                <li key={index}>
                                                    <div className="icon-wrapper">
                                                        <i
                                                            className={
                                                                note.is_customer_note
                                                                    ? "adminlib-mail orange"
                                                                    : "adminlib-form-paypal-email blue"
                                                            }
                                                        ></i>
                                                    </div>
                                                    <div className="details">
                                                        <div className="notification-title">
                                                            {note.author || "System Note"}
                                                        </div>
                                                        <div
                                                            className="des"
                                                            dangerouslySetInnerHTML={{ __html: note.note || "" }}
                                                        ></div>
                                                        <span>{new Date(note.date_created).toLocaleString()}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="notification-wrapper">
                                        <div className="empty">No order notes found.</div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </>
            )
            }
        </>
    );
};

export default OrderDetails;
