import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, ToggleSetting, getApiLink } from 'zyra';

interface PaymentField {
  name: string;
  type?: string;
  label: string;
  placeholder?: string;
}

interface PaymentProvider {
  id: string;
  label: string;
  fields?: PaymentField[];
}

interface StorePaymentConfig {
  [key: string]: PaymentProvider;
}

const PaymentSettings = ({ id }: { id: string }) => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	const storePayment: StorePaymentConfig =
		(appLocalizer.all_store_settings as StorePaymentConfig) || {};

	const paymentOptions = Object.values(storePayment).map((p) => ({
		key: p.id,
		value: p.id,
		label: p.label,
	}));

	const selectedProvider = storePayment[formData.payment_method];

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

	const handleToggleChange = (value: string) => {
		setFormData((prev) => {
			const updated = {
				...(prev || {}),
				payment_method: value,
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
			{successMsg && (
				<div className="admin-notice-wrapper">
					<i className="admin-font adminlib-icon-yes"></i>
					<div className="notice-details">
						<div className="title">Great!</div>
						<div className="desc">{successMsg}</div>
					</div>
				</div>
			)}

			<div className="container-wrapper">
				<div className="card-wrapper width-65">
					<div className="card-content">
						<div className="card-title">Payment information</div>

						{/* Payment Method Toggle */}
						<div className="form-group-wrapper">
							<div className="form-group">
								<label>Payment Method</label>
								<ToggleSetting
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									description="Choose your preferred payment method."
									options={paymentOptions}
									value={formData.payment_method || ""}
									onChange={handleToggleChange}
									/>
							</div>
						</div>

						{/* Commission Amount */}
						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="commission_amount">Commission Amount</label>
								<BasicInput
									name="commission_amount"
									type="number"
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									description='To set vendor commission as 0 pass "0" in the Commission Amount filed'
									value={formData.commission_amount}
									onChange={handleChange}
								/>
							</div>
						</div>

						{selectedProvider?.fields?.map((field) => (
							<div className="form-group-wrapper" key={field.name}>
								<div className="form-group">
									<label htmlFor={field.name}>{field.label}</label>
									<BasicInput
									name={field.name}
									type={field.type || "text"}
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									placeholder={field.placeholder || ""}
									value={formData[field.name] || ""}
									onChange={handleChange}
									/>
								</div>
							</div>
						))}

					</div>
				</div>
			</div>
		</>
	);
};

export default PaymentSettings;