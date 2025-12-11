import axios from 'axios';
import { useEffect, useState } from 'react';
import {
	BasicInput,
	DynamicRowSetting,
	getApiLink,
	SuccessNotice,
	ToggleSetting,
} from 'zyra';
import ShippingRatesByCountry from './ShippingRatesByCountry';
import DistanceByZoneShipping from './DistanceByZoneShipping';
import { __ } from '@wordpress/i18n';

const ShippingDelivery = () => {
	const [formData, setFormData] = useState<{ [key: string]: any }>({}); // Use 'any' for simplicity here
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	useEffect(() => {
		if (!appLocalizer.store_id) return;

		axios
			.get(getApiLink(appLocalizer, `store/${appLocalizer.store_id}`), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((res) => {
				const data = res.data || {};

				// Step 2a: parse distance_rules
				if (typeof data.distance_rules === 'string') {
					try {
						data.distance_rules = JSON.parse(data.distance_rules);
					} catch (err) {
						data.distance_rules = []; // fallback to empty array
					}
				}

				// Optional: parse multivendorx_shipping_rates if needed
				if (typeof data.multivendorx_shipping_rates === 'string') {
					try {
						data.multivendorx_shipping_rates = JSON.parse(
							data.multivendorx_shipping_rates
						);
					} catch (err) {
						data.multivendorx_shipping_rates = [];
					}
				}

				setFormData((prev) => ({ ...prev, ...data }));
			});
	}, [appLocalizer.store_id]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		const updated = { ...formData, [name]: value };
		setFormData(updated);
		autoSave(updated);
	};

	const handleToggleChange = (value: string, name?: string) => {
		setFormData((prev) => {
			const updated = {
				...(prev || {}),
				[name || 'shipping_options']: value,
			};
			autoSave(updated);
			return updated;
		});
	};

	const autoSave = (updatedData: Record<string, unknown>) => {
		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
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
			{/* Only show ToggleSetting if shipping_methods has options */}
			{appLocalizer.shipping_methods &&
				appLocalizer.shipping_methods.length > 0 && (
					<>
						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="">
									{__('Method Type', 'multivendorx')}
								</label>
								<ToggleSetting
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									description={__(
										'Choose your preferred shipping method.',
										'multivendorx'
									)}
									options={appLocalizer.shipping_methods}
									value={formData.shipping_options || ''}
									onChange={(value: any) =>
										handleToggleChange(
											value,
											'shipping_options'
										)
									}
								/>
							</div>
						</div>

						{/* Zone by Shipping */}
						{formData.shipping_options === 'shipping_by_zone' && (
							<DistanceByZoneShipping />
						)}

						{/* Country-wise shipping */}
						{formData.shipping_options ===
							'shipping_by_country' && (
							<>
								<div className="form-group-title-wrapper">
									<div className="title">
										{__(
											'Default Shipping Rules',
											'multivendorx'
										)}
									</div>
									<div className="des">
										{__(
											'Set base rates that apply to all orders',
											'multivendorx'
										)}
									</div>
								</div>

								{/* Default Shipping Price */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="multivendorx_shipping_type_price">
											{__(
												'Default Shipping Price ($)',
												'multivendorx'
											)}
										</label>
										<BasicInput
											type="number"
											name="multivendorx_shipping_type_price"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											placeholder="0.00"
											value={
												formData.multivendorx_shipping_type_price ||
												''
											}
											onChange={handleChange}
										/>
										<div className="settings-metabox-description">
											{__(
												'This is the shipping cost applied to every order.',
												'multivendorx'
											)}
										</div>
									</div>
								</div>

								{/* Per Product Additional Price */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="multivendorx_additional_product">
											{__(
												'Per Product Additional Price ($)',
												'multivendorx'
											)}
										</label>
										<BasicInput
											type="number"
											name="multivendorx_additional_product"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											placeholder="0.00"
											value={
												formData.multivendorx_additional_product ||
												''
											}
											onChange={handleChange}
										/>
										<div className="settings-metabox-description">
											{__(
												'This amount will be added to the Default Shipping Price for each additional product type in the cart.',
												'multivendorx'
											)}
										</div>
									</div>
								</div>

								{/* Per Qty Additional Price */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="multivendorx_additional_qty">
											{__(
												'Per Qty Additional Price ($)',
												'multivendorx'
											)}
										</label>
										<BasicInput
											type="number"
											name="multivendorx_additional_qty"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											placeholder="0.00"
											value={
												formData.multivendorx_additional_qty ||
												''
											}
											onChange={handleChange}
										/>
										<div className="settings-metabox-description">
											{__(
												'This amount will be added to the Default Shipping Price for each additional quantity of the same product.',
												'multivendorx'
											)}
										</div>
									</div>
								</div>

								{/* Free Shipping Minimum Order Amount */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="free_shipping_amount">
											{__(
												'Free Shipping Minimum Order Amount ($)',
												'multivendorx'
											)}
										</label>
										<BasicInput
											type="number"
											name="free_shipping_amount"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											placeholder={__(
												'NO Free Shipping',
												'multivendorx'
											)}
											value={
												formData.free_shipping_amount ||
												''
											}
											onChange={handleChange}
										/>
										<div className="settings-metabox-description">
											{__(
												"If the customer's order total exceeds this amount, shipping becomes free. Leave empty if you do not want to offer free shipping.",
												'multivendorx'
											)}
										</div>
									</div>
								</div>

								{/* Local Pickup Cost */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="local_pickup_cost">
											{__(
												'Local Pickup Cost ($)',
												'multivendorx'
											)}
										</label>
										<BasicInput
											type="number"
											name="local_pickup_cost"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											placeholder="0.00"
											value={
												formData.local_pickup_cost || ''
											}
											onChange={handleChange}
										/>
										<div className="settings-metabox-description">
											{__(
												'This is the fee customers need to pay if they choose Local Pickup as the delivery option.',
												'multivendorx'
											)}
										</div>
									</div>
								</div>

								<div className="form-group-title-wrapper">
									<div className="title">
										{__(
											'Country-Specific Rates',
											'multivendorx'
										)}
									</div>
									<div className="des">
										{__(
											'Country-specific rates will be added to the Default Shipping Price. If state/region rates are defined, the final shipping cost will be State Rate + Default Shipping Price.',
											'multivendorx'
										)}
									</div>
								</div>
								<ShippingRatesByCountry />
							</>
						)}

						{/* Distance-based Shipping */}
						{formData.shipping_options ===
							'shipping_by_distance' && (
							<>
								<div className="form-group-title-wrapper">
									<div className="title">
										{__(
											'Distance-wise Shipping Configuration',
											'multivendorx'
										)}
									</div>
								</div>

								{/* Default Cost */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="distance_default_cost">
											{__(
												'Default Cost ($) *',
												'multivendorx'
											)}
										</label>
										<BasicInput
											type="number"
											name="distance_default_cost"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											placeholder="0.00"
											value={
												formData.distance_default_cost ||
												''
											}
											onChange={handleChange}
											min="0"
											step="0.01"
										/>
									</div>
								</div>

								{/* Max Distance */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="distance_max_km">
											{__(
												'Max Distance (km)',
												'multivendorx'
											)}
										</label>
										<BasicInput
											type="number"
											name="distance_max_km"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											placeholder="0"
											value={
												formData.distance_max_km || ''
											}
											onChange={handleChange}
											min="0"
											step="0.1"
										/>
									</div>
								</div>

								{/* Local Pickup Cost */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="distance_local_pickup_cost">
											{__(
												'Local Pickup Cost ($) (Optional)',
												'multivendorx'
											)}
										</label>
										<BasicInput
											type="number"
											name="distance_local_pickup_cost"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											placeholder="0.00"
											value={
												formData.distance_local_pickup_cost ||
												''
											}
											onChange={handleChange}
											min="0"
											step="0.01"
										/>
									</div>
								</div>

								{/* Distance–Cost Rules */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label>
											{__(
												'Distance–Cost Rules',
												'multivendorx'
											)}
										</label>
										<DynamicRowSetting
											keyName="distance_rules"
											addLabel={__(
												'Add Rule',
												'multivendorx'
											)}
											value={
												formData.distance_rules || []
											}
											template={{
												fields: [
													{
														key: 'max_distance',
														type: 'number',
														label: __(
															'Up to (km)',
															'multivendorx'
														),
														placeholder: __(
															'Up to km',
															'multivendorx'
														),
														step: '0.1',
														min: '0',
													},
													{
														key: 'cost',
														type: 'number',
														label: __(
															'Cost ($)',
															'multivendorx'
														),
														placeholder: __(
															'Cost $',
															'multivendorx'
														),
														step: '0.01',
														min: '0',
													},
												],
											}}
											onChange={(updatedRules: any[]) => {
												const updated = {
													...formData,
													distance_rules:
														updatedRules,
												};
												setFormData(updated);
												autoSave(updated);
											}}
										/>
									</div>
								</div>
							</>
						)}
					</>
				)}
		</>
	);
};

export default ShippingDelivery;
