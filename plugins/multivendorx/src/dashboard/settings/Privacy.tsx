import { useEffect, useState } from 'react';
import axios from 'axios';
import { TextArea, getApiLink } from 'zyra';

const Privacy = () => {
    const id = appLocalizer.store_id;
    const [formData, setFormData] = useState<{ [key: string]: string }>({});
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Fetch store data
    useEffect(() => {
        if (!id) return;

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `store/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((res) => {
                const data = res.data || {};
                setFormData({
                    shipping_policy: data.shipping_policy || '',
                    refund_policy: data.refund_policy || '',
                    exchange_policy: data.exchange_policy || '',
                });
            });
    }, [id]);

    // Auto-hide success message after 3 seconds
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    // Handle field changes
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);
        autoSave(updated);
    };

    // Auto-save to API
    const autoSave = (updatedData: { [key: string]: string }) => {
        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `store/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: updatedData,
        }).then((res) => {
            if (res.data?.success) {
                setSuccessMsg('Privacy settings saved successfully!');
            }
        });
    };

    return (
        <>
            <div className="card-wrapper">
                <div className="card-content">
                    <div className="settings-metabox-note">
                        <i className="adminlib-info"></i>
                        <p>Confirm that you have access to johndoe@gmail.com in sender email settings.</p>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="shipping_policy">Shipping Policy</label>
                            <TextArea
                                name="shipping_policy"
                                inputClass="textarea-input"
                                value={formData.shipping_policy || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="refund_policy">Refund Policy</label>
                            <TextArea
                                name="refund_policy"
                                inputClass="textarea-input"
                                value={formData.refund_policy || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="exchange_policy">Cancellation/Return/Exchange Policy</label>
                            <TextArea
                                name="exchange_policy"
                                inputClass="textarea-input"
                                value={formData.exchange_policy || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {successMsg && (
                    <div className="admin-notice-wrapper">
                        <i className="admin-font adminlib-icon-yes"></i>
                        <div className="notice-details">
                            <div className="title">Great!</div>
                            <div className="desc">{successMsg}</div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Privacy;
