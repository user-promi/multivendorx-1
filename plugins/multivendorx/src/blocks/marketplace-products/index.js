import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';
import { initializeModules } from 'zyra';
import MarketplaceProductList from './marketplaceProductList';

initializeModules(productList, 'multivendorx', 'free', 'modules');

const EditBlock = (props) => {
	const { attributes, setAttributes } = props;
	const blockProps = useBlockProps();

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title="Store Filters">
					<SelectControl
						label="Sort by"
						value={attributes.orderby}
						options={[
							{ label: 'Name', value: 'name' },
							{ label: 'Category', value: 'category' },
							{ label: 'Registered', value: 'create-time' },
						]}
						onChange={(value) => setAttributes({ orderby: value })}
					/>
					<SelectControl
						label="Order"
						value={attributes.order}
						options={[
							{ label: 'Ascending', value: 'asc' },
							{ label: 'Descending', value: 'desc' },
						]}
						onChange={(value) => setAttributes({ order: value })}
					/>
					<TextControl
						label="Category"
						value={attributes.category}
						onChange={(value) => setAttributes({ category: value })}
					/>
					<TextControl
						label="per page"
						type="number"
						min={1}
						value={attributes.perpage}
						onChange={(value) =>
							setAttributes({ perpage: parseInt(value, 12) || 12 })
						}
					/>
				</PanelBody>
			</InspectorControls>


			{/* Pass attributes to StoresList */}
			<MarketplaceProductList
				orderby={attributes.orderby}
				order={attributes.order}
				category={attributes.category}
			/>
		</div>
	);
};

registerBlockType('multivendorx/marketplace-products', {
	apiVersion: 2,
	title: 'Product List',
	icon: 'products',
	category: 'multivendorx',
	supports: { html: false },

	attributes: {
		orderby: { type: 'string', default: 'name' },
		order: { type: 'string', default: 'asc' },
		category: { type: 'string', default: '' },
		perpage: { type: 'number', default: 12 },
	},

	edit: EditBlock,

	save({ attributes }) {
		return <div id="marketplace-products" data-attributes={JSON.stringify(attributes)}></div>;
	},
});

document.addEventListener('DOMContentLoaded', () => {
	const element = document.getElementById('marketplace-products');
	if (element) {
		const attributes = JSON.parse(element.getAttribute('data-attributes') || '{}');
		render(
			<BrowserRouter>
				<MarketplaceProductList {...attributes} />
			</BrowserRouter>,
			element
		);
	}
});
