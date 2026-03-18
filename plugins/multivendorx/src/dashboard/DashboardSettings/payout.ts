import { __ } from '@wordpress/i18n';
import StripeEmbeddedOnboarding from './StripeEmbeddedOnboarding';
interface PaymentField {
	publish?: any;
	client_secret?: any;
	key: string | number;
	action?: string;
	html?: string | TrustedHTML;
	name?: string;
	type?: string;
	label: string;
	placeholder?: string;
	options?: Array<{ key: string; label: string; value: string }>; // For choice-toggle type
}

interface PaymentProvider {
	id: string;
	label: string;
	fields?: PaymentField[];
}

interface StorePaymentConfig {
	[id: string]: PaymentProvider;
}

const storePayment: StorePaymentConfig =
	(appLocalizer.store_payment_settings as StorePaymentConfig) || {};

const filteredStorePayment = Object.fromEntries(
	Object.entries(storePayment).filter(
		([_, value]) =>
			value !== null && (!Array.isArray(value) || value.length > 0)
	)
);

const paymentOptions = Object.values(filteredStorePayment).map((p) => ({
	key: p.id,
	value: p.id,
	label: p.label,
}));

// Generate all payment fields for all providers with conditions
const generateAllPaymentFields = (): PaymentField[] => {
	const allFields: PaymentField[] = [];

	Object.values(filteredStorePayment).forEach((provider) => {
		if (provider.fields && Array.isArray(provider.fields)) {
			const providerFields = provider.fields.map((field) => {
				const baseField: PaymentField = {
					...field,
					key: `${field.key}`,
					dependent: { key: 'payment_method', value: provider.id },
				};

				if (field.type === 'embedded') {
					// Use React.createElement instead of JSX
					return {
						...baseField,
						component: React.createElement(
							StripeEmbeddedOnboarding,
							{
								publishableKey: field.publish,
								clientSecret: field.client_secret,
								onComplete: () => {
									console.log('Stripe onboarding completed');
									window.location.reload();
								},
							}
						),
					};
				}

				return baseField;
			});

			allFields.push(...providerFields);
		}
	});

	return allFields;
};

export default {
	id: 'payout',
	priority: 7,
	headerTitle: __('Payout', 'multivendorx'),
	headerDescription: __(
		'Enter your payment information and select the method you’d like to use for receiving store payouts.',
		'multivendorx'
	),
	headerIcon: 'wallet-open',
	submitUrl: `store/${appLocalizer.store_id}`,
	modal: [
		{
			key: 'payment_method',
			type: 'choice-toggle',
			label: __('Payment Method', 'multivendorx'),
			options: paymentOptions, // Use paymentOptions directly, not with nested fields
		},
		...generateAllPaymentFields(), // Spread all fields at root level with conditions
	],
};
