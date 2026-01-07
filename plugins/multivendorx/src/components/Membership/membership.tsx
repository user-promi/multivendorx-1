import { useEffect, useState } from 'react';
import axios from 'axios';
import {
	BasicInput,
	TextArea,
	FileInput,
	SelectInput,
	getApiLink,
	SuccessNotice,
	MultiCheckBox,
	ToggleSetting,
	MultiCheckboxTable,
	AdminBreadcrumbs,
	NestedComponent,
	Container,
	Column,
	Card,
	FormGroupWrapper,
	FormGroup,
	AdminButton,
} from 'zyra';
import { __ } from '@wordpress/i18n';

const productTypeField = {
	key: 'product_types',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Choose the kinds of items stores can sell under this plan. Only selected types will be available when a store adds a new product.',
	options: [
		{ key: 'simple', value: 'simple', label: 'Simple product' },
		{ key: 'variable', value: 'variable', label: 'Variable Product' },
		{ key: 'external', value: 'external', label: 'External / Affiliate' },
		{ key: 'downloadable', value: 'downloadable', label: 'Downloadable Product' },
	],
};

const proFeatures = {
	key: 'pro_features',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Choose the kinds of items stores can sell under this plan. Only selected types will be available when a store adds a new product.',
	options: [
		{ key: 'invoice_management', value: 'invoice_management', label: 'Invoice Management' },
		{ key: 'store_staff', value: 'store_staff', label: 'Store Staff' },
		{ key: 'seo_tools', value: 'seo_tools', label: 'SEO Tools' },
		{ key: 'affiliate_program', value: 'affiliate_program', label: 'Affiliate Program' },
		{ key: 'advertisement', value: 'advertisement', label: 'Advertisement' },
		{ key: 'advanced_inventory', value: 'advanced_inventory', label: 'Advanced Inventory' },
		{ key: 'analytics_dashboard', value: 'analytics_dashboard', label: 'Analytics Dashboard' },
		{ key: 'shipping_management', value: 'shipping_management', label: 'Shipping Management' },
	],
};
const orderPermissionField = {
	key: 'order_permissions',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Select the order management actions vendors are allowed to perform',
	options: [
		{
			key: 'add-order-notes',
			value: 'Add Order Notes',
			label: 'Add Order Notes',
		},
		{
			key: 'export-order-data',
			value: 'Export Order Data',
			label: 'Export Order Data',
		},
	],
};
const vendorStorefrontField = {
	key: 'vendor_storefront_capabilities',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Select the storefront capabilities available to vendors',
	options: [
		{ key: 'edit_store_policies', value: 'edit_store_policies', label: 'Edit Store Policies' },
		{ key: 'send_messages', value: 'send_messages', label: 'Send Messages' },
		{ key: 'support_system', value: 'support_system', label: 'Support System' },
		{ key: 'vacation_mode', value: 'vacation_mode', label: 'Vacation Mode' },
	],
};

const categoryField = {
	key: 'store_categories',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Limit where stores can list their products. This helps you control what your marketplace focuses on.',
	options: [
		{ key: 'activewear', value: 'activewear', label: 'Activewear' },
		{ key: 'casual', value: 'casual', label: 'Casual' },
		{ key: 'clothing', value: 'clothing', label: 'Clothing' },
		{ key: 'accessories', value: 'accessories', label: 'Accessories' },
	],
};
const advancedFeaturesField = {
	key: 'advanced_features',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Enable advanced features for vendors',
	options: [
		{
			key: 'vendor-vacation',
			value: 'vendor-vacation',
			label: 'Vendor Vacation',
		},
		{
			key: 'advanced-report',
			value: 'advanced-report',
			label: 'Advanced Report',
		},
	],
};

