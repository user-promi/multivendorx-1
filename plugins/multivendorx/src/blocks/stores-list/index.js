import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import StoresList from './StoresList';

const EditBlock = () => {
	const blockProps = useBlockProps();
	return (
		<div {...blockProps} id="multivendorx-stores-list">
			{/* {StoresList()} */}
			<StoresList />
		</div>
	);
};


registerBlockType('multivendorx/stores-list', {
	apiVersion: 2,
	title: 'Stores List',
	icon: 'cart',
	category: 'multivendorx',
	supports: {
		html: false,
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

        render(
            <BrowserRouter>
                <StoresList {...attributes} />
            </BrowserRouter>,
            element
        );
    }
});