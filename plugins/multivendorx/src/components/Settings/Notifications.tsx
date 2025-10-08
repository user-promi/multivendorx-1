import React, { useState } from 'react';
import "./Notifications.scss";
import { CommonPopup } from 'zyra';

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
    const [viewMode, setViewMode] = useState('list'); // list or grid
    const [editingNotification, setEditingNotification] = useState(null);


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
            {/* Toggle buttons */}
            {/* Toggle buttons using radio-style toggle */}
            <div className="toggle-setting-wrapper view-toggle">
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setViewMode('list')}
                    onKeyDown={(e) => e.key === 'Enter' && setViewMode('list')}
                >
                    <input
                        className="toggle-setting-form-input"
                        type="radio"
                        id="list-view"
                        name="view-mode"
                        value="list"
                        checked={viewMode === 'list'}
                        readOnly
                    />
                    <label htmlFor="list-view"><i className="adminlib-editor-list-ul"></i></label>
                </div>

                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setViewMode('grid')}
                    onKeyDown={(e) => e.key === 'Enter' && setViewMode('grid')}
                >
                    <input
                        className="toggle-setting-form-input"
                        type="radio"
                        id="grid-view"
                        name="view-mode"
                        value="grid"
                        checked={viewMode === 'grid'}
                        readOnly
                    />
                    <label htmlFor="grid-view"><i className="adminlib-module"></i></label>
                </div>
            </div>


            {/* List View */}
            {viewMode === 'list' && (
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
                                            </div>
                                        ))}
                                        <button className="admin-badge btn-purple" onClick={() => setEditingNotification(notif.id)}>
                                            <i className="adminlib-create"></i> Manage
                                        </button>
                                    </div>
                                </td>
                                <td><input type="checkbox" checked={notif.channels.mail} onChange={() => toggleChannel(notif.id, 'mail')} /></td>
                                <td><input type="checkbox" checked={notif.channels.sms} onChange={() => toggleChannel(notif.id, 'sms')} /></td>
                                <td><input type="checkbox" checked={notif.channels.system} onChange={() => toggleChannel(notif.id, 'system')} /></td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
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
                            {notifications.find(n => n.id === editingNotification)?.recipients.map(r => (
                                <div key={r.id} className={`recipient ${r.enabled ? '' : 'disable'}`}>
                                    {r.canDelete && (
                                        <button className="admin-badge red" onClick={() => deleteRecipient(editingNotification, r.id)}>
                                            <i className="adminlib-close"></i>
                                        </button>
                                    )}
                                    <span>{r.label}</span>
                                    <div className="toggle-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={r.enabled}
                                            onChange={() => toggleRecipient(editingNotification, r.id)}
                                            id={`toggle-${editingNotification}-${r.id}`}
                                        />
                                        <label htmlFor={`toggle-${editingNotification}-${r.id}`}></label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CommonPopup>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="notification-grid">
                    {notifications.map(notif => (
                        <div key={notif.id} className="notification-card">
                            <div className="card-header">
                                <i className={`notification-icon ${notif.icon}`}></i>
                                <h4>{notif.event}</h4>
                            </div>
                            <div className="card-body">
                                <div className="recipients-list">
                                    {notif.recipients.map(r => (
                                        <div key={r.id} className={`admin-badge green ${r.enabled ? '' : 'disable'}`}>
                                            <span>{r.label}</span>
                                            <input
                                                type="checkbox"
                                                checked={r.enabled}
                                                onChange={() => toggleRecipient(notif.id, r.id)}
                                            />
                                            {r.canDelete && (
                                                <button onClick={() => deleteRecipient(notif.id, r.id)} className="admin-badge red">
                                                    <i className="adminlib-close"></i>
                                                </button>
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
                                            <button className="admin-btn btn-green" onClick={() => addRecipient(notif.id)}>Save</button>
                                            <button className="admin-btn btn-red" onClick={() => { setAddingRecipient(null); setNewRecipientValue(''); }}>Cancel</button>
                                        </div>
                                    ) : (
                                        <button className="admin-btn btn-purple" onClick={() => setAddingRecipient(notif.id)}>
                                            <i className='adminlib-plus-circle-o'></i> Add
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="card-footer">
                                <label><input type="checkbox" checked={notif.channels.mail} onChange={() => toggleChannel(notif.id, 'mail')} /> Mail</label>
                                <label><input type="checkbox" checked={notif.channels.sms} onChange={() => toggleChannel(notif.id, 'sms')} /> SMS</label>
                                <label><input type="checkbox" checked={notif.channels.system} onChange={() => toggleChannel(notif.id, 'system')} /> System</label>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notification;
