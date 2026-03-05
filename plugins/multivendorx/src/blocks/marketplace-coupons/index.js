import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl } from '@wordpress/components';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import StoreCouponList from './StoreCouponList';
import { __ } from '@wordpress/i18n';

registerBlockType('multivendorx/marketplace-coupons', {
	apiVersion: 2,
	title: 'Store Coupons',
	icon: 'tickets-alt',
	category: 'multivendorx',

	attributes: {
		perPage: {
			type: 'number',
			default: 10,
		},
		orderby: {
			type: 'string',
			default: 'date',
		},
		order: {
			type: 'string',
			default: 'DESC',
		},
	},

	edit({ attributes, setAttributes }) {
		const blockProps = useBlockProps();

		return (
			<div {...blockProps}>
				<InspectorControls>
					<PanelBody
						title={__('Coupon Settings', 'multivendorx')}
						initialOpen={true}
					>

						<TextControl
							label={__('Coupons Per Page', 'multivendorx')}
							type="number"
							value={attributes.perPage}
							onChange={(value) =>
								setAttributes({
									perPage: parseInt(value, 10) || 10,
								})
							}
						/>

						<SelectControl
							label={__('Order By', 'multivendorx')}
							value={attributes.orderby}
							options={[
								{ label: 'Date', value: 'date' },
								{ label: 'ID', value: 'id' },
								{ label: 'Title', value: 'title' },
								{ label: 'Code', value: 'code' },
								{ label: 'Modified', value: 'modified' },
							]}
							onChange={(value) =>
								setAttributes({ orderby: value })
							}
						/>

						<SelectControl
							label={__('Order', 'multivendorx')}
							value={attributes.order}
							options={[
								{ label: 'Descending', value: 'DESC' },
								{ label: 'Ascending', value: 'ASC' },
							]}
							onChange={(value) =>
								setAttributes({ order: value })
							}
						/>

					</PanelBody>
				</InspectorControls>

				{/* Editor preview placeholder */}
				<div style={{ padding: '20px', background: '#f7f7f7' }}>
					<strong>{__('Store Coupons Preview', 'multivendorx')}</strong>
					<p>
						{__('Coupons will render on the frontend.', 'multivendorx')}
					</p>
				</div>
			</div>
		);
	},

	save({ attributes }) {
		return (
			<div
				id="marketplace-coupons"
				data-attributes={JSON.stringify(attributes)}
			/>
		);
	},
});

document.addEventListener('DOMContentLoaded', () => {
	const element = document.getElementById('marketplace-coupons');

	if (element) {
		const attributes = JSON.parse(
			element.getAttribute('data-attributes') || '{}'
		);

		render(
			<BrowserRouter>
				<StoreCouponList {...attributes} />
			</BrowserRouter>,
			element
		);
	}
});