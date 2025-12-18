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
} from 'zyra';
import { __ } from '@wordpress/i18n';

const Membership = ({ id }: { id: string }) => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [pricingType, setPricingType] = useState<'free' | 'paid'>('free');
	const [commissionType, setcommissionType] = useState<'prcentage' | 'fixed'>('prcentage');
	const [starFill, setstarFill] = useState(false);

	const [imagePreviews, setImagePreviews] = useState<{
		[key: string]: string;
	}>({});
	const [stateOptions, setStateOptions] = useState<
		{ label: string; value: string }[]
	>([]);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	const billingCycle = [
		{ value: '', label: 'Monthly' },
		{ value: 'instock', label: 'Quarterly' },
		{ value: 'outofstock', label: 'Yearly' },
		{ value: 'onbackorder', label: 'Lifetime' },
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
		simple: {
			label: 'Simple Product',
			desc: 'Allows vendors to create and manage simple products.',
			capability: {
				create_simple_products: 'Create simple products',
				publish_simple_products: 'Publish simple products',
			},
			capabilityDesc: {
				create_simple_products: 'Allows vendors to create simple products',
				publish_simple_products: 'Allows vendors to publish simple products',
			},
		},

		variable: {
			label: 'Variable Product',
			desc: 'Allows vendors to manage products with variations.',
			capability: {
				create_variable_products: 'Create variable products',
				publish_variable_products: 'Publish variable products',
			},
			capabilityDesc: {
				create_variable_products:
					'Allows vendors to create variable products',
				publish_variable_products:
					'Allows vendors to publish variable products',
			},
		},
	};

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
											onClick={() => setstarFill((prev) => !prev)}
											style={{ cursor: 'pointer' }}
										>
											<i className={`star-icon ${starFill ? 'adminlib-star' : 'adminlib-star-o'}`}></i>
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
									<div className="title">Pricing &Billing</div>
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
											description={__(
												'Select the status of the announcement.',
												'multivendorx'
											)}
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
											onChange={(value: string) => setPricingType(value as 'free' | 'paid')}
										/>
									</div>
									{pricingType === 'paid' && (
										<div className="form-group">
											<label htmlFor="product-name">Price</label>
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
								<div className="form-group-wrapper">
									{pricingType === 'paid' && (
										<>
											<div className="form-group">
												<label htmlFor="product-name">
													Billing cycle
												</label>
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
											<div className="form-group">
												<label htmlFor="product-name">
													Validity duration
												</label>
												<BasicInput
													name="name"
													postInsideText="Days"
													wrapperClass="setting-form-input"
													descClass="settings-metabox-description"
													value={formData.name}
													onChange={handleChange}
													size="15rem"
												/>
											</div>
										</>
									)}
								</div>
							</div>
						</div>
						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">Commission rules</div>
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
											onChange={(value: string) => setcommissionType(value as 'percentage' | 'fixed')}
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
					</div>
				</div>
			</div>
		</>
	);
};

export default Membership;
