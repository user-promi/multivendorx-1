import React from "react";
import { __ } from "@wordpress/i18n";

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
        <div className="transaction-modal-overlay">
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

            <style jsx>{`
                .transaction-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                }
                .transaction-modal {
                    background: #fff;
                    padding: 1.25rem;
                    border-radius: 0.5rem;
                    max-width: 31.25rem
                    width: 90%;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                }
                .transaction-details-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1.25rem;
                }
                .transaction-details-table td {
                    padding: 8px 0.75rem;
                    border-bottom: 1px solid #ddd;
                }
                .transaction-details-table td:first-child {
                    font-weight: bold;
                    width: 40%;
                }
            `}</style>
        </div>
    );
};

export default TransactionDetailsModal;