const exportedOrderInfoField = {
	key: 'exported_order_information',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Select the information to include when exporting order data',
	options: [
		{
			key: 'customer-name-contact',
			value: 'customer-name-contact',
			label: 'Customer Name & Contact',
		},
		{
			key: 'billing-address',
			value: 'billing-address',
			label: 'Billing Address',
		},
		{
			key: 'shipping-address',
			value: 'shipping-address',
			label: 'Shipping Address',
		},
	],
};
const orderEmailInfoField = {
	key: 'order_email_information',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Select the information to include in order-related emails',
	options: [
		{
			key: 'customer-name-contact',
			value: 'customer-name-contact',
			label: 'Customer Name & Contact',
		},
		{
			key: 'billing-address',
			value: 'billing-address',
			label: 'Billing Address',
		},
		{
			key: 'shipping-address',
			value: 'shipping-address',
			label: 'Shipping Address',
		},
		{
			key: 'order-calculations',
			value: 'order-calculations',
			label: 'Order Calculations',
		},
	],
};

const field = {
	key: 'productPermissions',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Select the actions stores are allowed to perform.',
	options: [
		{
			key: 'submit_products',
			value: 'submit_products',
			label: 'Submit Products',
		},
		{
			key: 'publish_directly',
			value: 'publish_directly',
			label: 'Publish Directly',
		},
		{
			key: 'edit_published',
			value: 'edit_published',
			label: 'Edit Published',
		},
		{
			key: 'upload_media',
			value: 'upload_media',
			label: 'Upload Media',
		},
	],
};

