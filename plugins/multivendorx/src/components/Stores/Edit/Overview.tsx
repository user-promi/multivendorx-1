/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import {
	Analytics,
	Card,
	Column,
	Container,
	getApiLink,
	InfoItem,
	useModules,
	FormGroupWrapper,
	FormGroup,
	ButtonInputUI,
	PopupUI,
	MultiCheckBoxUI,
	CalendarInputUI,
	TextAreaUI,
	ChoiceToggleUI,
	ItemListUI,
	TableCard,
} from 'zyra';
import { formatCurrency } from '../../../services/commonFunction';
import LatestReview from './LatestReview';
import LatestRefundRequest from './LatestRefundRequest';

interface OverviewProps {
	id: string | null;
	storeData?: StoreData;
}

interface Transaction {
	id: number;
	amount: string | number;
	date: string;
	transaction_type: string;
	transaction_status: string;
}

interface Product {
	id: number;
	name: string;
	sku: string;
	price: string | number;
	images?: Array<{ src: string }>;
}

interface StoreData {
	transactions?: {
		balance?: number;
		locking_balance?: number;
	};
	request_withdrawal_amount?: number;
	create_time?: string;
	commission?: {
		commission_total?: number;
	};
	primary_owner_info?: {
		data?: {
			display_name?: string;
			user_email?: string;
		};
	};
}

