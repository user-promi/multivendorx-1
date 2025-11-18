import React from "react";
import { __ } from "@wordpress/i18n";
import { CommonPopup } from "zyra";

type TransactionRow = {
    id: number;
    date: string;
    order_details: string;
    transaction_type: string;
    payment_mode: string;
    credit: number;
    debit: number;
    balance: number;
    status: string;
};

type Props = {
    transaction: TransactionRow;
    onClose: () => void;
};

const TransactionDetailsModal: React.FC<Props> = ({ transaction, onClose }) => {
    return (
        <>

            <CommonPopup
                open={open}
                onClose={onClose}
                width="500px"
                height="70%"
                header={
                    <>
                        <div className="title">
                            <i className="adminlib-cart"></i>
                            Transaction Details
                        </div>
                        <p>Publish important news, updates, or alerts that appear directly in store dashboards, ensuring sellers never miss critical information.</p>
                        <i
                            className="icon adminlib-close"
                            onClick={onClose}
                        ></i>
                    </>}
            >
                <>

                    <div className="heading">{__("Order Overview", "multivendorx")}</div>

                    <div className="commission-details">
                        <div className="items">
                            <div className="text">Date</div>
                            <div className="value">{transaction.date}</div>
                        </div>
                        <div className="items">
                            <div className="text">Order Details</div>
                            <div className="value">
                                {transaction.order_details}
                            </div>
                        </div>
                        <div className="items">
                            <div className="text">Transaction Type</div>
                            <div className="value">

                                {transaction.transaction_type}
                            </div>
                        </div>
                        <div className="items">
                            <div className="text">Payment Mode</div>
                            <div className="value">{transaction.payment_mode}</div>
                        </div>

                        <div className="items">
                            <div className="text">Credit</div>
                            <div className="value">{Number(transaction.credit || 0).toFixed(2)}</div>
                        </div>
                        <div className="items">
                            <div className="text">Debit</div>
                            <div className="value">{Number(transaction.debit || 0).toFixed(2)}</div>
                        </div>
                        <div className="items">
                            <div className="text">Balance</div>
                            <div className="value">{Number(transaction.balance || 0).toFixed(2)}</div>
                        </div>
                        <div className="items">
                            <div className="text">Status</div>
                            <div className="value">
                                <span className={`admin-badge ${transaction.status === 'paid' ? 'green' : 'red'}`}>
                                    {transaction.status
                                        ? transaction.status
                                            .replace(/^wc-/, '') // remove any prefix like 'wc-'
                                            .replace(/_/g, ' ')  // replace underscores with spaces
                                            .replace(/\b\w/g, (c) => c.toUpperCase()) // capitalize each word
                                        : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* <div className="popup-divider"></div> */}
                </>
            </CommonPopup>
            {/* <div className="transaction-modal-overlay">
                <div className="transaction-modal">
                    <h2>{__("Transaction Details", "multivendorx")}</h2>
                    <table className="transaction-details-table">
                        <tbody>
                            <tr>
                                <td>{__("Date", "multivendorx")}</td>
                                <td>{transaction.date}</td>
                            </tr>
                            <tr>
                                <td>{__("Order Details", "multivendorx")}</td>
                                <td>{transaction.order_details}</td>
                            </tr>
                            <tr>
                                <td>{__("Transaction Type", "multivendorx")}</td>
                                <td>{transaction.transaction_type}</td>
                            </tr>
                            <tr>
                                <td>{__("Payment Mode", "multivendorx")}</td>
                                <td>{transaction.payment_mode}</td>
                            </tr>
                            <tr>
                                <td>{__("Credit", "multivendorx")}</td>
                                <td>{Number(transaction.credit || 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>{__("Debit", "multivendorx")}</td>
                                <td>{Number(transaction.debit || 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>{__("Balance", "multivendorx")}</td>
                                <td>{Number(transaction.balance || 0).toFixed(2)}</td>
                            </tr>

                            <tr>
                                <td>{__("Status", "multivendorx")}</td>
                                <td>{transaction.status}</td>
                            </tr>
                        </tbody>
                    </table>

                    <button className="button button-secondary" onClick={onClose}>
                        {__("Close", "multivendorx")}
                    </button>
                </div>
            </div> */}
        </>
    );
};

export default TransactionDetailsModal;
