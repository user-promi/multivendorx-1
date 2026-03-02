import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import ProductList from './productList';

registerBlockType('multivendorx/highlighted-store-products', {
	apiVersion: 2,

	edit: () => {
		const blockProps = useBlockProps();

		return (
			<div {...blockProps}>
				<ProductList
					isEditor={true}
					productType="recent"
					limit={4}
				/>
			</div>
		);
	},

	save: () => {
		const blockProps = useBlockProps.save({
			className: 'multivendorx-highlighted-products',
		});

		return <div {...blockProps}></div>;
	},
});

// Frontend mounting
document.addEventListener('DOMContentLoaded', () => {
	const elements = document.querySelectorAll(
		'.multivendorx-highlighted-products'
	);

	elements.forEach((el) => {
		render(
			<BrowserRouter>
				<ProductList
					isEditor={false}
					productType="recent"
					limit={4}
				/>
			</BrowserRouter>,
			el
		);
	});
});