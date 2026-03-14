import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import StoreTabs from './StoreTabs';

const Edit = () => {
	return (
		<div className="is-style-minimal  alignwide wp-block-woocommerce-product-details">
			<div className="components-disabled mvx-store-products-wrapper">
				<ul className="wc-tabs tabs">
					<li className="description_tab active"><a> Products </a></li>
					<li className="description_tab"><a> Reviews </a></li>
					<li className="description_tab"><a> Policy </a></li>
				</ul>
				<ul className="wc-block-product-template is-flex-container columns-3" role="list">
					{[
						{ name: 'Classic T-Shirt', price: '₹499', type: 'simple', hasSale: true },
						{ name: 'Denim Jacket', price: '₹1,299', type: 'simple', hasSale: false },
						{ name: 'Running Shoes', price: '₹1,999', regularPrice: '₹2,499', type: 'variable', hasSale: true },
						{ name: 'Cotton Hoodie', price: '₹899', type: 'simple', hasSale: true },
						{ name: 'Sports Cap', price: '₹399', type: 'simple', hasSale: false },
						{ name: 'Yoga Mat', price: '₹799', regularPrice: '₹999', type: 'variable', hasSale: true },
						{ name: 'Gym Bag', price: '₹1,499', type: 'simple', hasSale: false },
						{ name: 'Water Bottle', price: '₹249', type: 'simple', hasSale: true },
						{ name: 'Training Gloves', price: '₹599', regularPrice: '₹799', type: 'variable', hasSale: true }
					].map((product, index) => (
						<li key={index} className="wc-block-product" role="listitem">
							<div className="wc-block-components-product-image">
								<a>
									<img
										src="/wp-content/uploads/woocommerce-placeholder.webp"
										alt={product.name}
										className="wp-block-woocommerce-product-image"
									/>
								</a>
								{product.hasSale && (
									<div className="wc-block-components-product-sale-badge wc-block-components-product-sale-badge--align-right">
										<span aria-hidden="true">Sale</span>
										<span className="screen-reader-text">Product on sale</span>
									</div>
								)}
							</div>

							<h3 className="wp-block-post-title has-text-align-center">
								<a href="#">
									{product.name}
								</a>
							</h3>

							<div className="wc-block-components-product-price price wc-block-components-product-price--align-center">
								{product.type === 'variable' && product.regularPrice ? (
									<span className="wc-block-components-product-price__value">
										<span className="screen-reader-text">Previous price:</span>
										<del className="wc-block-components-product-price__regular">{product.regularPrice}</del>
										<span className="screen-reader-text">Discounted price:</span>
										<ins className="wc-block-components-product-price__value is-discounted">{product.price}</ins>
									</span>
								) : (
									<span className="wc-block-components-product-price__value">{product.price}</span>
								)}
							</div>

							<div className="wp-block-button wc-block-components-product-button align-center">
								<a href="#" className="wp-block-button__link wp-element-button add_to_cart_button">
									{product.type === 'variable' ? 'Select options' : 'Add to cart'}
								</a>
							</div>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};
registerBlockType('multivendorx/store-tabs', {
	apiVersion: 2,
	edit: Edit,
	save() {
		return <div id="multivendorx-store-tabs"></div>;
	},
});

document.addEventListener('DOMContentLoaded', () => {
	const el = document.getElementById('multivendorx-store-tabs');

	if (!el) {
		return;
	}

	render(
		<BrowserRouter>
			<StoreTabs />
		</BrowserRouter>,
		el
	);
});
