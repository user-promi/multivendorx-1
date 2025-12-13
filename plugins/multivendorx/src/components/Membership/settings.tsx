import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, FileInput, SelectInput, getApiLink, SuccessNotice, MultiCheckBox, ToggleSetting } from 'zyra';
import { __ } from '@wordpress/i18n';

const Settings = ({ id }: { id: string }) => {
    const [formData, setFormData] = useState<{ [key: string]: string }>({});

    const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({});
    const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);
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
                setImagePreviews({
                    image: data.image || '',
                    banner: data.banner || '',
                });
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

    const runUploader = (key: string) => {
        const frame = (window as any).wp.media({
            title: 'Select or Upload Image',
            button: { text: 'Use this image' },
            multiple: false,
        });

        frame.on('select', function () {
            const attachment = frame.state().get('selection').first().toJSON();
            const updated = { ...formData, [key]: attachment.url };

            setFormData(updated);
            setImagePreviews((prev) => ({ ...prev, [key]: attachment.url }));
            autoSave(updated);
        });

        frame.open();
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
    const stockStatusOptions = [
        { value: '', label: 'Choose your preferred page...' },
        { value: 'instock', label: 'Membership Dashboard' },
        { value: 'outofstock', label: 'Vendor Portal' },
        { value: 'onbackorder', label: 'Custom Page' },
    ];
    return (
        <>
            <SuccessNotice message={successMsg} />
            <div className="container-wrapper">
                <div className="card-wrapper column w-65">
                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">Membership Settings</div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Vendor Membership List Page</label>
                                    <SelectInput
                                        name="stock_status"
                                        options={stockStatusOptions}
                                        type="single-select"
                                    // value={product.stock_status}
                                    // onChange={(selected) =>
                                    //     handleChange(
                                    //         'stock_status',
                                    //         selected.value
                                    //     )
                                    // }
                                    />
                                </div>
                            </div>

                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Payment Due Message</label>
                                    <TextArea
                                        name="short_description"
                                        wrapperClass="setting-from-textarea"
                                        inputClass="textarea-input"
                                        descClass="settings-metabox-description"
                                        // value={product.short_description}
                                        // onChange={(e) =>
                                        //     handleChange(
                                        //         'short_description',
                                        //         e.target.value
                                        //     )
                                        // }
                                    />
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Upcoming Renewal Reminder</label>
                                    <TextArea
                                        name="short_description"
                                        wrapperClass="setting-from-textarea"
                                        inputClass="textarea-input"
                                        descClass="settings-metabox-description"
                                        // value={product.short_description}
                                        // onChange={(e) =>
                                        //     handleChange(
                                        //         'short_description',
                                        //         e.target.value
                                        //     )
                                        // }
                                    />
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Grace Period Expiry Message</label>
                                    <TextArea
                                        name="short_description"
                                        wrapperClass="setting-from-textarea"
                                        inputClass="textarea-input"
                                        descClass="settings-metabox-description"
                                        // value={product.short_description}
                                        // onChange={(e) =>
                                        //     handleChange(
                                        //         'short_description',
                                        //         e.target.value
                                        //     )
                                        // }
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="card-wrapper column w-35">
                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">Webhook Configuration</div>
                            </div>
                        </div>
                        <div className="card-body">

                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Primary Webhook URL</label>
                                    <BasicInput name="name" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.name} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Stripe Webhook URL</label>
                                    <BasicInput name="name" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.name} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Settings;
