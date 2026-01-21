import React from 'react';
import "../../styles/web/UI/Analytics.scss";
import { Skeleton } from '@mui/material';
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
	isLoading?: boolean;
};

const Analytics: React.FC<AnalyticsProps> = ({
	data,
	template = 'template-1',
	col3 = false,
	isLoading = false,
}) => {
	const containerClass =
		template === 'template-3'
			? 'analytics-container dashboard'
			: template === 'template-2'
				? 'analytics-container report'
				: 'analytics-container';

	const skeletonItems = Array.from({ length: data.length || 4 });

	return (
		<div
			className={`${containerClass} ${col3 && template === 'template-2' ? 'col-3' : ''
				}`}
		>
			{isLoading
				? skeletonItems.map((_, idx) => (
					<div key={idx} className="analytics-item">
						<div className="analytics-icon">
							<Skeleton variant="text" width={80} height={80} />
						</div>
						<div className="details">
							<div className="number">
								<Skeleton variant="text" width={80} height={24} />
							</div>
							<div className="text">
								<Skeleton variant="text" width={100} height={18} />
							</div>
							{template === 'template-3' && (
								<div className="report">
									<Skeleton variant="text" width={60} height={16} />
								</div>
							)}
						</div>
					</div>
				))
				: data.map((item, idx) => (
					<div
						key={idx}
						className={`analytics-item ${item.colorClass || ''}`}
					>
						{item.icon && (
							<div className="analytics-icon">
								<i className={`${item.icon} ${item.iconClass || ''}`} />
							</div>
						)}
						<div className="details">
							<div className="number">{item.number}</div>
							<div className="text">{item.text}</div>
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
