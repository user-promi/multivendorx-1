import { __ } from '@wordpress/i18n';

const PolicyTab = () => {
	const policies = StoreInfo.store_policies || {};

	const hasValue = (value) =>
		value && value.toString().trim() !== '';

	return (
		<div className="multivendorx-policies-accordion">

			{hasValue(policies.store_policy) && (
				<div className="accordion-item">
					<div className="accordion-header">
						{__('Store Policy', 'multivendorx')}
					</div>
					<div className="accordion-body">
						<p>{policies.store_policy}</p>
					</div>
				</div>
			)}

			{hasValue(policies.shipping_policy) && (
				<div className="accordion-item">
					<div className="accordion-header">
						{__('Shipping Policy', 'multivendorx')}
					</div>
					<div className="accordion-body">
						<p>{policies.shipping_policy}</p>
					</div>
				</div>
			)}

			{hasValue(policies.refund_policy) && (
				<div className="accordion-item">
					<div className="accordion-header">
						{__('Refund Policy', 'multivendorx')}
					</div>
					<div className="accordion-body">
						<p>{policies.refund_policy}</p>
					</div>
				</div>
			)}

			{hasValue(policies.cancellation_policy) && (
				<div className="accordion-item">
					<div className="accordion-header">
						{__(
							'Cancellation / Return / Exchange Policy',
							'multivendorx'
						)}
					</div>
					<div className="accordion-body">
						<p>{policies.cancellation_policy}</p>
					</div>
				</div>
			)}

		</div>
	);
};

export default PolicyTab;