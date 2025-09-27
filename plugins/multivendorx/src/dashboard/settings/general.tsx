import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, FileInput, SelectInput, getApiLink } from 'zyra';

const GeneralSettings = () => {
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
            <div className="card-wrapper">
                <div className="card-content">
                    <div className="information-notioce">
                        <i className="adminlib-info"></i>
                        <p>Confirm that you have access to johndoe@gmail.com in sender email settings.</p>
                    </div>
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
            </div>
        </>
    );
};

export default GeneralSettings;
