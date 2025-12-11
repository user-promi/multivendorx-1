import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
	BasicInput,
	FileInput,
	SelectInput,
	getApiLink,
	SuccessNotice,
} from 'zyra';

interface FormData {
	[key: string]: any;
}

const Appearance = () => {
	const [formData, setFormData] = useState<FormData>({});
	const [imagePreviews, setImagePreviews] = useState<{
		[key: string]: string;
	}>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const settings =
		appLocalizer.settings_databases_value['store-capability']
			?.edit_store_info_activation || [];

	const storeOptions = [
		{ value: 'static_image', label: 'Static Image' },
		{ value: 'slider_image', label: 'Slider Image' },
		{ value: 'video', label: 'Video' },
	];

	useEffect(() => {
		if (!appLocalizer.store_id) {
			console.error('Missing store ID or appLocalizer');
			return;
		}

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((res) => {
				const data = res.data || {};

				// Set all form data
				setFormData((prev) => ({ ...prev, ...data }));

				setImagePreviews({
					image: data.image || '',
					banner: data.banner || '',
				});
			})
			.catch((error) => {
				console.error('Error loading store data:', error);
			});
	}, [appLocalizer.store_id]);

	const runUploader = (key: string) => {
		if (settings.includes('store_images')) return;
		const frame = (window as any).wp.media({
			title: 'Select or Upload Image',
			button: { text: 'Use this image' },
			multiple: false,
		});

		frame.on('select', function () {
			const attachment = frame.state().get('selection').first().toJSON();
			const updated = { ...formData, [key]: attachment.url };

			setFormData(updated);
			setImagePreviews((prev) => ({
				...prev,
				[key]: attachment.url,
			}));
			autoSave(updated);
		});

		frame.open();
	};

	const autoSave = (updatedData: any) => {
		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		})
			.then((res) => {
				if (res.data.success) {
					setSuccessMsg('Store saved successfully!');
					setTimeout(() => setSuccessMsg(null), 2500);
				}
			})
			.catch((error) => {
				console.error('Save error:', error);
			});
	};

	// Helper to convert stored banner_type string to SelectInput value shape
	const bannerTypeValue = () => {
		const v = formData.banner_type || formData.stores || ''; // support legacy `stores` if present
		if (!v) return [];
		const found = storeOptions.find((o) => o.value === v);
		return found ? [found] : [];
	};

	return (
		<>
			<SuccessNotice message={successMsg} />

			<div className="form-group-wrapper">
				<div className="form-group">
					<label htmlFor="product-name">
						{__('Profile Image', 'multivendorx')}
					</label>
					<FileInput
						value={formData.image}
						inputClass="form-input"
						name="image"
						type="hidden"
						onButtonClick={() => runUploader('image')}
						imageWidth={75}
						imageHeight={75}
						openUploader={__('Upload Image', 'multivendorx')}
						imageSrc={imagePreviews.image}
						buttonClass="admin-btn btn-purple"
						descClass="settings-metabox-description"
						onRemove={() => {
							if (settings.includes('store_images')) return;
							const updated = { ...formData, image: '' };
							setFormData(updated);
							setImagePreviews((prev) => ({
								...prev,
								image: '',
							}));
							autoSave(updated);
						}}
						onReplace={() => runUploader('image')}
					/>
				</div>
			</div>

			<div className="form-group-wrapper">
				<div className="form-group">
					<label htmlFor="banner-type">
						{__('Banner / Cover Image', 'multivendorx')}
					</label>

					{/*IMPORTANT: use banner_type key and autoSave on change */}
					<SelectInput
						name="banner_type"
						type="single-select"
						options={storeOptions}
						value={formData.banner_type || ''}
						onChange={(newValue: any) => {
							if (settings.includes('store_images')) return;
							const selectedValue = newValue?.value || '';
							const updated = {
								...formData,
								banner_type: selectedValue,
							};
							setFormData(updated);
							autoSave(updated);
						}}
					/>
				</div>
			</div>
			{formData.banner_type === 'static_image' && (
				<div className="form-group-wrapper">
					<div className="form-group">
						<label htmlFor="product-name">
							{__('Static Banner Image', 'multivendorx')}
						</label>
						<FileInput
							value={formData.banner}
							inputClass="form-input"
							name="banner"
							type="hidden"
							onButtonClick={() => runUploader('banner')}
							imageWidth={300}
							imageHeight={100}
							openUploader={__('Upload Banner', 'multivendorx')}
							imageSrc={imagePreviews.banner}
							buttonClass="admin-btn btn-purple"
							descClass="settings-metabox-description"
							onRemove={() => {
								if (settings.includes('store_images')) return;
								const updated = { ...formData, banner: '' };
								setFormData(updated);
								setImagePreviews((prev) => ({
									...prev,
									banner: '',
								}));
								autoSave(updated);
							}}
							onReplace={() => runUploader('banner')}
						/>
					</div>
				</div>
			)}
			{formData.banner_type === 'slider_image' && (
				<div className="form-group-wrapper">
					<div className="form-group">
						{__(
							'Slider upload feature coming soon...',
							'multivendorx'
						)}
					</div>
				</div>
			)}

			{formData.banner_type === 'video' && (
				<div className="form-group-wrapper">
					<div className="form-group">
						<BasicInput
							name="banner_video"
							type="text"
							value={formData.banner_video || ''}
							onChange={(e: any) => {
								const updated = {
									...formData,
									banner_video: e.target.value,
								};
								setFormData(updated);
								autoSave(updated);
							}}
							readOnly={
								settings.includes('store_images') ? true : false
							}
						/>
					</div>
				</div>
			)}
		</>
	);
};

export default Appearance;
