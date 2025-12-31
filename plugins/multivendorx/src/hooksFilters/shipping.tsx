import { useEffect, useState } from 'react';
import axios from 'axios';
import { addFilter } from '@wordpress/hooks';
import { BasicInput, Card, SelectInput } from 'zyra';
import { __ } from '@wordpress/i18n';

const ShippingCard = ({ product, handleChange }) => {
	const [shippingClasses, setShippingClasses] = useState([]);

	useEffect(() => {
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/products/shipping_classes`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((res) => {
				const options = res.data.map((cls) => ({
					value: cls.slug,
					label: cls.name,
				}));

				setShippingClasses(options);
			});
	}, []);

	const toggleCard = (cardId) => {
		const body = document.querySelector(`#${cardId} .card-body`);
		const arrow = document.querySelector(`#${cardId} .arrow-icon`);

		if (!body || !arrow) {
			return;
		}

		body.classList.toggle('hide-body');
		arrow.classList.toggle('rotate');
	};

	return (
		<Card
			title={__('Shipping', 'multivendorx')}
			iconName="adminlib-pagination-right-arrow icon"
			toggle
		>
			{/* Weight & Shipping class */}
			<div className="form-group-wrapper">
				<div className="form-group">
					<label>
						{__('Weight', 'multivendorx')} ({appLocalizer.weight_unit})
					</label>

					<BasicInput
						name="weight"
						value={product.weight}
						onChange={(e) =>
							handleChange('weight', e.target.value)
						}
					/>
				</div>

				<div className="form-group">
					<label>{__('Shipping classes', 'multivendorx')}</label>

					<SelectInput
						name="shipping_class"
						options={shippingClasses}
						value={product.shipping_class}
						onChange={(selected) =>
							handleChange('shipping_class', selected.value)
						}
					/>
				</div>
			</div>

			{/* Dimensions */}
			<div className="form-group-wrapper">
				<div className="form-group">
					<label>
						{__('Dimensions', 'multivendorx')} (
						{appLocalizer.dimension_unit})
					</label>

					<BasicInput
						name="product_length"
						value={product.product_length}
						placeholder={__('Length', 'multivendorx')}
						onChange={(e) =>
							handleChange('product_length', e.target.value)
						}
					/>
				</div>

				<div className="form-group">
					<label></label>

					<BasicInput
						name="product_width"
						value={product.product_width}
						placeholder={__('Width', 'multivendorx')}
						onChange={(e) =>
							handleChange('product_width', e.target.value)
						}
					/>
				</div>

				<div className="form-group">
					<label></label>

					<BasicInput
						name="product_height"
						value={product.product_height}
						placeholder={__('Height', 'multivendorx')}
						onChange={(e) =>
							handleChange('product_height', e.target.value)
						}
					/>
				</div>
			</div>
		</Card>

	);
};

addFilter(
	'product_shipping',
	'my-plugin/shipping',
	(content, product, handleChange) => {
		return (
			<>
				{content}
				<ShippingCard product={product} handleChange={handleChange} />
			</>
		);
	},
	10
);
