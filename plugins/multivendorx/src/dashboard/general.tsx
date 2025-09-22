import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, FileInput, SelectInput, getApiLink } from 'zyra';

const StoreInformation = () => {
    const id = appLocalizer.store_id;
    const [formData, setFormData] = useState<{ [key: string]: string }>({});
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        if (!id) return;

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `store/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((res) => {
                const data = res.data || {};
                setFormData((prev) => ({ ...prev, ...data }));
            })
    }, [id]);

    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);
    useEffect(() => {
        if (formData.country) {
            fetchStatesByCountry(formData.country);
        }
    }, [formData.country]);


    const fetchStatesByCountry = (countryCode: string) => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `states/${countryCode}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        }).then((res) => {
            setStateOptions(res.data || []);
        })
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);
        autoSave(updated);
    };

    const autoSave = (updatedData: { [key: string]: string }) => {
        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `store/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: updatedData,
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

            <div className="page-title-wrapper">
                <div className="page-title">
                    <div className="title">Store Information</div>
                    <div className="des">Manage your store information and preferences</div>
                </div>
            </div>
            <div className="container-wrapper">
                <div className="card-wrapper width-65">
                    {/* <div className="card-content">
                        <div className="card-title">
                            Basic information
                        </div>
                        
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Phone</label>
                                <BasicInput name="phone" value={formData.phone} wrapperClass="setting-form-input" descClass="settings-metabox-description" onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Address</label>
                                <BasicInput name="address_1" value={formData.address_1} wrapperClass="setting-form-input" descClass="settings-metabox-description" onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="product-name"></label>
                                <BasicInput name="address_2" value={formData.address_2} wrapperClass="setting-form-input" descClass="settings-metabox-description" onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Country</label>
                                <SelectInput
                                    name="country"
                                    value={formData.country}
                                    options={appLocalizer.country_list || []}
                                    type="single-select"
                                    onChange={(newValue:any) => {
                                        if (!newValue || Array.isArray(newValue)) return;
                                        const updated = { ...formData, country: newValue.value, state: '' }; // reset state
                                        setFormData(updated);
                                        autoSave(updated);
                                        fetchStatesByCountry(newValue.value);
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="product-name">State</label>
                                <SelectInput
                                    name="state"
                                    value={formData.state}
                                    options={stateOptions}
                                    type="single-select"
                                    onChange={(newValue:any) => {
                                        if (!newValue || Array.isArray(newValue)) return;
                                        const updated = { ...formData, state: newValue.value };
                                        setFormData(updated);
                                        autoSave(updated);
                                    }}
                                />
                            </div>
                        </div>
                    </div> */}
                    <div className="card-content">
                        <div className="card-title">
                            Basic information
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Name</label>
                                <BasicInput name="phone" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Slug</label>
                                <BasicInput name="phone" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
                            </div>
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Description</label>
                                <TextArea
                                    name="content"
                                    inputClass="textarea-input"
                                // value={formData.content}
                                // onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Message to Buyers</label>
                                <BasicInput name="phone" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
                            </div>
                        </div>
                    </div>

                    <div className="card-content">
                        <div className="card-title">Contact & Communication </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Phone</label>
                                <BasicInput name="phone" value={formData.phone} wrapperClass="setting-form-input" descClass="settings-metabox-description" onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Email / Additional Email</label>
                                <BasicInput name="phone" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Live Chat (Enable, WhatsApp, etc.)</label>
                                <BasicInput name="phone" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-wrapper width-35">
                    <div className="card-content">
                        <div className="card-title">Appearance </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Logo</label>
                                <BasicInput name="phone" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Banner / Cover Image</label>
                                <BasicInput name="phone" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StoreInformation;
