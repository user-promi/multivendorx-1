import { useEffect, useState } from 'react';
import axios from 'axios';
import { addFilter } from '@wordpress/hooks';
import { BasicInput, Card, FormGroup, FormGroupWrapper, SelectInput } from 'zyra';
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
		<Card contentHeight
			title={__('Shipping', 'multivendorx')}
			iconName="adminfont-pagination-right-arrow icon"
			toggle
		>

			{/* Dimensions */}
			<FormGroupWrapper>
			{/* Weight & Shipping class */}
				<FormGroup cols={2} label={__('Weight (kg)', 'multivendorx')} htmlFor="Weight">
					<BasicInput
						name="weight"
						value={product.weight}
						onChange={(e) =>
							handleChange('weight', e.target.value)
						}
					/>
				</FormGroup>
				<FormGroup cols={2} label={__('Shipping classes', 'multivendorx')} htmlFor="shipping-classes">
					<SelectInput
						name="shipping_class"
						options={shippingClasses}
						value={product.shipping_class}
						onChange={(selected) =>
							handleChange('shipping_class', selected.value)
						}
					/>
				</FormGroup>
				<FormGroup cols={3} label={`${__('Length', 'multivendorx')} (${appLocalizer.dimension_unit})`} >
					<BasicInput
						name="product_length"
						value={product.product_length}
						placeholder={__('Length', 'multivendorx')}
						onChange={(e) =>
							handleChange('product_length', e.target.value)
						}
					/>
				</FormGroup>

				<FormGroup cols={3} label={`${__('Width', 'multivendorx')} (${appLocalizer.dimension_unit})`}>
					<BasicInput
						name="product_width"
						value={product.product_width}
						placeholder={__('Width', 'multivendorx')}
						onChange={(e) =>
							handleChange('product_width', e.target.value)
						}
					/>
				</FormGroup>

				<FormGroup cols={3} label={`${__('Height', 'multivendorx')} (${appLocalizer.dimension_unit})`}>
					<BasicInput
						name="product_height"
						value={product.product_height}
						placeholder={__('Height', 'multivendorx')}
						onChange={(e) =>
							handleChange('product_height', e.target.value)
						}
					/>
				</FormGroup>
			</FormGroupWrapper>

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
