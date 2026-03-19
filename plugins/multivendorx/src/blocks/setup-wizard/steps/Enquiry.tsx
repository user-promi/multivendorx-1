/* global appLocalizer */
import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import Loading from './Loading';
import { getApiLink } from 'zyra';
import { __ } from '@wordpress/i18n';

interface EnquiryProps {
	onNext: () => void;
	onPrev: () => void;
}

const Enquiry: React.FC<EnquiryProps> = ({ onNext, onPrev }) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [displayOption, setDisplayOption] = useState<'popup' | 'inline'>(
		'popup'
	);
	const [restrictUserEnquiry, setRestrictUserEnquiry] = useState<string[]>(
		[]
	);

	const handleRestrictUserEnquiryChange = (
		event: ChangeEvent<HTMLInputElement>
	) => {
		const { checked, name } = event.target;
		setRestrictUserEnquiry((prevState) =>
			checked
				? [...prevState, name]
				: prevState.filter((value) => value !== name)
		);
	};

	const saveEnquirySettings = () => {
		setLoading(true);
		const data = {
			action: 'enquiry',
			displayOption: displayOption,
			restrictUserEnquiry: restrictUserEnquiry,
		};

		axios
			.post(getApiLink('settings'), data, {
				headers: {
					'X-WP-Nonce': appLocalizer?.nonce,
				},
			})
			.then(() => {
				setLoading(false);
				onNext();
			})
			.catch(() => {
				setLoading(false);
			});
	};

	return (
		<section>
			<h2>{__('Enquiry', 'multivendorx')}</h2>
			<article className="module-wrapper">
				<div className="module-items">
					<div className="module-details">
						<h3>{__('Display Enquiry Form:', 'multivendorx')}</h3>
						<p className="module-description">
							{__(
								'Select whether the form is displayed directly on the page or in a pop-up window.',
								'multivendorx'
							)}
						</p>
					</div>
					<ul>
						<li>
							<input
								className="toggle-setting-form-input"
								type="radio"
								id="popup"
								name="approve_vendor"
								value="popup"
								checked={displayOption === 'popup'}
								onChange={() => setDisplayOption('popup')}
							/>
							<label htmlFor="popup">
								{__('Popup', 'multivendorx')}
							</label>
						</li>
						<li>
							<input
								className="toggle-setting-form-input"
								type="radio"
								id="inline"
								name="approve_vendor"
								value="inline"
								checked={displayOption === 'inline'}
								onChange={() => setDisplayOption('inline')}
							/>
							<label htmlFor="inline">
								{__('Inline In-page', 'multivendorx')}
							</label>
						</li>
					</ul>
				</div>
			</article>

			<article className="module-wrapper">
				<div className="module-items">
					<div className="module-details">
						<h3>
							{__('Restrict for logged-in user', 'multivendorx')}
						</h3>
						<p className="module-description">
							{__(
								'If enabled, non-logged-in users cannot access the enquiry flow.',
								'multivendorx'
							)}
						</p>
					</div>
					<div className="toggle-checkbox">
						<input
							type="checkbox"
							id="enquiry_logged_out"
							name="enquiry_logged_out"
							checked={restrictUserEnquiry.includes(
								'enquiry_logged_out'
							)}
							onChange={handleRestrictUserEnquiryChange}
						/>
						<label htmlFor="enquiry_logged_out"></label>
					</div>
				</div>
			</article>

			<footer className="setup-footer-btn-wrapper">
				<div>
					<button className="footer-btn pre-btn" onClick={onPrev}>
						{__('Prev', 'multivendorx')}
					</button>
					<button className="footer-btn" onClick={onNext}>
						{__('Skip', 'multivendorx')}
					</button>
				</div>
				<button
					className="footer-btn next-btn"
					onClick={saveEnquirySettings}
				>
					{__('Next', 'multivendorx')}
				</button>
			</footer>
			{loading && <Loading />}
		</section>
	);
};

export default Enquiry;
