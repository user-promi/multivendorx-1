import React, { useState, useRef } from 'react';
import 'zyra/build/index.css';
import { ExpandablePanelGroup } from 'zyra';
import { __ } from '@wordpress/i18n';
import img from '../../assets/images/multivendorx-logo.png';

const SetupWizard: React.FC = () => {
	// Required state for ExpandablePanelGroup
	const [value, setValue] = useState({});
	const settingChanged = useRef(false);

	// NEW: Wizard step control
	const [currentStep, setCurrentStep] = useState(0);

	const appLocalizer = (window as any).appLocalizer;

	const inputField = {
		key: 'setup_wizard',
		proSetting: false,
		apiLink: 'settings',
		moduleEnabled: true,
		dependentSetting: '',
		dependentPlugin: '',
		modal: [],
		buttonEnable: true,
	};

	const isProSetting = (pro: boolean) => pro === true;

	const methods = [
		{
			id: 'marketplace_setup',
			label: 'Configure Your Marketplace',
			icon: 'adminlib-storefront',
			desc: 'Configure basic settings for vendor stores.',
			countBtn: true,
			isWizardMode: true,
			openForm:true,
			formFields: [
				{
					key: 'marketplace_model',
					type: 'multi-select',
					selectType: 'single-select',
					label: __(
						'Choose Your Marketplace Model',
						'multivendorx'
					),
					options: [
						{
							key: 'general',
							label: __('General', 'multivendorx'),
							value: 'general',
						},
						{
							key: 'booking',
							label: __('Booking', 'multivendorx'),
							value: 'booking',
						},
						{
							key: 'rental',
							label: __('Rental', 'multivendorx'),
							value: 'rental',
						},
						{
							key: 'auction',
							label: __('Auction', 'multivendorx'),
							value: 'auction',
						},
						{
							key: 'subscription',
							label: __('Subscription', 'multivendorx'),
							value: 'subscription',
						},
					],
				},
				{
					key: 'product_types',
					type: 'multi-select',
					selectType: 'multi-select',
					label: __(
						'Choose Your Product Types',
						'multivendorx'
					),
					options: [
						{
							key: 'simple',
							label: __('Simple', 'multivendorx'),
							value: 'simple',
						},
						{
							key: 'variable',
							label: __('Variable', 'multivendorx'),
							value: 'variable',
						},
						{
							key: 'booking',
							label: __('Booking', 'multivendorx'),
							value: 'booking',
						},
						{
							key: 'rental',
							label: __('Rental', 'multivendorx'),
							value: 'rental',
						},
						{
							key: 'auction',
							label: __('Auction', 'multivendorx'),
							value: 'auction',
						},
					],
				},
				{
					key: 'wizardButtons',
					type: 'buttons',
					options: [
						{
							label: 'Back',
							action: 'back',
							btnClass: 'admin-btn btn-red',
						},
						{
							label: 'Next',
							action: 'next',
							btnClass: 'admin-btn btn-purple',
						},
					],
				},
			],
		},
		{
			id: 'store_setup',
			label: 'Configure Your Store',
			icon: 'adminlib-storefront',
			desc: 'Configure basic settings for vendor stores.',
			countBtn: true,
			isWizardMode: true,
			openForm:true,
			formFields: [
				{
					key: 'approve_store',
					type: 'setting-toggle',
					label: __(
						'New store registration approval',
						'multivendorx'
					),
					options: [
						{
							key: 'manually',
							label: __('Manual', 'multivendorx'),
							value: 'manually',
						},
						{
							key: 'automatically',
							label: __('Automatic', 'multivendorx'),
							value: 'automatically',
						},
					],
				},
				{
					key: 'store_selling_mode',
					type: 'setting-toggle',
					label: __(
						'Product listing model',
						'multivendorx'
					),
					options: [
						{
							key: 'default',
							label: __('Independent seller', 'multivendorx'),
							value: 'default',
						},
						{
							key: 'single_product_multiple_vendor',
							label: __('Co-listed products', 'multivendorx'),
							value: 'single_product_multiple_vendor',
						},
						{
							key: 'franchise',
							label: __('Franchise', 'multivendorx'),
							value: 'franchise',
							proSetting: true
						},
					],
				},
				{
					key: 'wizardButtons',
					type: 'buttons',
					options: [
						{
							label: 'Back',
							action: 'back',
							btnClass: 'admin-btn btn-red',
						},
						{
							label: 'Next',
							action: 'next',
							btnClass: 'admin-btn btn-purple',
						},
					],
				},
			],
		},
		{
			id: 'commission_setup',
			label: 'Commission Setup',
			icon: 'adminlib-storefront',
			desc: 'Configure basic settings for vendor stores.',
			countBtn: true,
			isWizardMode: true,
			openForm:true,
			formFields: [
				{
					key: 'commission_type',
					type: 'setting-toggle',
					label: __('Commission type', 'multivendorx'),
					settingDescription: __(
						'Choose how commissions should be calculated for your marketplace.',
						'multivendorx'
					),
					desc: __(
						'<ul><li>Store order based - Calculated on the full order amount of each store. Example: A customer buys from 3 stores → commission applies separately to each store’s order.</li><li>Per item based - Applied to each product in the order. Example: An order with 5 items → commission applies 5 times, once per item.</li></ul>',
						'multivendorx'
					),
					options: [
						{
							key: 'store_order',
							label: __('Store order based', 'multivendorx'),
							value: 'store_order',
						},
						{
							key: 'item',
							label: __('Per item based', 'multivendorx'),
							value: 'item',
						},
					],
				},
				{
					key: 'commission_value',
					type: 'nested',
					label: 'Commission value',
					single: true,
					desc: __(
						'Set global commission rates that apply to each individual item quantity. Commission will be calculated by multiplying the rate with the total number of items across all products in the order.',
						'multivendorx'
					),
					nestedFields: [
						{
							key: 'commission_fixed',
							type: 'number',
							preInsideText: __('$', 'multivendorx'),
							size: '8rem',
							preText: 'Fixed',
							postText: '+',
						},
						{
							key: 'commission_percentage',
							type: 'number',
							postInsideText: __('%', 'multivendorx'),
							size: '8rem',
						},
					],
				},
				{
					key: 'disbursement_order_status',
					type: 'multi-checkbox',
					label: __(
						'Eligible order statuses for store earning payout',
						'multivendorx'
					),
					settingDescription: __(
						'Select the order statuses after which earning will be added to the store wallet.',
						'multivendorx'
					),
					class: 'mvx-toggle-checkbox',
					options: [
						{
							key: 'completed',
							label: __('Completed', 'multivendorx'),
							value: 'completed',
						},
						{
							key: 'delivered',
							label: __('Delivered', 'multivendorx'),
							value: 'delivered',
							proSetting: true,
						},
						{
							key: 'processing',
							label: __('Processing', 'multivendorx'),
							value: 'processing',
						},
						{
							key: 'shipped',
							label: __('Shipped', 'multivendorx'),
							value: 'shipped',
							proSetting: true,
						},
					],
					selectDeselect: true,
				},
				{
					key: 'wizardButtons',
					type: 'buttons',
					options: [
						{
							label: 'Back',
							action: 'back',
							btnClass: 'admin-btn btn-red',
						},
						{
							label: 'Finish',
							action: 'next',
							btnClass: 'admin-btn btn-purple',
							redirect: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=modules`,
						},
					],
				},
			],
		},
	];

	const proSettingChanged = (pro: boolean) => {
		console.log('Pro setting change triggered', pro);
	};

	const updateSetting = (key: string, data: any) => {
		setValue(data);
	};

	const hasAccess = () => true;

	return (
		<div className="wizard-container">
			<div>
				<div className="welcome-wrapper">
					<img src={img} alt="" />
					<h4 className="wizard-title">
						Welcome to the MultivendorX family!
					</h4>
					<div className="des">
						Thank you for choosing MultiVendorX! This quick setup
						wizard will help you configure the basic settings and
						have your marketplace ready in no time. It’s completely
						optional and shouldn’t take longer than five minutes.
					</div>
				</div>

				<ExpandablePanelGroup
					key={inputField.key}
					name={inputField.key}
					proSetting={isProSetting(inputField.proSetting ?? false)}
					proSettingChanged={() =>
						proSettingChanged(inputField.proSetting ?? false)
					}
					apilink={String(inputField.apiLink)}
					appLocalizer={appLocalizer}
					methods={methods}
					buttonEnable={inputField.buttonEnable}
					moduleEnabled={inputField.moduleEnabled}
					value={value}
					onChange={(data: any) => {
						if (hasAccess()) {
							settingChanged.current = true;
							updateSetting(inputField.key, data);
						}
					}}
					isWizardMode={true}
					wizardIndex={currentStep}
					setWizardIndex={setCurrentStep}
				/>

				{/* <div className="welcome-wrapper">
                    <div className="wizard-title">! Well Done</div>
                    <div className="des">Thank you for choosing MultiVendorX!</div>
                </div> */}
			</div>
		</div>
	);
};

export default SetupWizard;
