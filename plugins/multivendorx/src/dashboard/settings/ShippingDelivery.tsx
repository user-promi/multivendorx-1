import axios from "axios";
import { useEffect, useState } from "react";
import { BasicInput, CommonPopup, getApiLink, MultiCheckBox, SuccessNotice, ToggleSetting } from "zyra";
import ShippingRatesByCountry from "./ShippingRatesByCountry";

const ShippingDelivery = () => {
    const [formData, setFormData] = useState<{ [key: string]: any }>({}); // Use 'any' for simplicity here
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [EditShipping, setEditShipping] = useState(false);

    useEffect(() => {
        if (!appLocalizer.store_id) return;

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        }).then((res) => {
            const data = res.data || {};
            setFormData((prev) => ({ ...prev, ...data }));
        });
    }, [appLocalizer.store_id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);
        autoSave(updated);
    };

    const handleToggleChange = (value: string, name?: string) => {
        setFormData((prev) => {
            const updated = {
                ...(prev || {}),
                [name || 'shipping_options']: value,
            };
            autoSave(updated);
            return updated;
        });
    };

    const autoSave = (updatedData: Record<string, unknown>) => {
        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: updatedData,
        }).then((res) => {
            if (res.data.success) {
                setSuccessMsg('Store saved successfully!');
            }
        });
    };

    return (
        <>
            <SuccessNotice message={successMsg} />
            <div className="card-wrapper">
                <div className="card-content">
                    <div className="card-title">Method Type</div>

                    {/* Only show ToggleSetting if shipping_methods has options */}
                    {appLocalizer.shipping_methods && appLocalizer.shipping_methods.length > 0 && (
                        <ToggleSetting
                            wrapperClass="setting-form-input"
                            descClass="settings-metabox-description"
                            description="Choose your preferred payment method."
                            options={appLocalizer.shipping_methods}
                            value={formData.shipping_options || ""}
                            onChange={(value: any) => handleToggleChange(value, 'shipping_options')}
                        />
                    )}
                    {/* //zone by shipping */}
                    {formData.shipping_options === 'distance_by_zone' && (
                        <>
                            <div className="card-title">Zone-wise Shipping Configuration</div>
                            <div className="payment-tabs-component">
                                <div className="payment-method-card">
                                    <div className="payment-method">
                                        <div className="toggle-icon"><i className="adminlib-eye"></i></div>
                                        <div className="details">
                                            <div className="details-wrapper">
                                                <div className="payment-method-icon">
                                                    <i className="adminlib-verification3"></i>
                                                </div>
                                                <div className="payment-method-info">
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
                                                </div>
                                                <div className="payment-method-info">
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
                                                </div>
                                                <div className="payment-method-info">
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
                        </>
                    )}

                    {/* country wise shipping */}
                    {formData.shipping_options === 'shipping_by_country' && (
                        <>
                            <div className="card-title">Country-wise Shipping Configuration</div>

                            {/* Default Shipping Price */}
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="_mvx_shipping_type_price">Default Shipping Price ($)</label>
                                    <BasicInput
                                        type="number"
                                        name="_mvx_shipping_type_price"
                                        wrapperClass="setting-form-input"
                                        descClass="settings-metabox-description"
                                        placeholder="0.00"
                                        value={formData._mvx_shipping_type_price || ''}
                                        onChange={handleChange}
                                    />
                                    <div className="settings-metabox-description">
                                        This is the base price and will be the starting shipping price for each product
                                    </div>
                                </div>
                            </div>

                            {/* Per Product Additional Price */}
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="_mvx_additional_product">Per Product Additional Price ($)</label>
                                    <BasicInput
                                        type="number"
                                        name="_mvx_additional_product"
                                        wrapperClass="setting-form-input"
                                        descClass="settings-metabox-description"
                                        placeholder="0.00"
                                        value={formData._mvx_additional_product || ''}
                                        onChange={handleChange}
                                    />
                                    <div className="settings-metabox-description">
                                        If a customer buys more than one type product from your store, first product of the every second type will be charged with this price
                                    </div>
                                </div>
                            </div>

                            {/* Per Qty Additional Price */}
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="_mvx_additional_qty">Per Qty Additional Price ($)</label>
                                    <BasicInput
                                        type="number"
                                        name="_mvx_additional_qty"
                                        wrapperClass="setting-form-input"
                                        descClass="settings-metabox-description"
                                        placeholder="0.00"
                                        value={formData._mvx_additional_qty || ''}
                                        onChange={handleChange}
                                    />
                                    <div className="settings-metabox-description">
                                        Every second product of same type will be charged with this price
                                    </div>
                                </div>
                            </div>

                            {/* Free Shipping Minimum Order Amount */}
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="_free_shipping_amount">Free Shipping Minimum Order Amount ($)</label>
                                    <BasicInput
                                        type="number"
                                        name="_free_shipping_amount"
                                        wrapperClass="setting-form-input"
                                        descClass="settings-metabox-description"
                                        placeholder="NO Free Shipping"
                                        value={formData._free_shipping_amount || ''}
                                        onChange={handleChange}
                                    />
                                    <div className="settings-metabox-description">
                                        Free shipping will be available if order amount more than this. Leave empty to disable Free Shipping.
                                    </div>
                                </div>
                            </div>

                            {/* Local Pickup Cost */}
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="_local_pickup_cost">Local Pickup Cost ($)</label>
                                    <BasicInput
                                        type="number"
                                        name="_local_pickup_cost"
                                        wrapperClass="setting-form-input"
                                        descClass="settings-metabox-description"
                                        placeholder="0.00"
                                        value={formData._local_pickup_cost || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="card-title">Country-wise Shipping Configuration</div>
                            <ShippingRatesByCountry />
                        </>
                    )}
                </div>
            </div>

            {EditShipping && (
                <CommonPopup
                    open={EditShipping}
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
                    footer={<></>}
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