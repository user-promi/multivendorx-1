import { useEffect, useState } from 'react';
import axios from 'axios';
import { SuccessNotice, SelectInput, getApiLink, useModules } from 'zyra';
import { __ } from '@wordpress/i18n';

const StoreSquad = ({ id }: { id: string | null }) => {
    const { modules } = useModules();
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `store/${id}`),
            params: { fetch_user: true },
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((res) => {
                const data = res.data || {};
                setFormData((prev) => ({ ...prev, ...data }));
            })
    }, [id]);

    const autoSave = (updatedData: { [key: string]: any }) => {
        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `store/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: {
                ...updatedData,
                user: 'true'
            },
        }).then((res) => {
            if (res.data.success) {
                setSuccessMsg('Store saved successfully!');
            }
        })
    };

    return (
        <>
            <SuccessNotice message={successMsg} />

            <div className="container-wrapper">
                <div className="card-wrapper w-65">
                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">{__('Store owners', 'multivendorx')}</div>
                            </div>
                        </div>

                        {/* Store owners multi-select */}
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <SelectInput
                                    name="store_owners"
                                    options={appLocalizer.store_owners || []}
                                    type="multi-select"
                                    value={(formData.store_owners || []).map((id: any) => {
                                        const match = (appLocalizer.store_owners || []).find(
                                            (opt: any) => String(opt.value) === String(id)
                                        );
                                        return match ? match.value : String(id);
                                    })}
                                    onChange={(selected: any) => {
                                        const store_owners =
                                            (selected as any[])?.map(option => option.value) || [];
                                        const updated = { ...formData, store_owners, state: '' };
                                        setFormData(updated);
                                        autoSave(updated);
                                    }}
                                />
                            </div>
                        </div>

                        {modules.includes('staff-manager') && (
                            <>
                                {[
                                    { label: __('Store managers', 'multivendorx'), name: 'store_managers', options: appLocalizer?.managers_list },
                                    { label: __('Product managers', 'multivendorx'), name: 'product_managers', options: appLocalizer?.product_managers_list },
                                    { label: __('Customer supports', 'multivendorx'), name: 'customer_supports', options: appLocalizer?.customer_support_list },
                                    { label: __('Order assistants', 'multivendorx'), name: 'order_assistants', options: appLocalizer?.assistants_list },
                                ].map(({ label, name, options }) => (
                                    <div className="form-group-wrapper" key={name}>
                                        <div className="form-group">
                                            <label>{label}</label>
                                            <SelectInput
                                                name={name}
                                                options={options || []}
                                                type="multi-select"
                                                value={(formData[name] || []).map((id: any) => {
                                                    const match = (options || []).find((opt: any) => String(opt.value) === String(id));
                                                    return match ? match.value : String(id);
                                                })}
                                                onChange={(selected: any) => {
                                                    const updatedValues = (selected as any[])?.map(option => option.value) || [];
                                                    const updated = { ...formData, [name]: updatedValues, state: '' };
                                                    setFormData(updated);
                                                    autoSave(updated);
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {modules.includes('facilitator') && (
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label>{__('Facilitators', 'multivendorx')}</label>
                                    <SelectInput
                                        name="facilitators"
                                        options={appLocalizer?.facilitators_list || []}
                                        type="multi-select"
                                        value={(formData.facilitators || []).map((id: any) => {
                                            const match = (appLocalizer?.facilitators_list || []).find(
                                                (opt: any) => String(opt.value) === String(id)
                                            );
                                            return match ? match.value : String(id);
                                        })}
                                        onChange={(selected: any) => {
                                            const facilitators = (selected as any[])?.map(option => option.value) || [];
                                            const updated = { ...formData, facilitators, state: '' };
                                            setFormData(updated);
                                            autoSave(updated);
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card-wrapper w-35">
                    <div id="primary-owner" className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">{__('Primary owner', 'multivendorx')}</div>
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label>{__('Select primary owner', 'multivendorx')}</label>
                                <SelectInput
                                    name="primary_owner"
                                    options={appLocalizer?.store_owners || []}
                                    value={formData.primary_owner}
                                    type="single-select"
                                    onChange={(newValue: any) => {
                                        if (!newValue || Array.isArray(newValue)) return;
                                        const updated = { ...formData, primary_owner: newValue.value };
                                        setFormData(updated);
                                        autoSave(updated);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );

}

export default StoreSquad;