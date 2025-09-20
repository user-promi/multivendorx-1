import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, FileInput, SelectInput, getApiLink } from 'zyra';

const Policy = () => {
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
                    <div className="title">Policy</div>
                    <div className="des">Manage your store information and preferences</div>
                </div>
            </div>
            <div className="container-wrapper">
                <div className="card-wrapper width-65">
                    <div className="card-content">
                        <div className="card-title">
                            Shipping Policy
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <TextArea name="shipping_policy" wrapperClass="setting-from-textarea"
                                    inputClass="textarea-input"
                                    descClass="settings-metabox-description" value={formData.shipping_policy} onChange={handleChange} />
                            </div>
                        </div>

                    </div>
                    <div className="card-content">
                        <div className="card-title">
                            Refund Policy
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <TextArea name="refund_policy" wrapperClass="setting-from-textarea"
                                    inputClass="textarea-input"
                                    descClass="settings-metabox-description" value={formData.refund_policy} onChange={handleChange} />
                            </div>
                        </div>

                    </div>
                    <div className="card-content">
                        <div className="card-title">
                            Cancellation/Return/Exchange Policy
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <TextArea name="exchange_policy" wrapperClass="setting-from-textarea"
                                    inputClass="textarea-input"
                                    descClass="settings-metabox-description" value={formData.exchange_policy} onChange={handleChange} />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default Policy;
