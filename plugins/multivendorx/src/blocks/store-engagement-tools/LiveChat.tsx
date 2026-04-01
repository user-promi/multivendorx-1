/* global StoreInfo */
import { __ } from '@wordpress/i18n';
import React from 'react';

const ChatIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		width="20"
		height="20"
	>
		<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
	</svg>
);

const LiveChat: React.FC = () => {

	const provider = StoreInfo?.settings_databases_value['live-chat']?.chat_provider;
	const storeId = StoreInfo?.storeDetails?.storeId;
	const storeName = StoreInfo?.storeDetails?.storeName;

	if (provider === 'tawk') {
		return null;
	}
	return (
		<button
			className={`wp-block-button__link has-border-color has-accent-1-border-color wp-element-button multivendorx-livechat-btn`}
			data-store-id={storeId}
			data-store-name={storeName}
		>
			<ChatIcon />
			{__('Live Chat com', 'multivendorx')}
		</button>
	);
};

export default LiveChat;
