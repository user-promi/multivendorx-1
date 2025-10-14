import { useState } from "react";
import { MultiCheckBox, ToggleSetting } from "zyra";


const ShippingDelivery = () => {

    return (
        <>
            <div className="card-wrapper">
                <div className="card-content">
                    <div className="card-title">Method Type</div>
                    <ToggleSetting
                        wrapperClass="setting-form-input"
                        descClass="settings-metabox-description"
                        description="Choose your preferred shipping method."
                        options={[
                            { key: 'by_zone', value: 'by_zone', label: 'Zone-wise Shipping' },
                            { key: 'by_distance', value: 'by_distance', label: 'Country-wise Shipping' },
                            { key: 'distance_wise', value: 'distance_wise', label: 'Shipping by Distance' },
                        ]}
                    // value={formData.shipping_method || ''}
                    // onChange={handleToggleChange}
                    />

                    <div className="card-title">Zone-wise Shipping Configuration</div>
                    <div className="payment-tabs-component">
                        <div className="payment-method-card">
                            <div className="payment-method">
                                <div className="toggle-icon"><i className="adminlib-eye"></i></div>
                                <div className="details">
                                    <div className="details-wrapper">
                                        <div className="payment-method-icon">
                                            <i className="adminlib-verification3"></i>
                                        </div><div className="payment-method-info">
                                            <div className="title-wrapper">
                                                <span className="title">Identity Verification</span>
                                                <div className="admin-badge green">Active</div>
                                            </div>
                                            <div className="method-desc">Verify store identity using government-issued documents or facial recognition. Ensures authenticity of users.</div>
                                        </div>
                                    </div>
                                    <div className="admin-btn btn-purple">Manage</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShippingDelivery;
