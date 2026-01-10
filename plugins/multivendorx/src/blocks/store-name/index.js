import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';

registerBlockType('multivendorx/store-name', {
	edit() {
		const blockProps = useBlockProps();

		return (
			<div {...blockProps}>
				<h2>Store Name</h2>
			</div>
		);
	},

	save() {
		return (
			<div className="multivendorx-store-name">
				<h2>Store Name</h2>
			</div>
		);
	},
});
