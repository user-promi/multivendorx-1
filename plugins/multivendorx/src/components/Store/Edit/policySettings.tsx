import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, SuccessNotice, getApiLink } from 'zyra';

const PolicySettings = ({ id }: { id: string | null }) => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			const data = res.data || {};
			setFormData((prev) => ({ ...prev, ...data }));
		});
	}, [id]);

	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e?.target;
		console.log(name, value);

		setFormData((prev) => {
			const updated = {
				...(prev || {}),
				[name]: value ?? '',
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
				<div className="card-wrapper width-65">
					<div className="card-content">
						<div className="card-title">
							Shipping Policy
						</div>

						<div className="form-group-wrapper">
							<div className="form-group">
								<TextArea name="shipping_policy" wrapperClass="setting-from-textarea"
									inputClass="textarea-input"
									descClass="settings-metabox-description"
									value={formData.shipping_policy}
									onChange={handleChange}
									usePlainText={false}
									tinymceApiKey={appLocalizer.settings_databases_value['marketplace-settings']['tinymce_api_section'] ?? ''}
								/>
							</div>
						</div>

					</div>
					<div className="card-content">
						<div className="card-title">
							Refund Policy
						</div>

						<div className="form-group-wrapper">
							<div className="form-group">
								<TextArea name="refund_policy" wrapperClass="setting-from-textarea"
									inputClass="textarea-input"
									descClass="settings-metabox-description"
									value={formData.refund_policy}
									onChange={handleChange}
									usePlainText={false}
									tinymceApiKey={appLocalizer.settings_databases_value['marketplace-settings']['tinymce_api_section'] ?? ''}
								/>
							</div>
						</div>

					</div>
					<div className="card-content">
						<div className="card-title">
							Cancellation/Return/Exchange Policy
						</div>

						<div className="form-group-wrapper">
							<div className="form-group">
								<TextArea name="exchange_policy" wrapperClass="setting-from-textarea"
									inputClass="textarea-input"
									descClass="settings-metabox-description"
									value={formData.exchange_policy}
									onChange={handleChange}
									usePlainText={false}
									tinymceApiKey={appLocalizer.settings_databases_value['marketplace-settings']['tinymce_api_section'] ?? ''}
								/>
							</div>
						</div>

					</div>
				</div>
			</div>
		</>
	);
};

export default PolicySettings;