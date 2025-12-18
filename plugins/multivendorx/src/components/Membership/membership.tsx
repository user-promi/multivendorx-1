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
} from 'zyra';
import { __ } from '@wordpress/i18n';

const Membership = ({ id }: { id: string }) => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [pricingType, setPricingType] = useState<'free' | 'paid'>('free');
	const [commissionType, setcommissionType] = useState<'prcentage' | 'fixed'>(
		'prcentage'
	);
	const [starFill, setstarFill] = useState(false);
	const [allowTrial, setAllowTrial] = useState(false);
	const [features, setFeatures] = useState<string[]>(['']);

	const [imagePreviews, setImagePreviews] = useState<{
		[key: string]: string;
	}>({});
	const [stateOptions, setStateOptions] = useState<
		{ label: string; value: string }[]
	>([]);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	const billingCycleNumber = [
		{ value: '', label: '1' },
		{ value: 'instock', label: '2' },
		{ value: 'outofstock', label: '3' },
		{ value: 'onbackorder', label: '5' },
		{ value: 'onbackorder', label: '6' },
		{ value: 'onbackorder', label: '7' },
		{ value: 'onbackorder', label: '8' },
		{ value: 'onbackorder', label: '9' },
		{ value: 'onbackorder', label: '10' },
		{ value: 'onbackorder', label: '11' },
		{ value: 'onbackorder', label: '12' },
	];
	const billingCycle = [
		{ value: '', label: 'Monthly' },
		{ value: 'instock', label: 'Quarterly' },
		{ value: 'outofstock', label: 'Yearly' },
		{ value: 'onbackorder', label: 'Lifetime' },
	];
	const billingCycleStop = [
		{ value: '', label: 'Never' },
		{ value: 'instock', label: 'After 1 cycle' },
		{ value: 'outofstock', label: 'After 2 cycles' },
		{ value: 'onbackorder', label: 'After 3 cycles' },
		{ value: 'onbackorder', label: 'After 6 cycles' },
		{ value: 'onbackorder', label: 'After 12 cycles' },
	];

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
		});
	};
	const [setting, setSetting] = useState<Record<string, string[]>>({
		product_create: [],
		product_edit: [],
		product_delete: [],
	});
	const storeTabSetting = {
		products: ['simple', 'variable', 'grouped'],
	};
	const columns = [
		{
			key: 'description',
			label: 'Description',
			type: 'description',
		},
		{
			key: 'product_create',
			label: 'Status',
		},
	];
	// const rows = [

	// 	{
	// 		key: 'simple',
	// 		label: 'Simple Product',
	// 		description:
	// 			'Allows vendors to create and manage simple products.',
	// 	},
	// 	{
	// 		key: 'variable',
	// 		label: 'Variable Product',
	// 		description:
	// 			'Allows vendors to manage products with variations.',
	// 	},
	// 	{
	// 		key: 'grouped',
	// 		label: 'Grouped Product',
	// 		description:
	// 			'Allows vendors to sell multiple related products together.',
	// 	},
	// ];

	const rows = {
		product_types: {
			label: 'Product Types',
			desc: 'Allows vendors to create and manage simple products.',
			capability: {
				booking: 'Booking Products',
				subscription: 'Subscription Products',
				bundle: 'Bundle Products',
			},
			capabilityDesc: {
				booking: 'Allow stores to sell appointment and booking-based products',
				subscription: 'Enable recurring subscription-based products with auto-renewal',
				bundle: 'Enable recurring subscription-based products with auto-renewal',
			},
		},
		store_management_tools: {
			label: 'Store Management Tools',
			desc: 'Allows vendors to manage products with variations.',
			capability: {
				import_export: 'Import / Export Tools',
				business_hours: 'Business Hours',
				vacation_mode: 'Vacation Mode',
				staff_manager: 'Staff Manager',
				store_analytics: 'Store Analytics',
				store_seo: 'Store SEO',
			},
			capabilityDesc: {
				import_export:
					'Bulk import and export products, orders, and store data',
				business_hours:
					'Set custom store operating hours and schedules',
				vacation_mode:
					'Temporarily close store with custom vacation message',
				staff_manager:
					'Add team members with role-based permissions',
				store_analytics:
					'Access detailed sales reports and performance insights',
				store_seo:
					'Optimize store pages for search engines',
			},
		},
		sales_marketing: {
			label: 'Sales & Marketing',
			desc: 'Allows vendors to manage products with variations.',
			capability: {
				wholesale_b2b: 'Wholesale',
				min_max_quantities: 'Min / Max Quantities',
				advertise_product: 'Advertise Product',
				store_inventory: 'Store Inventory',
				store_analytics: 'Store Analytics',

			},
			capabilityDesc: {
				wholesale_b2b:
					'Offer special pricing for bulk buyers and B2B customers',
				min_max_quantities:
					'Set minimum and maximum purchase quantities per product',
				advertise_product:
					'Promote products with featured listings and ads',
				store_inventory:
					'Advanced stock management and inventory tracking',
			},
		},
		payment_gateways: {
			label: 'Payment Gateways',
			desc: 'Allows vendors to manage products with variations.',
			capability: {
				paypal_marketplace: 'PayPal Marketplace',
				stripe_marketplace: 'Stripe Marketplace',
				marketplace_fee: 'Marketplace Fee',

			},
			capabilityDesc: {
				paypal_marketplace:
					'Enable PayPal for marketplace transactions',
				stripe_marketplace:
					'Process payments through Stripe Connect',
				marketplace_fee:
					'Apply custom transaction fees on sales',

			},
		},
		communication_documents: {
			label: 'Communication & Documents',
			desc: 'Allows vendors to manage products with variations.',
			capability: {
				invoice_packing_slip: 'Invoice & Packing Slip',
				live_chat: 'Live Chat',
			},
			capabilityDesc: {
				invoice_packing_slip:
					'Generate professional invoices and packing slips',
				live_chat:
					'Real-time customer support chat on store pages',
			},
		},
		third_party_integrations: {
			label: 'Third-Party Integrations',
			desc: 'Allows vendors to manage products with variations.',
			capability: {
				elementor: 'Elementor',
				buddypress: 'BuddyPress',
				advanced_custom_field: 'Advanced Custom Field',
			},
			capabilityDesc: {
				elementor:
					'Build custom store pages with Elementor page builder',
				buddypress:
					'Integrate with BuddyPress community features',
				advanced_custom_field:
					'Add custom fields to products and store pages',
			},
		},
	};

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
	return (
		<>
			<AdminBreadcrumbs
				activeTabIcon="adminlib-storefront"
				tabTitle="Add plan"
				description={
					'Manage marketplace stores with ease. Review, edit, or add new stores anytime.'
				}
			/>
			<SuccessNotice message={successMsg} />
			<div className="general-wrapper">
				<div className="container-wrapper">
					<div className="card-wrapper column w-65">
						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">Plan details</div>
								</div>
								<div className="right">
									<div className="field-wrapper">
										<ToggleSetting
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											options={[
												{
													key: 'draft',
													value: 'draft',
													label: __(
														'Draft',
														'multivendorx'
													),
												},
												{
													key: 'published',
													value: 'Published',
													label: __(
														'Published',
														'multivendorx'
													),
												},
											]}
											// value={formData.status}
											// onChange={handleToggleChange}
										/>
										<div
											className="des"
											onClick={() =>
												setstarFill((prev) => !prev)
											}
											style={{ cursor: 'pointer' }}
										>
											<i
												className={`star-icon ${starFill ? 'adminlib-star' : 'adminlib-star-o'}`}
											></i>
											Mark as recommended plan
										</div>
									</div>
								</div>
							</div>
							<div className="card-body">
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Name
										</label>
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
										<label htmlFor="product-name">
											Description
										</label>
										<TextArea
											name="short_description"
											wrapperClass="setting-from-textarea"
											inputClass="textarea-input"
											descClass="settings-metabox-description"
										/>
									</div>
								</div>
							</div>
						</div>

						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">Product Limits</div>
								</div>
							</div>
							<div className="card-body">

							</div>
						</div>

						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">Product Types</div>
								</div>
							</div>
							<div className="card-body">
								<MultiCheckboxTable
									rows={rows}
									columns={columns}
									setting={setting}
									enable={true}
								// onChange={handleChange}
								// storeTabSetting={storeTabSetting}
								// modules={modules}
								// moduleChange={handleModuleChange}
								// proSetting={false}
								// proChanged={handleProChanged}
								// khali_dabba={true}
								/>
							</div>
						</div>
					</div>

					<div className="card-wrapper column w-35">
						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">
										Pricing &Billing
									</div>
								</div>
							</div>
							<div className="card-body">
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Plan pricing type
										</label>
										<ToggleSetting
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											options={[
												{
													key: 'free',
													value: 'ree',
													label: __(
														'Free',
														'multivendorx'
													),
												},
												{
													key: 'paid',
													value: 'paid',
													label: __(
														'Paid',
														'multivendorx'
													),
												},
											]}
											value={pricingType}
											onChange={(value: string) =>
												setPricingType(
													value as 'free' | 'paid'
												)
											}
										/>
									</div>
									{pricingType === 'paid' && (
										<div className="form-group">
											<label htmlFor="product-name">Sign up fee</label>
											<BasicInput
												name="name"
												wrapperClass="setting-form-input"
												descClass="settings-metabox-description"
												value={formData.name}
												onChange={handleChange}
											/>
										</div>
									)}
								</div>
								{pricingType === 'paid' && (
									<>
										<div className="form-group-wrapper">
											<div className="form-group">
												<label htmlFor="product-name">Recurring price</label>
												<BasicInput
													name="name"
													wrapperClass="setting-form-input"
													descClass="settings-metabox-description"
													value={formData.name}
													size={"12rem"}
													onChange={handleChange}
													description={__(
														'You must enable/active MVX Stripe Marketplace or MVX PayPal Marketplace to use recurring subscription',
														'multivendorx'
													)}
												/>
											</div>
										</div>

										<div className="form-group-wrapper">
											<div className="form-group">
												<label htmlFor="product-name">
													Billing cycle stop
												</label>
												<SelectInput
													name="stock_status"
													options={billingCycleStop}
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

											<div className="form-group">
												<label htmlFor="product-name">
													Billing cycle
												</label>

												<div className="multi-field">
													<SelectInput
														name="stock_status"
														options={billingCycleNumber}
														type="single-select"
														size={"4rem"}
													// value={product.stock_status}
													// onChange={(selected) =>
													//     handleChange(
													//         'stock_status',
													//         selected.value
													//     )
													// }
													/>
													<SelectInput
														name="stock_status"
														options={billingCycle}
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
										</div>
										<div className="form-group-wrapper">
											<div className="form-group">
												<label>
													<input
														type="checkbox"
														checked={allowTrial}
														onChange={(e) => setAllowTrial(e.target.checked)}
													/>
													Please check this if you want to allow trial subscription.
												</label>
											</div>
										</div>
										<div className="form-group-wrapper">

											<div className="form-group">
												{allowTrial && (
													<>
														<label htmlFor="product-name">
															Billing cycle
														</label>

														<div className="multi-field">
															<SelectInput
																name="stock_status"
																options={billingCycleNumber}
																type="single-select"
																size={"4rem"}
															// value={product.stock_status}
															// onChange={(selected) =>
															//     handleChange(
															//         'stock_status',
															//         selected.value
															//     )
															// }
															/>
															<SelectInput
																name="stock_status"
																options={billingCycle}
																type="single-select"
																size={"14rem"}
															// value={product.stock_status}
															// onChange={(selected) =>
															//     handleChange(
															//         'stock_status',
															//         selected.value
															//     )
															// }
															/>
														</div>
													</>
												)}
											</div>
										</div>
									</>
								)}
							</div>
						</div>
						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">
										Commission rules
									</div>
								</div>
							</div>
							<div className="card-body">
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Commission type
										</label>
										<ToggleSetting
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											options={[
												{
													key: 'percentage',
													value: 'percentage',
													label: __(
														'Percentage',
														'multivendorx'
													),
												},
												{
													key: 'fixed',
													value: 'fixed',
													label: __(
														'Fixed',
														'multivendorx'
													),
												},
											]}
											value={commissionType}
											onChange={(value: string) =>
												setcommissionType(
													value as
														| 'percentage'
														| 'fixed'
												)
											}
										/>
									</div>
									{commissionType === 'percentage' && (
										<div className="form-group">
											<label htmlFor="product-name">
												Marketplace fees
											</label>
											<BasicInput
												name="name"
												postInsideText="%"
												wrapperClass="setting-form-input"
												descClass="settings-metabox-description"
												value={formData.name}
												onChange={handleChange}
												size="15rem"
											/>
										</div>
									)}
									{commissionType === 'fixed' && (
										<div className="form-group">
											<label htmlFor="product-name">
												Marketplace fees
											</label>
											<BasicInput
												name="name"
												postInsideText="fixed"
												wrapperClass="setting-form-input"
												descClass="settings-metabox-description"
												value={formData.name}
												onChange={handleChange}
												size="15rem"
											/>
										</div>
									)}
								</div>
							</div>
						</div>
						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">Membership Features</div>
								</div>
							</div>
							<div className="card-body">
								<div className="membership-features">

									<div className="buttons-wrapper">
										<button
											type="button"
											className="admin-btn btn-red"
											onClick={clearAll}
										>
											<i className="adminlib-delete"></i> Clear All
										</button>
										<button
											type="button"
											className="admin-btn btn-purple"
											onClick={addFeature}
										>
										<i className="adminlib-plus"></i>	Add Feature
										</button>
									</div>

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
							</div>
						</div>
						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">Product Limits</div>
								</div>
							</div>
							<div className="card-body">
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Total products
										</label>
										<BasicInput
											name="name"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											value={formData.name}
											onChange={handleChange}
										/>
									</div>
									<div className="form-group">
										<label htmlFor="product-name">
											Gallery images per product
										</label>
										<BasicInput
											name="slug"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											value={formData.slug}
											onChange={handleChange}
										/>
									</div>
								</div>

								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Featured products
										</label>
										<MultiCheckBox
											wrapperClass="toggle-btn"
											inputWrapperClass="toggle-checkbox-header"
											inputInnerWrapperClass="toggle-checkbox"
											idPrefix="toggle-switch-sold-individually"
											type="checkbox"
											// value={
											// 	product.sold_individually
											// 		? ['sold_individually']
											// 		: []
											// }
											// onChange={(e) =>
											// 	handleChange(
											// 		'sold_individually',
											// 		(
											// 			e as React.ChangeEvent<HTMLInputElement>
											// 		).target.checked
											// 	)
											// }
											options={[
												{
													key: 'sold_individually',
													value: 'sold_individually',
												},
											]}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div >
		</>
	);
};

export default Membership;
