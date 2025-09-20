import { useEffect, useState } from "react";
import { __ } from '@wordpress/i18n';
import { ColumnDef } from "@tanstack/react-table";
import productImage from "../assets/images/default.png";
import { Table } from "zyra";

type StoreRow = {
    id: number;
    store_name?: string;   // Coupon Name
    store_slug?: string;   // Reused but we'll map different fields into it
    type?: string;         // Coupon Type
    amount?: string;       // Coupon Amount
    usage?: string;        // Usage / Limit
    expiry?: string;       // Expiry Date
    status?: string;
};

const Reviews: React.FC = () => {
    const [isRefund, setIsRefund] = useState(false);
    const [values, setValues] = useState({
        commission: 50,
        discount: 5,
        shipping: 0,
        total: 95,
        earned: 50,
    });
    const [row, setRow] = useState({
        cost: 100,
        discount: 5,
        qty: 1,
        total: 95,
        commission: 20,
    });

    const handleChange = (field: keyof typeof values, val: number) => {
        const newVals = { ...values, [field]: val };

        // Recalculate total & earned if needed
        const baseTotal = 100; // example base price
        newVals.total = baseTotal - newVals.discount + newVals.shipping;
        newVals.earned = newVals.commission;

        setValues(newVals);
    };

    return (
        <>
            {/* page title start */}
            < div className="page-title-wrapper" >
                <div className="page-title">
                    <div className="title">Order #8456
                        <div className="admin-badge green">
                            <i className="adminlib-check"></i>
                            Completed
                        </div>
                    </div>
                    <div className="des">September 10, 2025 8:06 am</div>
                </div>
            </div > {/* page title end */}



            <div className="container-wrapper">
                <div className="card-wrapper width-65">
                    <div className="card-content">
                        <div className="table-wrapper view-order-table">
                            <table className="admin-table">
                                <thead className="admin-table-header">
                                    <tr className="header-row">
                                        <td className="header-col">Item</td>
                                        <td className="header-col">Cost</td>
                                        <td className="header-col">Discount</td>
                                        <td className="header-col">Qty</td>
                                        <td className="header-col">Total</td>
                                        <td className="header-col">Commission</td>
                                    </tr>
                                </thead>
                                <tbody className="admin-table-body">
                                    <tr className="admin-row simple">
                                        <td className="admin-column">
                                            <div className="item-details">
                                                <div className="image">
                                                    <img src={productImage} alt="product" />
                                                </div>
                                                <div className="detail">
                                                    <div className="name">Charcoal Detox</div>
                                                    <div className="sku">SKU: 8676</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Cost */}
                                        <td className="admin-column">
                                            {!isRefund ? (
                                                `$${row.cost}`
                                            ) : (
                                                <input
                                                    type="number"
                                                    value={row.cost}
                                                    onChange={(e) =>
                                                        setRow({ ...row, cost: +e.target.value })
                                                    }
                                                    className="basic-input"
                                                />
                                            )}
                                        </td>

                                        {/* Discount */}
                                        <td className="admin-column">
                                            {!isRefund ? (
                                                `$${row.discount}`
                                            ) : (
                                                <input
                                                    type="number"
                                                    value={row.discount}
                                                    onChange={(e) =>
                                                        setRow({ ...row, discount: +e.target.value })
                                                    }
                                                    className="basic-input"
                                                />
                                            )}
                                        </td>

                                        {/* Qty */}
                                        <td className="admin-column">
                                            {!isRefund ? (
                                                `x ${row.qty}`
                                            ) : (
                                                <input
                                                    type="number"
                                                    value={row.qty}
                                                    onChange={(e) =>
                                                        setRow({ ...row, qty: +e.target.value })
                                                    }
                                                    className="basic-input"
                                                />
                                            )}
                                        </td>

                                        {/* Total */}
                                        <td className="admin-column">
                                            {!isRefund ? (
                                                `$${row.total}`
                                            ) : (
                                                <input
                                                    type="number"
                                                    value={row.total}
                                                    onChange={(e) =>
                                                        setRow({ ...row, total: +e.target.value })
                                                    }
                                                    className="basic-input"
                                                />
                                            )}
                                        </td>

                                        {/* Commission */}
                                        <td className="admin-column">
                                            {!isRefund ? (
                                                `$${row.commission}`
                                            ) : (
                                                <input
                                                    type="number"
                                                    value={row.commission}
                                                    onChange={(e) =>
                                                        setRow({ ...row, commission: +e.target.value })
                                                    }
                                                    className="basic-input"
                                                />
                                            )}
                                        </td>
                                    </tr>


                                    {/* shipping row start */}
                                    <tr className="admin-row  simple">
                                        <td className="admin-column">
                                            <div className="item-details">
                                                <div className="icon">
                                                    <i className="adminlib-cart green"></i>
                                                </div>
                                                <div className="detail">
                                                    <div className="name">Free shipping</div>
                                                    <div className="sub-text"><span>Items:</span>  Charcoal Detox × 1</div>
                                                    <div className="sub-text"><span>package_qty:</span>  </div>
                                                    <div className="sub-text"><span>_vendor_order_shipping_item_id:</span>  337</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="admin-column">

                                        </td>
                                        <td className="admin-column">

                                        </td>
                                        <td className="admin-column">

                                        </td>
                                        <td className="admin-column">
                                            $95
                                        </td>
                                        <td className="admin-column">

                                        </td>
                                    </tr> {/* shipping row start */}
                                </tbody>
                            </table>
                        </div>


                        <div className="coupons-calculation-wrapper">
                            <div className="left">
                                {!isRefund && (
                                    <div className="coupon">Coupon(s): <a href="#" className="admin-badge blue">COUPON30</a></div>
                                )}
                                <div
                                    className="admin-btn btn-purple"
                                    onClick={() => setIsRefund(!isRefund)}
                                >
                                    {isRefund ? "Refund Manuall" : "Refund"}
                                </div>
                            </div>
                            <div className="right">
                                {!isRefund ? (
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td>Commission:</td>
                                                <td>$29</td>
                                            </tr>
                                            <tr>
                                                <td>Discount:</td>
                                                <td>$29</td>
                                            </tr>
                                            <tr>
                                                <td>Discount:</td>
                                                <td>$29</td>
                                            </tr>
                                            <tr>
                                                <td>Discount:</td>
                                                <td>$29</td>
                                            </tr>
                                            <tr>
                                                <td>Total Earned:</td>
                                                <td>$529</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                ) : (
                                    <table className="refund-table">
                                        <tbody>
                                            <tr>
                                                <td>Amount already refunded:</td>
                                                <td>
                                                    -$50
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Total available to refund:</td>
                                                <td>
                                                    $60
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Refund amount:</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="basic-input"
                                                        value={values.shipping}
                                                        onChange={(e) =>
                                                            handleChange("shipping", +e.target.value)
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Reason for refund (optional):</td>
                                                <td>${values.total.toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                </div>


                <div className="card-wrapper width-35">
                    {/* customer details start */}
                    <div className="card-content">
                        <div className="card-title">Customer details</div>
                        <div className="details">
                            <div className="icon">
                                <img src="https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/1.png" alt="" />
                            </div>
                            <div className="content">
                                <div className="title">Shamus Tuttle</div>
                                <div className="des">Customer id: #5003546</div>
                            </div>
                        </div>
                        <div className="details">
                            <div className="icon ">
                                <i className="adminlib-cart green"></i>
                            </div>
                            <div className="content">
                                <div className="title">4 Orders</div>
                            </div>
                        </div>
                    </div> {/* customer details start */}

                    {/* Shipping start */}
                    <div className="card-content">
                        <div className="card-title">Billing address</div>

                        <div className="address">
                            <div>45 Roker Terrace</div>
                            <div> Latheronwheel</div>
                            <div> KW5 8NW,London</div>
                            <div> UK</div>
                        </div>

                        <div className="card-title">Payment method</div>
                        <div className="admin-badge blue">Direct bank transfer</div>
                    </div> {/* Shipping start */}

                    {/* Shipping start */}
                    <div className="card-content">
                        <div className="card-title">Shipping address</div>
                        <div>45 Roker Terrace</div>
                        <div> Latheronwheel</div>
                        <div> KW5 8NW,London</div>
                        <div> UK</div>
                    </div> {/* Shipping start */}

                    <div className="card-content">
                        <div className="card-title">Order notes</div>
                        <div className="notification-wrapper">
                            <ul>
                                <li>
                                    <div className="icon-wrapper">
                                        <i className="adminlib-form-paypal-email blue"></i>
                                    </div>
                                    <div className="details">
                                        <div className="notification-title">Lorem ipsum dolor sit amet.</div>
                                        <div className="des">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</div>
                                        <span>1d ago</span>
                                    </div>

                                </li>
                                <li>
                                    <div className="icon-wrapper">
                                        <i className="adminlib-mail orange"></i>
                                    </div>
                                    <div className="details">
                                        <div className="notification-title">Lorem ipsum dolor sit amet.</div>
                                        <div className="des">Lorem ipsum dolor sit amet, consectetur adipisicing elit</div>
                                        <span>34min ago</span>
                                    </div>
                                </li>
                                <li>
                                    <div className="icon-wrapper">
                                        <i className="adminlib-form-paypal-email green"></i>
                                    </div>
                                    <div className="details">
                                        <div className="notification-title">Lorem ipsum dolor sit amet.</div>
                                        <div className="des">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</div>
                                        <span>34min ago</span>
                                    </div>
                                </li>
                                <li>
                                    <div className="icon-wrapper">
                                        <i className="adminlib-calendar red"></i>
                                    </div>
                                    <div className="details">
                                        <div className="notification-title">Lorem ipsum dolor sit amet.</div>
                                        <div className="des">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</div>
                                        <span>34min ago</span>
                                    </div>
                                </li>
                            </ul>

                        </div>
                    </div>
                </div>
            </div >
        </>
    )

};

export default Reviews;