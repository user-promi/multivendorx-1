import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, FileInput, SelectInput, getApiLink, SuccessNotice } from 'zyra';

const Storefront = () => {
    const id = appLocalizer.store_id;

    // allow flexible values (string | array)
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [imagePreviews, setImagePreviews] = useState<{ [key: string]: any }>({});
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const bannerOptions = [
        { label: "Static Image", value: "static-image" },
        { label: "Slider", value: "slider" },
        { label: "Video", value: "video" },
    ];

    // Fetch existing store data
    useEffect(() => {
        if (!id) return;

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `store/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        }).then((res) => {
            const data = res.data || {};
            setFormData((prev) => ({ ...prev, ...data }));
            setImagePreviews({
                image: data.image || '',
                banner: data.banner || '',
            });
        });
    }, [id]);

    // Auto clear success message
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);
        autoSave(updated);
    };

    // Open WP media uploader
    const runUploader = (key: string) => {
        const allowMultiple = formData.bannerType === "slider";

        const frame = (window as any).wp.media({
            title: allowMultiple ? "Select or Upload Images" : "Select or Upload Image",
            button: { text: allowMultiple ? "Use these images" : "Use this image" },
            multiple: allowMultiple,
        });

        frame.on("select", function () {
            const selection = frame.state().get("selection");
            let updated: any = { ...formData };

            if (allowMultiple) {
                // array of URLs
                const attachments = selection.map((att: any) => att.toJSON().url);
                updated[key] = attachments;
                setFormData(updated);
                setImagePreviews((prev) => ({ ...prev, [key]: attachments }));
            } else {
                // single URL
                const attachment = selection.first().toJSON();
                updated[key] = attachment.url;
                setFormData(updated);
                setImagePreviews((prev) => ({ ...prev, [key]: attachment.url }));
            }

            autoSave(updated);
        });

        frame.open();
    };

    // Save changes to backend
    const autoSave = (updatedData: { [key: string]: any }) => {
        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `store/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: updatedData,
        }).then((res) => {
            if (res.data.success) {
                setSuccessMsg('Store saved successfully!');
            }
        });
    };
    console.log(formData)
    return (
        <>
            <SuccessNotice message={successMsg} />

            <div className="page-title-wrapper">
                <div className="page-title">
                    <div className="title">Storefront</div>
                    <div className="des">Manage your store information and preferences</div>
                </div>
            </div>

            <div className="container-wrapper">
                {/* LEFT PANEL */}
                <div className="card-wrapper width-65">
                    <div className="card-content">
                        <div className="card-title">Store information</div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label>Name</label>
                                <BasicInput
                                    name="name"
                                    wrapperClass="setting-form-input"
                                    descClass="settings-metabox-description"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label>Slug</label>
                                <BasicInput
                                    name="slug"
                                    wrapperClass="setting-form-input"
                                    descClass="settings-metabox-description"
                                    value={formData.slug}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card-content">
                        <div className="card-title">Description</div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <TextArea
                                    name="description"
                                    wrapperClass="setting-from-textarea"
                                    inputClass="textarea-input"
                                    descClass="settings-metabox-description"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="card-wrapper width-35">
                    <div className="card-content">
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label>Store Banner Type</label>
                                <SelectInput
                                    name="bannerType"
                                    value={formData.bannerType}
                                    options={bannerOptions}
                                    type="single-select"
                                    onChange={(newValue: any) => {
                                        if (!newValue || Array.isArray(newValue)) return;
                                        const updated = { ...formData, bannerType: newValue.value };
                                        setFormData(updated);
                                        autoSave(updated);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label>Store Banner</label>

                                {formData.bannerType === "static-image" && (
                                    <FileInput
                                        value={formData.banner}
                                        inputClass="form-input"
                                        name="banner"
                                        type="hidden"
                                        onButtonClick={() => runUploader("banner")}
                                        imageWidth={75}
                                        imageHeight={75}
                                        openUploader="Upload Image"
                                        imageSrc={imagePreviews.banner}
                                        buttonClass="admin-btn btn-purple"
                                        descClass="settings-metabox-description"
                                    />
                                )}

                                {formData.bannerType === "slider" && (
                                    <FileInput
                                        value={Array.isArray(formData.banner) ? formData.banner.join(",") : ""}
                                        inputClass="form-input"
                                        name="banner"
                                        type="hidden"
                                        onButtonClick={() => runUploader("banner")}
                                        imageWidth={75}
                                        imageHeight={75}
                                        openUploader="Upload Images"
                                        imageSrc={imagePreviews.banner}
                                        buttonClass="admin-btn btn-purple"
                                        descClass="settings-metabox-description"
                                        multiple={true}
                                    />
                                )}

                                {formData.bannerType === "video" && (
                                    <BasicInput
                                        name="bannerVideoUrl"
                                        wrapperClass="setting-form-input"
                                        descClass="settings-metabox-description"
                                        value={formData.bannerVideoUrl || ""}
                                        placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                                        onChange={handleChange}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label>Profile Image</label>
                                <FileInput
                                    value={formData.image}
                                    inputClass="form-input"
                                    name="image"
                                    type="hidden"
                                    onButtonClick={() => runUploader('image')}
                                    imageWidth={75}
                                    imageHeight={75}
                                    openUploader="Upload Image"
                                    imageSrc={imagePreviews.image}
                                    buttonClass="admin-btn btn-purple"
                                    descClass="settings-metabox-description"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Storefront;
