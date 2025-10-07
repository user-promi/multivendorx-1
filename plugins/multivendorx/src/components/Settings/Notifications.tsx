import React, { useState } from 'react';
import "./Notifications.scss";

const Notification = () => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            icon: 'adminlib-cart',
            event: 'New Store Approval',
            recipients: [
                { id: 1, type: 'Vendor', label: 'Vendor', enabled: true, canDelete: false },
                { id: 2, type: 'Admin', label: 'Admin', enabled: false, canDelete: false },
                { id: 3, type: 'extra', label: 'admin@marketplace.com', enabled: true, canDelete: true }
            ],
            channels: { mail: true, sms: false, system: true }
        },
        {
            id: 2,
            icon: 'adminlib-cart',
            event: 'New Order Placed',
            recipients: [
                { id: 1, type: 'Vendor', label: 'Vendor', enabled: true, canDelete: false },
                { id: 2, type: 'Customer', label: 'Customer', enabled: true, canDelete: false },
                { id: 3, type: 'extra', label: 'sales@marketplace.com', enabled: false, canDelete: true }
            ],
            channels: { mail: true, sms: true, system: true }
        },
    ]);

    const [addingRecipient, setAddingRecipient] = useState(null);
    const [newRecipientValue, setNewRecipientValue] = useState('');

    const toggleRecipient = (notifId, recipientId) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notifId
                    ? { ...notif, recipients: notif.recipients.map(r => r.id === recipientId ? { ...r, enabled: !r.enabled } : r) }
                    : notif
            )
        );
    };

    const toggleChannel = (notifId, channel) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notifId
                    ? { ...notif, channels: { ...notif.channels, [channel]: !notif.channels[channel] } }
                    : notif
            )
        );
    };

    const deleteRecipient = (notifId, recipientId) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notifId
                    ? { ...notif, recipients: notif.recipients.filter(r => r.id !== recipientId) }
                    : notif
            )
        );
    };

    const addRecipient = (notifId) => {
        if (!newRecipientValue.trim()) return;

        setNotifications(prev =>
            prev.map(notif => {
                if (notif.id === notifId) {
                    const newId = Math.max(...notif.recipients.map(r => r.id), 0) + 1;
                    return {
                        ...notif,
                        recipients: [...notif.recipients, {
                            id: newId,
                            type: 'extra',
                            label: newRecipientValue,
                            enabled: true,
                            canDelete: true
                        }]
                    };
                }
                return notif;
            })
        );

        setNewRecipientValue('');
        setAddingRecipient(null);
    };

    return (
        <div className="notification-container">
            <table className="notification-table">
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Recipients</th>
                        <th>Mail</th>
                        <th>SMS</th>
                        <th>System</th>
                    </tr>
                </thead>
                <tbody>
                    {notifications.map(notif => (
                        <tr key={notif.id}>
                            <td>
                                <div className="title-wrapper">
                                    <i className={`notification-icon ${notif.icon}`}></i>
                                    {notif.event}
                                </div>
                            </td>
                            <td>
                                <div className="recipients-list">
                                    {notif.recipients.map(r => (
                                        <div key={r.id} className={`admin-badge green ${r.enabled ? '' : 'disable'}`}>
                                            <span>{r.label}</span>
                                            <div className="toggle-checkbox">
                                                <input
                                                    id={`toggle-switch-${notif.id}-${r.id}`}
                                                    className="basic-input"
                                                    type="checkbox"
                                                    checked={r.enabled}
                                                    onChange={() => toggleRecipient(notif.id, r.id)}
                                                />
                                                <label htmlFor={`toggle-switch-${notif.id}-${r.id}`}></label>
                                            </div>

                                            {r.canDelete && (
                                                <button onClick={() => deleteRecipient(notif.id, r.id)} className="admin-badge red"><i className="adminlib-close"></i></button>
                                            )}
                                        </div>
                                    ))}
                                    {addingRecipient === notif.id ? (
                                        <div className="add-recipient">
                                            <input
                                                type="text"
                                                className='basic-input'
                                                value={newRecipientValue}
                                                onChange={e => setNewRecipientValue(e.target.value)}
                                                onKeyPress={e => e.key === 'Enter' && addRecipient(notif.id)}
                                            />
                                            <button className="admin-btn btn-purple" onClick={() => addRecipient(notif.id)}><i className='adminlib-plus-circle-o'></i> Add</button>
                                            <button className="admin-btn btn-red" onClick={() => { setAddingRecipient(null); setNewRecipientValue(''); }}><i className='adminlib-close'></i> Cancel</button>
                                        </div>
                                    ) : (
                                        <button className="admin-btn btn-purple" onClick={() => setAddingRecipient(notif.id)}> <i className='adminlib-plus-circle-o'></i> Add</button>
                                    )}
                                </div>
                            </td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={notif.channels.mail}
                                    onChange={() => toggleChannel(notif.id, 'mail')}
                                />
                            </td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={notif.channels.sms}
                                    onChange={() => toggleChannel(notif.id, 'sms')}
                                />
                            </td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={notif.channels.system}
                                    onChange={() => toggleChannel(notif.id, 'system')}
                                />
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Notification;
