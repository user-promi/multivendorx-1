import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, FileInput, SelectInput, getApiLink } from 'zyra';

const SocialMedia = () => {
    const id = appLocalizer.store_id;
    const [formData, setFormData] = useState<{ [key: string]: string }>({});
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
            <div className="card-wrapper">
                <div className="card-content">
                    <div className="card-title">Social information</div>
                    {/* Facebook */}
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="facebook"><i className="adminlib-facebook-fill"></i> Facebook</label>
                            <BasicInput
                                name="facebook"
                                wrapperClass="setting-form-input"
                                descClass="settings-metabox-description"
                                value={formData.facebook}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* x */}
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="twitter"><i className="adminlib-twitter"></i> X</label>
                            <BasicInput
                                name="twitter"
                                wrapperClass="setting-form-input"
                                descClass="settings-metabox-description"
                                value={formData.twitter}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* LinkedIn */}
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="linkedin"><i className="adminlib-linkedin-border"></i> LinkedIn</label>
                            <BasicInput
                                name="linkedin"
                                wrapperClass="setting-form-input"
                                descClass="settings-metabox-description"
                                value={formData.linkedin}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* YouTube */}
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="youtube"><i className="adminlib-youtube"></i> YouTube</label>
                            <BasicInput
                                name="youtube"
                                wrapperClass="setting-form-input"
                                descClass="settings-metabox-description"
                                value={formData.youtube}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Instagram */}
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="instagram"><i className="adminlib-mail"></i> Instagram</label>
                            <BasicInput
                                name="instagram"
                                wrapperClass="setting-form-input"
                                descClass="settings-metabox-description"
                                value={formData.instagram}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
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
            </div>
        </>
    );
};

export default SocialMedia;
