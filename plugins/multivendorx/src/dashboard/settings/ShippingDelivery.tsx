import { useState } from "react";
import { BasicInput, CommonPopup, MultiCheckBox, ToggleSetting } from "zyra";


const ShippingDelivery = () => {

    const [EditShipping, setEditShipping] = useState(false);

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
                                                <span className="title">Free shipping</span>
                                                <div className="admin-badge green">Active</div>
                                            </div>
                                            <div className="method-desc">Verify store identity using government-issued documents or facial recognition. Ensures authenticity of users.</div>
                                        </div>
                                    </div>
                                    <div className="admin-btn btn-purple" onClick={() => { setEditShipping(true); }}>Manage</div>
                                </div>
                            </div>
                        </div>

                        <div className="payment-method-card">
                            <div className="payment-method">
                                <div className="toggle-icon"><i className="adminlib-eye"></i></div>
                                <div className="details">
                                    <div className="details-wrapper">
                                        <div className="payment-method-icon">
                                            <i className="adminlib-verification3"></i>
                                        </div><div className="payment-method-info">
                                            <div className="title-wrapper">
                                                <span className="title">Flat rate</span>
                                                <div className="admin-badge green">Active</div>
                                            </div>
                                            <div className="method-desc">Verify store identity using government-issued documents or facial recognition. Ensures authenticity of users.</div>
                                        </div>
                                    </div>
                                    <div className="admin-btn btn-purple" onClick={() => { setEditShipping(true); }}>Manage</div>
                                </div>
                            </div>
                        </div>

                        <div className="payment-method-card">
                            <div className="payment-method">
                                <div className="toggle-icon"><i className="adminlib-eye"></i></div>
                                <div className="details">
                                    <div className="details-wrapper">
                                        <div className="payment-method-icon">
                                            <i className="adminlib-verification3"></i>
                                        </div><div className="payment-method-info">
                                            <div className="title-wrapper">
                                                <span className="title">Local pickup</span>
                                                <div className="admin-badge green">Active</div>
                                            </div>
                                            <div className="method-desc">Verify store identity using government-issued documents or facial recognition. Ensures authenticity of users.</div>
                                        </div>
                                    </div>
                                    <div className="admin-btn btn-purple" onClick={() => { setEditShipping(true); }}>Manage</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {EditShipping && (
                <CommonPopup
                    open={EditShipping}
                    // onClose= setEditShipping(true)
                    width="500px"
                    height="50%"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-cart"></i>
                                Edit Shipping
                            </div>
                            <p>Publish important news, updates, or alerts that appear directly in store dashboards, ensuring sellers never miss critical information.</p>
                            <i
                                className="icon adminlib-close"
                                onClick={() => setEditShipping(false)}
                            ></i>
                        </>
                    }
                    footer={
                        <>


                        </>
                    }
                >

                    <div className="content">
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="title">Shipping method</label>
                                <ToggleSetting
                                    wrapperClass="setting-form-input"
                                    options={[
                                        { key: "flat_rate", value: "Flat rate", label: "Flat rate" },
                                        { key: "free_shipping", value: "Free shipping", label: "Free shipping" },
                                        { key: "local_pickup", value: "Local pickup", label: "Local pickup" },

                                    ]}
                                // value={formData.free_shipping}
                                // onChange={(val: any) =>
                                //     setFormData({ ...formData, free_shipping: val })
                                // }
                                />
                            </div>
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="title">Shipping Cost ($)</label>
                                <BasicInput
                                    type="number"
                                    name="title"
                                    // value={formData.title}
                                    // onChange={(e: any) =>
                                    //     setFormData({ ...formData, title: e.target.value })
                                    // }
                                />
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="title">Local Pickup Cost ($)</label>
                                <BasicInput
                                    type="number"
                                    name="title"
                                    // value={formData.title}
                                    // onChange={(e: any) =>
                                    //     setFormData({ ...formData, title: e.target.value })
                                    // }
                                />
                            </div>
                        </div>
                    </div>
                </CommonPopup>
            )}
        </>
    );
};

export default ShippingDelivery;