const Overview: React.FC<OverviewProps> = ({ id, storeData }) => {
	const navigate = useNavigate();
	const { modules } = useModules();

	const [recentDebits, setRecentDebits] = useState<Transaction[]>([]);
	const [recentProducts, setRecentProducts] = useState<Product[]>([]);
	const [Vacation, setVacation] = useState(false);
	const [vacationMode, setvacationMode] = useState<string[]>([]);

	useEffect(() => {
		if (!id) {
			return;
		}

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'transaction'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: 1,
				row: 3,
				store_id: id,
				transaction_type: 'Withdrawal',
				transaction_status: 'Completed',
				filter_status: 'Dr',
				orderBy: 'created_at',
				order: 'DESC',
			},
		})
			.then((response) => {
				setRecentDebits(response.data.transaction || []);
			})
			.catch((error) => {
				console.error(
					'Error fetching recent debit transactions:',
					error
				);
				setRecentDebits([]);
			});

		axios({
			method: 'GET',
			url: `${appLocalizer.apiUrl}/wc/v3/products`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: 1,
				per_page: 3,
				orderby: 'date',
				order: 'desc',
				meta_key: 'multivendorx_store_id',
				value: id,
			},
		})
			.then((response) => {
				setRecentProducts(response.data);
			})
			.catch((error) => {
				console.error('Failed to fetch recent products:', error);
			});
	}, []);

	useEffect(() => {
		const highlightId = location.state?.highlightTarget;
		if (highlightId) {
			const target = document.getElementById(highlightId);

			if (target) {
				target.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				});
				target.classList.add('highlight');
				const handleClick = () => {
					target.classList.remove('highlight');
					document.removeEventListener('click', handleClick);
				};
				setTimeout(() => {
					document.addEventListener('click', handleClick);
				}, 100);
			}
		}
	}, [location.state]);

	const overviewData = [
		{
			icon: 'wallet red',
			number: formatCurrency(storeData.transactions?.balance ?? 0),
			text: __('Wallet Balance', 'multivendorx'),
		},
		{
			icon: 'dollar yellow',
			number: formatCurrency(
				storeData.transactions?.locking_balance ?? 0
			),
			text: __('Upcoming Balance', 'multivendorx'),
		},
		{
			icon: 'wallet-in blue',
			number: formatCurrency(storeData.request_withdrawal_amount ?? 0),
			text: __('Requested Payout', 'multivendorx'),
		},
	];
	const handleCloseForm = () => {
		setVacation(false);
	};

	// business hours table (dynamic and remove)
	const scheduleColumns = {
		day: {
			label: 'Day',
		},
		time: {
			label: 'Working Hours',
		},
		break: {
			label: 'Break',
		},
	};
	const scheduleRows = [
		{ day: 'Mon', time: '9:00 AM–7:00 PM', break: 'Lunch' },
		{ day: 'Tue', time: '9:00 AM–7:00 PM', break: 'Lunch' },
		{ day: 'Wed', time: '9:00 AM–7:00 PM', break: '-' },
		{ day: 'Thu', time: '9:00 AM–7:00 PM', break: 'Lunch' },
		{ day: 'Fri', time: '9:00 AM–6:00 PM', break: 'Lunch' },
		{ day: 'Sat', time: '10:00 AM–4:00 PM', break: '-' },
		{ day: 'Sun', time: 'Closed', break: '-' },
	];
	return (
		<>
			<Container>
				<Column grid={8}>
					<Analytics
						variant="small"
						data={overviewData.map((item) => ({
							icon: item.icon,
							number: item.number,
							text: item.text,
						}))}
					/>
					<Card
						title={__('Recent payouts', 'multivendorx')}
						iconName="external icon"
						onIconClick={() => {
							navigate(
								`?page=multivendorx#&tab=transaction-history&store_id=${id}`
							);
						}}
					>
						{recentDebits && recentDebits.length > 0 ? (
							recentDebits.map((txn) => (
								<InfoItem
									key={txn.id}
									title={__('Bank Transfer', 'multivendorx')}
									descriptions={[
										{
											value: new Date(
												txn.date
											).toLocaleDateString('en-US', {
												month: 'short',
												day: '2-digit',
												year: 'numeric',
											}),
										},
									]}
									amount={formatCurrency(txn.amount)}
								/>
							))
						) : (
							<div className="no-data">
								{__('No recent payout', 'multivendorx')}
							</div>
						)}
					</Card>

					<Card
						title={__('Latest products', 'multivendorx')}
						iconName="external icon"
						onIconClick={() => {
							window.open(
								`${appLocalizer.admin_url}edit.php?post_type=product`,
								'_self'
							);
						}}
					>
						{recentProducts.length > 0 ? (
							recentProducts.map((product, idx) => {
								const productImage =
									product.images && product.images.length > 0
										? product.images[0].src
										: null;
								const editUrl = `${appLocalizer.site_url.replace(
									/\/$/,
									''
								)}/wp-admin/post.php?post=${
									product.id
								}&action=edit`;

								return (
									<InfoItem
										key={product.id}
										title={product.name}
										titleLink={editUrl}
										avatar={{
											image: productImage,
											iconClass: `item-icon adminfont-single-product admin-color${idx + 2}`,
										}}
										descriptions={[
											{
												label: __(
													'sku',
													'multivendorx'
												),
												value: product.sku,
											},
										]}
										amount={formatCurrency(
											product.price ?? 0
										)}
									/>
								);
							})
						) : (
							<p className="no-data">
								{__(
									'No recent products found.',
									'multivendorx'
								)}
							</p>
						)}
					</Card>

					{modules.includes('store-review') && (
						<Card
							title={__('Latest reviews', 'multivendorx')}
							iconName="external icon"
							onIconClick={() => {
								navigate(
									`?page=multivendorx#&tab=customer-support&subtab=review`
								);
							}}
						>
							<LatestReview store_id={id} />
						</Card>
					)}

					{modules.includes('marketplace-refund') && (
						<Card
							title={__('Latest refunds', 'multivendorx')}
							iconName="external icon"
							onIconClick={() => {
								navigate(
									`?page=multivendorx#&tab=customer-support&subtab=refund-requests`
								);
							}}
						>
							<div className="store-owner-details owner">
								<LatestRefundRequest store_id={id} />
							</div>
						</Card>
					)}
				</Column>
				<Column grid={4}>
					<Card
						title={__('Store information', 'multivendorx')}
						iconName="external icon"
						onIconClick={() => {
							navigate(
								`?page=multivendorx#&tab=stores&edit/${id}/&subtab=store`
							);
						}}
					>
						<FormGroupWrapper>
							<FormGroup
								row
								label={__('Created on', 'multivendorx')}
							>
								{storeData.create_time}
								<a
									className="sku"
									onClick={() => {
										navigate(
											`?page=multivendorx#&tab=stores&edit/${id}/&subtab=application-details`
										);
									}}
								>
									{__('Application Data', 'multivendorx')}
								</a>
							</FormGroup>
							<FormGroup
								row
								label={__('Lifetime earnings', 'multivendorx')}
							>
								{formatCurrency(
									storeData.commission?.commission_total ?? 0
								)}
							</FormGroup>
							<FormGroup
								row
								label={__('Total products', 'multivendorx')}
							>
								{__('3 (pkoro)', 'multivendorx')}
							</FormGroup>
							<ItemListUI
								className="mini-card"
								background
								items={[
									{
										title: __(
											'Membership Plan',
											'multivendorx'
										),
										desc: __(
											'Renews on Dec 15, 2024',
											'multivendorx'
										),
										value: __('Gold Plan', 'multivendorx'),
									},
								]}
							/>
						</FormGroupWrapper>
						<ButtonInputUI
							buttons={[
								{
									icon: 'vacation',
									text: __('Change plan', 'multivendorx'),
									// onClick: () => setVacation(true),
								},
								{
									icon: 'vacation',
									text: __('Assign Manually', 'multivendorx'),
									color: 'purple',
									// onClick: () => setVacation(true),
								},
							]}
						/>
					</Card>
					<Card
						title={__('Store status', 'multivendorx')}
						iconName="external icon"
						onIconClick={() => {
							navigate(
								`?page=multivendorx#&tab=stores&edit/${id}/&subtab=store`
							);
						}}
					>
						<FormGroupWrapper>
							<FormGroup
								row
								label={__('Current status', 'multivendorx')}
							>
								<span className="admin-badge green">
									{__('Open(pkoro)', 'multivendorx')}
								</span>
							</FormGroup>
							<FormGroup
								row
								label={__('Next opening', 'multivendorx')}
							>
								{__('Mon 9:00 AM (pkoro)', 'multivendorx')}
							</FormGroup>
							{appLocalizer.khali_dabba && (
								<>
									<FormGroup
										row
										label={__(
											'Vacation mode',
											'multivendorx'
										)}
									>
										<span className="admin-badge red">
											{' '}
											{__(
												'Inactive(pkoro)',
												'multivendorx'
											)}
										</span>
									</FormGroup>
								</>
							)}

							<PopupUI
								open={Vacation}
								onClose={handleCloseForm}
								width={31.25}
								height={40}
								header={{
									icon: 'vacation',
									title: __('Vacation Mode', 'multivendorx'),
									description: __(
										'Temporarily pause your store for a set period',
										'multivendorx'
									),
								}}
								footer={
									<ButtonInputUI
										buttons={[
											{
												icon: 'close',
												text: __(
													'Cancel',
													'multivendorx'
												),
												color: 'red',
												onClick: handleCloseForm,
											},
											{
												icon: 'save',
												text: __(
													'Save Vacation Settings',
													'multivendorx'
												),
												// onClick: () => handleSubmit(),
											},
										]}
									/>
								}
							>
								<FormGroupWrapper>
									<FormGroup
										label={__(
											'Enable Vacation Mode',
											'multivendorx'
										)}
									>
										<MultiCheckBoxUI
											look="toggle"
											value={vacationMode}
											onChange={(value) => {
												setvacationMode(value);
											}}
											options={[
												{
													label: 'Trial',
													value: 'trial',
												},
											]}
										/>
									</FormGroup>
									<FormGroup
										cols={2}
										label={__('Start Date', 'multivendorx')}
									>
										<CalendarInputUI
										// onChange={(range: DateRange) => {
										// 	setDateRange({
										// 		startDate: range.startDate,
										// 		endDate: range.endDate,
										// 	});
										// }}
										/>
									</FormGroup>
									<FormGroup
										cols={2}
										label={__('End Date', 'multivendorx')}
									>
										<CalendarInputUI
										// onChange={(range: DateRange) => {
										// 	setDateRange({
										// 		startDate: range.startDate,
										// 		endDate: range.endDate,
										// 	});
										// }}
										/>
									</FormGroup>
									<FormGroup
										label={__(
											'Vacation Message',
											'multivendorx'
										)}
									>
										<TextAreaUI
											name="answer"
											// value={answer}
											// onChange={(value: string) => setAnswer(value)}
										/>
									</FormGroup>
									<FormGroup
										label={__(
											'Cart Behaviour During Vacation',
											'multivendorx'
										)}
									>
										<ChoiceToggleUI
											options={[
												{
													key: 'draft',
													value: 'draft',
													label: __(
														'Disable Add to Cart',
														'multivendorx'
													),
												},
												{
													key: 'pending',
													value: 'pending',
													label: __(
														'Keep Add to Cart Active',
														'multivendorx'
													),
												},
												{
													key: 'publish',
													value: 'publish',
													label: __(
														'Pre-order Mode',
														'multivendorx'
													),
												},
											]}
											// value={formData.status}
											// onChange={(val: string) =>
											// 	handleChange('status', val)
											// }
										/>
									</FormGroup>
								</FormGroupWrapper>
							</PopupUI>
						</FormGroupWrapper>
						<ButtonInputUI
							buttons={[
								{
									icon: 'vacation',
									text: __('Set Vacation', 'multivendorx'),
									onClick: () => setVacation(true),
								},
								{
									icon: 'vacation',
									text: __('Edit Hours', 'multivendorx'),
									color: 'purple',
									// onClick: () => setVacation(true),
								},
							]}
						/>
					</Card>
					{appLocalizer.khali_dabba && (
						<Card
							title={__('Store hours', 'multivendorx')}
							desc={__(
								'Manage your weekly schedule and special hours',
								'multivendorx'
							)}
						>
							<TableCard
								headers={scheduleColumns}
								rows={scheduleRows}
								showMenu={false}
							/>
						</Card>
					)}

					{/* <Card
						title={__('Store staff', 'multivendorx')}
						iconName="external icon"
						onIconClick={() => {
							navigate(
								`?page=multivendorx#&tab=stores&edit/${id}/&subtab=staff`
							);
						}}
					>
						<InfoItem
							title={
								storeData.primary_owner_info?.data
									?.display_name ?? <Skeleton width={150} />
							}
							avatar={{
								iconClass:
									'item-icon adminfont-person secondary',
							}}
							descriptions={[
								{
									label: __('Email', 'multivendorx'),
									value: storeData.primary_owner_info?.data
										?.user_email ?? (
										<Skeleton width={150} />
									),
								},
							]}
							badges={[
								{
									text: __('Primary Owner', 'multivendorx'),
									className: 'green',
								},
								{
									text: <i className="adminfont-edit" />,
									className: 'blue',
									onClick: () => {
										navigate(
											`?page=multivendorx#&tab=stores&edit/${id}/&subtab=staff`,
											{
												state: {
													highlightTarget:
														'primary-owner',
												},
											}
										);
										setTimeout(() => {
											navigate(
												`?page=multivendorx#&tab=stores&edit/${id}/&subtab=staff`,
												{ replace: true }
											);
										}, 500);
									},
								},
							]}
						/>
					</Card> */}
				</Column>
			</Container>
		</>
	);
};

export default Overview;
