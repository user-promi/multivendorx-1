import { ChoiceToggleUI, ExpandablePanelUI, FormGroup, FormGroupWrapper, SectionUI, SelectInputUI } from "zyra";
import { __ } from '@wordpress/i18n';
import { useState, useCallback, useMemo } from "react";

const ProductCompliance: React.FC = () => {
    const [value, setValue] = useState({});
    const [expandableKey, setExpandableKey] = useState(Date.now());
    const [triggerWords, setTriggerWords] = useState([]); // For trigger words
    const [triggerAction, setTriggerAction] = useState('draft'); // For trigger action
    const [abuseReasons, setAbuseReasons] = useState({});

    // Existing tags (would come from API)
    const existingTags = [
        { name: 'electronics' },
        { name: 'clothing' },
        { name: 'food' },
    ];

    // Generate unique ID for new items
    const generateUniqueId = () => {
        return 'item_' + Math.random().toString(36).substr(2, 9);
    };

    const productOptions = [
        { label: 'Electronics', value: 'electronics' },
        { label: 'Clothing', value: 'clothing' },
        { label: 'Books', value: 'books' },
        { label: 'Furniture', value: 'furniture' },
    ];

    const getAllProductMethods = useMemo(() => {
        return Object.keys(value).map((key) => ({
            id: key,
            icon: 'single-product',
            label: value[key]?.product_name || key,
            isCustom: true,
            desc: `Configuration for ${value[key]?.product_name || key}`,
            formFields: [
                {
                    key: 'food_hold_listing',
                    type: 'checkbox',
                    label: __('Hold listing until reviewed', 'multivendorx'),
                    desc: __('Require review for food & health products', 'multivendorx'),
                    options: [
                        {
                            key: 'food_hold_listing',
                            value: 'food_hold_listing',
                        },
                    ],
                    look: 'toggle',
                },
                {
                    key: 'electronics_required_documents',
                    type: 'creatable-multi',
                    label: __('Required documents from seller', 'multivendorx'),
                    size: '30%',
                    options: [
                        { value: 'invoice', label: __('Invoice', 'multivendorx') },
                        { value: 'warranty_certificate', label: __('Warranty Certificate', 'multivendorx') },
                        { value: 'safety_compliance', label: __('Safety Compliance', 'multivendorx') },
                    ],
                    placeholder: __('Type document name…', 'multivendorx'),
                    formatCreateLabel: (val) => `Add "${val}"`,
                },
            ],
        }));
    }, [value]);

    const addNewProductCategory = useCallback((selectedValue) => {
        if (!selectedValue) return;

        const product = productOptions.find(p => p.value === selectedValue);
        if (!product) return;

        // Check if product already exists
        const alreadyExists = Object.values(value).some(
            v => v.product_id === product.value
        );

        if (alreadyExists) {
            return;
        }

        const newId = generateUniqueId();

        setValue(prev => ({
            ...prev,
            [newId]: {
                enable: true,
                product_id: product.value,
                product_name: product.label,
                food_hold_listing: false,
                electronics_required_documents: []
            }
        }));

        setExpandableKey(Date.now());
    }, [value, productOptions]);

    const handleAnyBundleChange = useCallback((newData) => {
        setValue(prev => {
            const updated = { ...prev };

            Object.keys(prev).forEach(key => {
                if (!newData[key]) {
                    delete updated[key];
                }
            });

            Object.keys(newData).forEach(key => {
                if (updated[key]) {
                    updated[key] = { ...updated[key], ...newData[key] };
                }
            });

            return updated;
        });
    }, []);

    const availableOptions = useMemo(() => {
        const addedProductIds = Object.values(value).map(v => v.product_id);

        return [
            {
                label: __('Select a category to prohibit', 'multivendorx'),
                value: '',
            },
            ...productOptions
                .filter(option => !addedProductIds.includes(option.value))
                .map((p) => ({
                    label: p.label,
                    value: p.value,
                })),
        ];
    }, [value, productOptions]);

    const handleAbuseReasonsChange = useCallback((newData) => {
        setAbuseReasons(prev => {
            const updated = { ...prev };

            Object.keys(prev).forEach(key => {
                if (!newData[key]) {
                    delete updated[key];
                }
            });

            Object.keys(newData).forEach(key => {
                if (updated[key]) {
                    updated[key] = { ...updated[key], ...newData[key] };
                } else {
                    updated[key] = newData[key];
                }
            });

            return updated;
        });
    }, []);

    return (
        <>
            <FormGroupWrapper>
                {/* First Expandable Panel (using modal) */}
                <FormGroup>
                    <ExpandablePanelUI
                        name="prohibited_product_categories"
                        methods={ratingsField.modal}
                        value={value}
                        onChange={setValue}
                        canAccess={true}
                        addNewBtn={true}
                        addNewTemplate={ratingsField.addNewTemplate}
                    />
                </FormGroup>

                {/* Trigger Words Section */}
                <SectionUI
                    title={__('Trigger words', 'multivendorx')}
                    desc={__('When a listing contains these words, the system flags it', 'multivendorx')}
                />

                <FormGroup row label={__('Trigger words', 'multivendorx')}>
                    <SelectInputUI
                        type="creatable-multi"
                        options={existingTags.map((tag) => ({
                            value: tag.name,
                            label: tag.name,
                        }))}
                        size="100%"
                        value={triggerWords}
                        onChange={(list) => {
                            setTriggerWords(list || []);
                        }}
                        placeholder={__('Type tag…', 'multivendorx')}
                        formatCreateLabel={(val) => `Add "${val}"`}
                        size="15rem"
                    />
                </FormGroup>

                <FormGroup row label={__('When triggered:', 'multivendorx')}>
                    <ChoiceToggleUI
                        options={[
                            {
                                key: 'draft',
                                value: 'draft',
                                label: __('Hold for approval', 'multivendorx'),
                            },
                            {
                                key: 'pending',
                                value: 'pending',
                                label: __('Notify only', 'multivendorx'),
                            },
                        ]}
                        value={triggerAction}
                        onChange={(val) => setTriggerAction(val)}
                    />
                </FormGroup>

                {/* Safety & Compliance Section */}
                <SectionUI
                    title={__('Safety & compliance', 'multivendorx')}
                    desc={__('For each product category, decide whether listings should be held for your review or just notify you. You can also require sellers to upload specific documents.', 'multivendorx')}
                />

                <FormGroup row label={__('Add Category', 'multivendorx')}>
                    <SelectInputUI
                        name="product_select"
                        type="single-select"
                        size="15rem"
                        options={availableOptions}
                        onChange={(selected) => {
                            if (selected) {
                                addNewProductCategory(selected);
                            }
                        }}
                    />
                </FormGroup>

                <FormGroup>
                    <ExpandablePanelUI
                        key={expandableKey}
                        name="safety_compliance_categories"
                        methods={getAllProductMethods}
                        value={value}
                        onChange={handleAnyBundleChange}
                        canAccess={true}
                        addNewBtn={false}
                    />
                </FormGroup>

                <SectionUI
                    title={__('Product Report Abuse', 'multivendorx')}
                    desc={__('Set rules and options for product abuse reporting.', 'multivendorx')}
                />

                <FormGroup row
                    label={__('Who can report', 'multivendorx')}
                    labelDes={__('Decide if only logged-in customers can submit abuse reports, or if reporting is open to everyone.', 'multivendorx')}
                    desc={__('<ul><li>logged-in customers - Only registered and logged-in customers can report products.This helps prevent spam and ensures accountability.</li><li>Anyone - Both logged-in customers and guests can report products. This gives the widest access but may increase the risk of spam submissions.</li></ul>', 'multivendorx')}>
                    <ChoiceToggleUI
                        options={[
                            {
                                key: 'logged_in',
                                label: __('logged-in customers', 'multivendorx'),
                                value: 'logged_in',
                            },
                            {
                                key: 'anyone',
                                label: __('Anyone', 'multivendorx'),
                                value: 'anyone',
                            },
                        ]}
                        // value={formData.status}
                        // onChange={(val: string) =>
                        //     handleChange('status', val)
                        // }
                    />
                </FormGroup>
                <FormGroup row
                    label={__('Reasons for abuse report', 'multivendorx')}
                    labelDes={__('Define one or more preset reasons that stores can choose from when submitting an abuse report.', 'multivendorx')}
                    desc={__('<b>Note</b>: Users can report products for various issues. When enabling logged-in user restriction, anonymous reports will be blocked. Abuse reports are reviewed by administrators who can take appropriate action including product removal or store penalties.', 'multivendorx')}>

                    <ExpandablePanelUI
                        name="abuse_report_reasons"
                        methods={abuseReportReasons.modal || []}
                        value={abuseReasons}
                        onChange={handleAbuseReasonsChange}
                        canAccess={true}
                        addNewBtn={true}
                        addNewTemplate={abuseReportReasons.addNewTemplate}
                    />
                </FormGroup>
            </FormGroupWrapper>
        </>
    );
};

