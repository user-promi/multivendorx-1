/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { DialogContent, DialogContentText } from '@mui/material';

/**
 * Internal dependencies
 */
import '../styles/web/Popup.scss';

export interface PopupMessage {
    text: string;
    des?: string;
    icon?: string;
}
export interface BtnLink {
    site: string;
    price: string;
    link: string;
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
    message?: any;
    moduleButton?: string;
    pluginDescription?: string;
    pluginButton?: string;
    SettingDescription?: string;
    pluginUrl?: string;
    modulePageUrl?: string;
    btnLink?: BtnLink[];
    upgradeBtnText?: string;
}

const ProPopup: React.FC<PopupProps> = (props) => {
    const { btnLink = [], proUrl = '#' } = props;

    const [selectedBtn, setSelectedBtn] = useState<BtnLink>(
        btnLink.length ? btnLink[0] : { site: '', price: '', link: proUrl }
    );
    useEffect(() => {
        setSelectedBtn(btnLink.length ? btnLink[0] : { site: '', price: '', link: proUrl });
    }, [btnLink, proUrl]);
    console.log(props);

    return (
        <DialogContent className={`${props.messages ? "pro-popup-content" : "module-popup-content"}`}>
            <DialogContentText sx={{ fontFamily: "Figtree, sans-serif" }}>
                <div className="popup-wrapper">
                    {props.messages && (
                        <>
                            <div className="top-section">
                                <div className="heading">{props.title}</div>
                                <div className="description">{props.moreText}</div>
                                <div className="price">{selectedBtn.price}</div>
                                <div className="select-wrapper">
                                    For website with
                                    <select
                                        value={selectedBtn.link}
                                        onChange={(e) => {
                                            const found = btnLink.find((b) => b.link === e.target.value);
                                            if (found) setSelectedBtn(found);
                                        }}
                                    >
                                        {btnLink.map((b, idx) => (
                                            <option key={idx} value={b.link}>
                                                {b.site}
                                            </option>
                                        ))}
                                    </select>
                                    site license
                                </div>
                                <a
                                    className="admin-btn"
                                    href={selectedBtn.link}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {props.upgradeBtnText} <i className="adminlib-arrow-right arrow-icon"></i>
                                </a>
                            </div>
                            <div className="popup-content">
                                <div className="heading-text">
                                    Why should you upgrade?
                                </div>

                                <ul>
                                    {props.messages?.map(
                                        (message, index) => (
                                            <li>
                                                <div className="title"><i className={message.icon}></i> {message.text}</div>
                                                <div className="sub-text">{message.des}</div>
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
                            <div className="popup-header">
                                <i className={`adminlib-${props.moduleName}`}></i>
                            </div>
                            <div className="popup-body">
                                <h2>Activate {String(props.moduleName)
                                    .split('-')
                                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ')}
                                </h2>
                                <p>{props.message}</p>

                                <div className="buttons-wrapper center">
                                    <a
                                        className="admin-btn btn-purple"
                                        href={props.modulePageUrl}
                                    >
                                        <i className="adminlib-preview"></i> {props.moduleButton}
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
        </DialogContent >
    );
};

export default ProPopup;