import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, SelectInput, getApiLink } from 'zyra';

const StoreQueue = ({ id }: { id: string }) => {
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

            {successMsg && (
                <>
                    <div className="admin-notice-wrapper">
                        <i className="admin-font adminlib-icon-yes"></i>
                        <div className="notice-details">
                            <div className="title">Great!</div>
                            <div className="desc">{successMsg}</div>
                        </div>
                    </div>
                </>
            )}
            <div className="container-wrapper">
                <div className="card-wrapper width-65">
                    <div className="card-content">

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label>Store Owners</label>
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
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Store Users</label>
                                <SelectInput
                                    name="country"
                                    options={[
                                        { value: 'vendor1', label: 'John’s Fashion Hub' },
                                        { value: 'vendor2', label: 'Tech World' },
                                        { value: 'vendor3', label: 'Green Grocery' },
                                        { value: 'vendor4', label: 'Home Essentials' },
                                        { value: 'vendor5', label: 'Book Paradise' },
                                    ]}

                                    type="multi-select"
                                    onChange={(newValue) => {
                                        if (!newValue || Array.isArray(newValue)) return;
                                        const updated = { ...formData, user: newValue.value, state: '' }; // reset state
                                        setFormData(updated);
                                        autoSave(updated);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Store Users</label>
                                <SelectInput
                                    name="country"
                                    options={[
                                        { value: 'vendor1', label: 'John’s Fashion Hub' },
                                        { value: 'vendor2', label: 'Tech World' },
                                        { value: 'vendor3', label: 'Green Grocery' },
                                        { value: 'vendor4', label: 'Home Essentials' },
                                        { value: 'vendor5', label: 'Book Paradise' },
                                    ]}

                                    type="multi-select"
                                    onChange={(newValue) => {
                                        if (!newValue || Array.isArray(newValue)) return;
                                        const updated = { ...formData, user: newValue.value, state: '' }; // reset state
                                        setFormData(updated);
                                        autoSave(updated);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Store Users</label>
                                <SelectInput
                                    name="country"
                                    options={[
                                        { value: 'vendor1', label: 'John’s Fashion Hub' },
                                        { value: 'vendor2', label: 'Tech World' },
                                        { value: 'vendor3', label: 'Green Grocery' },
                                        { value: 'vendor4', label: 'Home Essentials' },
                                        { value: 'vendor5', label: 'Book Paradise' },
                                    ]}

                                    type="multi-select"
                                    onChange={(newValue) => {
                                        if (!newValue || Array.isArray(newValue)) return;
                                        const updated = { ...formData, user: newValue.value, state: '' }; // reset state
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

export default StoreQueue;