import { useEffect, useState } from 'react';
import axios from 'axios';
import {
	TextArea,
	getApiLink,
	SuccessNotice,
	Section,
	MultiCheckBox,
} from 'zyra';
import { __ } from '@wordpress/i18n';

const Privacy = () => {
	const id = appLocalizer.store_id;
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [updateData, setUpdateData] = useState<{ [key: string]: any }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	// Fetch store data
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
			// setFormData({
			//     shipping_policy: data.shipping_policy || '',
			//     refund_policy: data.refund_policy || '',
			//     exchange_policy: data.exchange_policy || '',
			// });
		});
	}, [id]);

	// Auto-hide success message after 3 seconds
	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

	// Handle field changes
	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		const updated = { ...formData, [name]: value };

		if (name == 'deactivation_reason') {
			setUpdateData(updated);
		} else {
			setFormData(updated);
			autoSave(updated);
		}
	};

	// Auto-save to API
	const autoSave = (updatedData: { [key: string]: string }) => {
		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data?.success) {
				setSuccessMsg('Privacy settings saved successfully!');
				setFormData((prev) => ({
					...prev,
					deactivation_reason: updateData.deactivation_reason,
				}));
			}
		});
	};
	return (
		<>
			<SuccessNotice message={successMsg} />

			<div className="card-wrapper">
				<div className="card-content">
					<div className="form-group-wrapper">
						<div className="form-group">
							<label htmlFor="shipping_policy">
								{__('Shipping Policy', 'multivendorx')}
							</label>
							<TextArea
								name="shipping_policy"
								inputClass="textarea-input"
								value={formData.shipping_policy || ''}
								onChange={handleChange}
							/>
						</div>
					</div>

					<div className="form-group-wrapper">
						<div className="form-group">
							<label htmlFor="refund_policy">
								{__('Refund Policy', 'multivendorx')}
							</label>
							<TextArea
								name="refund_policy"
								inputClass="textarea-input"
								value={formData.refund_policy || ''}
								onChange={handleChange}
							/>
						</div>
					</div>

					<div className="form-group-wrapper">
						<div className="form-group">
							<label htmlFor="exchange_policy">
								{__(
									'Cancellation/Return/Exchange Policy',
									'multivendorx'
								)}
							</label>
							<TextArea
								name="exchange_policy"
								inputClass="textarea-input"
								value={formData.exchange_policy || ''}
								onChange={handleChange}
							/>
						</div>
					</div>
				</div>
			</div>

			<Section key="section" hint="Deactivation" />

			<div className="card-wrapper">
				<div className="card-content">
					<div className="form-group-wrapper">
						{formData.deactivation_reason ? (
							<div>
								{__(
									"When you delete a channel, all messages from this channel will be removed from Slack immediately. This can't be undone. Keep in mind: Any files uploaded to this channel won't be removed. You can archive a channel instead without removing its messages.",
									'multivendorx'
								)}
							</div>
						) : (
							<>
								<div className="form-group">
									<label htmlFor="store-description">
										{__(
											'Enable Deactivation',
											'multivendorx'
										)}
									</label>
									<MultiCheckBox
										wrapperClass="toggle-btn"
										descClass="settings-metabox-description"
										description=""
										inputWrapperClass="toggle-checkbox-header"
										inputInnerWrapperClass="toggle-checkbox"
										idPrefix="toggle-switch"
										key="enable_deactivation"
										options={[
											{
												key: 'enable_deactivation',
												value: 'enable_deactivation',
											},
										]}
										value={
											formData.enable_deactivation || []
										}
										onChange={(selected) => {
											setFormData((prev) => ({
												...prev,
												enable_deactivation:
													selected.target.value,
											}));
											autoSave({
												...formData,
												enable_deactivation:
													selected.target.value,
											});
										}}
									/>
								</div>

								{formData.enable_deactivation && (
									<>
										<div className="form-group">
											<label htmlFor="store-description">
												{__(
													'Deactivation Reason',
													'multivendorx'
												)}
											</label>
											<TextArea
												name="deactivation_reason"
												inputClass="textarea-input"
												value={
													updateData.deactivation_reason ||
													''
												}
												onChange={handleChange}
											/>
										</div>

										<div className="form-group">
											<button>
												{__('Submit', 'multivendorx')}
											</button>
										</div>
									</>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default Privacy;
