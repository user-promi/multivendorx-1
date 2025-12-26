import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import StoresList from './StoresList';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';

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
							{ label: 'Shipping', value: 'shipping' },
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
						label="Category ID"
						value={attributes.category}
						onChange={(value) => setAttributes({ category: value })}
					/>
				</PanelBody>
			</InspectorControls>


			{/* Pass attributes to StoresList */}
			<StoresList
				orderby={attributes.orderby}
				order={attributes.order}
				category={attributes.category}
			/>
		</div>
	);
};

registerBlockType('multivendorx/stores-list', {
	apiVersion: 2,
	title: 'Stores List',
	icon: 'cart',
	category: 'multivendorx',
	supports: { html: false },

	attributes: {
		orderby: { type: 'string', default: 'name' },
		order: { type: 'string', default: 'asc' },
		category: { type: 'string', default: '' },
	},

	edit: EditBlock,

	save() {
		return <div id="multivendorx-stores-list"></div>;
	},
});

document.addEventListener('DOMContentLoaded', () => {
    const element = document.getElementById('multivendorx-stores-list');
    if (element) {
        const attributes = JSON.parse(element.getAttribute('data-attributes') || '{}');
        console.log('att',attributes);
        render(
            <BrowserRouter>
                <StoresList {...attributes} />
            </BrowserRouter>,
            element
        );
    }
});
