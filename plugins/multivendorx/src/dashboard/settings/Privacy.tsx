import { useEffect, useState } from 'react';
import axios from 'axios';
import {
	TextArea,
	getApiLink,
	SuccessNotice,
	Section,
	MultiCheckBox,
	FormGroupWrapper,
	FormGroup,
	Container,
	Column,
	Card,
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

			<Container>
				<Column row>
					<Card title="Store policy">
						<FormGroupWrapper>
							<TextArea
								name="store_policy"
								wrapperClass="setting-from-textarea"
								inputClass="textarea-input"
								descClass="settings-metabox-description"
								value={formData.store_policy}
								onChange={handleChange}
								usePlainText={false}
								tinymceApiKey={
									appLocalizer
										.settings_databases_value[
									'marketplace'
									]['tinymce_api_section'] ?? ''
								}
							/>
						</FormGroupWrapper>
					</Card>
					<Card title="Shipping policy">
						<FormGroupWrapper>
							<TextArea
								name="shipping_policy"
								wrapperClass="setting-from-textarea"
								inputClass="textarea-input"
								descClass="settings-metabox-description"
								value={formData.shipping_policy}
								onChange={handleChange}
								usePlainText={false}
								tinymceApiKey={
									appLocalizer
										.settings_databases_value[
									'marketplace'
									]['tinymce_api_section'] ?? ''
								}
							/>
						</FormGroupWrapper>
					</Card>
				</Column>
				<Column row>
					<Card title="Refund policy">
						<FormGroupWrapper>
							<TextArea
								name="refund_policy"
								wrapperClass="setting-from-textarea"
								inputClass="textarea-input"
								descClass="settings-metabox-description"
								value={formData.refund_policy}
								onChange={handleChange}
								usePlainText={false}
								tinymceApiKey={
									appLocalizer
										.settings_databases_value[
									'marketplace'
									]['tinymce_api_section'] ?? ''
								}
							/>
						</FormGroupWrapper>
					</Card>
					<Card title="Cancellation / return / exchange policy">
						<FormGroupWrapper>
							<TextArea
								name="cancellation_policy"
								wrapperClass="setting-from-textarea"
								inputClass="textarea-input"
								descClass="settings-metabox-description"
								value={formData.cancellation_policy}
								onChange={handleChange}
								usePlainText={false}
								tinymceApiKey={
									appLocalizer
										.settings_databases_value[
									'marketplace'
									]['tinymce_api_section'] ?? ''
								}
							/>
						</FormGroupWrapper>
					</Card>
				</Column>
			</Container>
			<Section key="section" hint="Deactivation" />

			{formData.deactivation_reason ? (
				<div>
					{__(
						"When you delete a channel, all messages from this channel will be removed from Slack immediately. This can't be undone. Keep in mind: Any files uploaded to this channel won't be removed. You can archive a channel instead without removing its messages.",
						'multivendorx'
					)}
				</div>
			) : (
				<>
					<FormGroupWrapper>
						<FormGroup
							label={__('Enable Deactivation', 'multivendorx')}
							htmlFor="enable_deactivation"
						>
							<MultiCheckBox
								wrapperClass="toggle-btn"
								descClass="settings-metabox-description"
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
								value={formData.enable_deactivation || []}
								onChange={(selected: any) => {
									const updated = {
										...formData,
										enable_deactivation: selected.target.value,
									};
									setFormData(updated);
									autoSave(updated);
								}}
							/>
						</FormGroup>
					</FormGroupWrapper>

					{formData.enable_deactivation && (
						<>
							<div className="form-group-wrapper">
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
											updateData.deactivation_reason || ''
										}
										onChange={handleChange}
									/>
								</div>
							</div>
							<div className="buttons-wrapper">
								<button className="admin-btn btn-purple">
									{__('Submit', 'multivendorx')}
								</button>
							</div>
						</>
					)}
				</>
			)}
		</>
	);
};

export default Privacy;
