import { useState } from "react";
import { MultiCheckBox, ToggleSetting } from "zyra";


const ShippingDelivery = () => {
    const [selectedValues, setSelectedValues] = useState<string[]>(['virtual', 'downloadable']);

    const demoOptions = [
        { key: 'australia_post', value: 'Australia Post', label: 'Australia Post' },
        { key: 'canada_post', value: 'Canada Post', label: 'Canada Post' },
        { key: 'city_link', value: 'City Link', label: 'City Link' },
        { key: 'dhl', value: 'DHL', label: 'DHL' },
        { key: 'dpd', value: 'DPD', label: 'DPD' },
        { key: 'fastway_sa', value: 'Fastway South Africa', label: 'Fastway South Africa' },
        { key: 'fedex', value: 'FedEx', label: 'FedEx' },
        { key: 'ontrac', value: 'OnTrac', label: 'OnTrac' },
        { key: 'parcelforce', value: 'ParcelForce', label: 'ParcelForce' },
        { key: 'polish_shipping', value: 'Polish Shipping Providers', label: 'Polish Shipping Providers' },
        { key: 'royal_mail', value: 'Royal Mail', label: 'Royal Mail' },
        { key: 'sapo', value: 'SAPO', label: 'SAPO' },
        { key: 'tnt_consignment', value: 'TNT Express (Consignment)', label: 'TNT Express (Consignment)' },
        { key: 'tnt_reference', value: 'TNT Express (Reference)', label: 'TNT Express (Reference)' },
        { key: 'fedex_sameday', value: 'FedEx Sameday', label: 'FedEx Sameday' },
        { key: 'ups', value: 'UPS', label: 'UPS' },
        { key: 'usps', value: 'USPS', label: 'USPS' },
        { key: 'dhl_us', value: 'DHL US', label: 'DHL US' },
        { key: 'other', value: 'Other', label: 'Other' },
    ];

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
                            { key: 'by_zone', value: 'by_zone', label: 'Zone Wise' },
                            { key: 'by_distance', value: 'by_distance', label: 'Country Wise' },
                            { key: 'distance_wise', value: 'distance_wise', label: 'Distance Wise' },
                        ]}
                    // value={formData.shipping_method || ''}
                    // onChange={handleToggleChange}
                    />

                    <div className="card-title">Shipment Tracking</div>

                    <MultiCheckBox
                        khali_dabba={false}
                        wrapperClass="checkbox-list-side-by-side"
                        descClass="settings-metabox-description"
                        description=""
                        selectDeselect={true}
                        selectDeselectClass="admin-btn btn-purple select-deselect-trigger"
                        selectDeselectValue="Select / Deselect All"
                        inputWrapperClass="toggle-checkbox-header"
                        inputInnerWrapperClass="default-checkbox"
                        inputClass="mvx-toggle-checkbox"
                        options={demoOptions}
                        value={selectedValues}
                        onChange={(updated: string[]) => setSelectedValues(updated)}
                        onMultiSelectDeselectChange={() => {
                            // Select/deselect all logic
                            if (selectedValues.length === demoOptions.length) {
                                setSelectedValues([]);
                            } else {
                                setSelectedValues(demoOptions.map((opt) => opt.value));
                            }
                        }}
                    />

                    <div className="card-title">Shipping Stages</div>

                    <div className="toggle-settings-wrapper">
                        <ToggleSetting
                            wrapperClass="setting-form-input"
                            descClass="settings-metabox-description"
                            description="Choose your preferred payment method."
                            options={[
                                { key: "yes", value: "yes", label: "Yes" },
                                { key: "no", value: "no", label: "No" },
                            ]}
                        // options={paymentOptions}
                        // value={formData.payment_method || ""}
                        // onChange={(value) => handleToggleChange(value, 'payment_method')}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShippingDelivery;
