import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	BlockControls,
	AlignmentToolbar,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	ToggleControl,
} from '@wordpress/components';

registerBlockType('multivendorx/store-social-icons', {
	edit: ({ attributes, setAttributes }) => {
		const {
			iconSize = 24,
			iconGap = 12,
			align = 'center',
			showLabels = false,
		} = attributes;

		// Set block props with alignment
		const blockProps = useBlockProps({
			className: 'wp-block-social-links',
			style: {
				justifyContent:
					align === 'left'
						? 'flex-start'
						: align === 'right'
							? 'flex-end'
							: 'center',
			},
		});

		// Social platforms configuration
		const socialPlatforms = [
			{ name: 'facebook', label: 'Facebook', className: 'wp-social-link-facebook' },
			{ name: 'twitter', label: 'Twitter', className: 'wp-social-link-twitter' },
			{ name: 'instagram', label: 'Instagram', className: 'wp-social-link-instagram' },
			{ name: 'youtube', label: 'YouTube', className: 'wp-social-link-youtube' },
			{ name: 'linkedin', label: 'LinkedIn', className: 'wp-social-link-linkedin' },
			{ name: 'pinterest', label: 'Pinterest', className: 'wp-social-link-pinterest' },
		];

		return (
			<>
				<BlockControls>
					<AlignmentToolbar
						value={align}
						onChange={(newAlign) =>
							setAttributes({ align: newAlign })
						}
					/>
				</BlockControls>

				<InspectorControls>
					<PanelBody
						title={__('Icon Settings', 'multivendorx')}
						initialOpen={true}
					>
						<RangeControl
							label={__('Icon Size', 'multivendorx')}
							value={iconSize}
							onChange={(value) =>
								setAttributes({ iconSize: value })
							}
							min={20}
							max={100}
							step={5}
						/>

						<RangeControl
							label={__('Icon Gap', 'multivendorx')}
							value={iconGap}
							onChange={(value) =>
								setAttributes({ iconGap: value })
							}
							min={5}
							max={50}
							step={5}
						/>

						<ToggleControl
							label={__('Show labels', 'multivendorx')}
							checked={showLabels}
							onChange={(value) =>
								setAttributes({ showLabels: value })
							}
						/>
					</PanelBody>
				</InspectorControls>

				<div {...blockProps}>
					<ul 
						className="wp-block-social-links__list" 
						style={{ 
							display: 'flex',
							flexWrap: 'wrap',
							gap: `${iconGap}px`,
							justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
							padding: 0,
							margin: 0,
							listStyle: 'none',
						}}
					>
						{socialPlatforms.map((platform) => (
							<li
								key={platform.name}
								className={`wp-social-link ${platform.className} wp-block-social-link`}
								style={{
									transform: `scale(${iconSize / 24})`,
									margin: 0,
									display: 'inline-flex',
								}}
							>
								<a
									href="#"
									className="wp-block-social-link-anchor"
									style={{
										padding: '0.5em',
										textDecoration: 'none',
									}}
								>
									{/* WordPress core social icons will be loaded via CSS */}
									<span className="wp-block-social-link-label" style={{ marginLeft: showLabels ? '0.5em' : 0 }}>
										{showLabels ? platform.label : ''}
									</span>
								</a>
							</li>
						))}
					</ul>
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const {
			iconSize = 24,
			iconGap = 12,
			align = 'center',
			showLabels = false,
		} = attributes;

		const blockProps = useBlockProps.save({
			className: 'wp-block-social-links',
			style: {
				justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
			},
		});

		// Social platforms configuration for save
		const socialPlatforms = [
			{ name: 'facebook', label: 'Facebook', className: 'wp-social-link-facebook' },
			{ name: 'twitter', label: 'Twitter', className: 'wp-social-link-twitter' },
			{ name: 'instagram', label: 'Instagram', className: 'wp-social-link-instagram' },
			{ name: 'youtube', label: 'YouTube', className: 'wp-social-link-youtube' },
			{ name: 'linkedin', label: 'LinkedIn', className: 'wp-social-link-linkedin' },
			{ name: 'pinterest', label: 'Pinterest', className: 'wp-social-link-pinterest' },
		];

		return (
			<div {...blockProps}>
				<ul 
					className="wp-block-social-links__list" 
					style={{ 
						display: 'flex',
						flexWrap: 'wrap',
						gap: `${iconGap}px`,
						justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
						padding: 0,
						margin: 0,
						listStyle: 'none',
					}}
				>
					{socialPlatforms.map((platform) => (
						<li
							key={platform.name}
							className={`wp-social-link ${platform.className} wp-block-social-link multivendorx-social-${platform.name}`}
							style={{
								transform: `scale(${iconSize / 24})`,
								margin: 0,
								display: 'inline-flex',
							}}
						>
							<a
								href="#"
								className="wp-block-social-link-anchor"
								style={{
									padding: '0.5em',
									textDecoration: 'none',
								}}
							>
								{/* WordPress core will handle the icon via CSS */}
								<span className="wp-block-social-link-label" style={{ marginLeft: showLabels ? '0.5em' : 0 }}>
									{showLabels ? platform.label : ''}
								</span>
							</a>
						</li>
					))}
				</ul>
			</div>
		);
	},
});

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', setupSocialLinks);
} else {
	setupSocialLinks();
}

function setupSocialLinks() {
	if (!window.StoreInfo?.storeDetails) {
		return;
	}

	const { facebook, twitter, instagram, youtube, linkedin, pinterest } =
		window.StoreInfo.storeDetails;

	const map = {
		facebook,
		twitter,
		instagram,
		youtube,
		linkedin,
		pinterest,
	};

	Object.entries(map).forEach(([key, url]) => {
		document
			.querySelectorAll(`.multivendorx-social-${key}`)
			.forEach((el) => {
				if (url) {
					const link = el.querySelector('a') || el;
					link.href = url;
					link.target = '_blank';
					link.rel = 'noopener noreferrer';
					el.style.display = '';
				} else {
					el.style.display = 'none';
				}
			});
	});
}