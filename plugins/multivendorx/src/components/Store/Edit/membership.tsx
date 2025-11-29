/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';

const Membership = ({ id }: { id: string | null }) => {
    return (
        <>
            <div className="container-wrapper">
                <div className="card-wrapper w-65">
                    <div className="card-content">
                        <div className="form-group-wrapper">
                            <div className="description-wrapper">
                                <div className="title">
                                    <i className="adminlib-error"></i>
                                    {__('Gold Plan', 'multivendorx')}
                                    <span className="admin-badge green">{__('Active', 'multivendorx')}</span>
                                </div>
                                <div className="des">
                                    {__('Renews on Dec 15, 2024', 'multivendorx')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-wrapper w-35"></div>
            </div>
        </>
    );
}

export default Membership;
