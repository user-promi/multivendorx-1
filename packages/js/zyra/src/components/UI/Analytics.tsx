import React from 'react';
import "../../styles/web/UI/Analytics.scss";
type AnalyticsItem = {
	icon?: string;
	iconClass?: string;
	colorClass?: string;
	number: React.ReactNode;
	text: React.ReactNode;
	extra?: React.ReactNode;
};

type AnalyticsProps = {
	data: AnalyticsItem[];
	template?: 'template-1' | 'template-2' | 'template-3';
	col3?: boolean;
};

const Analytics: React.FC<AnalyticsProps> = ({
	data,
	template = 'template-1',
	col3 = false,
}) => {
	const containerClass =
		template === 'template-3'
			? 'analytics-container dashboard'
			: template === 'template-2'
			? 'analytics-container report'
			: 'analytics-container';

	return (
		<div
			className={`${containerClass} ${
				col3 && template === 'template-2' ? 'col-3' : ''
			}`}
		>
			{data.map((item, idx) => (
				<div
					key={idx}
					className={`analytics-item ${item.colorClass || ''}`}
				>
                    {item.icon && (
						<div className="analytics-icon">
							<i
								className={`${item.icon} ${item.iconClass || ''}`}
							/>
						</div>
					)}
					<div className="details">
						<div className="number">{item.number}</div>
						<div className="text">{item.text}</div>

						{/* dashboard only */}
						{template === 'template-3' && item.extra && (
							<div className="report">{item.extra}</div>
						)}
					</div>
				</div>
			))}
		</div>
	);
};

export default Analytics;
