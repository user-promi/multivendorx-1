import React from 'react';

export type ButtonAction = {
	label: string;
	icon?: string;
	onClick: () => void;
	className?: string;
};

type ButtonActionsProps = {
	actions?: ButtonAction[];
};

const ButtonActions: React.FC<ButtonActionsProps> = ({ actions = [] }) => {
	if (!actions.length) return null;

	return (
		<div className="table-button-actions">
			{actions.map((action, index) => (
				<button
					key={index}
					className={`admin-badge ${action.className || ''}`}
					onClick={action.onClick}
				>
					{action.icon && <i className={`adminfont-${action.icon}`} />}
					{action.label}
				</button>
			))}
		</div>
	);
};

export default ButtonActions;
