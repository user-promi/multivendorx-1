import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';
import MarketplaceProductList from './marketplaceProductList';

// Static product data for preview in editor
const staticProducts = [
	{
		id: 1,
		name: 'Sample Product 1',
		price: '$29.99',
		sale_price: '$19.99',
		regular_price: '$29.99',
		on_sale: true,
		image: 'https://via.placeholder.com/300x300',
		rating: 4.5,
		review_count: 15,
		permalink: '#',
		vendor: 'Sample Vendor',
	},
	{
		id: 2,
		name: 'Sample Product 2',
		price: '$49.99',
		sale_price: '',
		regular_price: '$49.99',
		on_sale: false,
		image: 'https://via.placeholder.com/300x300',
		rating: 3.8,
		review_count: 8,
		permalink: '#',
		vendor: 'Another Vendor',
	},
	{
		id: 3,
		name: 'Sample Product 3',
		price: '$89.99',
		sale_price: '$69.99',
		regular_price: '$89.99',
		on_sale: true,
		image: 'https://via.placeholder.com/300x300',
		rating: 4.8,
		review_count: 23,
		permalink: '#',
		vendor: 'Premium Vendor',
	},
	{
		id: 4,
		name: 'Sample Product 4',
		price: '$15.99',
		sale_price: '',
		regular_price: '$15.99',
		on_sale: false,
		image: 'https://via.placeholder.com/300x300',
		rating: 4.2,
		review_count: 42,
		permalink: '#',
		vendor: 'Budget Store',
	},
];

// EditBlock Component
const EditBlock = (props) => {
	const { attributes, setAttributes, isSelected } = props;
	const blockProps = useBlockProps();

	// Function to simulate filtering based on attributes
	const getFilteredStaticProducts = () => {
		let products = [...staticProducts];

		// Sort based on orderby
		switch (attributes.orderby) {
			case 'popularity':
				products.sort((a, b) => b.review_count - a.review_count);
				break;
			case 'recent':
				// For demo, just reverse the array
				products.reverse();
				break;
			case 'rating':
				products.sort((a, b) => b.rating - a.rating);
				break;
			case 'price':
				products.sort((a, b) => {
					const priceA = parseFloat(a.price.replace('$', ''));
					const priceB = parseFloat(b.price.replace('$', ''));
					return attributes.order === 'asc' ? priceA - priceB : priceB - priceA;
				});
				break;
			case 'on_sale':
				products = products.filter(p => p.on_sale);
				break;
			default:
				// Default sorting by name
				products.sort((a, b) => a.name.localeCompare(b.name));
		}

		// Apply order (asc/desc) for non-price sorting
		if (attributes.orderby !== 'price' && attributes.order === 'desc') {
			products.reverse();
		}

		// Limit by perPage
		return products.slice(0, attributes.perPage || 12);
	};

	const filteredProducts = getFilteredStaticProducts();

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title={__('Product Filters', 'multivendorx')} initialOpen={true}>
					<SelectControl
						label={__('Sort by', 'multivendorx')}
						value={attributes.orderby}
						options={[
							{ label: __('Default', 'multivendorx'), value: 'default' },
							{ label: __('Popularity', 'multivendorx'), value: 'popularity' },
							{ label: __('Recent', 'multivendorx'), value: 'recent' },
							{ label: __('By Rating', 'multivendorx'), value: 'rating' },
							{ label: __('By Price', 'multivendorx'), value: 'price' },
							{ label: __('On Sale', 'multivendorx'), value: 'on_sale' },
						]}
						onChange={(value) => setAttributes({ orderby: value })}
					/>
					<SelectControl
						label={__('Order', 'multivendorx')}
						value={attributes.order}
						options={[
							{ label: __('Ascending', 'multivendorx'), value: 'asc' },
							{ label: __('Descending', 'multivendorx'), value: 'desc' },
						]}
						onChange={(value) => setAttributes({ order: value })}
					/>
					<TextControl
						label={__('Products per page', 'multivendorx')}
						type="number"
						min={1}
						max={20}
						value={attributes.perPage}
						onChange={(value) =>
							setAttributes({
								perPage: parseInt(value, 10) || 12,
							})
						}
					/>
				</PanelBody>
			</InspectorControls>

			{/* Editor Preview with Static Products */}
			<div className="marketplace-products-editor-preview">
				<div style={{ 
					padding: '10px', 
					background: '#f0f0f0', 
					marginBottom: '15px',
					borderRadius: '4px',
					fontSize: '12px',
					color: '#666'
				}}>
					<strong>{__('Editor Preview', 'multivendorx')}</strong> — 
					{__('Showing static demo products. ', 'multivendorx')}
					{filteredProducts.length} {__('products displayed', 'multivendorx')}
				</div>
				
				<div style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
					gap: '20px',
					padding: '10px'
				}}>
					{filteredProducts.map(product => (
						<div key={product.id} style={{
							border: '1px solid #ddd',
							borderRadius: '4px',
							padding: '15px',
							background: '#fff'
						}}>
							<div style={{
								width: '100%',
								height: '150px',
								background: '#f5f5f5',
								marginBottom: '10px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								overflow: 'hidden'
							}}>
								<img 
									src={product.image} 
									alt={product.name}
									style={{
										maxWidth: '100%',
										maxHeight: '100%',
										objectFit: 'cover'
									}}
								/>
							</div>
							<h4 style={{ margin: '0 0 5px', fontSize: '14px' }}>
								{product.name}
							</h4>
							<div style={{ 
								fontSize: '13px',
								color: '#666',
								marginBottom: '5px'
							}}>
								{product.vendor}
							</div>
							<div style={{ 
								fontWeight: 'bold',
								color: product.on_sale ? '#e74c3c' : '#333'
							}}>
								{product.on_sale ? (
									<>
										<del style={{ 
											color: '#999',
											fontSize: '12px',
											marginRight: '5px'
										}}>
											{product.regular_price}
										</del>
										{product.price}
									</>
								) : (
									product.price
								)}
							</div>
							{product.rating > 0 && (
								<div style={{ 
									fontSize: '12px',
									color: '#f39c12',
									marginTop: '5px'
								}}>
									{'★'.repeat(Math.floor(product.rating))}
									{'☆'.repeat(5 - Math.floor(product.rating))}
									<span style={{ color: '#999', marginLeft: '5px' }}>
										({product.review_count})
									</span>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

// Register the Block
registerBlockType('multivendorx/marketplace-products', {
	apiVersion: 2,
	title: __('Marketplace Products', 'multivendorx'),
	icon: 'products',
	category: 'multivendorx',
	supports: { html: false },

	attributes: {
		orderby: { type: 'string', default: 'default' },
		order: { type: 'string', default: 'asc' },
		category: { type: 'string', default: '' },
		perPage: { type: 'number', default: 12 },
	},

	edit: EditBlock,

	save({ attributes }) {
		return (
			<div
				id="marketplace-products"
				data-attributes={JSON.stringify(attributes)}
			></div>
		);
	},
});

// Render on frontend (keep as is)
document.addEventListener('DOMContentLoaded', () => {
	const element = document.getElementById('marketplace-products');
	if (element) {
		const attributes = JSON.parse(
			element.getAttribute('data-attributes') || '{}'
		);
		render(
			<BrowserRouter>
				<MarketplaceProductList {...attributes} />
			</BrowserRouter>,
			element
		);
	}
});