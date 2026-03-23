/* global StoreInfo */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps, BlockControls, AlignmentToolbar } from '@wordpress/block-editor';

/**
 * Clock Icon Component
 */
const ClockIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		width="20"
		height="20"
	>
		<path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 11h5v-2h-4V6h-2v7Z" />
	</svg>
);

/**
 * Register Block
 */
registerBlockType('multivendorx/store-business-hours', {
	supports: {
		align: true,
		html: false,
	},

	attributes: {
		heading: { type: 'string', default: __('Business Hours', 'multivendorx') },
	},

	/**
	 * EDIT — static preview
	 */
	edit: ({ attributes, setAttributes }) => {
		const blockProps = useBlockProps({
			className: 'multivendorx-store-business-hours-block',
			style: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
		});

		return (
			<>
				<BlockControls>
					<AlignmentToolbar
						value={attributes.align}
						onChange={(nextAlign) => setAttributes({ align: nextAlign })}
					/>
				</BlockControls>

				<div {...blockProps}>
					<ClockIcon />
					<span>{attributes.heading}</span>
				</div>
			</>
		);
	},

	/**
	 * SAVE — dynamic-ready markup only
	 */
	save: () => {
		const blockProps = useBlockProps.save({
			className: 'multivendorx-store-business-hours-wrapper',
			style: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
		});

		return (
			<div {...blockProps}>
				<div className="multivendorx-business-hours-header">
					<span className="dashicons dashicons-clock"></span>
					<span>{__('Business Hours', 'multivendorx')}</span>
				</div>

				<div className="multivendorx-store-business-hours"></div>
			</div>
		);
	},
});

/**
 * FRONTEND — dynamic business hours injection
 */
window.addEventListener('load', () => {
    if (!window.StoreInfo?.storeDetails?.businessHours) {
        // No business hours, remove blocks
        document
            .querySelectorAll('.multivendorx-store-business-hours-wrapper')
            .forEach((block) => block.remove());
        return;
    }

    const businessHours = StoreInfo.storeDetails.businessHours;

    document
        .querySelectorAll('.multivendorx-store-business-hours-wrapper')
        .forEach((block) => {
            const container = block.querySelector('.multivendorx-store-business-hours');
            if (!container) return;

            let html = '';
            Object.entries(businessHours).forEach(([day, time]) => {
                if (time) {
                    html += `<div class="mvx-business-hour-row"><strong>${day}:</strong> ${time}</div>`;
                }
            });

            if (!html) {
                block.remove();
                return;
            }

            container.innerHTML = html;
        });
});