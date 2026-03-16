// Notice.tsx — merged from Notice.tsx + NoticeReceiver.tsx

import React, { useEffect, useState } from 'react';
import "../styles/web/Notice.scss";
import { FieldComponent } from './fieldUtils';

// ─── Types ───────────────────────────────────────────────────────────────────

type NoticePosition = 'float' | 'notice' | 'banner';

interface NoticeItem {
    uniqueKey: string;
    title?: string;
    message?: string | string[];
    type?: 'info' | 'success' | 'warning' | 'error' | 'banner';
    position: NoticePosition;
    actionLabel?: string;
    onAction?: () => void;
    expiresAt?: number;
}

// ─── Store ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'zyra_app_notices_v1';

let subscribers: Array<(items: NoticeItem[]) => void> = [];

const getStored = (): NoticeItem[] => {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        const parsed: NoticeItem[] = JSON.parse(data);
        return parsed.filter(n => typeof n.expiresAt === 'number');
    } catch {
        return [];
    }
};

let notices: NoticeItem[] = getStored();

const persist = () => {
    if (typeof window === 'undefined') return;
    const persistable = notices.filter(n => typeof n.expiresAt === 'number');
    persistable.length === 0
        ? localStorage.removeItem(STORAGE_KEY)
        : localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
};

const broadcast = () => {
    persist();
    subscribers.forEach(cb => cb([...notices]));
};

// ─── Public store API ─────────────────────────────────────────────────────────

const subscribe = (callback: (items: NoticeItem[]) => void) => {
    subscribers.push(callback);
    callback([...notices]);
    return () => {
        subscribers = subscribers.filter(cb => cb !== callback);
    };
};

export const addNotice = (
    notice: Omit<NoticeItem, 'expiresAt'>,
    validity: number | 'lifetime' = 'lifetime'
) => {
    const uniqueKey = notice.uniqueKey || Date.now().toString();
    if (notices.some(n => n.uniqueKey === uniqueKey)) return;

    const expiresAt = validity === 'lifetime' ? undefined : Date.now() + validity;
    notices.push({ ...notice, uniqueKey, expiresAt });
    broadcast();
};

const removeNotice = (uniqueKey: string) => {
    notices = notices.filter(n => n.uniqueKey !== uniqueKey);
    broadcast();
};

const flushExpired = () => {
    const before = notices.length;
    const now = Date.now();
    notices = notices.filter(n => !n.expiresAt || n.expiresAt > now);
    if (before !== notices.length) broadcast();
};

export const clearSessionNotices = () => {
    notices = notices.filter(n => typeof n.expiresAt === 'number');
    broadcast();
};

// ─── Shared render helper ─────────────────────────────────────────────────────

const renderNoticeContent = (item: NoticeItem, onClose?: () => void) => (
    <>
        <i className={`admin-font adminfont-${item.type}`} />
        <div className="notice-details">
            {item.title && <div className="notice-text">{item.title}</div>}
            {Array.isArray(item.message)
                ? item.message.map((msg, i) => (
                    <React.Fragment key={i}>
                        <div className="notice-desc">
                            {msg}
                            {item.actionLabel && (
                                <button className="notice-action" onClick={item.onAction}>
                                    {item.actionLabel}
                                </button>
                            )}
                        </div>
                        {onClose && (
                            <i className="close-icon adminfont-close" onClick={onClose} />
                        )}
                    </React.Fragment>
                ))
                : item.message && (
                    <div className="notice-desc">{item.message}</div>
                )}
        </div>
    </>
);

// ─── <Notice> — inline or delegated to store ──────────────────────────────────

export interface NoticeProps {
    uniqueKey?: string;
    title?: string;
    message?: string | string[];
    type?: 'info' | 'success' | 'warning' | 'error' | 'banner';
    displayPosition?: 'inline' | NoticePosition;
    actionLabel?: string;
    onAction?: () => void;
    validity?: number | 'lifetime';
}

export const Notice: React.FC<NoticeProps> = ({
    uniqueKey,
    title,
    message,
    type = 'success',
    displayPosition = 'notice',
    actionLabel,
    onAction,
    validity = 5000,
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (displayPosition === 'inline') return;
        addNotice(
            { uniqueKey, title, message, type, position: displayPosition, actionLabel, onAction },
            validity
        );
        setIsVisible(false);
    }, []);

    if (displayPosition !== 'inline' || !isVisible || (!title && !message)) return null;

    const item: NoticeItem = {
        uniqueKey: uniqueKey || 'inline',
        title,
        message,
        type,
        position: 'notice',
        actionLabel,
        onAction,
    };

    return (
        <div className={`ui-notice type-${type} display-${displayPosition}`}>
            {renderNoticeContent(item, () => setIsVisible(false))}
        </div>
    );
};

// ─── <NoticeReceiver> — mounts in layout to display store notices ─────────────

interface NoticeReceiverProps {
    position: NoticePosition;
}

export const NoticeReceiver: React.FC<NoticeReceiverProps> = ({ position }) => {
    const [items, setItems] = useState<NoticeItem[]>([]);

    useEffect(() => subscribe(all => setItems(all.filter(n => n.position === position))), [position]);

    useEffect(() => {
        flushExpired();
        const interval = setInterval(flushExpired, 500);
        return () => clearInterval(interval);
    }, []);

    if (!items.length) return null;

    return (
        <div className={`receiver receiver-${position}`}>
            {items.map(item => (
                <div key={item.uniqueKey} className={`ui-notice type-${item.type} display-${item.position}`}>
                    {renderNoticeContent(item, () => removeNotice(item.uniqueKey))}
                </div>
            ))}
        </div>
    );
};

// ─── NoticeField — FieldRegistry entry ───────────────────────────────────────

const NoticeField: FieldComponent = {
    render: ({ field }) => {
        const item: NoticeItem = {
            uniqueKey: field.uniqueKey || field.key,
            title: field.title,
            message: field.message,
            type: field.noticeType || 'info',
            position: 'notice',
            actionLabel: field.actionLabel,
            onAction: field.onAction,
        };

        return (
            <div className={`ui-notice type-${item.type} display-${item.position}`}>
                {renderNoticeContent(item)}
            </div>
        );
    },
};

export default NoticeField;