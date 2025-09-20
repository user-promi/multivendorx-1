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
    const orderData = [
        { icon: "adminlib-tools red", number: "September 10, 2025 8:10 am", text: "Order date " },
        { icon: "adminlib-book green", number: "Direct bank transfer", text: "Payment method" },
        { icon: "adminlib-global-community yellow", number: "California, USA", text: "Delivery location" },
        { icon: "adminlib-wholesale blue", number: "4", text: "Products Quantity" },
    ];
    return (
        <>
            {/* page title start */}
            < div className="page-title-wrapper" >
                <div className="page-title">
                    <div className="title">View Order #8456</div>
                    <div className="des">Manage your store information and preferences</div>
                </div>
                <div className="buttons-wrapper">
                    <div className="admin-badge green">
                        <i className="adminlib-check"></i>
                        Completed
                    </div>
                </div>
            </div > {/* page title end */}

            <div className="container-wrapper">
                <div className="card-wrapper width-65">
                    <div className="card-content">

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
                    
                    
                </div>
            </div>



            <div className="row">
                <div className="column ">
                    <div className="order-overview">
                        <div className="details left">
                            <div className="text-wrapper">
                                <div className="text">
                                    Order Id
                                </div>
                                <div className="sub-text">
                                    #58752
                                </div>
                            </div>
                            <div className="text-wrapper">
                                <div className="text">
                                    Order Date
                                </div>
                                <div className="sub-text">
                                    September 10, 2025 8:06 am
                                </div>
                            </div>
                            <div className="text-wrapper">
                                <div className="text">
                                    Payment method
                                </div>
                                <div className="sub-text">
                                    Payment via Direct bank transfer
                                </div>
                            </div>
                        </div>
                        <div className="details right">
                            <div className="text-wrapper">
                                <div className="text">
                                    Status
                                </div>
                                <div className="sub-text">
                                    <div className="admin-badge green">
                                        <i className="adminlib-check"></i>
                                        Completed
                                    </div>
                                </div>
                            </div>
                            <div className="text-wrapper">
                                <div className="text">
                                    Location
                                </div>
                                <div className="sub-text">
                                    California, USA
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div className="column">
                    <div className="details-wrapper">
                        <div className="details">
                            <div className="heading">Order date :</div>
                            <div className="text">	September 10, 2025 8:10 am</div>
                        </div>
                        <div className="details">
                            <div className="heading">Payment method :</div>
                            <div className="text">Payment via Direct bank transfer</div>
                        </div>
                        <div className="details">
                            <div className="heading">Delivery location from map </div>
                            <div className="text">California, USA</div>
                        </div>
                    </div>
                </div> */}
            </div>

            <div className="row">
                <div className="column">
                    <div className="card">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">Billing address</div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div> Test customer</div>
                            <div> NewYork</div>
                            <div> New York, NY 07008</div>
                            <div>  United States (US)</div>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="card">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">Shipping address</div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div> Test customer</div>
                            <div> NewYork</div>
                            <div> New York, NY 07008</div>
                            <div>  United States (US)</div>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="card">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">Customer detail</div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div> Test customer</div>
                            <div> NewYork</div>
                            <div> New York, NY 07008</div>
                            <div>  United States (US)</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="column item-details-table">
                    <div className="table-wrapper">
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
                                <tr className="admin-row  simple">
                                    <td className="admin-column">
                                        <div className="item-details">
                                            <div className="image">
                                                <img src={productImage} alt="product" />
                                            </div>
                                            <div className="details">
                                                <div className="name">Charcoal Detox</div>
                                                <div className="sku">SKU:  8676</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="admin-column">
                                        $100
                                    </td>
                                    <td className="admin-column">
                                        $5
                                    </td>
                                    <td className="admin-column">
                                        x 1
                                    </td>
                                    <td className="admin-column">
                                        $95
                                    </td>
                                    <td className="admin-column">
                                        $20
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="column">
                    <div className="coupons-calculation-wrapper">
                        <div className="left">
                            <div className="coupon">Coupon(s): <a href="#" className="admin-badge blue">COUPON30</a></div>
                            <div className="admin-btn btn-purple">Refund</div>
                        </div>
                        <div className="right">
                            <table>
                                <tbody>
                                    <tr>
                                        <td>commission</td>
                                        <td>$29</td>
                                    </tr>
                                    <tr>
                                        <td>Discount</td>
                                        <td>$29</td>
                                    </tr>
                                    <tr>
                                        <td>Discount</td>
                                        <td>$29</td>
                                    </tr>
                                    <tr>
                                        <td>Discount</td>
                                        <td>$29</td>
                                    </tr>
                                    <tr>
                                        <td>Total Earned</td>
                                        <td>$529</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

};

export default Reviews;