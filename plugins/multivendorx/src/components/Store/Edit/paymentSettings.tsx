import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, ToggleSetting, getApiLink, SuccessNotice, BlockText } from 'zyra';

interface PaymentField {
	key: any;
	html: string | TrustedHTML;
	name: string;
	type?: string;
	label: string;
    placeholder?: string;
    options?: Array<{ key: string; label: string; value: string; }>; // Added for clarity
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

const PaymentSettings = ({ id, data }: { id: string|null; data: any }) => {
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
    const providerFields = selectedProvider?.fields || selectedProvider?.formFields || [];

	useEffect(() => {
		if (!id) return;

		// axios({
		// 	method: 'GET',
		// 	url: getApiLink(appLocalizer, `store/${id}`),
		// 	headers: { 'X-WP-Nonce': appLocalizer.nonce },
		// }).then((res) => {
		// 	const data = res.data || {};
		// 	setFormData((prev) => ({ ...prev, ...data }));
		// });

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

    // ✨ --- NEW: Logic to handle Stripe dependencies --- ✨
	useEffect(() => {
        // Ensure this logic only runs for the stripe marketplace provider
		if (formData.payment_method !== 'mvx_stripe_marketplace') {
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

	const handleAccChange = (value: string, name?: string) => {
		setFormData((prev) => {
			const updated = {
				...(prev || {}),
				[name || '']: value,
			};
			
			autoSave(updated);
			return updated;
		});
	};
    
    // ✨ --- NEW: Helper functions to get disabled options --- ✨
    const getDynamicOptions = (fieldKey: string) => {
        const field = providerFields.find((f) => f.key === fieldKey);
        if (!field || !field.options || formData.payment_method !== 'mvx_stripe_marketplace') {
            return field?.options || [];
        }

        const dashboardAccess = formData.dashboard_access;

        switch (fieldKey) {
            case 'onboarding_flow':
                if (dashboardAccess === 'full') {
                    return field.options.map(opt => ({ ...opt, disabled: opt.value !== 'hosted' }));
                }
                if (dashboardAccess === 'none') {
                    return field.options.map(opt => ({ ...opt, disabled: opt.value !== 'embedded' }));
                }
                return field.options.map(opt => ({...opt, disabled: false})); // Express supports both

            case 'charge_type':
                if (dashboardAccess === 'full') {
                    return field.options.map(opt => ({ ...opt, disabled: opt.value !== 'direct' }));
                }
                if (dashboardAccess === 'express' || dashboardAccess === 'none') {
                    return field.options.map(opt => ({ ...opt, disabled: opt.value === 'direct' }));
                }
                return field.options.map(opt => ({...opt, disabled: false}));

            default:
                return field.options;
        }
    };

	return (
		<>
			<SuccessNotice message={successMsg} />

			<div className="container-wrapper">
				<div className="card-wrapper w-65">
					<div className="card-content">
						<div className="card-title">Withdrawal Methods</div>
						<div className="form-group-wrapper">
							<div className="form-group">
								<ToggleSetting
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									description={
										(paymentOptions && paymentOptions.length === 0)
											? "You haven’t enabled any payment methods yet. Configure payout options to allow stores to receive their earnings."
											: ""
									}
									options={paymentOptions}
									value={formData.payment_method || ""}
									onChange={(value) => handleToggleChange(value, 'payment_method')}
								/>
							</div>
						</div>

						{providerFields.map((field, index) => {
                            // Render HTML (e.g., connect button)
							if (field.type === "html" && field.html) {
								return (
									<div
										key={`html-${index}`}
										className="form-group-wrapper"
										dangerouslySetInnerHTML={{ __html: field.html }}
									/>
								);
                            }
                            
                            // Render Toggle Settings
                            if (field.type === 'setting-toggle') {
                                return (
									<ToggleSetting
										key={field.key}
										description={field.desc}
										options={
										Array.isArray(field.options)
											? field.options.map((opt) => ({
											...opt,
											value: String(opt.value),
											}))
											: []
										}
										value={formData[field.key || ""] || ""}
										onChange={(value) => handleToggleChange(value, field.key)}
									/>
									);
                            }
							console.log(formData)
							// Default input field rendering
							return (
								<div className="form-group-wrapper" key={field.key}>
									<div className="form-group">
										<label htmlFor={field.key}>{field.label}</label>
										<BasicInput
											name={field.key || ""}
											type={field.type || "text"}
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											placeholder={field.placeholder || ""}
											value={formData[field.key]}
											onChange={handleChange}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</div>
				{/* Commission Amount */}
				<div className="card-wrapper w-35">
					<div className="card-content">
						<div className="card-title">
							Store-specific Commission
						</div>
						<BlockText
                            blockTextClass="settings-metabox-note"
                            value="If no store-specific commission is set, the global commission will automatically apply."// Text or HTML content to display inside the block (safe HTML injected).
                        />
						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="product-name">Fixed</label>
								<BasicInput preInsideText={"$"} postText={"+"} name="commission_fixed" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.commission_fixed} onChange={handleChange} />
							</div>

							<div className="form-group">
								<label htmlFor="product-name">Percentage</label>
								<BasicInput postInsideText={"%"} name="commission_percentage" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.commission_percentage} onChange={handleChange} />
							</div>
						</div>
					</div>
				</div>
				
			</div>
		</>
	);
};

export default PaymentSettings;