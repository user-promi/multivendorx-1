import React, { useEffect, useState } from 'react';
import { CommonPopup, getApiLink } from 'zyra';
import axios from 'axios';
import { Skeleton } from '@mui/material';
import { __ } from '@wordpress/i18n';

type NotificationsProps = {
    type?: 'notification' | 'activity';
};

const Notifications : React.FC<NotificationsProps> = ({
	type,
}) => {
	const [notifications, setNotifications] = useState<[] | null>(null);

	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'notifications'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				header: true,
				store_id: appLocalizer.store_id,
				type: type
			},
		}).then((response) => {
			setNotifications(response.data || []);
		});
	}, []);

	const handleNotificationClick = (id: number) => {
		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `notifications/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { 
				id, 
				is_read: true,
				store_id: appLocalizer.store_id,
			},
		}).then(() => {
			setNotifications((prev) => prev.filter((n) => n.id !== id));
		});
	};

	const dismissNotification = (id: number) => {
		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `notifications/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { 
				id, 
				is_dismissed: true,
				store_id: appLocalizer.store_id,
			},
		}).then(() => {
			setNotifications((prev) => prev.filter((n) => n.id !== id));
		});
	};

	if (notifications?.length === 0) {
		return (
			<li>
				<div className="item no-notifications">
					<span>{__('No notifications', 'multivendorx')}</span>
				</div>
			</li>
		);
	}
	return (
		<>
			<div className="dropdown-menu notification">
				<div className="title">
					{__('Notifications', 'multivendorx')}
					{notifications && notifications.length > 0 && (
						<span className="admin-badge green">
							{notifications.length} {__('New', 'multivendorx')}
						</span>
					)}
				</div>
				<div className="notification">
					<ul>
						{notifications && notifications.length > 0 ? (
							notifications.map((item, idx) => (
								<li key={idx}>
									<div className="item"
									onClick={() => handleNotificationClick(item.id)}
									>
										<div
											className={`icon admin-badge admin-color${idx + 5}`}
										>
											<i
												className={
													item.icon ||
													'adminlib-user-network-icon'
												}
											></i>
										</div>
										<div className="details">
											<span className="heading">
												{item.title}
											</span>
											<span className="message">
												{item.message}
											</span>
											<span className="time">
												{item.time}
											</span>
										</div>

										<i className="check-icon adminlib-check"></i>
										<i className="check-icon adminlib-cross"  
											onClick={(e) => {
												e.stopPropagation();
												dismissNotification(item.id)
											}}></i>
									</div>
								</li>
							))
						) : (
							<li>
								<div className="item">
									<Skeleton
										variant="text"
										width={400}
										height={70}
									/>
								</div>
								<div className="item">
									<Skeleton
										variant="text"
										width={400}
										height={70}
									/>
								</div>
								<div className="item">
									<Skeleton
										variant="text"
										width={400}
										height={70}
									/>
								</div>
								<div className="item">
									<Skeleton
										variant="text"
										width={400}
										height={70}
									/>
								</div>
							</li>
						)}
					</ul>
				</div>
				<div className="footer">
					<a
						href={
							appLocalizer.permalink_structure
								? `/${appLocalizer.dashboard_slug}/view-notifications`
								: `/?page_id=${appLocalizer.dashboard_page_id}&segment=view-notifications`
						}
						className="admin-btn btn-purple"
					>
						<i className="adminlib-eye"></i>{' '}
						{__('View all notifications', 'multivendorx')}
					</a>
				</div>
			</div>
		</>
	);
};
export default Notifications;
