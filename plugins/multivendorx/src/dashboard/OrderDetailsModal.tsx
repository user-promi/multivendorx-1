import React from "react";
import { __ } from "@wordpress/i18n";

type OrderDetailsModalProps = {
    order: any;
    onClose: () => void;
};

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
    if (!order) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    backgroundColor: "#fff",
                    padding: "20px",
                    borderRadius: "8px",
                    width: "500px",
                    maxHeight: "80vh",
                    overflowY: "auto",
                }}
            >
                <h2>{__("Order Details", "multivendorx")}</h2>
                <p>
                    <strong>{__("Order ID:", "multivendorx")}</strong> #{order.number}
                </p>
                <p>
                    <strong>{__("Customer:", "multivendorx")}</strong> {order.billing.first_name} {order.billing.last_name}
                </p>
                <p>
                    <strong>{__("Email:", "multivendorx")}</strong> {order.billing.email}
                </p>
                <p>
                    <strong>{__("Status:", "multivendorx")}</strong> {order.status}
                </p>
                <p>
                    <strong>{__("Total:", "multivendorx")}</strong> {order.total} {order.currency}
                </p>
                <p>
                    <strong>{__("Earning:", "multivendorx")}</strong>{" "}
                    {order.line_items?.reduce((acc, item) => {
                        const commission = item.meta_data?.find(m => m.key === "multivendorx_item_earning");
                        return acc + (commission ? parseFloat(commission.value) : 0);
                    }, 0).toFixed(2)}{" "}
                    {order.currency}
                </p>

                <h3>{__("Items", "multivendorx")}</h3>
                <ul>
                    {order.line_items?.map(item => (
                        <li key={item.id}>
                            {item.name} - {item.quantity} × {item.total} {order.currency}
                        </li>
                    ))}
                </ul>

                <button
                    className="button button-secondary"
                    onClick={onClose}
                    style={{ marginTop: "15px" }}
                >
                    {__("Close", "multivendorx")}
                </button>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
