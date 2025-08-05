/**
 * External dependencies
 */
import React from 'react';
import { DialogContent, DialogContentText } from '@mui/material';

/**
 * Internal dependencies
 */
import '../styles/web/Popup.scss';

export interface PopupMessage {
    icon: string;
    text: string;
}

// Types
export interface PopupProps {
    proUrl?: string;
    title?: string;
    messages?: PopupMessage[];
    moreText?: string;
    moduleName?: string;
    settings?: string;
    plugin?: string;
    message?: string;
    moduleButton?: string;
    pluginDescription?: string;
    pluginButton?: string;
    SettingDescription?: string;
    pluginUrl?: string;
    modulePageUrl?: string;
}

const ProPopup: React.FC<PopupProps> = (props) => {
    return (
        <DialogContent className={`${props.messages ? "pro-popup-content" : "module-popup-content"}`}>
            <DialogContentText>
                <div className="popup-wrapper">
                    {props.messages && (
                        <>
                            <div className="left-section"></div>
                            <div className="right-section">
                                <h4>
                                    Unlock <span className="pro-tag">Pro</span>
                                    <i className="popup-icon-star-notifima"></i>
                                </h4>
                                <ul className="features-list">
                                    {props.messages?.map(
                                        (message, index) => (
                                            <li
                                                className="feature-item"
                                                key={index}
                                            >
                                                <i
                                                    className={message.icon}
                                                ></i>
                                                <p>{message.text}</p>
                                            </li>
                                        )
                                    )}
                                </ul>
                                <span className="more-text">
                                    {props.moreText}
                                </span>
                                <div className="footer-button">
                                    <a
                                        className="admin-btn btn-purple"
                                        target="_blank"
                                        rel="noreferrer"
                                        href={props.proUrl}
                                    >
                                        Upgrade to pro
                                    </a>
                                </div>
                            </div>
                        </>
                    )}
                    {props.moduleName && (
                        <>
                            <h2>{props.message}</h2>
                            <a
                                className="admin-btn btn-red"
                                href={props.modulePageUrl}
                            >
                                {props.moduleButton}
                            </a>
                        </>
                    )}
                    {props.settings && (
                        <>
                            <h2>{props.message}</h2>
                            <p>{props.SettingDescription}</p>
                        </>
                    )}
                </div>
            </DialogContentText>
        </DialogContent>
    );
};

export default ProPopup;
