import { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiLink, TextAreaUI, ChoiceToggleUI, NoticeManager, Container, Column, Card, FormGroupWrapper, FormGroup } from 'zyra';
import { __ } from '@wordpress/i18n';

const AdditionalInformation = () => {
	const id = appLocalizer.store_id;
	const [formData, setFormData] = useState<{ [key: string] }>({});
	const [stateOptions, setStateOptions] = useState<
		{ label: string; value: string }[]
	>([]);

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
		});
	}, [id]);

	// Fetch states when country changes
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

	// Handle text input changes
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			const updated = { ...prev, [name]: value };
			autoSave(updated);
			return updated;
		});
	};

	// Handle toggle changes (always save yes/no string)
	const handleToggleChange = (field: string, val) => {
		const newValue = typeof val === 'string' ? val : val?.value || 'no';
		setFormData((prev) => {
			const updated = { ...prev, [field]: newValue };
			autoSave(updated);
			return updated;
		});
	};

	// Auto-save to backend
	const autoSave = (updatedData: { [key: string] }) => {
		axios
			.put(getApiLink(appLocalizer, `store/${id}`), updatedData, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((res) => {
				if (res.data.success) {
					NoticeManager.add({
						title: __('Great!', 'multivendorx'),
						message: __('Store saved successfully!', 'multivendorx'),
						type: 'success',
						position: 'float',
					});
				}
			});
	};

	return (
		<>
			<Container general>
				<Column grid={8}>
					{/* Message to Buyer */}
					<Card title={__('Message to Buyer', 'multivendorx')}>
						<FormGroupWrapper>
							<TextAreaUI
								name="messageToBuyer"
								value={formData.messageToBuyer || ''}
								onChange={handleChange}
							/>
						</FormGroupWrapper>
					</Card>

					{/* Privacy Controls */}
					<Card title={__('Privacy Controls', 'multivendorx')}>
						<FormGroupWrapper>
							<FormGroup label={__('Hide Address', 'multivendorx')}>
								<ChoiceToggleUI
									options={[
										{
											key: 'yes',
											value: 'yes',
											label: __('Yes', 'multivendorx'),
										},
										{
											key: 'no',
											value: 'no',
											label: __('No', 'multivendorx'),
										},
									]}
									value={formData.hideAddress || 'no'}
									onChange={(val) =>
										handleToggleChange('hideAddress', val)
									}
								/>
							</FormGroup>

							<FormGroup label={__('Hide Phone', 'multivendorx')}>
								<ChoiceToggleUI
									options={[
										{
											key: 'yes',
											value: 'yes',
											label: __('Yes', 'multivendorx'),
										},
										{
											key: 'no',
											value: 'no',
											label: __('No', 'multivendorx'),
										},
									]}
									value={formData.hidePhone || 'no'}
									onChange={(val) =>
										handleToggleChange('hidePhone', val)
									}
								/>
							</FormGroup>

							<FormGroup label={__('Hide Phone', 'multivendorx')}>
								<ChoiceToggleUI
									options={[
										{
											key: 'yes',
											value: 'yes',
											label: __('Yes', 'multivendorx'),
										},
										{
											key: 'no',
											value: 'no',
											label: __('No', 'multivendorx'),
										},
									]}
									value={formData.hideEmail || 'no'}
									onChange={(val) =>
										handleToggleChange('hideEmail', val)
									}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>
				</Column>
			</Container>
		</>
	);
};

export default AdditionalInformation;
