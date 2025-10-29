import React, { useEffect, useState } from 'react';
import "./Notifications.scss";
import { CommonPopup, getApiLink } from 'zyra';
import axios from 'axios';

// ------------------ RecipientBadge Component ------------------
interface Recipient {
    id: number;
    type: string;
    label: string;
    enabled: boolean;
    canDelete: boolean;
}

interface RecipientBadgeProps {
    recipient: Recipient;
    onToggle: () => void;
    onDelete?: () => void;
}

const RecipientBadge: React.FC<RecipientBadgeProps> = ({ recipient, onToggle, onDelete }) => {
    let iconClass = 'adminlib-mail';
    if (recipient.label === 'Vendor') iconClass = 'adminlib-storefront';
    else if (recipient.label === 'Admin') iconClass = 'adminlib-person';
    else if (recipient.label === 'Customer') iconClass = 'adminlib-user-circle';

    return (
        <>
            {recipient.enabled && (
                <div className="admin-badge green">
                    <i className={iconClass}></i>
                    <span>{recipient.label}</span>
                </div>
            )}
        </>
    );

};

// ------------------ Notification Component ------------------
const Notification = () => {

    const [notifications, setNotifications] = useState<[] | null>(null);

    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'notifications'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
        .then((response) => {
            setNotifications(response.data || []);
        });
    }, []);

    // const [notifications, setNotifications] = useState([
    //     {
    //         id: 1,
    //         icon: 'adminlib-cart',
    //         event: 'New Store Approval',
    //         description: 'Notify vendors and admins when a new store is approved.',
    //         recipients: [
    //             { id: 1, type: 'Vendor', label: 'Vendor', enabled: true, canDelete: false },
    //             { id: 2, type: 'Admin', label: 'Admin', enabled: false, canDelete: false },
    //             { id: 3, type: 'extra', label: 'admin@marketplace.com', enabled: true, canDelete: true }
    //         ],
    //         channels: { mail: true, sms: false, system: true }
    //     },
    //     {
    //         id: 2,
    //         icon: 'adminlib-cart',
    //         event: 'New Order Placed',
    //         description: 'Notify vendors and customers when a new order is placed.',
    //         recipients: [
    //             { id: 1, type: 'Vendor', label: 'Vendor', enabled: true, canDelete: false },
    //             { id: 2, type: 'Customer', label: 'Customer', enabled: true, canDelete: false },
    //             { id: 3, type: 'extra', label: 'sales@marketplace.com', enabled: false, canDelete: true }
    //         ],
    //         channels: { mail: true, sms: true, system: true }
    //     },
    //     {
    //         id: 3,
    //         icon: 'adminlib-credit-card',
    //         event: 'Transaction Details',
    //         description: 'Send transaction details to vendors and finance team.',
    //         recipients: [
    //             { id: 1, type: 'Vendor', label: 'Vendor', enabled: true, canDelete: false },
    //             { id: 2, type: 'extra', label: 'finance@marketplace.com', enabled: true, canDelete: true }
    //         ],
    //         channels: { mail: true, sms: false, system: true }
    //     },
    //     {
    //         id: 4,
    //         icon: 'adminlib-contact-form',
    //         event: 'Order Shipped',
    //         description: 'Notify customers and admins when an order is shipped.',
    //         recipients: [
    //             { id: 1, type: 'Customer', label: 'Customer', enabled: true, canDelete: false },
    //             { id: 2, type: 'Admin', label: 'Admin', enabled: false, canDelete: false },
    //             { id: 3, type: 'extra', label: 'support@marketplace.com', enabled: true, canDelete: true }
    //         ],
    //         channels: { mail: true, sms: true, system: true }
    //     },
    //     {
    //         id: 5,
    //         icon: 'adminlib-verification3',
    //         event: 'Refund Request',
    //         description: 'Notify admins and vendors about refund requests.',
    //         recipients: [
    //             { id: 1, type: 'Admin', label: 'Admin', enabled: true, canDelete: false },
    //             { id: 2, type: 'Vendor', label: 'Vendor', enabled: true, canDelete: false },
    //             { id: 3, type: 'extra', label: 'refunds@marketplace.com', enabled: true, canDelete: true }
    //         ],
    //         channels: { mail: true, sms: false, system: true }
    //     },
    //     {
    //         id: 6,
    //         icon: 'adminlib-contact-form',
    //         event: 'Vendor Commission Paid',
    //         description: 'Notify vendors and accounts team after commission is paid.',
    //         recipients: [
    //             { id: 1, type: 'Vendor', label: 'Vendor', enabled: true, canDelete: false },
    //             { id: 2, type: 'extra', label: 'accounts@marketplace.com', enabled: true, canDelete: true }
    //         ],
    //         channels: { mail: true, sms: false, system: true }
    //     },
    //     {
    //         id: 7,
    //         icon: 'adminlib-multi-product',
    //         event: 'Password Reset',
    //         description: 'Notify users when their password is reset.',
    //         recipients: [
    //             { id: 1, type: 'User', label: 'User', enabled: true, canDelete: false }
    //         ],
    //         channels: { mail: true, sms: true, system: false }
    //     },
    //     {
    //         id: 8,
    //         icon: 'adminlib-marketplace',
    //         event: 'Invoice Generated',
    //         description: 'Send invoice details to customers and billing team.',
    //         recipients: [
    //             { id: 1, type: 'Customer', label: 'Customer', enabled: true, canDelete: false },
    //             { id: 2, type: 'extra', label: 'billing@marketplace.com', enabled: false, canDelete: true }
    //         ],
    //         channels: { mail: true, sms: false, system: true }
    //     },
    //     {
    //         id: 9,
    //         icon: 'adminlib-star',
    //         event: 'Review Submitted',
    //         description: 'Notify vendors when a new review is submitted.',
    //         recipients: [
    //             { id: 1, type: 'Vendor', label: 'Vendor', enabled: true, canDelete: false }
    //         ],
    //         channels: { mail: true, sms: false, system: true }
    //     },
    //     {
    //         id: 10,
    //         icon: 'adminlib-marketplace',
    //         event: 'Low Stock Alert',
    //         description: 'Notify vendors and warehouse team when stock is low.',
    //         recipients: [
    //             { id: 1, type: 'Vendor', label: 'Vendor', enabled: true, canDelete: false },
    //             { id: 2, type: 'extra', label: 'warehouse@marketplace.com', enabled: true, canDelete: true }
    //         ],
    //         channels: { mail: true, sms: false, system: true }
    //     },
    // ]);


    const [addingRecipient, setAddingRecipient] = useState<number | null>(null);
    const [newRecipientValue, setNewRecipientValue] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [editingNotification, setEditingNotification] = useState<number | null>(null);

    // ------------------ Handlers ------------------

    const handleSave = () => {
        if (!notifications || !editingNotification) return;

        const filtered = notifications.filter(
            (item) => item.id === editingNotification
        );

console.log(filtered)
        axios({
            method: 'POST',
            url: getApiLink(appLocalizer, 'notifications'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: { 
                notifications: filtered
            }
        })
        .then((response) => {
            setNotifications(response.data || []);
        });
    };

    const toggleRecipient = (notifId: number, recipientId: number) => {
        setNotifications(prev =>
            prev.map(n =>
                n.id === notifId
                    ? { ...n, recipients: n.recipients.map(r => r.id === recipientId ? { ...r, enabled: !r.enabled } : r) }
                    : n
            )
        );

        // handleSave();
    };
// console.log('notifications', notifications)
// console.log('editingNotification', editingNotification)

    const deleteRecipient = (notifId: number, recipientId: number) => {
        setNotifications(prev =>
            prev.map(n =>
                n.id === notifId
                    ? { ...n, recipients: n.recipients.filter(r => r.id !== recipientId) }
                    : n
            )
        );
    };

    const addRecipient = (notifId: number) => {
        if (!newRecipientValue.trim()) return;
        setNotifications(prev =>
            prev.map(n => {
                if (n.id === notifId) {
                    const newId = Math.max(...n.recipients.map(r => r.id), 0) + 1;
                    return {
                        ...n,
                        recipients: [...n.recipients, {
                            id: newId,
                            type: 'extra',
                            label: newRecipientValue,
                            enabled: true,
                            canDelete: true
                        }]
                    };
                }
                return n;
            })
        );
        setNewRecipientValue('');
        setAddingRecipient(null);
    };

    const toggleChannel = (notifId: number, channel: keyof typeof notifications[0]['channels']) => {
        setNotifications(prev =>
            prev.map(n =>
                n.id === notifId ? { ...n, channels: { ...n.channels, [channel]: !n.channels[channel] } } : n
            )
        );
    };

    // ------------------ Render ------------------
    return (
        <div className="notification-container">
            {/* View Toggle */}
            <div className="toggle-setting-wrapper view-toggle">
                {['list', 'grid'].map(mode => (
                    <div
                        key={mode}
                        role="button"
                        tabIndex={0}
                        onClick={() => setViewMode(mode as 'list' | 'grid')}
                        onKeyDown={e => e.key === 'Enter' && setViewMode(mode as 'list' | 'grid')}
                    >
                        <input
                            className="toggle-setting-form-input"
                            type="radio"
                            id={`${mode}-view`}
                            name="view-mode"
                            value={mode}
                            checked={viewMode === mode}
                            readOnly
                        />
                        <label htmlFor={`${mode}-view`}>
                            <i className={mode === 'list' ? 'adminlib-editor-list-ul' : 'adminlib-module'}></i>
                        </label>
                    </div>
                ))}
            </div>

            {/* List View */}
            {viewMode === 'list' && (
                <table className="notification-table">
                    <thead>
                        <tr>
                            <th>Event</th>
                            <th>Recipients</th>
                            <th>System</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notifications && notifications.map(notif => (
                            <tr key={notif.id} onClick={() => setEditingNotification(notif.id)}>
                                <td>
                                    <div className="title-wrapper">
                                        <i className={`notification-icon ${notif.icon}`}></i>
                                        <div className="details">
                                            <div className="title">{notif.event} {notif.tag} {notif.category}</div>
                                            <div className="description">{notif.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="recipients-list">
                                        {notif.recipients.map(r => (
                                            <RecipientBadge
                                                key={r.id}
                                                recipient={r}
                                                onToggle={() => toggleRecipient(notif.id, r.id)}
                                                onDelete={r.canDelete ? () => deleteRecipient(notif.id, r.id) : undefined}
                                            />
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <div className="system-column">
                                        {Object.entries(notif.channels).map(([channel, enabled]) => {
                                            let iconClass = '';
                                            let badgeClass = 'admin-badge ';

                                            switch (channel) {
                                                case 'mail':
                                                    iconClass = 'adminlib-mail';
                                                    badgeClass += 'yellow';
                                                    break;
                                                case 'sms':
                                                    iconClass = 'adminlib-enquiry';
                                                    badgeClass += 'green';
                                                    break;
                                                case 'system':
                                                    iconClass = 'adminlib-notification';
                                                    badgeClass += 'blue';
                                                    break;
                                            }

                                            return (
                                                <i
                                                    key={channel}
                                                    className={`${iconClass} ${badgeClass} ${!enabled ? 'disable' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleChannel(notif.id, channel as keyof typeof notif.channels);
                                                    }}
                                                ></i>
                                            );
                                        })}
                                    </div>
                                </td>
                                <td>
                                    <i className="adminlib-create"></i>
                                </td>
                                {/* <td><input type="checkbox" checked={notif.channels.mail} onChange={() => toggleChannel(notif.id, 'mail')} /></td>
                                <td><input type="checkbox" checked={notif.channels.sms} onChange={() => toggleChannel(notif.id, 'sms')} /></td>
                                <td><input type="checkbox" checked={notif.channels.system} onChange={() => toggleChannel(notif.id, 'system')} /></td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Edit Recipients Popup */}
            {editingNotification && (
                <CommonPopup
                    open={!!editingNotification}
                    onClose={() => setEditingNotification(null)}
                    width="500px"
                    height="70%"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-cart"></i>
                                Manage Recipients
                            </div>
                            <p>Edit and control notification recipients for this event.</p>
                            <i
                                className="icon adminlib-close"
                                onClick={() => setEditingNotification(null)}
                            ></i>
                        </>
                    }
                    footer={
                        <div className="drawer-footer">
                            <button className="admin-btn btn-red" onClick={() => setEditingNotification(null)}>
                                Cancel
                            </button>
                        </div>
                    }
                >
                    <div className="content">
                        <div className="drawer-add-recipient">
                            <input
                                type="text"
                                className="basic-input"
                                placeholder="email@domain.com or +1234567890"
                                value={newRecipientValue}
                                onChange={(e) => setNewRecipientValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addRecipient(editingNotification)}
                            />
                            <button className="admin-btn btn-purple" onClick={() => addRecipient(editingNotification)}>
                                <i className="adminlib-plus-circle-o"></i>
                                Add
                            </button>
                        </div>

                        <div className="drawer-recipients">
                            {notifications && notifications.find(n => n.id === editingNotification)?.recipients.map(r => (
                                <div key={r.id} className={`recipient ${r.enabled ? '' : 'disable'}`}>
                                    <span className="icon">
                                        <i className={
                                            r.label === 'Vendor' ? 'adminlib-storefront' :
                                                r.label === 'Admin' ? 'adminlib-person' :
                                                    r.label === 'Customer' ? 'adminlib-user-circle' : 'adminlib-mail'
                                        }></i>
                                    </span>
                                    <div className="details">
                                        <span>{r.label}</span>
                                        <div className="description">Lorem, ipsum.</div>
                                    </div>
                                    {r.canDelete && (
                                        <i className="delete-btn adminlib-delete" onClick={() => deleteRecipient(editingNotification, r.id)}></i>
                                    )}
                                    {!r.canDelete && (
                                        <i onClick={() => toggleRecipient(editingNotification, r.id)} className={r.enabled ? 'adminlib-eye' : 'adminlib-eye-blocked'}></i>
                                    )}
                                </div>
                            ))}

                        </div>
                        <div className="title">
                            System
                        </div>
                        <div className="drawer-recipients">
                            {Object.entries(notifications && notifications.find(n => n.id === editingNotification)?.channels || {}).map(
                                ([channel, enabled]) => {
                                    let label = '';
                                    switch (channel) {
                                        case 'mail': label = 'Mail'; break;
                                        case 'sms': label = 'SMS'; break;
                                        case 'system': label = 'System'; break;
                                    }
                                    return (
                                        <>
                                            <div key={channel} className={`recipient ${!enabled ? 'disable' : ''}`}>
                                                <span className="icon">
                                                    <i className={
                                                        label === 'Mail' ? 'adminlib-mail' :
                                                            label === 'SMS' ? 'adminlib-enquiry' :
                                                                label === 'System' ? 'adminlib-notification' : 'adminlib-mail'
                                                    }></i>
                                                </span>
                                                <div className="details">
                                                    <span>{label}</span>
                                                    <div className="description">Lorem, ipsum.</div>
                                                </div>
                                                <i onClick={() => toggleChannel(editingNotification, channel as keyof typeof notifications[0]['channels'])} className={enabled ? 'adminlib-eye' : 'adminlib-eye-blocked'}></i>

                                            </div>
                                        </>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </CommonPopup>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="notification-grid">
                    {notifications && notifications.map(notif => (
                        <div key={notif.id} className="notification-card">
                            <div className="card-body">
                                <div className="title-wrapper">
                                    <i className={`notification-icon ${notif.icon}`}></i>
                                    <div className="details">
                                        <div className="title">{notif.event}</div>
                                        <div className="description">{notif.description}</div>
                                    </div>
                                </div>
                                <div className="recipients-list">
                                    {notif.recipients.map(r => (
                                        <RecipientBadge
                                            key={r.id}
                                            recipient={r}
                                            onToggle={() => toggleRecipient(notif.id, r.id)}
                                            onDelete={r.canDelete ? () => deleteRecipient(notif.id, r.id) : undefined}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="card-footer">
                                <div className="system-column">
                                    {Object.entries(notif.channels).map(([channel, enabled]) => {
                                        let iconClass = '';
                                        let badgeClass = 'admin-badge ';

                                        switch (channel) {
                                            case 'mail':
                                                iconClass = 'adminlib-mail';
                                                badgeClass += 'yellow';
                                                break;
                                            case 'sms':
                                                iconClass = 'adminlib-enquiry';
                                                badgeClass += 'green';
                                                break;
                                            case 'system':
                                                iconClass = 'adminlib-notification';
                                                badgeClass += 'blue';
                                                break;
                                        }

                                        return (
                                            <i
                                                key={channel}
                                                className={`${iconClass} ${badgeClass} ${!enabled ? 'disable' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleChannel(notif.id, channel as keyof typeof notif.channels);
                                                }}
                                            ></i>
                                        );
                                    })}
                                </div>

                                <div className="admin-btn btn-purple" onClick={() => setEditingNotification(notif.id)}>
                                    Manage <i className="adminlib-create"></i>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notification;