/* global StoreInfo */
import React from 'react';

const StoreTabs: React.FC = () => {
	return (
		<div
			dangerouslySetInnerHTML={{
				__html: StoreInfo.storeDetails.storeTabs,
			}}
		/>
	);
};

export default StoreTabs;
