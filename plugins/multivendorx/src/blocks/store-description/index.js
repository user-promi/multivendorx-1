import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';

registerBlockType('multivendorx/store-description', {
	edit() {
		const blockProps = useBlockProps();

		return (
			<div {...blockProps}>
				<h2>Store description</h2>
			</div>
		);
	},

	save() {
		return (
			<div className="multivendorx-store-description">
				<h2>Store description</h2>
			</div>
		);
	},
});
