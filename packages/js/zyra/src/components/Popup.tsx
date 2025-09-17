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
                            <div className="top-section">
                                <div className="heading">Upgrade Your Plan</div>
                                <div className="description">Lorem ipsum dolor sit amet.</div>
                                <div className="admin-btn btn-red">
                                    Upgrade my plan <i className="adminlib-arrow-right arrow-icon"></i>
                                </div>
                            </div>
                            <div className="content">
                                <div className="heading-text">
                                    Why should you upgrade?
                                </div>

                                <ul>
                                    {props.messages?.map(
                                        (message, index) => (
                                            <li>
                                                <div className="title">
                                                    {message.text}
                                                </div>
                                                <div className="sub-text">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti eum quo, sapiente libero quam et.</div>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                            {/* <div className="right-section">
                                <h4>
                                    Unlock <span className="pro-tag">Pro</span>
                                    <i className="popup-icon-popup-star"></i>
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
                                        Get Pro. Sell More.
                                    </a>
                                </div>
                            </div> */}
                        </>
                    )}
                    {props.moduleName && (
                        <>
                            <div className="module-left-section">
                                <div className="module-icon">
                                    <i className={`adminlib-${props.moduleName}`}></i>
                                </div>
                            </div>
                            <div className="module-right-section">
                                <h2>Activate {props.moduleName}</h2>
                                <p>{props.message}</p>

                                <div className="footer-button">
                                    <a
                                        className="admin-btn btn-purple"
                                        href={props.modulePageUrl}
                                    >
                                        {props.moduleButton}
                                    </a>
                                </div>
                            </div>
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