// ratingsField definition outside component
const ratingsField = {
    key: 'prohibited_product_categories',
    type: 'expandable-panel',
    label: __('Prohibited product categories', 'multivendorx'),
    placeholder: __('Add prohibited product category', 'multivendorx'),
    settingDescription: __(
        'Define one or more product categories that are not allowed to be listed on your marketplace.',
        'multivendorx'
    ),
    modal: [
        {
            id: 'business-registration',
            label: 'Product title',
            mandatory: true,
            formFields: [],
            desc: 'Confirms the store is legally registered as a business entity.',
        },
        {
            id: 'trade-license',
            label: 'Product description',
            mandatory: true,
            formFields: [],
            desc: 'Validates that the store is authorized to operate and conduct business legally.',
        },
        {
            id: 'Specifications',
            label: 'Specifications',
            formFields: [],
            desc: 'Confirms the store’s physical or operational business address.',
        },
        {
            id: 'Manufacturer / importer details',
            label: 'Manufacturer / importer details',
            formFields: [],
            desc: 'Confirms the store’s physical or operational business address.',
        },
        {
            id: 'address',
            label: 'Ingredients / materials',
            isCustom: true,
            desc: 'What the product is made of',
        },
        {
            id: 'Usage instructions',
            label: 'Usage instructions',
            isCustom: true,
            desc: 'How to use or operate the product safely',
        },
    ],
    addNewBtn: true,
    addNewTemplate: {
        label: 'New Product Categories',
        editableFields: {
            title: true,
            description: false,
            mandatory: true,
        },
        showMandatoryCheckbox: true,
    },
};

const abuseReportReasons = {
    key: 'abuse_report_reasons',
    type: 'expandable-panel',
    label: __('Reasons for abuse report', 'multivendorx'),
    placeholder: __(
        'Add a reason for reporting a product',
        'multivendorx'
    ),
    settingDescription: __(
        'Define one or more preset reasons that stores can choose from when submitting an abuse report.',
        'multivendorx'
    ),
    desc: __(
        '<b>Note</b>: Users can report products for various issues. When enabling logged-in user restriction, anonymous reports will be blocked. Abuse reports are reviewed by administrators who can take appropriate action including product removal or store penalties.',
        'multivendorx'
    ),
    name: 'abuse_report_reasons',
    moduleEnabled: 'marketplace-compliance',
    addNewBtn: true,
    addNewTemplate: {
        label: 'New Reasons',
        editableFields: {
            title: true,
            description: false,
        },
        disableBtn: true,
    },
}

export default ProductCompliance;