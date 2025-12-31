import { useEffect, useState } from 'react';
import axios from 'axios';
import {
	BasicInput,
	ToggleSetting,
	getApiLink,
	SuccessNotice,
	BlockText,
} from 'zyra';
import { __, sprintf } from '@wordpress/i18n';

interface PaymentField {
	key: any;
	html: string | TrustedHTML;
	name: string;
	type?: string;
	label: string;
	placeholder?: string;
	options?: Array<{ key: string; label: string; value: string }>; // Added for clarity
}

interface PaymentProvider {
	id: string;
	label: string;
	fields?: PaymentField[];
	formFields?: PaymentField[]; // Accommodate the PHP structure
}

interface StorePaymentConfig {
	[key: string]: PaymentProvider;
}

const PaymentSettings = ({ id, data }: { id: string | null; data: any }) => {
	const [formData, setFormData] = useState<{ [key: string]: any }>({}); // Use 'any' for simplicity here
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	const storePayment: StorePaymentConfig =
		(appLocalizer.all_store_settings as StorePaymentConfig) || {};

	const filteredStorePayment = Object.fromEntries(
		Object.entries(storePayment).filter(([_, value]) => value !== null)
	);

	const paymentOptions = Object.values(filteredStorePayment).map((p) => ({
		key: p.id,
		value: p.id,
		label: p.label,
	}));

	// The selectedProvider needs to check both 'fields' and 'formFields'
	const selectedProvider = storePayment[formData.payment_method];
	const providerFields =
		selectedProvider?.fields || selectedProvider?.formFields || [];

	const bankDetails =
		appLocalizer.settings_databases_value['payment-integration']
			?.payment_methods?.['bank-transfer']?.['bank_details'];

	useEffect(() => {
		if (!id) {
			return;
		}

		if (data) {
			setFormData(data);
		}
	}, [id]);

	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

	// NEW: Logic to handle Stripe dependencies
	useEffect(() => {
		// Ensure this logic only runs for the stripe marketplace provider
		if (formData.payment_method !== 'stripe-connect') {
			return;
		}

		const newFormData = { ...formData };
		const dashboardAccess = formData.dashboard_access;
		let changed = false;

		// Rule 1: Standard Dashboard ('full')
		if (dashboardAccess === 'full') {
			if (newFormData.onboarding_flow !== 'hosted') {
				newFormData.onboarding_flow = 'hosted';
				changed = true;
			}
			if (newFormData.charge_type !== 'direct') {
				newFormData.charge_type = 'direct';
				changed = true;
			}
		}
		// Rule 2: Express Dashboard ('express')
		else if (dashboardAccess === 'express') {
			if (newFormData.charge_type === 'direct') {
				newFormData.charge_type = 'destination'; // Default to destination
				changed = true;
			}
		}
		// Rule 3: No Dashboard / Custom ('none')
		else if (dashboardAccess === 'none') {
			if (newFormData.onboarding_flow !== 'embedded') {
				newFormData.onboarding_flow = 'embedded';
				changed = true;
			}
			if (newFormData.charge_type === 'direct') {
				newFormData.charge_type = 'destination'; // Default to destination
				changed = true;
			}
		}

		if (changed) {
			setFormData(newFormData);
			autoSave(newFormData);
		}
	}, [formData.dashboard_access, formData.payment_method]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;

		setFormData((prev) => {
			const updated = {
				...(prev || {}),
				[name]: value ?? '',
			};
			autoSave(updated);
			return updated;
		});
	};

	const handleToggleChange = (value: string, name?: string) => {
		setFormData((prev) => {
			const updated = {
				...(prev || {}),
				[name || 'payment_method']: value,
			};
			autoSave(updated);
			return updated;
		});
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

	return (
		<>
			<SuccessNotice message={successMsg} />

			<div className="container-wrapper">
				<div className="card-wrapper column-8">
					<div className="card-wrapper">
						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">
										{__(
											'Withdrawal methods',
											'multivendorx'
										)}
									</div>
								</div>
							</div>
							<div className="card-body">
								<div className="form-group-wrapper">
									<div className="form-group">
										<ToggleSetting
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											description={
												paymentOptions &&
												paymentOptions.length === 0
													? sprintf(
															/* translators: %s: link to payment integration settings */
															__(
																'You haven’t enabled any payment methods yet. Configure payout options <a href="%s">from here</a> to allow stores to receive their earnings.',
																'multivendorx'
															),
															'?page=multivendorx#&tab=settings&subtab=payment-integration'
														)
													: ''
											}
											options={paymentOptions}
											value={
												formData.payment_method || ''
											}
											onChange={(value) =>
												handleToggleChange(
													value,
													'payment_method'
												)
											}
										/>
									</div>
								</div>

								{bankDetails &&
									providerFields.map((field, index) => {
										const shouldRender =
											field.key === 'account_type' ||
											bankDetails.includes(field.key);

										if (!shouldRender) {
											return null; // skip rendering
										}

										// Render HTML (e.g., connect button)
										if (
											field.type === 'html' &&
											field.html
										) {
											return (
												<div
													key={`html-${index}`}
													className="form-group-wrapper"
													dangerouslySetInnerHTML={{
														__html: field.html,
													}}
												/>
											);
										}

										// Render Toggle Settings
										if (field.type === 'setting-toggle') {
											return (
												<div
													className="form-group-wrapper"
													key={field.key}
												>
													<div className="form-group">
														<label
															htmlFor={field.key}
														>
															{__(
																field.label,
																'multivendorx'
															)}
														</label>
														<ToggleSetting
															key={field.key}
															description={__(
																field.desc ||
																	'',
																'multivendorx'
															)}
															options={
																Array.isArray(
																	field.options
																)
																	? field.options.map(
																			(
																				opt
																			) => ({
																				...opt,
																				value: String(
																					opt.value
																				),
																			})
																		)
																	: []
															}
															value={
																formData[
																	field.key ||
																		''
																] || ''
															}
															onChange={(value) =>
																handleToggleChange(
																	value,
																	field.key
																)
															}
														/>
													</div>
												</div>
											);
										}

										// Default input field rendering
										return (
											<div
												className="form-group-wrapper"
												key={field.key}
											>
												<div className="form-group">
													<label htmlFor={field.key}>
														{__(
															field.label,
															'multivendorx'
														)}
													</label>
													<BasicInput
														name={field.key || ''}
														type={
															field.type || 'text'
														}
														wrapperClass="setting-form-input"
														descClass="settings-metabox-description"
														placeholder={
															field.placeholder
																? __(
																		field.placeholder,
																		'multivendorx'
																	)
																: ''
														}
														value={
															formData[field.key]
														}
														onChange={handleChange}
													/>
												</div>
											</div>
										);
									})}
							</div>
						</div>
					</div>
				</div>
				{/* Commission Amount */}
				<div className="card-wrapper column-4">
					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{__(
										'Store-specific commission',
										'multivendorx'
									)}
								</div>
							</div>
						</div>

						<div className="card-body">
							<BlockText
								blockTextClass="settings-metabox-note"
								value={sprintf(
									/* translators: %s: link to global commission settings */
									__(
										'If no store-specific commission is set, the <a href="%s">global commission</a> will automatically apply.',
										'multivendorx'
									),
									`${appLocalizer.plugin_url}settings&subtab=store-commissions`
								)}
							/>
							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">
										{__('Fixed', 'multivendorx')}
									</label>
									<BasicInput
										preInsideText="$"
										postText="+"
										name="commission_fixed"
										wrapperClass="setting-form-input"
										descClass="settings-metabox-description"
										value={formData.commission_fixed}
										onChange={handleChange}
									/>
								</div>

								<div className="form-group">
									<label htmlFor="product-name">
										{__('Percentage', 'multivendorx')}
									</label>
									<BasicInput
										postInsideText="%"
										name="commission_percentage"
										wrapperClass="setting-form-input"
										descClass="settings-metabox-description"
										value={formData.commission_percentage}
										onChange={handleChange}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default PaymentSettings;
