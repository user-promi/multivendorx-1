/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	FormGroup,
	FormGroupWrapper,
	getApiLink,
	PopupUI,
	SectionUI,
	TableCard,
	TableRow,
} from 'zyra';
import { formatCurrency } from '@/services/commonFunction';

type ViewCommissionProps = {
	open: boolean;
	onClose: () => void;
	commissionId: number;
};
interface CommissionData {
	order_id?: number;
	store_id?: number;
	status?: string;
	amount?: number;
	total?: number;
	shipping?: number;
	tax?: number;
	shipping_tax_amount?: number;
	commission_refunded?: number;
	note?: string;
	[key: string]: unknown;
}

interface OrderData {
	status?: string;
	shipping_lines?: Array<{
		method_title: string;
		total: string;
		total_tax: string;
	}>;
	line_items?: Array<{
		name: string;
		price: string;
		quantity: number;
		total?: string;
		total_tax?: string;
	}>;
	[key: string]: unknown;
}

const ViewCommission: React.FC<ViewCommissionProps> = ({
	open,
	onClose,
	commissionId,
}) => {
	const [commissionData, setCommissionData] = useState<CommissionData | null>(
		null
	);
	const [orderData, setOrderData] = useState<OrderData | null>(null);
	const [shippingItems, setShippingItems] = useState<TableRow[][]>([]);

	// Add new state
	const [orderItems, setOrderItems] = useState<TableRow[][]>([]);

	useEffect(() => {
		if (!commissionId) {
			setCommissionData(null);
			setOrderData(null);
			setOrderItems([]);
			return;
		}

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `commission/${commissionId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((res) => {
				const commission = res.data || {};
				setCommissionData(commission);

				if (commission.order_id) {
					axios({
						method: 'GET',
						url: `${appLocalizer.apiUrl}/wc/v3/orders/${commission.order_id}`,
						headers: { 'X-WP-Nonce': appLocalizer.nonce },
					})
						.then((orderRes) => {
							const order = orderRes.data || {};

							setOrderData(order);
							if (Array.isArray(order.shipping_lines)) {
								const mappedRows = order.shipping_lines.map(
									(ship) => ({
										method: ship.method_title,
										amount: ship.total,
										tax: ship.total_tax,
									})
								);

								setShippingItems(mappedRows);
							} else {
								setShippingItems([]);
							}

							if (Array.isArray(order.line_items)) {
								const mappedRows = order.line_items.map(
									(item) => {
										const total = parseFloat(
											item.total || '0'
										);
										const tax = parseFloat(
											item.total_tax || '0'
										);

										return {
											id: item.name, // product name
											cost: formatCurrency(item.price),
											qty: item.quantity,
											total: formatCurrency(total),
											tax: formatCurrency(tax),
										};
									}
								);

								setOrderItems(mappedRows);
							} else {
								setOrderItems([]);
							}
						})
						.catch(() => {
							setOrderData(null);
							setOrderItems([]);
						});
				}
			})
			.catch(() => {
				setCommissionData(null);
				setOrderData(null);
				setOrderItems([]);
			});
	}, [commissionId]);

	const popupColumns = {
		id: {
			label: __('Product', 'multivendorx'),
		},
		cost: {
			label: __('Cost', 'multivendorx'),
		},
		qty: {
			label: __('Qty', 'multivendorx'),
		},
		total: {
			label: __('Total', 'multivendorx'),
		},
		tax: {
			label: __('Tax', 'multivendorx'),
		},
	};

	const shippingColumns = {
		method: {
			label: __('Method', 'multivendorx'),
		},
		amount: {
			label: __('Amount', 'multivendorx'),
		},
		tax: {
			label: __('Tax', 'multivendorx'),
		},
	};

	return (
		<PopupUI
			open={open}
			onClose={onClose}
			width="70%"
			height="70%"
			header={{
				icon: 'commission',
				title: `${__('View Commission', 'multivendorx')}${commissionId ? ` #${commissionId}` : ''}`,
				description: __(
					'Details of this commission including stores, order breakdown, and notes.',
					'multivendorx'
				),
			}}
		>
			<div className="content multi">
				<div className="section left">
					<TableCard
						title={__('Order Details', 'multivendorx')}
						headers={popupColumns}
						rows={orderItems}
					/>

					{Array.isArray(shippingItems) &&
						shippingItems.length > 0 && (
							<TableCard
								title={__('Shipping', 'multivendorx')}
								headers={shippingColumns}
								rows={shippingItems}
							/>
						)}
				</div>

				<div className="section right">
					<FormGroupWrapper>
						<SectionUI
							title={__('Order Overview', 'multivendorx')}
						/>

						<FormGroup
							row
							label={__('Associated Order', 'multivendorx')}
						>
							{commissionData?.order_id ? (
								<a
									href={`${appLocalizer.site_url.replace(/\/$/, '')}/dashboard/orders/#view/${commissionData.order_id}`}
									target="_blank"
									rel="noopener noreferrer"
									className="link-item"
								>
									#{commissionData.order_id}
								</a>
							) : (
								'-'
							)}
						</FormGroup>

						<FormGroup
							row
							label={__('Order Status', 'multivendorx')}
						>
							<span className="admin-badge blue">
								{orderData?.status
									? orderData.status
											.replace(/^wc-/, '') // remove 'wc-' prefix if exists
											.replace(/_/g, ' ') // replace underscores with spaces
											.replace(/\b\w/g, (c) =>
												c.toUpperCase()
											) // capitalize first letter of each word
									: ''}
							</span>
						</FormGroup>

						<SectionUI
							title={__('Commission Overview', 'multivendorx')}
						/>

						<FormGroup
							row
							label={__('Commission Status', 'multivendorx')}
						>
							<span
								className={`admin-badge ${
									commissionData?.status === 'paid'
										? 'green'
										: 'red'
								}`}
							>
								{commissionData?.status
									? commissionData.status
											.replace(/^wc-/, '') // remove any prefix like 'wc-'
											.replace(/_/g, ' ') // replace underscores with spaces
											.replace(/\b\w/g, (c) =>
												c.toUpperCase()
											) // capitalize each word
									: ''}
							</span>
						</FormGroup>

						<FormGroup
							row
							label={__('Commission Amount', 'multivendorx')}
						>
							{formatCurrency(
								parseFloat(commissionData?.amount ?? 0) +
									parseFloat(
										commissionData?.commission_refunded ?? 0
									)
							)}
						</FormGroup>

						<FormGroup row label={__('Shipping', 'multivendorx')}>
							{formatCurrency(commissionData?.shipping)}
						</FormGroup>

						<FormGroup row label={__('Tax', 'multivendorx')}>
							{formatCurrency(
								Number(commissionData?.tax || 0) +
									Number(
										commissionData?.shipping_tax_amount || 0
									)
							)}
						</FormGroup>

						{commissionData?.commission_refunded > 0 && (
							<FormGroup
								row
								label={__('Commission refund', 'multivendorx')}
							>
								{formatCurrency(
									commissionData.commission_refunded
								)}
							</FormGroup>
						)}

						<FormGroup row label={__('Total', 'multivendorx')}>
							{formatCurrency(commissionData?.total)}
						</FormGroup>
					</FormGroupWrapper>

					{commissionData?.note && (
						<>
							<SectionUI
								title={__('Commission Notes', 'multivendorx')}
							/>
							<div className="settings-metabox-note">
								<i className="adminfont-info"></i>
								<p>{commissionData?.note}</p>
							</div>
						</>
					)}
				</div>
			</div>
		</PopupUI>
	);
};

export default ViewCommission;
