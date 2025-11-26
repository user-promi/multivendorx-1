import { useEffect, useState } from 'react';
import axios from 'axios';
import { SuccessNotice, SelectInput, getApiLink, useModules } from 'zyra';

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
                                <div className="title">
                                    Store owners
                                </div>
                            </div>
                        </div>
                        {/* Other form groups remain the same */}
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
                                            (selected as any[])?.map(
                                                (option) => option.value
                                            ) || [];
                                        const updated = {
                                            ...formData,
                                            store_owners,
                                            state: '',
                                        };
                                        setFormData(updated);
                                        autoSave(updated);
                                    }}
                                />
                            </div>
                        </div>
                        {modules.includes('staff-manager') && (
                            <>
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label>Store managers</label>
                                        <SelectInput
                                            name="store_managers"
                                            options={appLocalizer?.managers_list || []}
                                            type="multi-select"
                                            value={(formData.store_managers || []).map((id: any) => {
                                                const match = (appLocalizer?.managers_list || []).find(
                                                    (opt: any) => String(opt.value) === String(id)
                                                );
                                                return match ? match.value : String(id);
                                            })}
                                            onChange={(selected: any) => {
                                                const store_managers =
                                                    (selected as any[])?.map(
                                                        (option) => option.value
                                                    ) || [];
                                                const updated = {
                                                    ...formData,
                                                    store_managers,
                                                    state: '',
                                                };
                                                setFormData(updated);
                                                autoSave(updated);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label>Product managers</label>
                                        <SelectInput
                                            name="product_managers"
                                            options={appLocalizer?.product_managers_list || []}
                                            type="multi-select"
                                            value={(formData.product_managers || []).map((id: any) => {
                                                const match = (appLocalizer?.product_managers_list || []).find(
                                                    (opt: any) => String(opt.value) === String(id)
                                                );
                                                return match ? match.value : String(id);
                                            })}
                                            onChange={(selected: any) => {
                                                const product_managers =
                                                    (selected as any[])?.map(
                                                        (option) => option.value
                                                    ) || [];
                                                const updated = {
                                                    ...formData,
                                                    product_managers,
                                                    state: '',
                                                };
                                                setFormData(updated);
                                                autoSave(updated);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label>Customer supports</label>
                                        <SelectInput
                                            name="customer_supports"
                                            options={appLocalizer?.customer_support_list || []}
                                            type="multi-select"
                                            value={(formData.customer_supports || []).map((id: any) => {
                                                const match = (appLocalizer?.customer_support_list || []).find(
                                                    (opt: any) => String(opt.value) === String(id)
                                                );
                                                return match ? match.value : String(id);
                                            })}
                                            onChange={(selected: any) => {
                                                const customer_supports =
                                                    (selected as any[])?.map(
                                                        (option) => option.value
                                                    ) || [];
                                                const updated = {
                                                    ...formData,
                                                    customer_supports,
                                                    state: '',
                                                };
                                                setFormData(updated);
                                                autoSave(updated);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label>Order assistants</label>
                                        <SelectInput
                                            name="order_assistants"
                                            options={appLocalizer?.assistants_list || []}
                                            type="multi-select"
                                            value={(formData.order_assistants || []).map((id: any) => {
                                                const match = (appLocalizer?.assistants_list || []).find(
                                                    (opt: any) => String(opt.value) === String(id)
                                                );
                                                return match ? match.value : String(id);
                                            })}
                                            onChange={(selected: any) => {
                                                const order_assistants =
                                                    (selected as any[])?.map(
                                                        (option) => option.value
                                                    ) || [];
                                                const updated = {
                                                    ...formData,
                                                    order_assistants,
                                                    state: '',
                                                };
                                                setFormData(updated);
                                                autoSave(updated);
                                            }}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        {modules.includes('facilitator') && (
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label>Facilitators</label>
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
                                            const facilitators =
                                                (selected as any[])?.map(
                                                    (option) => option.value
                                                ) || [];
                                            const updated = {
                                                ...formData,
                                                facilitators,
                                                state: '',
                                            };
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
                                <div className="title">
                                    Primary owner
                                </div>
                            </div>
                        </div>
                        {/* FIXED: Corrected label typo and fixed primary_owner handling */}
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label></label>
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