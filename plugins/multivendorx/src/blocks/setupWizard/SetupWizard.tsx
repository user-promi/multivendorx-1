import React, { useState, useRef } from 'react';
import 'zyra/build/index.css';
import { PaymentTabsComponent } from 'zyra';
import { __ } from '@wordpress/i18n';
import img from '../../assets/images/multivendorx-logo.png';

interface Step {
	title: string;
	description?: string;
	completed: boolean;
	actionText: string;
}

interface Section {
	title: string;
	steps: Step[];
}

const sectionsData: Section[] = [
	{
		title: 'Set Up The Basics',
		steps: [
			{
				title: 'Set Site Title & Tagline',
				description: 'Give your site a name and tagline.',
				completed: true,
				actionText: 'Set Up',
			},
			{
				title: 'Review Admin Email',
				description: 'Ensure your admin email is correct.',
				completed: false,
				actionText: 'Review',
			},
		],
	},
];

const SetupWizard: React.FC = () => {
	const [ sections, setSections ] = useState< Section[] >( sectionsData );
	const [ expandedSection, setExpandedSection ] = useState< number | null >(
		0
	);

	// Required state for PaymentTabsComponent
	const [ value, setValue ] = useState( {} );
	const settingChanged = useRef( false );

	// NEW: Wizard step control
	const [ currentStep, setCurrentStep ] = useState( 0 );

	const appLocalizer = ( window as any ).appLocalizer;

	const inputField = {
		key: 'payment_gateway',
		proSetting: true,
		apiLink: '/wp-json/payments/v1/settings',
		moduleEnabled: 'yes',
		dependentSetting: '',
		dependentPlugin: '',
		modal: [ 'paypal', 'stripe', 'razorpay' ],
		buttonEnable: true,
	};

	const isProSetting = ( pro: boolean ) => pro === true;

	const methods = [
		{
			id: 'store_setup',
			label: 'Configure Your Store',
			icon: 'adminlib-storefront',
			desc: 'Configure basic settings for vendor stores.',
			countBtn: true,
			isWizardMode: true,
			formFields: [
				{
					key: 'store_url',
					type: 'text',
					label: 'Store URL',
					placeholder: `Define vendor store URL`,
				},
				{
					key: 'multi_vendor_products',
					type: 'checkbox',
					label: 'Single Product Multiple Vendors',
					desc: 'Allows more than one store to sell the same product with their own price and stock.',
					default: false,
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
			label: 'Set Up Revenue Sharing',
			icon: 'adminlib-commission',
			desc: 'Choose how earnings are split between Admin and Vendors.',
			countBtn: true,
			isWizardMode: true,
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
							label: __( 'Manual', 'multivendorx' ),
							value: 'manually',
						},
						{
							key: 'automatically',
							label: __( 'Automatic', 'multivendorx' ),
							value: 'automatically',
						},
					],
				},
				{
					key: 'commission_type',
					type: 'setting-toggle',
					label: __( 'Commission type', 'multivendorx' ),
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
							label: __( 'Store order based', 'multivendorx' ),
							value: 'store_order',
						},
						{
							key: 'per_item',
							label: __( 'Per item based', 'multivendorx' ),
							value: 'per_item',
						},
					],
					nestedFields: [
						{
							key: 'paid_promotion_limit',
							type: 'setup',
							label: 'Advanced commission rules',
							desc: 'Set detailed commission rules by product, order, or store, including fees, taxes, and shipping.',
							link: `${ appLocalizer.site_url }/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
						},
					],
				},
				{
					key: 'paid_promotion_limit',
					type: 'setup',
					title: 'Advanced commission rules',
					desc: 'Set detailed commission rules by product, order, or store, including fees, taxes, and shipping.',
					link: `${ appLocalizer.site_url }/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
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
			id: 'store_permissions',
			label: 'Store Permissions',
			icon: 'adminlib-commission',
			desc: 'Control which features and actions are available to each store role.',
			countBtn: true,
			isWizardMode: true,
			formFields: [
				{
					key: 'products_fields',
					type: 'multi-checkbox',
					label: __( 'Edit product page blocks', 'multivendorx' ),
					settingDescription: __(
						'Control which product data fields are available to stores when creating or editing products.',
						'multivendorx'
					),
					class: 'mvx-toggle-checkbox',
					options: [
						{
							key: 'general',
							label: __( 'Manage Products', 'multivendorx' ),
							value: 'general',
						},
						{
							key: 'view_products',
							label: __( 'View Products', 'multivendorx' ),
							value: 'general',
						},
						{
							key: 'edit_products',
							label: __( 'Edit Products', 'multivendorx' ),
							value: 'general',
						},
						{
							key: 'delete_products',
							label: __( 'Delete Products', 'multivendorx' ),
							value: 'general',
						},
						{
							key: 'publish_products',
							label: __( 'Publish Products', 'multivendorx' ),
							value: 'general',
						},
						{
							key: 'upload_files',
							label: __( 'Upload Files', 'multivendorx' ),
							value: 'general',
						},
					],
					selectDeselect: true,
					nestedFields: [
						{
							key: 'paid_promotion_limit',
							type: 'setup',
							label: 'Advanced store capabilities',
							desc: 'Quickly manage additional store permissions and advanced features, including orders, coupons, analytics, and more.',
							link: `${ appLocalizer.site_url }/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=store-capability`,
						},
					],
				},
				{
					key: 'paid_promotion_limit',
					type: 'setup',
					label: 'Advanced store capabilities',
					desc: 'Quickly manage additional store permissions and advanced features, including orders, coupons, analytics, and more.',
					link: `${ appLocalizer.site_url }/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=store-capability`,
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
			label: 'Commission Setup',
			icon: 'adminlib-storefront',
			desc: 'Configure basic settings for vendor stores.',
			countBtn: true,
			isWizardMode: true,
			formFields: [
				{
					key: 'commission_percent',
					type: 'number',
					label: 'Commission Percentage',
					default: 80,
				},
				{
					key: 'commission_type',
					type: 'select',
					label: 'Commission Type',
					options: [
						{ label: 'Percentage', value: 'percentage' },
						{ label: 'Fixed', value: 'fixed' },
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
			id: 'vendor_capabilities',
			label: 'Configure Vendor Permissions',
			icon: 'adminlib-setting',
			desc: 'Control what dashboard sections and tools are available to active vendors.',
			countBtn: true,
			isWizardMode: true,
			formFields: [
				{
					key: 'product_caps',
					type: 'checkbox_group',
					label: 'Products',
					options: [
						{ label: 'Submit Products', value: 'submit_products' },
						{
							label: 'Publish Products',
							value: 'publish_products',
						},
						{
							label: 'Edit Published Products',
							value: 'edit_published_products',
						},
					],
				},
				{
					key: 'coupon_caps',
					type: 'checkbox_group',
					label: 'Coupons',
					options: [
						{ label: 'Submit Coupons', value: 'submit_coupons' },
						{ label: 'Publish Coupons', value: 'publish_coupons' },
						{
							label: 'Edit/Delete Published Coupons',
							value: 'edit_delete_coupons',
						},
					],
				},
				{
					key: 'media_caps',
					type: 'checkbox_group',
					label: 'Media',
					options: [
						{ label: 'Upload Media Files', value: 'upload_media' },
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
							label: 'Finish',
							action: 'finish',
							btnClass: 'admin-btn btn-purple',
							redirect: `${ appLocalizer.site_url }/wp-admin/admin.php?page=multivendorx#&tab=dashboard`,
						},
					],
				},
			],
		},
	];

	const proSettingChanged = ( pro: boolean ) => {
		console.log( 'Pro setting change triggered', pro );
	};

	const updateSetting = ( key: string, data: any ) => {
		setValue( data );
	};

	const hasAccess = () => true;

	return (
		<div className="wizard-container">
			<div>
				<div className="welcome-wrapper">
					<img src={ img } alt="" />
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

				<PaymentTabsComponent
					key={ inputField.key }
					name={ inputField.key }
					proSetting={ isProSetting(
						inputField.proSetting ?? false
					) }
					proSettingChanged={ () =>
						proSettingChanged( inputField.proSetting ?? false )
					}
					apilink={ String( inputField.apiLink ) }
					appLocalizer={ appLocalizer }
					methods={ methods }
					buttonEnable={ inputField.buttonEnable }
					value={ value }
					onChange={ ( data: any ) => {
						if ( hasAccess() ) {
							settingChanged.current = true;
							updateSetting( inputField.key, data );
						}
					} }
					isWizardMode={ true }
					wizardIndex={ currentStep }
					setWizardIndex={ setCurrentStep }
				/>

				{ /* <div className="welcome-wrapper">
                    <div className="wizard-title">! Well Done</div>
                    <div className="des">Thank you for choosing MultiVendorX!</div>
                </div> */ }
			</div>
		</div>
	);
};

export default SetupWizard;