const Membership = ({ id }: { id: string }) => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [pricingType, setPricingType] = useState<'free' | 'paid'>('free');
	const [productLimitsCard, setproductLimitsCard] = useState(false);
	const [orderManagement, setorderManagement] = useState(false);
	const [allowedProducts, setallowedProducts] = useState(false);
	const [productPermissions, setproductPermissions] = useState(false);
	const [additionalFeatures, setadditionalFeatures] = useState(false);
	const [featuredProducts, setfeaturedProducts] = useState(false);
	const [starFill, setstarFill] = useState(false);
	const [features, setFeatures] = useState<string[]>(['']);
	const [rules, setRules] = useState<any[]>([]);
	const [featuredEnabled, setFeaturedEnabled] = useState(false);

	const [imagePreviews, setImagePreviews] = useState<{
		[key: string]: string;
	}>({});
	const [stateOptions, setStateOptions] = useState<
		{ label: string; value: string }[]
	>([]);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	useEffect(() => {
		if (!id) {
			return;
		}
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
		});
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		const updated = { ...formData, [name]: value };
		setFormData(updated);
		autoSave(updated);
	};
	const handleMultiCheckboxChange =
		(fieldKey: string) => (e: any) => {
			if (Array.isArray(e)) {
				handleInputChange(fieldKey, e);
				return;
			}

			if (e?.target) {
				const val = String(e.target.value);
				const checked = !!e.target.checked;
				let current = normalizeValue(fieldKey);

				current = checked
					? [...new Set([...current, val])]
					: current.filter((v) => v !== val);

				handleInputChange(fieldKey, current);
			}
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
		});
	};
	const [setting, setSetting] = useState<Record<string, string[]>>({
		product_create: [],
		product_edit: [],
		product_delete: [],
	});

	// add membership start
	const addFeature = () => {
		setFeatures((prev) => [...prev, '']);
	};

	const updateFeature = (index: number, value: string) => {
		setFeatures((prev) =>
			prev.map((f, i) => (i === index ? value : f))
		);
	};

	const clearAll = () => {
		setFeatures(['']);
	};
	// add membership end


	// multicheckbox start
	const methodId = 'default';

	const [value, setValue] = useState<any>({
		default: {
			product_types: ['simple'],
			store_categories: ['activewear', 'casual'],
		},
	});

	const normalizeValue = (key: string) => {
		const v = value?.[methodId]?.[key];
		return Array.isArray(v) ? v : v ? [v] : [];
	};

	const handleInputChange = (
		key: string,
		newValue: string[]
	) => {
		setValue((prev: any) => ({
			...prev,
			[methodId]: {
				...(prev[methodId] || {}),
				[key]: newValue,
			},
		}));
	};

	const handleSelectDeselect = (field: any) => {
		const allValues = field.options.map((o: any) =>
			String(o.value)
		);

		const current = normalizeValue(field.key);
		const selectAll = current.length !== allValues.length;

		handleInputChange(
			field.key,
			selectAll ? allValues : []
		);
	};
	//  multicheckbox end

	// nastes component start
	const nestedFields = [
		{
			key: 'facilitator_fixed',
			type: 'number',
			preInsideText: __('$', 'multivendorx'),
			size: '7rem',
			preText: 'Fixed',
			postText: '+',
		},
		{
			key: 'facilitator_percentage',
			type: 'number',
			postInsideText: __('%', 'multivendorx'),
			size: '7rem',
		},
	];
	const subscription = [
		{
			key: 'disable_coupon_for_wholesale',
			type: 'checkbox',
			options: [
				{
					key: 'disable_coupon_for_wholesale',
					label: __('', 'catalogx'),
					value: 'disable_coupon_for_wholesale',
				},
			],
			look: 'toggle',
		},
		{
			key: 'facilitator_fixed',
			type: 'number',
			postInsideText: __('days', 'multivendorx'),
			size: '8rem',
			preText: 'for a duration of',
			dependent: {
				key: 'disable_coupon_for_wholesale',
				set: true,
				value: 'disable_coupon_for_wholesale',
			},
		},
	];
	const productUploadSettings = [
		{
			key: 'enable_product_limits',
			type: 'checkbox',
			options: [
				{
					key: 'enable_product_limits',
					label: __('', 'multivendorx'),
					value: 'enable_product_limits',
				},
			],
			look: 'toggle',
		},

		{
			key: 'max_products',
			type: 'number',
			size: '8rem',
			preText: 'with a maximum of',
			postInsideText: __('products', 'multivendorx'),
			dependent: {
				key: 'enable_product_limits',
				set: true,
				value: 'enable_product_limits',
			},
		},

		{
			key: 'extra_product_charge',
			type: 'number',
			size: '8rem',
			preText: 'Beyond this limit,charge',
			//postText: __('per product', 'multivendorx'),
			postInsideText: __('/products', 'multivendorx'),
			preInsideText: __('$', 'multivendorx'),
			dependent: {
				key: 'enable_product_limits',
				set: true,
				value: 'enable_product_limits',
			},
		},
		{
			key: 'images_per_product',
			type: 'number',
			size: '6rem',
			preText: 'Stores can also upload images',
			//postText: __('images per product', 'multivendorx'),
			postInsideText: __('/products', 'multivendorx'),
			dependent: {
				key: 'enable_product_limits',
				set: true,
				value: 'enable_product_limits',
			},
		},


		{
			key: 'product_images',
			type: 'checkbox',
			label: 'lflkksjsjajaaj',
			options: [
				{
					key: 'product_images',
					value: 'product_images',
				},
			],
			look: 'toggle',
			dependent: {
				key: 'enable_product_limits',
				set: true,
				value: 'enable_product_limits',
			},
		},
		{
			key: 'max_featured_products',
			type: 'number',
			size: '6rem',
			preText: 'allowed upto',
			dependent: {
				key: 'product_images',
				set: true,
				value: 'product_images',
			},
		},
	];

	const gracePeriod = [
		{
			key: 'disable_coupon',
			type: 'checkbox',
			options: [
				{
					key: 'disable_coupon',
					label: __('', 'catalogx'),
					value: 'disable_coupon',
				},
			],
			look: 'toggle',
		},
		{
			key: 'facilita',
			type: 'number',
			postInsideText: __('days', 'multivendorx'),
			size: '8rem',
			preText: 'for a duration of',
			dependent: {
				key: 'disable_coupon',
				set: true,
				value: 'disable_coupon',
			},
		},
		{
			key: 'facilitator',
			type: 'dropdown',
			size: '4rem',
			options: [
				{
					key: 'monday',
					label: __('Visible', 'multivendorx'),
					value: 'monday',
				},
				{
					key: 'tuesday',
					label: __('Hidden', 'multivendorx'),
					value: 'tuesday',
				},
				{
					key: 'wednesday',
					label: __('Hide Products', 'multivendorx'),
					value: 'wednesday',
				},
				{
					key: 'thursday',
					label: __('Set to Draft', 'multivendorx'),
					value: 'thursday',
				},
			],
			preText: 'During this period, products are',
			dependent: {
				key: 'disable_coupon',
				set: true,
				value: 'disable_coupon',
			},
		},
		{
			key: 'rule_type',
			type: 'select',
			options: [
				{ value: 'price', label: 'allowed' },
				{ value: 'quantity', label: 'Not allowed' }
			],
			dependent: {
				key: 'disable_coupon',
				set: true,
				value: 'disable_coupon',
			},
			preText: 'and product creation is',
		},
		{
			key: 'facilitator_fixed',
			type: 'dropdown',
			size: '5rem',
			options: [
				{
					key: 'monday',
					label: __('Keep Products Visible', 'multivendorx'),
					value: 'monday',
				},
				{
					key: 'tuesday',
					label: __('After 2 cycles', 'multivendorx'),
					value: 'tuesday',
				},
				{
					key: 'wednesday',
					label: __('Hide Products', 'multivendorx'),
					value: 'wednesday',
				},
				{
					key: 'thursday',
					label: __('Set to Draft', 'multivendorx'),
					value: 'thursday',
				},
			],
			preText: 'Change the store role to',
			dependent: {
				key: 'disable_coupon',
				set: true,
				value: 'disable_coupon',
			},
		},
	];

	return (
		<>
			<AdminBreadcrumbs
				activeTabIcon="adminfont-storefront"
				tabTitle="Add plan"
				description={
					'Manage marketplace stores with ease. Review, edit, or add new stores anytime.'
				}
			/>
			<SuccessNotice message={successMsg} />
			<Container>
				<Column grid={8}>
					<Card
						title="Plan details"
						action={
							<div className="field-wrapper">
								<ToggleSetting
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									options={[
										{
											key: 'draft',
											value: 'draft',
											label: __('Draft', 'multivendorx'),
										},
										{
											key: 'published',
											value: 'Published',
											label: __('Published', 'multivendorx'),
										},
									]}
								/>

								<div
									className="recommended-wrapper"
									onClick={() => setstarFill((prev) => !prev)}
								>
									<i
										className={`star-icon ${starFill ? 'adminfont-star' : 'adminfont-star-o'
											}`}
									></i>
									<div className="hover-text">
										Mark as recommended plan
									</div>
								</div>
							</div>
						}
					>
						<FormGroupWrapper>
							<FormGroup label="Name" htmlFor="product-name">
								<BasicInput
									name="name"
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									value={formData.name}
									onChange={handleChange}
								/>
							</FormGroup>
							<FormGroup label="Description" htmlFor="short_description">
								<TextArea
									name="short_description"
									wrapperClass="setting-from-textarea"
									inputClass="textarea-input"
									descClass="settings-metabox-description"
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>


					<Card title={__('What stores can sell', 'multivendorx')}
						desc={__('Decide what kind of items stores are allowed to list on your marketplace.', 'multivendorx')}
					>
						<FormGroupWrapper>
							<FormGroup label={__('Types of products allowed', 'multivendorx')} desc={__('Choose the kinds of items stores can sell under this plan. Only selected types will be available when a store adds a new product.', 'multivendorx')}>
								<MultiCheckBox
									khali_dabba={true}
									wrapperClass="checkbox-list-side-by-side"
									descClass="settings-metabox-description"
									description={productTypeField.desc}
									inputWrapperClass="toggle-checkbox-header"
									inputInnerWrapperClass="default-checkbox"
									inputClass={productTypeField.class}
									idPrefix="product-type"
									selectDeselect
									options={productTypeField.options}
									value={normalizeValue(productTypeField.key)}
									onChange={(e: any) => {
										if (Array.isArray(e)) {
											handleInputChange(productTypeField.key, e);
											return;
										}

										if (e?.target) {
											const val = String(e.target.value);
											const checked = !!e.target.checked;
											let current = normalizeValue(productTypeField.key);

											current = checked
												? [...new Set([...current, val])]
												: current.filter((v) => v !== val);

											handleInputChange(productTypeField.key, current);
										}
									}}
									onMultiSelectDeselectChange={() =>
										handleSelectDeselect(productTypeField)
									}
									proSetting={false}
									moduleChange={() => { }}
									modules={[]}
								/>
							</FormGroup>

							<FormGroup label={__('Categories stores can sell in', 'multivendorx')} className="border-top" desc={__('Limit where stores can list their products. This helps you control what your marketplace focuses on.')}>
								<MultiCheckBox
									wrapperClass="checkbox-list-side-by-side"
									descClass="settings-metabox-description"
									description={categoryField.desc}
									inputWrapperClass="toggle-checkbox-header"
									inputInnerWrapperClass="default-checkbox"
									inputClass={categoryField.class}
									idPrefix="category"
									selectDeselect
									options={categoryField.options}
									value={normalizeValue(categoryField.key)}
									onChange={(e: any) => {
										if (Array.isArray(e)) {
											handleInputChange(categoryField.key, e);
											return;
										}

										if (e?.target) {
											const val = String(e.target.value);
											const checked = !!e.target.checked;
											let current = normalizeValue(categoryField.key);

											current = checked
												? [...new Set([...current, val])]
												: current.filter((v) => v !== val);

											handleInputChange(categoryField.key, current);
										}
									}}
									onMultiSelectDeselectChange={() =>
										handleSelectDeselect(categoryField)
									}
									proSetting={false}
									moduleChange={() => { }}
									modules={[]}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>

					<Card title={__('What stores are allowed to do with products', 'multivendorx')}
						desc={__('Decide how much control stores have after adding a product — for example, whether they can publish it themselves or make changes later.', 'multivendorx')}
					>
						<FormGroupWrapper>
							<FormGroup
								label="Product permissions"
								htmlFor={vendorStorefrontField.key}
								desc={__('Select the actions stores are allowed to perform.', 'multivendorx')}
							>
								<MultiCheckBox
									wrapperClass="checkbox-list-side-by-side"
									descClass="settings-metabox-description"
									description={vendorStorefrontField.desc}
									inputWrapperClass="toggle-checkbox-header"
									inputInnerWrapperClass="default-checkbox"
									inputClass={vendorStorefrontField.class}
									idPrefix={vendorStorefrontField.key}
									selectDeselect
									options={vendorStorefrontField.options}
									value={normalizeValue(vendorStorefrontField.key)}
									onChange={handleMultiCheckboxChange(
										vendorStorefrontField.key
									)}
									onMultiSelectDeselectChange={() =>
										handleSelectDeselect(vendorStorefrontField)
									}
									proSetting={false}
									moduleChange={() => { }}
									modules={[]}
								/>
							</FormGroup>

							<FormGroup label="How many products a store can list" className="border-top" desc={__('Set the total number of products a store can have at one time.', 'multivendorx')}>
								<BasicInput
									name="name"
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									value={formData.name}
									onChange={handleChange}
									// postInsideText={'credits per month'}
									size="10rem"
									postText={'products maximum'}
								/>
							</FormGroup>

							<FormGroup label="Images per product" className="border-top" desc={__('Control how many images a store can add for each product.', 'multivendorx')}>
								<BasicInput
									name="name"
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									value={formData.name}
									onChange={handleChange}
									// postInsideText={'credits per month'}
									size="10rem"
									postText={'images maximum'}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>

					<Card title={__('MultiVendorX Pro Features', 'multivendorx')}
						desc={'Select which premium features stores can access with this plan.'}
					>
						<FormGroupWrapper>
							<FormGroup label="Available Pro Features" desc={__('Enable advanced features that give stores more control and capabilities.', 'multivendorx')}>
								<MultiCheckBox
									khali_dabba={true}
									wrapperClass="checkbox-list-side-by-side"
									descClass="settings-metabox-description"
									description={productTypeField.desc}
									inputWrapperClass="toggle-checkbox-header"
									inputInnerWrapperClass="default-checkbox"
									inputClass={productTypeField.class}
									idPrefix="product-type"
									selectDeselect
									options={proFeatures.options}
									value={normalizeValue(proFeatures.key)}
									onChange={(e: any) => {
										if (Array.isArray(e)) {
											handleInputChange(proFeatures.key, e);
											return;
										}

										if (e?.target) {
											const val = String(e.target.value);
											const checked = !!e.target.checked;
											let current = normalizeValue(proFeatures.key);

											current = checked
												? [...new Set([...current, val])]
												: current.filter((v) => v !== val);

											handleInputChange(proFeatures.key, current);
										}
									}}
									onMultiSelectDeselectChange={() =>
										handleSelectDeselect(proFeatures)
									}
									proSetting={false}
									moduleChange={() => { }}
									modules={[]}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>

					<Card title={__('How stores handle orders and customer information', 'multivendorx')}
						desc={__('Decide what stores can see and do after a customer places an order.', 'multivendorx')}
					>
						<FormGroupWrapper>
							<FormGroup label="Actions stores can take on orders"
								desc="Choose whether stores can add notes, download order details, or take other actions."
							>
								<MultiCheckBox
									wrapperClass="checkbox-list-side-by-side"
									descClass="settings-metabox-description"
									description={orderPermissionField.desc}
									inputWrapperClass="toggle-checkbox-header"
									inputInnerWrapperClass="default-checkbox"
									inputClass={orderPermissionField.class}
									idPrefix={orderPermissionField.key}
									selectDeselect
									options={orderPermissionField.options}
									value={normalizeValue(orderPermissionField.key)}
									onChange={handleMultiCheckboxChange(orderPermissionField.key)}
									onMultiSelectDeselectChange={() =>
										handleSelectDeselect(orderPermissionField)
									}
									proSetting={false}
									moduleChange={() => { }}
									modules={[]}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>

					<Card title={__('AI tools available to stores', 'multivendorx')}
						desc={'Decide whether stores can use AI tools and how much they can use them.'}
					>
						<FormGroupWrapper>
							<FormGroup label="AI for writing product details" htmlFor={exportedOrderInfoField.key} className="border-top" desc={__('AI for writing product details', 'multivendorx')}>
								<BasicInput
									name="name"
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									value={formData.name}
									onChange={handleChange}
									postInsideText={'credits per month'}
									size="8rem"
								/>
							</FormGroup>
							<FormGroup label="AI for writing product details" htmlFor={exportedOrderInfoField.key} className="border-top" desc={__('AI for writing product details', 'multivendorx')}>
								<BasicInput
									name="name"
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									value={formData.name}
									onChange={handleChange}
									postInsideText={'credits per month'}
									size="8rem"
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>

					<Card title={__('Extra tools for running a store', 'multivendorx')}
						desc={'Decide which additional tools stores get to manage their storefront and customers.'}
					>
						<FormGroupWrapper>
							<FormGroup
								label="Store management tools"
								htmlFor={vendorStorefrontField.key}
								desc={__('Choose whether stores can set store rules, communicate with buyers, pause sales, or offer customer support.', 'multivendorx')}
							>
								<MultiCheckBox
									wrapperClass="checkbox-list-side-by-side"
									descClass="settings-metabox-description"
									description={vendorStorefrontField.desc}
									inputWrapperClass="toggle-checkbox-header"
									inputInnerWrapperClass="default-checkbox"
									inputClass={vendorStorefrontField.class}
									idPrefix={vendorStorefrontField.key}
									selectDeselect
									options={vendorStorefrontField.options}
									value={normalizeValue(vendorStorefrontField.key)}
									onChange={handleMultiCheckboxChange(
										vendorStorefrontField.key
									)}
									onMultiSelectDeselectChange={() =>
										handleSelectDeselect(vendorStorefrontField)
									}
									proSetting={false}
									moduleChange={() => { }}
									modules={[]}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>
				</Column>

				<Column grid={4}>
					<Card title={__('Pricing', 'multivendorx')}>
						<FormGroupWrapper>
							<FormGroup
								label="Membership type"
								htmlFor="membership_type"
							>
								<ToggleSetting
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									options={[
										{
											key: 'free',
											value: 'free',
											label: __('Free', 'multivendorx'),
										},
										{
											key: 'paid',
											value: 'paid',
											label: __('Paid', 'multivendorx'),
										},
									]}
									value={pricingType}
									onChange={(value: string) =>
										setPricingType(value as 'free' | 'paid')
									}
								/>
							</FormGroup>
						</FormGroupWrapper>

						{pricingType === 'paid' && (
							<>
								<FormGroupWrapper>
									<FormGroup
										label="Sign up fee"
										htmlFor="signup_fee"
										cols={2}
									>
										<BasicInput
											name="signup_fee"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											value={formData.signup_fee}
											onChange={handleChange}
											pInsideText="$"
										/>
									</FormGroup>

									<FormGroup
										label="Recurring price"
										htmlFor="recurring_price"
										cols={2}
									>
										<BasicInput
											name="recurring_price"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											value={formData.recurring_price}
											onChange={handleChange}
										/>
									</FormGroup>
								</FormGroupWrapper>
								<div className="settings-metabox-note">
									<div className="metabox-note-wrapper">
										<i className="adminfont-info"></i>
										<div className="details">
											<p>Activate Stripe Marketplace or PayPal Marketplace module to use recurring subscriptions.</p>
											<p>Sign-up fee 0.05 or more is required to create subscriptions in Stripe/PayPal</p>
										</div>
									</div>
								</div>
								<div className="card-header">
									<div className="left">
										<div className="title">
											Trial Period
										</div>
										<div className="des">Configure optional trial period for new members</div>
									</div>
								</div>
								<FormGroupWrapper>
									<FormGroup
										label="Offer a trial period"
										htmlFor="trial_period"
									>
										<NestedComponent
											id="trial_period"
											fields={subscription}
											value={rules}
											single={true}
											addButtonLabel="Add Rule"
											deleteButtonLabel="Remove"
											onChange={(val) => setRules(val)}
										/>
									</FormGroup>
								</FormGroupWrapper>
								<div className="card-header">
									<div className="left">
										<div className="title">
											After Expiry
										</div>
										<div className="des">Define what happens when subscription expires</div>
									</div>
								</div>
								<FormGroupWrapper>
									<FormGroup
										label="Offer grace period"
										htmlFor="grace_period"
									>
										<NestedComponent
											id="grace_period"
											fields={gracePeriod}
											value={rules}
											single={true}
											addButtonLabel="Add Rule"
											deleteButtonLabel="Remove"
											onChange={(val) => setRules(val)}
										/>
									</FormGroup>
								</FormGroupWrapper>
							</>
						)}
					</Card>
					<Card title={__('Commission type', 'multivendorx')}>
						<FormGroupWrapper>
							<FormGroup
								label="Include All Add-ons"
								htmlFor={advancedFeaturesField.key}
							>
								<NestedComponent
									id="role_rules"
									fields={nestedFields}
									value={rules}
									single={true}
									addButtonLabel="Add Rule"
									deleteButtonLabel="Remove"
									onChange={(val) => setRules(val)}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>

					<Card title={__('Membership Perks', 'multivendorx')}>
						<div className="membership-features">
							<AdminButton
								buttons={[
									{
										icon: 'delete',
										text: 'Clear All',
										className: 'red',
										onClick: clearAll,
									},
									{
										icon: 'plus',
										text: 'Add Feature',
										className: 'purple',
										onClick: addFeature,
									},
								]}
							/>
							<div className="features-list">
								{features.map((feature, index) => (
									<div className="feature-row" key={index}>
										<span className={`feature-number`}>
											{index + 1}
										</span>
										<input
											type="text"
											className="basic-input"
											placeholder="e.g., Unlimited access to premium content"
											value={feature}
											onChange={(e) =>
												updateFeature(index, e.target.value)
											}
										/>
									</div>
								))}
							</div>
						</div>
					</Card>
				</Column>
			</Container>
		</>
	);
};

export default Membership;