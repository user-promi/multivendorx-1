import { __, sprintf } from '@wordpress/i18n';
import React, { useState } from 'react';

const SupportIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		width="20"
		height="20"
	>
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
	</svg>
);

interface Props {
	productName: string;
	productId: number;
}

const StoreSupport: React.FC<Props> = ({ productName, productId }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				className="wp-block-button__link has-border-color has-accent-1-border-color wp-element-button multivendorx-store-support-btn"
				onClick={() => setIsOpen(true)}
			>
				<SupportIcon />
				{__('Support com', 'multivendorx')}
			</button>

			{isOpen && (
				<div
					className="store-support-popup multivendorx-popup"
					onClick={(e) => {
						if (e.target === e.currentTarget) setIsOpen(false);
					}}
				>
					<form className="woocommerce-form woocommerce-form-login login multivendorx-popup-content">

						<span
							className="popup-close"
							onClick={() => setIsOpen(false)}
						>
							<i className="dashicons dashicons-no-alt"></i>
						</span>

						<h3>{__('Hi Shop2', 'multivendorx')}</h3>
						<h2>{__('Create a new support', 'multivendorx')}</h2>

						{/* Subject */}
						<p className="woocommerce-form-row form-row form-row-wide">
							<label htmlFor="support-subject">
								{__('Subject', 'multivendorx')}
							</label>
							<input
								type="text"
								id="support-subject"
								name="support-subject"
								className="woocommerce-Input input-text"
							/>
						</p>

						{/* Select (NEW) */}
						<p className="woocommerce-form-row form-row form-row-wide">
							<label htmlFor="order-id">
								{__('Order ID', 'multivendorx')}
							</label>
							<select
								id="order-id"
								name="order-id"
								className="woocommerce-Input input-select"
							>
								<option value="">{__('Select order id', 'multivendorx')}</option>
								<option value="147">{__('Order #147', 'multivendorx')}</option>
								<option value="157">{__('Order #157', 'multivendorx')}</option>
							</select>
						</p>

						{/* Message */}
						<p className="woocommerce-form-row form-row form-row-wide">
							<label htmlFor="support-message">
								{__('Message', 'multivendorx')}
							</label>
							<textarea
								id="support-message"
								className="input-text"
								placeholder={__('Message', 'multivendorx')}
							/>
						</p>

						<button
							type="button"
							className="submit-report-abuse woocommerce-button button wp-element-button"
						>
							{__('Submit', 'multivendorx')}
						</button>
					</form>
				</div>
			)}
		</>
	);
};

export default StoreSupport;