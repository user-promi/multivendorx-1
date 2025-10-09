import { useState } from 'react';
import { BasicInput, TextArea, FileInput, SelectInput, getApiLink } from 'zyra';

const Appearance = () => {
    const storeOptions = [
        { value: 'static_image', label: 'Static Image' },
        { value: 'slider_image', label: 'Slider Image' },
        { value: 'video', label: 'Video' },
    ];

    const [formData, setFormData] = useState({
        stores: '',
    });

    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [sliderPreviews, setSliderPreviews] = useState<string[]>([]);

    const handleStaticImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setBannerPreview(previewUrl);
        }
    };

    const handleSliderImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const previews = Array.from(files).map(file => URL.createObjectURL(file));
            setSliderPreviews(previews);
        }
    };
    return (
        <>
            <div className="card-wrapper">
                <div className="card-content">
                    <div className="card-title">Appearance </div>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="product-name">Logo</label>
                            <FileInput
                                // value={formData.image}
                                inputClass="form-input"
                                name="image"
                                type="hidden"
                                // onButtonClick={() => runUploader('image')}
                                imageWidth={75}
                                imageHeight={75}
                                openUploader="Upload Image"
                                // imageSrc={imagePreviews.image}
                                buttonClass="admin-btn btn-purple"
                                descClass="settings-metabox-description"
                                size="small"
                                // ✅ NEW: Handle Remove
                                // onRemove={() => {
                                //     const updated = { ...formData, image: '' };
                                //     setFormData(updated);
                                //     setImagePreviews((prev) => ({ ...prev, image: '' }));
                                //     autoSave(updated);
                                // }}
                                //NEW: Handle Replace (reopen media uploader)
                                // onReplace={() => runUploader('image')}
                            />
                        </div>
                    </div>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="product-name">Banner / Cover Image</label>
                            <SelectInput
                                name="stores"
                                type="single-select"
                                options={storeOptions}
                                value={formData.stores ? formData.stores.split(',') : []}
                                onChange={(newValue: any) => {
                                    const selectedValues = Array.isArray(newValue)
                                        ? newValue.map((opt) => opt.value)
                                        : [];
                                    setFormData((prev) => ({
                                        ...prev,
                                        stores: selectedValues.join(','),
                                    }));
                                }}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default Appearance;
