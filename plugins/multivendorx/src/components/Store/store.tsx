import { Link, useLocation, useNavigate } from 'react-router-dom';
import StoreTable from './storeTable';
import ViewStore from './viewStore';
import EditStore from './Edit/editStore';
import {
    AdminBreadcrumbs,
    BasicInput,
    CommonPopup,
    EmailsInput,
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
    const [emails, setEmails] = useState<string[]>([]); 
    // const [error, setError] = useState<{ type: string; message: string } | null>(null);
    const [error, setError] = useState<{ [key: string]: { type: string; message: string }; }>({});


    const hash = location.hash;
    const navigate = useNavigate();

    const isTabActive = hash.includes('tab=stores');
    const isAddStore = hash.includes('create');
    // const isViewStore = hash.includes('view');
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

        // if (name === 'name') {
        //     const newSlug = generateSlug(value);
        //     updated.slug = newSlug;
        // }

        if (name === "slug") {
            const clean = value.replace(/[^a-zA-Z0-9-]/g, "");
            updated.slug = clean.toLowerCase();
        } else if (name === "name") {
            updated.name = value;
            updated.slug = generateSlug(value);
        }

        setFormData(updated);
    };

    const saveEmails = (emailList: string[], primary: string) => {
        const updated = {
            ...formData,
            primary_email: primary,
            emails: emailList,
        };
        setFormData(updated);
    };

    // run slug check only after user finishes typing (onBlur)
    const handleNameBlur = async () => {
        if (!formData.slug) return;
        const exists = await checkSlugExists(formData.slug);
        if (exists)
            // setError(`Slug "${formData.slug}" already exists.`);
            setError((prev) => ({
                ...prev,
                slug: {
                    type: 'invalid-massage',
                    message: `Slug "${formData.slug}" already exists.`,
                },
            }));
        else
            setError((prev) => ({
                ...prev,
                slug: {
                    type: 'success-massage',
                    message: 'Available',
                },
            }));
    };

    const handleSubmit = async () => {
        // if (!formData || Object.keys(formData).length === 0) return;

        const { name, slug, email, store_owners } = formData;

        if (!name?.trim()) {
            setError((prev) => ({
                ...prev,
                name: {
                    type: 'invalid-massage',
                    message: 'Store name is required.',
                },
            }));
            return;
        }

        if (!slug?.trim()) {
            setError((prev) => ({
                ...prev,
                slug: {
                    type: 'invalid-massage',
                    message: 'Store slug is required.',
                },
            }));
            return;
        }

        if (!formData.primary_email?.trim()) {
            setError((prev) => ({
                ...prev,
                email: {
                    type: 'invalid-massage',
                    message: 'Store email is required.',
                },
            }));
            return;
        }

        if (!store_owners) {
            setError((prev) => ({
                ...prev,
                primary: {
                    type: 'invalid-massage',
                    message: 'Primary owners is required.',
                },
            }));
            return;
        }


        // Check again before submit (in case slug manually changed)
        const exists = await checkSlugExists(slug);
        if (exists) {
            setError((prev) => ({
                ...prev,
                slug: {
                    type: 'invalid-massage',
                    message: `Slug "${formData.slug}" already exists.`,
                },
            }));
            return;
        }

        setError({});

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
            setError((prev) => ({
                ...prev,
                name: {
                    type: 'invalid-massage',
                    message: 'Something went wrong while saving the store.',
                },
            }));
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
            {/* {isTabActive && isViewStore && !isAddStore && <ViewStore />} */}
            {isTabActive && iseditStore && !isAddStore && (
                <EditStore />
            )}

            {!isAddStore && !iseditStore && (
                <>
                    <AdminBreadcrumbs
                        activeTabIcon="adminlib-storefront"
                        tabTitle="Stores"
                        description={
                            'Manage marketplace stores with ease. Review, edit, or add new stores anytime.'
                        }
                        buttons={[
                            <div
                                className="admin-btn btn-purple-bg"
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
                                            Store name
                                        </label>
                                        <BasicInput
                                            type="text"
                                            name="name"
                                            value={formData.name || ''}
                                            onChange={handleChange}
                                            // onBlur={handleNameBlur}
                                            required={true}
                                        />
                                        {error?.name?.message && <div className="invalid-massage">{error?.name?.message}</div>}

                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="store-url">
                                            Store slug
                                        </label>
                                        <BasicInput
                                            type="text"
                                            name="slug"
                                            value={formData.slug || ''}
                                            wrapperClass="setting-form-input"
                                            onChange={handleChange}
                                            required={true}
                                            clickBtnName='Check Slug'
                                            onclickCallback={handleNameBlur}
                                            msg={error.slug}
                                        />
                                        {error?.slug?.message && <div className="invalid-massage">{error?.slug?.message}</div>}

                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="store-name">
                                            Store Email
                                        </label>
                                        {/* <BasicInput
                                            type="text"
                                            name="email"
                                            value={formData.email || ''}
                                            onChange={handleChange}
                                            required={true}
                                            msg={error.email}
                                        /> */}
                                        <EmailsInput
                                            value={emails}
                                            enablePrimary={true}
                                            onChange={(list, primary) => {
                                                saveEmails(list, primary);
                                            }}
                                        />
                                        {error?.email?.message && <div className="invalid-massage">{error?.email?.message}</div>}

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
                                            Primary owner
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
                                        {error?.primary?.message && <div className="invalid-massage">{error?.primary?.message}</div>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="store-image">
                                            Profile image
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
