import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';

interface Task {
	title: string;
	description?: string;
	completed: boolean;
	actionText: string;
}

interface Section {
	title: string;
	steps: Task[];
}

interface IntroProps {
	onNext: () => void;
}

const sectionsData: Section[] = [
	{
		title: __('Set Up The Basics', 'multivendorx'),
		steps: [
			{
				title: __('Set Site Title & Tagline', 'multivendorx'),
				description: __(
					'Give your site a name and tagline.',
					'multivendorx'
				),
				completed: true,
				actionText: __('Set Up', 'multivendorx'),
			},
			{
				title: __('Review Admin Email', 'multivendorx'),
				description: __(
					'Ensure your admin email is correct.',
					'multivendorx'
				),
				completed: false,
				actionText: __('Review', 'multivendorx'),
			},
			{
				title: __('Choose Page Links', 'multivendorx'),
				description: __(
					'Decide how page links appear.',
					'multivendorx'
				),
				completed: false,
				actionText: __('Set Up', 'multivendorx'),
			},
			{
				title: __('Search Engine Visibility', 'multivendorx'),
				description: __(
					'Control search engine indexing.',
					'multivendorx'
				),
				completed: false,
				actionText: __('Review', 'multivendorx'),
			},
		],
	},
	{
		title: __('Design, Style & Theme', 'multivendorx'),
		steps: [
			{
				title: __('Pick a Color Scheme', 'multivendorx'),
				description: '',
				completed: false,
				actionText: __('Set Up', 'multivendorx'),
			},
			{
				title: __('Choose Typography', 'multivendorx'),
				description: '',
				completed: false,
				actionText: __('Set Up', 'multivendorx'),
			},
		],
	},
];

const Intro: React.FC<IntroProps> = ({ onNext }) => {
	const [expanded, setExpanded] = useState<number | null>(0);

	const toggleSection = (index: number) => {
		setExpanded(expanded === index ? null : index);
	};

	return (
		<>
			<section className="welcome-section">
				<h2>{__('Welcome to the CatalogX family!', 'multivendorx')}</h2>
				<p>
					{__(
						'Thank you for choosing CatalogX! This quick setup wizard will help you configure the basic settings and you will have your marketplace ready in no time.',
						'multivendorx'
					)}{' '}
					<strong>
						{__(
							'It’s completely optional and shouldn’t take longer than five minutes.',
							'multivendorx'
						)}
					</strong>
				</p>
				<p>
					{__(
						"If you don't want to go through the wizard right now, you can skip and return to the WordPress dashboard. Come back anytime if you change your mind!",
						'multivendorx'
					)}
				</p>
				<button className="footer-btn next-btn" onClick={onNext}>
					{__('Next', 'multivendorx')}
				</button>
			</section>

			<div className="wizard-container">
				{sectionsData.map((section, idx) => {
					const completedSteps = section.steps.filter(
						(s) => s.completed
					).length;
					const totalSteps = section.steps.length;

					return (
						<div
							key={idx}
							className={`wizard-section ${
								expanded === idx ? 'expanded' : ''
							}`}
						>
							<div
								className="wizard-header"
								onClick={() => toggleSection(idx)}
							>
								<div className="wizard-title">
									<span
										className={`chevron ${
											expanded === idx ? 'rotate' : ''
										}`}
									>
										&gt;
									</span>
									{section.title}
								</div>
								<div className="wizard-progress">
									{completedSteps}/{totalSteps}
								</div>
							</div>

							{expanded === idx && (
								<div className="wizard-steps">
									{section.steps.map((task, tidx) => (
										<div key={tidx} className="wizard-step">
											<div className="step-info">
												<div
													className={`step-status ${
														task.completed
															? 'completed'
															: ''
													}`}
												>
													{task.completed && (
														<span className="check">
															&#10003;
														</span>
													)}
												</div>
												<div className="step-text">
													<span className="step-title">
														{task.title}
													</span>
													{task.description && (
														<span className="desc">
															{task.description}
														</span>
													)}
												</div>
											</div>
											<button className="admin-btn btn-blue">
												{task.actionText} &rarr;
											</button>
										</div>
									))}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</>
	);
};

export default Intro;
