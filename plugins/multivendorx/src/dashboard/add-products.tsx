import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {
    BasicInput,
    CalendarInput,
    CommonPopup,
    FileInput,
    MultiCheckBox,
    RadioInput,
    SelectInput,
    TextArea,
} from 'zyra';
const demoData = [
    {
        id: "cat1",
        name: "Category 1",
        children: [
            { id: "sub1", name: "sub category 1" },
            { id: "sub2", name: "sub category 2" },
            {
                id: "sub3",
                name: "sub category 3",
                children: [
                    { id: "child1", name: "sub 1" },
                    { id: "child2", name: "sub 2" },
                    { id: "child3", name: "sub 3" },
                ],
            },
            { id: "sub4", name: "sub category 4" },
        ],
    },
    { id: "cat2", name: "Category 2" },
    { id: "cat3", name: "Category 3" },
    { id: "cat4", name: "Category 4" },
];
const AddProduct = () => {
    const location = useLocation();

    const query = new URLSearchParams(location.search);
    let productId = query.get('context_id');
    if (!productId) {
        const parts = location.pathname.split('/').filter(Boolean);
        if (parts.length >= 4) {
            productId = productId || parts[3];
        }
    }
    const [product, setProduct] = useState({});
    const [shippingClasses, setShippingClasses] = useState([]);

    const [featuredImage, setFeaturedImage] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);

    useEffect(() => {
        if (!productId) return;

        axios
            .get(`${appLocalizer.apiUrl}/wc/v3/products/${productId}`, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
            })
            .then(function (res) {
                const images = res.data.images || [];

                if (images.length > 0) {
                    setFeaturedImage(images[0]);
                }

                setGalleryImages(images.slice(1));
                setProduct(res.data);
            });
    }, [productId]);

    const [variants, setVariants] = useState([
        {
            id: 1,
            name: 'Color',
            values: [
                'Red',
                'Green',
                'Blue',
                'Red',
                'Green',
                'Blue',
                'Red',
                'Green',
                'Blue',
                'Red',
                'Green',
                'Blue',
            ],
            tempValue: '',
            isEditing: false,
        },
        {
            id: 2,
            name: 'Size',
            values: ['S', 'M', 'L', 'XL'],
            tempValue: '',
            isEditing: false,
        },
        {
            id: 3,
            name: 'Material',
            values: ['Cotton', 'Silk'],
            tempValue: '',
            isEditing: false,
        },
    ]);
    const [AddAttribute, setAddAttribute] = useState(false);
    const [Addvariant, setAddvariant] = useState(false);
    const [showAddNew, setShowAddNew] = useState(false);
    const [visibility, setVisibility] = useState('shop_search');
    const wrapperRef = useRef(null);
    const [selectedCat, setSelectedCat] = useState("");
    const [selectedSub, setSelectedSub] = useState("");
    const [selectedChild, setSelectedChild] = useState("");

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                // Reset all selections
                setSelectedCat("");
                setSelectedSub("");
                setSelectedChild("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // ------------------ CLICK HANDLERS ------------------
    const handleCategoryClick = (catId) => {
        setSelectedCat(catId);
        setSelectedSub("");
        setSelectedChild("");
    };
    const handleSubClick = (subId) => {
        setSelectedSub(subId);
        setSelectedChild("");
    };
    const handleChildClick = (childId) => {
        setSelectedChild(childId);
    };

    const handlePathClick = (level) => {
        if (level === "category") {
            setSelectedSub("");
            setSelectedChild("");
        }
        if (level === "sub") {
            setSelectedChild("");
        }
    };

    const printPath = () => {
        const cat = demoData.find((c) => c.id === selectedCat);
        const sub = cat?.children?.find((s) => s.id === selectedSub);
        const child = sub?.children?.find((c) => c.id === selectedChild);

        return (
            <>
                {cat && (
                    <span
                        
                        onClick={() => handlePathClick("category")}
                    >
                        {cat.name}
                    </span>
                )}
                {sub && (
                    <>
                        {" / "}
                        <span
                            
                            onClick={() => handlePathClick("sub")}
                        >
                            {sub.name}
                        </span>
                    </>
                )}
                {child && (
                    <>
                        {" / "}
                        <span>{child.name}</span>
                    </>
                )}
            </>
        );
    };

    const resetSelection = () => {
        setSelectedCat("");
        setSelectedSub("");
        setSelectedChild("");
    };
    // category end
    useEffect(() => {
        function handleClick(e) {
            if (!wrapperRef.current) return;

            variants.forEach((v) => {
                if (v.isEditing) {
                    // If click is outside that variant -> save
                    const el = document.getElementById(`variant-${v.id}`);
                    if (el && !el.contains(e.target)) {
                        finishEditing(v.id);
                    }
                }
            });
        }

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [variants]);

    const addVariant = () => {
        setVariants((prev) => [
            ...prev,
            {
                id: Date.now(),
                name: '',
                values: [],
                tempValue: '',
                isEditing: true,
            },
        ]);
    };

    // update field on change
    const updateVariantField = (id, field, value) => {
        setVariants((prev) =>
            prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
        );
    };

    // when user clicks outside → save & switch to view mode
    const finishEditing = (id) => {
        setVariants((prev) =>
            prev.map((v) => {
                if (v.id === id) {
                    const cleanedValues = v.tempValue.trim()
                        ? [...v.values, v.tempValue.trim()]
                        : v.values;

                    return {
                        ...v,
                        values: cleanedValues,
                        tempValue: '',
                        isEditing: false,
                    };
                }
                return v;
            })
        );
    };

    // add new value badge
    const addValue = (id) => {
        setVariants((prev) =>
            prev.map((v) => {
                if (v.id === id && v.tempValue.trim()) {
                    return {
                        ...v,
                        values: [...v.values, v.tempValue.trim()],
                        tempValue: '',
                    };
                }
                return v;
            })
        );
    };

    // delete variant
    const deleteVariant = (id) => {
        setVariants((prev) => prev.filter((v) => v.id !== id));
    };

    // enter edit mode again
    const editVariant = (id) => {
        setVariants((prev) =>
            prev.map((v) => (v.id === id ? { ...v, isEditing: true } : v))
        );
    };

    const toggleCard = (cardId) => {
        const body = document.querySelector(`#${cardId} .card-body`);
        const arrow = document.querySelector(`#${cardId} .arrow-icon`);

        if (!body || !arrow) return;

        body.classList.toggle('hide-body');
        arrow.classList.toggle('rotate');
    };

    // static data start
    const typeOptions = [
        { label: 'Select product type', value: '' },
        { label: 'Simple', value: 'simple' },
        { label: 'Variable', value: 'variable' },
    ];

    const paymentOptions = [
        { label: 'Select stock status', value: '' },
        { label: 'In stock', value: 'instock' },
        { label: 'out of stock', value: '' },
    ];

    const stockStatusOptions = [
        { value: '', label: 'Stock Status' },
        { value: 'instock', label: 'In Stock' },
        { value: 'outofstock', label: 'Out of Stock' },
        { value: 'onbackorder', label: 'On Backorder' },
    ];

    const staticvariant = [
        { label: 'red', value: 'red' },
        { label: 'green', value: 'green' },
        { label: 'blue', value: 'blue' },
    ];

    const staticvariantion = [
        { label: '', value: '' },
        { label: 'color', value: '' },
        { label: 'size', value: '' },
        { label: 'width', value: '' },
    ];

    const backorderOptions = [
        { label: 'Do not allow', value: 'no' },
        { label: 'Allow, but notify customer', value: 'notify' },
        { label: 'Allow', value: 'yes' },
    ];

    const handleChange = (field, value) => {
        setProduct((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const createProduct = () => {
        const imagePayload = [];

        if (featuredImage) {
            imagePayload.push({ id: featuredImage.id });
        }

        galleryImages.forEach(img => {
            imagePayload.push({ id: img.id });
        });

        try {
            const payload = {
                ...product,
                images: imagePayload,
                categories: selectedCats.map(id => ({ id })),
                meta_data: [
                    {
                        key: 'multivendorx_store_id',
                        value: appLocalizer.store_id,
                    },
                ],
            };

            axios
                .put(
                    `${appLocalizer.apiUrl}/wc/v3/products/${productId}`,
                    payload,
                    { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
                )
                .then((res) => {
                    console.log('Product created:', res.data);
                    window.location.reload();
                });
        } catch (error) {
            console.error('Error:', error.response);
        }
    };

    useEffect(() => {
        axios
            .get(`${appLocalizer.apiUrl}/wc/v3/products/shipping_classes`, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
            })
            .then((res) => {
                const options = res.data.map((cls) => ({
                    value: cls.slug,
                    label: cls.name,
                }));

                setShippingClasses(options);
            });
    }, []);

    const [tagInput, setTagInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [existingTags, setExistingTags] = useState([]);

    useEffect(() => {
        axios
            .get(`${appLocalizer.apiUrl}/wc/v3/products/tags`, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
            })
            .then((res) => {
                setExistingTags(res.data);
            });
    }, []);

    const handleTagInput = (value) => {
        setTagInput(value);

        if (!value.trim()) {
            setSuggestions([]);
            return;
        }

        const filtered = existingTags.filter(
            (tag) =>
                tag &&
                tag.name &&
                tag.name.toLowerCase().includes(value.toLowerCase())
        );

        setSuggestions(filtered);
    };

    const addTag = (tag) => {
        let newTag = tag;

        if (typeof tag === 'string') {
            newTag = { name: tag };
        }

        if (!product.tags.find((t) => t.name === newTag.name)) {
            setProduct({
                ...product,
                tags: [...product.tags, newTag],
            });
        }

        setTagInput('');
        setSuggestions([]);
    };

    const addDownloadableFile = () => {
        const newFile = {
            id: appLocalizer.random_string_generate,
            name: "",
            file: ""
        };
        setProduct(prev => ({
            ...prev,
            downloads: [...prev.downloads, newFile]
        }));
    };

    const updateDownloadableFile = (id, field, value) => {
        setProduct(prev => ({
            ...prev,
            downloads: prev.downloads.map(f =>
                f.id === id ? { ...f, [field]: value } : f
            )
        }));
    };

    const removeDownloadableFile = (id) => {
        setProduct(prev => ({
            ...prev,
            downloads: prev.downloads.filter(f => f.id !== id)
        }));
    };

    const openMediaUploader = (id) => {
        const frame = wp.media({
            title: "Select or Upload File",
            button: { text: "Use this file" },
            multiple: false
        });

        frame.on("select", () => {
            const attachment = frame.state().get("selection").first().toJSON();
            updateDownloadableFile(id, "file", attachment.url);
        });

        frame.open();
    };

    const openFeaturedUploader = () => {
        const frame = wp.media({
            title: "Select Featured Image",
            button: { text: "Use this image" },
            multiple: false,
            library: { type: "image" }
        });

        frame.on("select", () => {
            const attachment = frame.state().get("selection").first().toJSON();

            const img = {
                id: attachment.id,
                src: attachment.url,
                thumbnail: attachment.sizes?.thumbnail?.url || attachment.url
            };

            setFeaturedImage(img);
        });

        frame.open();
    };

    const openGalleryUploader = () => {
        const frame = wp.media({
            title: "Select Gallery Images",
            button: { text: "Add to gallery" },
            multiple: true,
            library: { type: "image" }
        });

        frame.on("select", () => {
            const selection = frame.state().get("selection").toJSON();

            const newImages = selection.map(img => ({
                id: img.id,
                src: img.url,
                thumbnail: img.sizes?.thumbnail?.url || img.url
            }));

            setGalleryImages(prev => [...prev, ...newImages]);
        });

        frame.open();
    };

    const [categories, setCategories] = useState([]);
    const [selectedCats, setSelectedCats] = useState([]);

    useEffect(() => {
        axios.get(`${appLocalizer.apiUrl}/wc/v3/products/categories`, {
            headers: { "X-WP-Nonce": appLocalizer.nonce }
        })
        .then(res => setCategories(res.data));
    }, []);

    useEffect(() => {
        if (product && product.categories) {
            setSelectedCats(product.categories.map(c => c.id));
        }
    }, [product]);


    const toggleCategory = (id) => {
    setSelectedCats((prev) =>
        prev.includes(id)
            ? prev.filter(item => item !== id)    // remove
            : [...prev, id]                        // add
    );
};

    
    const buildCategoryTree = (categories) => {
        const map = {};
        const roots = [];

        categories.forEach(cat => {
            map[cat.id] = { ...cat, children: [] };
        });

        categories.forEach(cat => {
            if (cat.parent === 0) {
                roots.push(map[cat.id]);
            } else if (map[cat.parent]) {
                map[cat.parent].children.push(map[cat.id]);
            }
        });

        return roots;
    };

    const CategoryItem = ({ category, selectedCats, toggleCategory }) => {
    return (
        <li className={category.parent === 0 ? "category" : "sub-category"}>
            <input
                type="checkbox"
                checked={selectedCats.includes(category.id)}   // 💥 previously saved value
                onChange={() => toggleCategory(category.id)}   // update value
            />
            {category.name}

            {category.children?.length > 0 && (
                <ul>
                    {category.children.map(child => (
                        <CategoryItem
                            key={child.id}
                            category={child}
                            selectedCats={selectedCats}
                            toggleCategory={toggleCategory}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

const CategoryTree = ({ categories, selectedCats, toggleCategory }) => {
    const nestedCategories = buildCategoryTree(categories);

    return (
        <div className="category-wrapper">
            <ul>
                {nestedCategories.map(cat => (
                    <CategoryItem
                        key={cat.id}
                        category={cat}
                        selectedCats={selectedCats}
                        toggleCategory={toggleCategory}
                    />
                ))}
            </ul>
        </div>
    );
};



console.log('categories', categories)
console.log('product', product)
    return (
        <>
            <div className="page-title-wrapper">
                <div className="page-title">
                    <div className="title">Add Product</div>

                    <div className="des">
                        Lorem, ipsum dolor sit amet consectetur adipisicing
                        elit. Quas accusantium obcaecati labore nam quibusdam
                        minus.
                    </div>
                </div>
                <div className="buttons-wrapper">
                    <button className="admin-btn btn-blue">Draft</button>
                    <button
                        className="admin-btn btn-purple-bg"
                        onClick={createProduct}
                    >
                        Publish
                    </button>
                </div>
            </div>

            <div className="row">
                <div className="column w-10">
                    <div className="checklist-wrapper">
                        <div className="checklist-title">Checklist</div>
                        <ul>
                            <li className="checked">
                                <span></span> Name
                            </li>
                            <li className="checked">
                                <span></span> Image
                            </li>
                            <li className="checked">
                                <span></span> Price
                            </li>
                            <li>
                                <span></span> Name
                            </li>
                            <li>
                                <span></span> Image
                            </li>
                            <li>
                                <span></span> Price
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="column w-65">
                    {/* General information */}
                    <div className="card" id="card-general">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">General information</div>
                            </div>
                            <div className="right">
                                <i
                                    className="adminlib-pagination-right-arrow  arrow-icon"
                                    onClick={() => toggleCard('card-general')}
                                ></i>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">
                                        Product name
                                    </label>
                                    <BasicInput
                                        name="name"
                                        wrapperClass="setting-form-input"
                                        value={product.name}
                                        onChange={(e) =>
                                            handleChange('name', e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">
                                        Product short description
                                    </label>
                                    <TextArea
                                        name="short_description"
                                        wrapperClass="setting-from-textarea"
                                        inputClass="textarea-input"
                                        descClass="settings-metabox-description"
                                        value={product.short_description}
                                        onChange={(e) =>
                                            handleChange(
                                                'short_description',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">
                                        Product description
                                    </label>
                                    <TextArea
                                        name="description"
                                        wrapperClass="setting-from-textarea"
                                        inputClass="textarea-input"
                                        descClass="settings-metabox-description"
                                        value={product.description}
                                        onChange={(e) =>
                                            handleChange(
                                                'description',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">
                                        Product type
                                    </label>
                                    <SelectInput
                                        name="type"
                                        options={typeOptions}
                                        value={product.type}
                                        onChange={(selected) =>
                                            handleChange('type', selected.value)
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <div className="checkbox-wrapper">
                                        <div className="item">
                                            <input
                                                type="checkbox"
                                                checked={product.virtual}
                                                onChange={(e) =>
                                                    handleChange(
                                                        'virtual',
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                            Virtual
                                        </div>
                                        <div className="item">
                                            <input
                                                type="checkbox"
                                                checked={product.downloadable}
                                                onChange={(e) =>
                                                    handleChange(
                                                        'downloadable',
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                            Download
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Price and stock */}
                    <div className="card" id="card-price">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">Price and stock</div>
                            </div>
                            <div className="right">
                                <i
                                    className="adminlib-pagination-right-arrow  arrow-icon"
                                    onClick={() => toggleCard('card-price')}
                                ></i>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">
                                        Regular price
                                    </label>
                                    <BasicInput
                                        name="regular_price"
                                        wrapperClass="setting-form-input"
                                        value={product.regular_price}
                                        onChange={(e) =>
                                            handleChange(
                                                'regular_price',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="product-name">
                                        Sale price
                                    </label>
                                    <BasicInput
                                        name="sale_price"
                                        wrapperClass="setting-form-input"
                                        value={product.sale_price}
                                        onChange={(e) =>
                                            handleChange(
                                                'sale_price',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">SKU</label>
                                    <BasicInput
                                        name="sku"
                                        wrapperClass="setting-form-input"
                                        value={product.sku}
                                        onChange={(e) =>
                                            handleChange('sku', e.target.value)
                                        }
                                    />
                                </div>
                                {!product.manage_stock && (
                                    <div className="form-group">
                                        <label htmlFor="product-name">
                                            Stock Status
                                        </label>
                                        <SelectInput
                                            name="stock_status"
                                            options={stockStatusOptions}
                                            type="single-select"
                                            value={product.stock_status}
                                            onChange={(selected) =>
                                                handleChange(
                                                    'stock_status',
                                                    selected.value
                                                )
                                            }
                                        />
                                    </div>
                                )}
                                <div className="form-group">
                                    Stock management
                                    <MultiCheckBox
                                        wrapperClass="toggle-btn"
                                        inputWrapperClass="toggle-checkbox-header"
                                        inputInnerWrapperClass="toggle-checkbox"
                                        idPrefix="toggle-switch-manage-stock"
                                        type="checkbox"
                                        value={
                                            product.manage_stock
                                                ? ['manage_stock']
                                                : []
                                        }
                                        onChange={(e) => {
                                            const checked = (
                                                e as React.ChangeEvent<HTMLInputElement>
                                            ).target.checked;
                                            handleChange(
                                                'manage_stock',
                                                checked
                                            );
                                        }}
                                        options={[
                                            {
                                                key: 'manage_stock',
                                                value: 'manage_stock',
                                            },
                                        ]}
                                    />
                                </div>

                                <div className="form-group">
                                    Sold individually
                                    <MultiCheckBox
                                        wrapperClass="toggle-btn"
                                        inputWrapperClass="toggle-checkbox-header"
                                        inputInnerWrapperClass="toggle-checkbox"
                                        idPrefix="toggle-switch-manage-stock"
                                        type="checkbox"
                                        value={
                                            product.sold_individually
                                                ? ['sold_individually']
                                                : []
                                        }
                                        onChange={(e) => {
                                            const checked = (
                                                e as React.ChangeEvent<HTMLInputElement>
                                            ).target.checked;
                                            handleChange(
                                                'sold_individually',
                                                checked
                                            );
                                        }}
                                        options={[
                                            {
                                                key: 'sold_individually',
                                                value: 'sold_individually',
                                            },
                                        ]}
                                    />
                                </div>
                            </div>
                            {product.manage_stock && (
                                <>
                                    <div className="form-group-wrapper">
                                        <div className="form-group">
                                            <label htmlFor="product-name">
                                                Quantity
                                            </label>
                                            <BasicInput
                                                name="stock"
                                                wrapperClass="setting-form-input"
                                                value={product.stock}
                                                onChange={(e) =>
                                                    handleChange(
                                                        'stock',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="product-name">
                                                Allow backorders?
                                            </label>
                                            <SelectInput
                                                name="backorders"
                                                options={backorderOptions}
                                                type="single-select"
                                                value={product.backorders}
                                                onChange={(selected) =>
                                                    handleChange(
                                                        'backorders',
                                                        selected.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="product-name">
                                                Low stock threshold
                                            </label>
                                            <BasicInput
                                                name="low_stock_amount"
                                                wrapperClass="setting-form-input"
                                                value={product.low_stock_amount}
                                                onChange={(e) =>
                                                    handleChange(
                                                        'low_stock_amount',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">
                                        Product URL
                                    </label>
                                    <BasicInput
                                        name="address"
                                        wrapperClass="setting-form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="product-name">
                                        Button text
                                    </label>
                                    <BasicInput
                                        name="address"
                                        wrapperClass="setting-form-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {!product.virtual && (
                        <div className="card" id="card-shipping">
                            <div className="card-header">
                                <div className="left">
                                    <div className="title">Shipping</div>
                                </div>
                                <div className="right">
                                    <i
                                        className="adminlib-pagination-right-arrow  arrow-icon"
                                        onClick={() =>
                                            toggleCard('card-shipping')
                                        }
                                    ></i>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">
                                            Weight ({appLocalizer.weight_unit})
                                        </label>
                                        <BasicInput
                                            name="weight"
                                            wrapperClass="setting-form-input"
                                            value={product.weight}
                                            onChange={(e) =>
                                                handleChange(
                                                    'weight',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="product-name">
                                            Shipping classes
                                        </label>
                                        <SelectInput
                                            name="shipping_class"
                                            options={shippingClasses}
                                            value={product.shipping_class}
                                            onChange={(selected) =>
                                                handleChange(
                                                    'shipping_class',
                                                    selected.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">
                                            Dimensions (
                                            {appLocalizer.dimension_unit})
                                        </label>
                                        <BasicInput
                                            name="product_length"
                                            wrapperClass="setting-form-input"
                                            value={product.product_length}
                                            placeholder="Length"
                                            onChange={(e) =>
                                                handleChange(
                                                    'product_length',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name"> </label>
                                        <BasicInput
                                            name="product_width"
                                            wrapperClass="setting-form-input"
                                            value={product.product_width}
                                            placeholder="Width"
                                            onChange={(e) =>
                                                handleChange(
                                                    'product_width',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name"> </label>
                                        <BasicInput
                                            name="product_height"
                                            wrapperClass="setting-form-input"
                                            value={product.product_height}
                                            placeholder="Height"
                                            onChange={(e) =>
                                                handleChange(
                                                    'product_height',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {product.downloadable && (
                        <div className="card" id="card-downloadable">
                            <div className="card-header">
                                <div className="left">
                                    <div className="title">Downloadable</div>
                                </div>
                                <div className="right">
                                    <i
                                        className="adminlib-pagination-right-arrow  arrow-icon"
                                        onClick={() =>
                                            toggleCard('card-downloadable')
                                        }
                                    ></i>
                                </div>
                            </div>
                            <div className="card-body">

                                {product.downloads?.map((file, index) => (
                                    <div key={file.id} className="shipping-country-wrapper">
                                        <div className="shipping-country">
                                            <div className="country item">

                                                <BasicInput
                                                    name="file_name"
                                                    wrapperClass="setting-form-input"
                                                    value={file.name}
                                                    placeholder="File name"
                                                    onChange={(e) =>
                                                        updateDownloadableFile(file.id, "name", e.target.value)
                                                    }
                                                />

                                                <BasicInput
                                                    name="file_url"
                                                    wrapperClass="setting-form-input"
                                                    value={file.file}
                                                    placeholder="File URL"
                                                    onChange={(e) =>
                                                        updateDownloadableFile(file.id, "file", e.target.value)
                                                    }
                                                />

                                                <div
                                                    className="admin-btn btn-purple"
                                                    onClick={() => openMediaUploader(file.id)}
                                                >
                                                    Upload file
                                                </div>

                                                <div
                                                    className="delete-icon adminlib-delete"
                                                    onClick={() => removeDownloadableFile(file.id)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="admin-btn btn-purple-bg" onClick={addDownloadableFile}>
                                    <i className="adminlib-plus-circle-o"></i> Add new
                                </div>


                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">
                                            Download limit
                                        </label>
                                        <BasicInput
                                            name="download_limit"
                                            type="number"
                                            wrapperClass="setting-form-input"
                                            value={product.download_limit}
                                            onChange={(e) =>
                                                handleChange(
                                                    'download_limit',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="product-name">
                                            Download expiry
                                        </label>
                                        <BasicInput
                                            name="download_expiry"
                                            type="number"
                                            wrapperClass="setting-form-input"
                                            value={product.download_expiry}
                                            onChange={(e) =>
                                                handleChange(
                                                    'download_expiry',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* Variants start */}
                    <div className="card" id="card-variants">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">Variations</div>
                            </div>
                            <div className="right">
                                <i
                                    className="adminlib-pagination-right-arrow  arrow-icon"
                                    onClick={() => toggleCard('card-variants')}
                                ></i>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="card-title">
                                <div className="title">Attributes</div>
                                <div className="buttons">
                                    <div
                                        className="add-btn"
                                        onClick={() => {
                                            setAddAttribute(true);
                                        }}
                                    >
                                        <div className="i adminlib-plus-circle-o"></div>
                                        Add attribute
                                    </div>
                                </div>
                            </div>

                            <div className="attribute-wrapper">
                                <div className="attribute-box">
                                    <div className="name-wrapper">
                                        <div className="name">Colors</div>
                                        <div className="icons">
                                            <i className="adminlib-edit"></i>
                                            <i className="adminlib-delete"></i>
                                        </div>
                                    </div>
                                    <div className="value-wrapper">
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                        <span className="admin-badge blue">
                                            Green
                                        </span>
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                        <span className="admin-badge blue">
                                            Green
                                        </span>
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                    </div>
                                </div>

                                <div className="attribute-box">
                                    <div className="name-wrapper">
                                        <div className="name">Colors</div>
                                        <div className="icons">
                                            <i className="adminlib-edit"></i>
                                            <i className="adminlib-delete"></i>
                                        </div>
                                    </div>
                                    <div className="value-wrapper">
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                        <span className="admin-badge blue">
                                            Green
                                        </span>
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                        <span className="admin-badge blue">
                                            Green
                                        </span>
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                    </div>
                                </div>

                                <div className="attribute-box">
                                    <div className="name-wrapper">
                                        <div className="name">Colors</div>
                                        <div className="icons">
                                            <i className="adminlib-edit"></i>
                                            <i className="adminlib-delete"></i>
                                        </div>
                                    </div>
                                    <div className="value-wrapper">
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                        <span className="admin-badge blue">
                                            Green
                                        </span>
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                        <span className="admin-badge blue">
                                            Green
                                        </span>
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                    </div>
                                </div>

                                <div className="attribute-box">
                                    <div className="name-wrapper">
                                        <div className="name">Colors</div>
                                        <div className="icons">
                                            <i className="adminlib-edit"></i>
                                            <i className="adminlib-delete"></i>
                                        </div>
                                    </div>
                                    <div className="value-wrapper">
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                        <span className="admin-badge blue">
                                            Green
                                        </span>
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                        <span className="admin-badge blue">
                                            Green
                                        </span>
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                    </div>
                                </div>

                                <div className="attribute-box">
                                    <div className="name-wrapper">
                                        <div className="name">Colors</div>
                                        <div className="icons">
                                            <i className="adminlib-edit"></i>
                                            <i className="adminlib-delete"></i>
                                        </div>
                                    </div>
                                    <div className="value-wrapper">
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                        <span className="admin-badge blue">
                                            Green
                                        </span>
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                        <span className="admin-badge blue">
                                            Green
                                        </span>
                                        <span className="admin-badge blue">
                                            Red
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* variants */}
                            <div className="card-title">
                                <div className="title">Variants</div>
                                <div className="buttons">
                                    <div className="add-btn">
                                        <div className="i adminlib-plus-circle-o"></div>
                                        Generate variations
                                    </div>
                                    <div
                                        className="add-btn"
                                        onClick={() => {
                                            setAddvariant(true);
                                        }}
                                    >
                                        <div className="i adminlib-plus-circle-o"></div>
                                        Add variant
                                    </div>
                                </div>
                            </div>
                            <div className="variant-wrapper">
                                <div className="variant-box">
                                    <div className="variant-items">
                                        <div className="variant">
                                            <div className="value">Green</div>
                                            <div className="name">Color</div>
                                        </div>

                                        <div className="variant">
                                            <div className="value">XL</div>
                                            <div className="name">Size</div>
                                        </div>
                                        <div className="variant">
                                            <div className="value">Puma</div>
                                            <div className="name">Brand</div>
                                        </div>
                                    </div>
                                    <div className="product">
                                        <div className="image-section">
                                            <i className="adminlib-multi-product"></i>
                                        </div>
                                        <div className="details">
                                            <div className="sku">
                                                <b>SKU:</b> product86776
                                            </div>
                                            <div className="price">
                                                $299 - $199
                                            </div>
                                            <div className="stock">
                                                In stock - 20
                                            </div>
                                        </div>
                                    </div>
                                    <i
                                        className="admin-badge yellow adminlib-edit edit-icon"
                                        onClick={() => {
                                            setAddvariant(true);
                                        }}
                                    ></i>
                                </div>

                                <div className="variant-box">
                                    <div className="variant-items">
                                        <div className="variant">
                                            <div className="value">Green</div>
                                            <div className="name">Color</div>
                                        </div>

                                        <div className="variant">
                                            <div className="value">XL</div>
                                            <div className="name">Size</div>
                                        </div>
                                        <div className="variant">
                                            <div className="value">Puma</div>
                                            <div className="name">Brand</div>
                                        </div>
                                    </div>
                                    <div className="product">
                                        <div className="image-section">
                                            <i className="adminlib-multi-product"></i>
                                        </div>
                                        <div className="details">
                                            <div className="sku">
                                                <b>SKU:</b> product86776
                                            </div>
                                            <div className="price">
                                                $299 - $199
                                            </div>
                                            <div className="stock">
                                                In stock - 20
                                            </div>
                                        </div>
                                    </div>
                                    <i
                                        className="admin-badge yellow  adminlib-edit edit-icon"
                                        onClick={() => {
                                            setAddvariant(true);
                                        }}
                                    ></i>
                                </div>

                                <div className="variant-box">
                                    <div className="variant-items">
                                        <div className="variant">
                                            <div className="value">Green</div>
                                            <div className="name">Color</div>
                                        </div>

                                        <div className="variant">
                                            <div className="value">XL</div>
                                            <div className="name">Size</div>
                                        </div>
                                        <div className="variant">
                                            <div className="value">Puma</div>
                                            <div className="name">Brand</div>
                                        </div>
                                    </div>
                                    <div className="product">
                                        <div className="image-section">
                                            <i className="adminlib-multi-product"></i>
                                        </div>
                                        <div className="details">
                                            <div className="sku">
                                                <b>SKU:</b> product86776
                                            </div>
                                            <div className="price">
                                                $299 - $199
                                            </div>
                                            <div className="stock">
                                                In stock - 20
                                            </div>
                                        </div>
                                    </div>
                                    <i
                                        className="admin-badge yellow adminlib-edit edit-icon"
                                        onClick={() => {
                                            setAddvariant(true);
                                        }}
                                    ></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {AddAttribute && (
                        <CommonPopup
                            open={AddAttribute}
                            onClick={() => setAddAttribute(false)}
                            width="500px"
                            height="70%"
                            header={
                                <>
                                    <div className="title">
                                        <i className="adminlib-coupon"></i>
                                        Add Attribute
                                    </div>
                                    <p>
                                        Lorem ipsum dolor sit amet consectetur
                                        adipisicing elit. Earum sint, minus
                                        voluptates esse officia enim dolorem,
                                        eaque neque error doloremque praesentium
                                        facere quidem mollitia deleniti?
                                    </p>
                                    <i
                                        className="icon adminlib-close"
                                        onClick={() => setAddAttribute(false)}
                                    ></i>
                                </>
                            }
                        >
                            <div className="content">
                                {/* start left section */}
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="title">
                                            Attribute name
                                        </label>
                                        <div className="attribute-popup-wrapper">
                                            <div className="field-wrapper">
                                                <SelectInput
                                                    name="payment_method"
                                                    options={paymentOptions}
                                                    type="single-select"
                                                    size="80%"
                                                />
                                                {!showAddNew && (
                                                    <div
                                                        className="add-btn"
                                                        onClick={() =>
                                                            setShowAddNew(true)
                                                        }
                                                    >
                                                        <i className="adminlib-plus-circle-o"></i>{' '}
                                                        Add new
                                                    </div>
                                                )}
                                            </div>
                                            {showAddNew && (
                                                <div className="field-wrapper add-new-field">
                                                    <BasicInput
                                                        name="address"
                                                        wrapperClass="setting-form-input"
                                                    />
                                                    <div
                                                        className="admin-btn btn-purple-bg"
                                                        onClick={() =>
                                                            setShowAddNew(false)
                                                        }
                                                    >
                                                        <i className="adminlib-form-checkboxes"></i>{' '}
                                                        Save{' '}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="title">
                                            Attribute value
                                        </label>
                                        <div className="dropdown-field">
                                            <TextArea
                                                name="short_description"
                                                wrapperClass="setting-from-textarea"
                                                inputClass="textarea-input dropdown-input"
                                                descClass="settings-metabox-description"
                                                value={
                                                    product.short_description
                                                }
                                                onChange={(e) =>
                                                    handleChange(
                                                        'short_description',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <div className="input-dropdown">
                                                <ul>
                                                    <li>Red</li>
                                                    <li>Red</li>
                                                    <li>Red</li>
                                                    <li>Red</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="buttons-wrapper left">
                                    <div className="admin-btn btn-purple">
                                        Select all
                                    </div>
                                    <div className="admin-btn btn-red">
                                        Select none
                                    </div>
                                </div>
                            </div>
                        </CommonPopup>
                    )}

                    {Addvariant && (
                        <CommonPopup
                            open={Addvariant}
                            onClick={() => setAddvariant(false)}
                            width="40%"
                            height="90%"
                            header={
                                <>
                                    <div className="title">
                                        <i className="adminlib-coupon"></i>
                                        Add Variant
                                    </div>
                                    <p>
                                        Lorem ipsum dolor sit amet consectetur
                                        adipisicing elit. Earum sint, minus
                                        voluptates esse officia enim dolorem,
                                        eaque neque error doloremque praesentium
                                        facere quidem mollitia deleniti?
                                    </p>
                                    <i
                                        className="icon adminlib-close"
                                        onClick={() => setAddvariant(false)}
                                    ></i>
                                </>
                            }
                            footer={
                                <>
                                    <div className="admin-btn btn-red">
                                        Cancel
                                    </div>
                                    <div className="admin-btn btn-purple-bg">
                                        Save
                                    </div>
                                </>
                            }
                        >
                            <div className="content add-variant">
                                <div className="form-group-wrapper select-variations-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="">
                                            Select variations{' '}
                                        </label>
                                        <div className="select-wrapper">
                                            <span>#45</span>
                                            <SelectInput
                                                name="payment_method"
                                                options={paymentOptions}
                                                type="single-select"
                                                wrapperClass="variation-select"
                                                size="10rem"
                                            />
                                            <SelectInput
                                                name="payment_method"
                                                options={paymentOptions}
                                                type="single-select"
                                                wrapperClass="variation-select"
                                                size="10rem"
                                            />
                                            <SelectInput
                                                name="payment_method"
                                                options={paymentOptions}
                                                type="single-select"
                                                size="10rem"
                                                wrapperClass="variation-select"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <FileInput
                                            inputClass="form-input"
                                            name="image"
                                            type="hidden"
                                            size="medium"
                                            imageWidth={50}
                                            imageHeight={50}
                                            openUploader="Upload Image"
                                            buttonClass="admin-btn btn-purple"
                                            descClass="settings-metabox-description"
                                        />
                                    </div>
                                </div>
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">
                                            Regular price
                                        </label>
                                        <BasicInput
                                            name="address"
                                            wrapperClass="setting-form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">
                                            Sale price
                                        </label>
                                        <BasicInput
                                            name="address"
                                            wrapperClass="setting-form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">
                                            SKU
                                        </label>
                                        <BasicInput
                                            name="address"
                                            wrapperClass="setting-form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">
                                            Stock status
                                        </label>
                                        <SelectInput
                                            name="payment_method"
                                            options={paymentOptions}
                                            type="single-select"
                                            wrapperClass="variation-select"
                                        />
                                    </div>
                                </div>

                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <div className="checkbox-wrapper">
                                            <div className="item">
                                                <input
                                                    type="checkbox"
                                                    checked={product.virtual}
                                                // onChange={(e) => handleChange("virtual", e.target.checked)}
                                                />
                                                Enabled
                                            </div>
                                            <div className="item">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        product.downloadable
                                                    }
                                                // onChange={(e) => handleChange("downloadable", e.target.checked)}
                                                />
                                                Downloadable
                                            </div>
                                            <div className="item">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        product.downloadable
                                                    }
                                                // onChange={(e) => handleChange("downloadable", e.target.checked)}
                                                />
                                                Virtual
                                            </div>
                                            <div className="item">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        product.downloadable
                                                    }
                                                // onChange={(e) => handleChange("downloadable", e.target.checked)}
                                                />
                                                Manage stock
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">
                                            Description
                                        </label>
                                        <TextArea
                                            name="short_description"
                                            wrapperClass="setting-from-textarea"
                                            inputClass="textarea-input"
                                            descClass="settings-metabox-description"
                                            value={product.short_description}
                                            onChange={(e) =>
                                                handleChange(
                                                    'short_description',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">
                                            Commission Fixed
                                        </label>
                                        <BasicInput
                                            name="address"
                                            wrapperClass="setting-form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">
                                            Commission Percentage
                                        </label>
                                        <BasicInput
                                            name="address"
                                            wrapperClass="setting-form-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CommonPopup>
                    )}
                </div>

                {/* right column */}
                <div className="column w-35">
                    {/* ai assist */}
                    <div className="card" id="card-ai-assist">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">AI assist</div>
                            </div>
                            <div className="right">
                                <i
                                    className="adminlib-pagination-right-arrow  arrow-icon"
                                    onClick={() => toggleCard('card-ai-assist')}
                                ></i>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="ai-assist-wrapper">
                                <div className="suggestions-wrapper">
                                    <div className="suggestions-title">
                                        Suggestions
                                    </div>
                                    <div className="box">
                                        <span>
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipisicing elit. Nisi
                                            veniam doloremque omnis aspernatur
                                            similique alias vel illo ut,
                                            corrupti recusandae quo nulla,
                                            reprehenderit harum vitae!
                                        </span>
                                    </div>
                                    <div className="box">
                                        <span>
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipisicing elit. Nisi
                                            veniam doloremque omnis aspernatur
                                            similique alias vel illo ut,
                                            corrupti recusandae quo nulla,
                                            reprehenderit harum vitae!
                                        </span>
                                    </div>
                                </div>
                                <div className="sender-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Write the prompt or select an example"
                                    />
                                    <div className="icon-wrapper">
                                        <i className="adminlib-mail"></i>
                                        <i className="adminlib-send"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">Visibility</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-pagination-right-arrow  arrow-icon"></i>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="visibility">
                                        Visibility
                                    </label>

                                    <RadioInput
                                        name="visibility"
                                        idPrefix="visibility"
                                        type="radio"
                                        wrapperClass="settings-form-group-radio"
                                        inputWrapperClass="radio-basic-input-wrap"
                                        inputClass="setting-form-input"
                                        descClass="settings-metabox-description"
                                        activeClass="radio-select-active"
                                        radiSelectLabelClass="radio-label"
                                        options={[
                                            {
                                                key: 'vs1',
                                                value: 'shop_search',
                                                label: 'Shop and search results',
                                                name: 'visibility',
                                            },
                                            {
                                                key: 'vs2',
                                                value: 'shop_only',
                                                label: 'Shop only',
                                                name: 'visibility',
                                            },
                                            {
                                                key: 'vs3',
                                                value: 'search_only',
                                                label: 'Search results only',
                                                name: 'visibility',
                                            },
                                            {
                                                key: 'vs4',
                                                value: 'hidden',
                                                label: 'Hidden',
                                                name: 'visibility',
                                            },
                                        ]}
                                        value={visibility}
                                        onChange={(e) =>
                                            setVisibility(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Status</label>
                                    <div className="admin-badge green">
                                        Publish
                                    </div>
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">
                                        Publish
                                    </label>
                                    <CalendarInput
                                        wrapperClass=""
                                        inputClass=""
                                    // onChange={(range: any) => {
                                    //    updateFilter('date', {
                                    //       start_date: range.startDate,
                                    //       end_date: range.endDate,
                                    //    });
                                    // }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">Category</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-pagination-right-arrow  arrow-icon"></i>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="category-breadcrumb-wrapper">
                                <div className="category-breadcrumb">
                                    {printPath()}
                                </div>
                                {(selectedCat || selectedSub || selectedChild) && (
                                    <button
                                        onClick={resetSelection}
                                        className="admin-btn btn-red"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            <div className="form-group-wrapper">
                                <div className="category-wrapper" ref={wrapperRef}>
                                    <ul className="settings-form-group-radio">
                                        {demoData.map((cat) => (
                                            <li
                                                key={cat.id}
                                                className="category"
                                                style={{
                                                    display:
                                                        !selectedCat || selectedCat === cat.id ? "block" : "none",
                                                }}
                                            >
                                                <div className={`radio-basic-input-wrap ${selectedCat === cat.id ? "radio-select-active" : ""
                                                    }`}>
                                                    <input
                                                        type="radio"
                                                        name="category"
                                                        className="setting-form-input"
                                                        checked={selectedCat === cat.id}
                                                        onChange={() => handleCategoryClick(cat.id)}
                                                    />
                                                    <label htmlFor="">{cat.name} </label>
                                                </div>
                                                {selectedCat === cat.id && cat.children && (
                                                    <ul className="settings-form-group-radio">
                                                        {cat.children.map((sub) => (
                                                            <li
                                                                key={sub.id}
                                                                className="sub-category"
                                                                style={{
                                                                    display:
                                                                        !selectedSub || selectedSub === sub.id
                                                                            ? "block"
                                                                            : "none",
                                                                }}
                                                            >
                                                                <div className={`radio-basic-input-wrap ${selectedSub === sub.id ? "radio-select-active" : ""
                                                                    }`}>
                                                                    <input
                                                                        type="radio"
                                                                        name="sub-category"
                                                                        checked={selectedSub === sub.id}
                                                                        className="setting-form-input"
                                                                        onChange={() => handleSubClick(sub.id)}
                                                                    />
                                                                    <label> {sub.name} </label>
                                                                </div>
                                                                {/* CHILD LEVEL */}
                                                                {selectedSub === sub.id && sub.children && (
                                                                    <ul className="settings-form-group-radio">
                                                                        {sub.children.map((child) => (
                                                                            <li
                                                                                key={child.id}
                                                                                className="sub-category"
                                                                                style={{
                                                                                    display:
                                                                                        !selectedChild || selectedChild === child.id
                                                                                            ? "block"
                                                                                            : "none",
                                                                                }}
                                                                            >
                                                                                <div className={`radio-basic-input-wrap ${selectedChild === child.id ? "radio-select-active" : ""
                                                                                    }`}>
                                                                                    <input
                                                                                        type="radio"
                                                                                        name="child-category"
                                                                                        className="setting-form-input"
                                                                                        checked={selectedChild === child.id}
                                                                                        onChange={() => handleChildClick(child.id)}
                                                                                    />
                                                                                    <label htmlFor={child.id}> {child.name} </label>
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <CategoryTree
                                        categories={categories}
                                        selectedCats={selectedCats}
                                        toggleCategory={toggleCategory}
                                    />

                                </div>
                            </div>

                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label>Product Tags</label>

                                    <div className="tag-list">
                                        {product.tags?.map((tag) => (
                                            <span
                                                className="admin-badge blue"
                                                key={tag.id}
                                            >
                                                {tag.name}
                                                <span
                                                    onClick={() =>
                                                        setProduct(prev => ({
                                                            ...prev,
                                                            tags: prev.tags.filter(t => t.name !== tag.name),
                                                        }))
                                                    }
                                                >
                                                    <i className="delete-icon adminlib-cross"></i>
                                                </span>
                                            </span>
                                        ))}
                                    </div>

                                    <div
                                        className="dropdown-field"
                                    >
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) =>
                                                handleTagInput(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === 'Enter' &&
                                                addTag(tagInput)
                                            }
                                            placeholder="Type tag…"
                                            className="basic-input dropdown-input"
                                        />

                                        <button
                                            className="admin-btn btn-green"
                                            onClick={() => addTag(tagInput)}
                                        >
                                            Add
                                        </button>

                                        {suggestions.length > 0 && (
                                            <div className="input-dropdown">
                                                <ul>
                                                {suggestions.map((tag) => (
                                                    <li
                                                        key={tag.id || tag.name}
                                                        className="dropdown-item"
                                                        onClick={() =>
                                                            addTag(tag)
                                                        }
                                                    >
                                                        {tag.name}
                                                    </li>
                                                ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* image upload */}
                    <div className="card" id="card-image-upload">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">Upload image</div>
                            </div>
                            <div className="right">
                                <i
                                    className="adminlib-pagination-right-arrow  arrow-icon"
                                    onClick={() =>
                                        toggleCard('card-image-upload')
                                    }
                                ></i>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">
                                        Features Image
                                    </label>
                                    <FileInput
                                        type="hidden"
                                        imageSrc={featuredImage?.thumbnail}
                                        openUploader="Select Featured Image"
                                        buttonClass="admin-btn btn-purple"
                                        onButtonClick={openFeaturedUploader}
                                        onRemove={() => setFeaturedImage(null)}
                                        onReplace={openFeaturedUploader}
                                    />

                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">
                                        Product gallery
                                    </label>
                                    <div className="gallery-wrapper">
                                        {galleryImages.map((img, index) => (
                                            <FileInput
                                                key={img.id}
                                                type="hidden"
                                                imageSrc={img.thumbnail}
                                                openUploader="Replace Image"
                                                buttonClass="admin-btn btn-purple"
                                                onRemove={() => {
                                                    setGalleryImages(galleryImages.filter((i, idx) => idx !== index));
                                                }}
                                                onReplace={() => openGalleryUploader()}
                                            />
                                        ))}

                                        {/* Add more button */}
                                        <FileInput
                                            type="hidden"
                                            imageSrc={null}
                                            openUploader="Add Gallery Image"
                                            buttonClass="admin-btn btn-purple"
                                            onButtonClick={openGalleryUploader}
                                        />
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default AddProduct;
