import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getApiLink } from "./apiService";
import "../styles/web/SyncNow.scss";

type SyncStatus = {
    action: string;
    current: number;
    total: number;
};

export interface SyncNowProps {
    buttonKey: string;
    interval: number;
    proSetting: boolean;
    proSettingChanged: () => boolean;
    value: string;
    description: string;
    apilink: string;
    statusApiLink: string;
    appLocalizer: Record<string, any>; // Allows any structure
}

const SyncNow: React.FC<SyncNowProps> = ({
    appLocalizer,
    interval,
    proSetting,
    proSettingChanged,
    value,
    description,
    apilink,
    statusApiLink,
}) => {
    const [syncStarted, setSyncStarted] = useState<boolean>(false);
    const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([]);
    const [buttonClicked, setButtonClicked] = useState<boolean>(false);
    const fetchStatusRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (syncStarted) {
            fetchStatusRef.current = setInterval(fetchSyncStatus, interval);
        }

        return () => {
            if (fetchStatusRef.current) clearInterval(fetchStatusRef.current);
        };
    }, [syncStarted, interval]);

    useEffect(() => {
        fetchSyncStatus();
    }, []);

    const fetchSyncStatus = () => {
        axios({
            method: "post",
            url: getApiLink(appLocalizer, statusApiLink),
            headers: { "X-WP-Nonce": (window as any).appLocalizer.nonce },
        }).then((response) => {
            const syncData = response.data;
            setSyncStarted(syncData.running);
            setSyncStatus(syncData.status);
        });
    };

    const handleSync = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (proSettingChanged()) return;

        setSyncStarted(true);
        setButtonClicked(true);

        axios({
            method: "post",
            url: getApiLink(appLocalizer, apilink),
            headers: { "X-WP-Nonce": (window as any).appLocalizer.nonce },
        }).then((response) => {
            if (response.data) {
                setSyncStarted(false);
                fetchSyncStatus();
            }
        });
    };

    return (
        <div className="section-synchronize-now">
            <div className="loader-wrapper">
                <button
                    className="btn-purple btn-effect synchronize-now-button"
                    onClick={handleSync}
                >
                    {value}
                </button>
                {syncStarted && (
                    <div className="loader">
                        <div className="three-body__dot"></div>
                        <div className="three-body__dot"></div>
                        <div className="three-body__dot"></div>
                    </div>
                )}
            </div>

            {syncStarted && (
                <div className="fetch-display-output success">
                    Synchronization started, please wait.
                </div>
            )}
            <p
                className="settings-metabox-description"
                dangerouslySetInnerHTML={{ __html: description }}
            ></p>
            {proSetting && <span className="admin-pro-tag">pro</span>}
            {syncStatus.length > 0 &&
                syncStatus.map((status, index) => (
                    <div key={index} className="details-status-row sync-now">
                        {status.action}
                        <div className="status-meta">
                            <span className="status-icons">
                                <i className="admin-font adminLib-icon-yes"></i>
                            </span>
                            <span>
                                {status.current} / {status.total}
                            </span>
                        </div>
                        <span
                            style={{
                                width: `${(status.current / status.total) * 100}%`,
                            }}
                            className="progress-bar"
                        ></span>
                    </div>
                ))}
        </div>
    );
};

export default SyncNow;
