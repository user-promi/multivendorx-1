import { Link, useLocation, useNavigate } from 'react-router-dom';
import StoreTable from './storeTable';
import ViewStore from './viewStore';
import EditStore from './Edit/editStore';
import {
    AdminBreadcrumbs,
    BasicInput,
    CommonPopup,
    FileInput,
    getApiLink,
    SelectInput,
    TextArea,
} from 'zyra';
import { useState } from 'react';
import axios from 'axios';

const Store = () => {
    const location = useLocation();
    const [addStore, setaddStore] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [imagePreview, setImagePreview] = useState<string>('');
    const [error, setError] = useState<string>('');
    const hash = location.hash;
    const navigate = useNavigate();

    const isTabActive = hash.includes('tab=stores');
    const isAddStore = hash.includes('create');
    const isViewStore = hash.includes('view');
    const iseditStore = hash.includes('edit');

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-');
    };

    const checkSlugExists = async (slug: string) => {
        try {
            const response = await axios.get(
                getApiLink(appLocalizer, 'store'),
                {
                    params: { slug },
                    headers: { 'X-WP-Nonce': appLocalizer.nonce },
                }
            );
            return response.data.exists;
        } catch (err) {
            return false;
        }
    };

    // update text in state immediately (no API here)
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };

        if (name === 'name') {
            const newSlug = generateSlug(value);
            updated.slug = newSlug;
            setError(''); // reset previous error
        }

        setFormData(updated);
    };

    // run slug check only after user finishes typing (onBlur)
    const handleNameBlur = async () => {
        if (!formData.slug) return;
        const exists = await checkSlugExists(formData.slug);
        if (exists) setError(`Slug "${formData.slug}" already exists.`);
        else setError('');
    };

    const handleSubmit = async () => {
        if (!formData || Object.keys(formData).length === 0) return;

        const { name, slug } = formData;

        // Check again before submit (in case slug manually changed)
        const exists = await checkSlugExists(slug);
        if (exists) {
            setError(`Slug "${slug}" already exists. Please choose another.`);
            return;
        }

        setError('');
        const payload = { ...formData, status: 'active' };

        try {
            const response = await axios({
                method: 'POST',
                url: getApiLink(appLocalizer, 'store'),
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                data: { formData: payload },
            });

            if (response.data.success) {
                setaddStore(false);
                navigate(
                    `?page=multivendorx#&tab=stores&edit/${response.data.id}`
                );
            }
        } catch (err) {
            setError('Something went wrong while saving the store.');
        }
    };

    // Open WordPress media uploader
    const runUploader = (key: string) => {
        const frame: any = (window as any).wp.media({
            title: 'Select or Upload Image',
            button: { text: 'Use this image' },
            multiple: false,
        });

        frame.on('select', function () {
            const attachment = frame.state().get('selection').first().toJSON();
            const updated = { ...formData, [key]: attachment.url };

            setFormData(updated);
            setImagePreview(attachment.url);
        });

        frame.open();
    };

    // Remove image
    const handleRemoveImage = (key: string) => {
        const updated = { ...formData, [key]: '' };
        setFormData(updated);
        setImagePreview('');
    };

    // Replace image
    const handleReplaceImage = (key: string) => {
        runUploader(key);
    };

    return (
        <>
            {isTabActive && isViewStore && !isAddStore && <ViewStore />}
            {isTabActive && iseditStore && !isViewStore && !isAddStore && (
                <EditStore />
            )}

            {!isAddStore && !isViewStore && !iseditStore && (
                <>
                    <AdminBreadcrumbs
                        activeTabIcon="adminlib-storefront"
                        tabTitle="Stores"
                        description={
                            'Manage marketplace stores with ease. Review, edit, or add new stores anytime.'
                        }
                        buttons={[
                            <div
                                className="admin-btn btn-purple"
                                onClick={() => {
                                    setFormData({}); // reset all fields
                                    setImagePreview(''); // reset image preview
                                    setaddStore(true);
                                }}
                            >
                                <i className="adminlib-plus-circle-o"></i>
                                Add Store
                            </div>,
                        ]}
                    />

                    {addStore && (
                        <CommonPopup
                            open={addStore}
                            width="500px"
                            header={
                                <>
                                    <div className="title">
                                        <i className="adminlib-storefront"></i>
                                        Add Store
                                    </div>
                                    <p>
                                        Create a new store and set it up with
                                        essential details.
                                    </p>
                                    <i
                                        onClick={() => {
                                            setFormData({});
                                            setImagePreview('');
                                            setaddStore(false);
                                        }}
                                        className="icon adminlib-close"
                                    ></i>
                                </>
                            }
                            footer={
                                <>
                                    <div
                                        onClick={() => {
                                            setFormData({});
                                            setImagePreview('');
                                            setaddStore(false);
                                        }}
                                        className="admin-btn btn-red"
                                    >
                                        Cancel
                                    </div>

                                    <div
                                        onClick={handleSubmit}
                                        className="admin-btn btn-purple"
                                    >
                                        Submit
                                    </div>
                                </>
                            }
                        >
                            <div className="content">
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="store-name">
                                            Store Name
                                        </label>
                                        <BasicInput
                                            type="text"
                                            name="name"
                                            value={formData.name || ''}
                                            onChange={handleChange}
                                            onBlur={handleNameBlur}
                                            required={true}
                                        />
                                    </div>

                                    <div className={`form-group ${error ? 'error-input' : ''}`}>
                                        <label htmlFor="store-url">
                                            Store Slug
                                        </label>
                                        <BasicInput
                                            type="text"
                                            name="slug"
                                            value={formData.slug || ''}
                                            onChange={handleChange}
                                            required={true}
                                            generate="submit"
                                        />

                                        {error && (
                                            <div
                                                className="invalid-feedback"
                                            >
                                                {error}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="store-desc">
                                            Description
                                        </label>
                                        <TextArea
                                            name="description"
                                            inputClass="textarea-input"
                                            value={formData.description || ''}
                                            onChange={handleChange}
                                            usePlainText={false}
                                            tinymceApiKey={appLocalizer.settings_databases_value['marketplace-settings']['tinymce_api_section'] ?? ''}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="store-owner">
                                            Set Primary Owner
                                        </label>
                                        <SelectInput
                                            name="store_owners"
                                            options={
                                                appLocalizer?.store_owners || []
                                            }
                                            value={formData.store_owners}
                                            type="single-select"
                                            onChange={(newValue: any) => {
                                                if (
                                                    !newValue ||
                                                    Array.isArray(newValue)
                                                )
                                                    return;

                                                const updated = {
                                                    ...formData,
                                                    store_owners:
                                                        newValue.value,
                                                };
                                                setFormData(updated);
                                            }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="store-image">
                                            Profile Image
                                        </label>
                                        <FileInput
                                            value={formData.image || ''}
                                            inputClass="form-input"
                                            name="image"
                                            type="hidden"
                                            imageSrc={imagePreview || ''}
                                            imageWidth={75}
                                            imageHeight={75}
                                            openUploader="Upload Image"
                                            buttonClass="admin-btn btn-purple"
                                            onButtonClick={() =>
                                                runUploader('image')
                                            }
                                            onRemove={() =>
                                                handleRemoveImage('image')
                                            }
                                            onReplace={() =>
                                                handleReplaceImage('image')
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </CommonPopup>
                    )}
                    <StoreTable />
                </>
            )}
        </>
    );
};

export default Store;
