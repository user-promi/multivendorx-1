import { addFilter } from '@wordpress/hooks';
import { BasicInputUI, Card, DynamicRowSetting, FormGroup, FormGroupWrapper, MultiCheckBoxUI, SelectInputUI, ButtonInputUI, TableCard } from 'zyra';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RelatedList = ({ product, setProduct, handleChange }) => {
	const [ranges, setRanges] = useState([]);

	const downloadTemplate = {
		fields: [
			{
				key: 'rangeType',
				type: 'select',
				label: 'Range type',
				options: [
					{ label: 'Date range', value: 'date_range' },
					{ label: 'Custom range', value: 'custom_range' },
				],
			},
			{
				key: 'from',
				type: 'text',
				label: 'From',
				placeholder: 'dd/mm/yyyy',
			},
			{
				key: 'to',
				type: 'text',
				label: 'To',
				placeholder: 'dd/mm/yyyy',
			},
			{
				key: 'bookable',
				type: 'select',
				label: 'Bookable',
				options: [
					{ label: 'Yes', value: 'yes' },
					{ label: 'No', value: 'no' },
				],
			},
			{
				key: 'priority',
				type: 'number',
				label: 'Priority',
				placeholder: '10',
			},
		],
	};

	const AllDatesAre = [
		{ label: 'Available by default', value: 'percent' },
		{ label: 'Not available by default', value: 'fixed_product' },
	];
	const CheckRulesAgainst = [
		{ label: 'All blocks being booked', value: 'percent' },
		{ label: 'The first block only', value: 'fixed_product' },
		{ label: 'The last block only', value: 'fixed_product' },
	];

	const rangeTypeOptions = [
		{ label: 'Date range', value: 'date_range' },
		{ label: 'Time range', value: 'time_range' },
	];

	const addNewRange = () => {
		setRanges([
			...ranges,
			{
				id: Date.now(),
				rangeType: 'date_range',
				fromDate: '',
				toDate: '',
				fromTime: '',
				fromMin: '',
				toTime: '',
				toMin: '',
				fromTimePeriod: 'AM',
				toTimePeriod: 'AM',
				baseCost: 0,
				blockCost: 0,
			},
		]);
	};

	const updateRange = (id, field, value) => {
		setRanges(
			ranges.map((range) =>
				range.id === id ? { ...range, [field]: value } : range
			)
		);
	};

	const removeRange = (id) => {
		setRanges(ranges.filter((range) => range.id !== id));
	};

	// Table headers for cost ranges
	const rangeTableHeaders = {
		rangeType: {
			label: __('Range type', 'multivendorx'),
			render: (row) => (
				<SelectInputUI
					name={`range_type_${row.id}`}
					type="single-select"
					options={rangeTypeOptions}
					value={row.rangeType}
					onChange={(value) => updateRange(row.id, 'rangeType', value)}
				/>
			),
		},
		from: {
			label: __('From', 'multivendorx'),
			// width: 10,
			render: (row) => {
				const isDateRange = row.rangeType === 'date_range';

				if (isDateRange) {
					return (
						<BasicInputUI
							type="date"
							name={`from_date_${row.id}`}
							value={row.fromDate}
							placeholder="Start date"
							onChange={(value) => updateRange(row.id, 'fromDate', value)}
						/>
					);
				} else {
					return (
						<>
							<BasicInputUI
								type="time"
								name={`from_time_${row.id}`}
								value={row.fromTime}
								placeholder="12"
								onChange={(value) => updateRange(row.id, 'fromTime', value)}
							/>
							{/* <span>:</span>
							<BasicInputUI
								type="time"
								name={`from_min_${row.id}`}
								value={row.fromMin}
								placeholder="00"
								onChange={(value) => updateRange(row.id, 'fromMin', value)}
							/>
							<SelectInputUI
								name={`from_period_${row.id}`}
								type="single-select"
								options={[
									{ label: 'AM', value: 'AM' },
									{ label: 'PM', value: 'PM' },
								]}
								value={row.fromTimePeriod}
								onChange={(value) => updateRange(row.id, 'fromTimePeriod', value)}
							/> */}
						</>
					);
				}
			},
		},
		to: {
			label: __('To', 'multivendorx'),
			// width: 10,
			render: (row) => {
				const isDateRange = row.rangeType === 'date_range';

				if (isDateRange) {
					return (
						<BasicInputUI
							type="date"
							name={`to_date_${row.id}`}
							value={row.toDate}
							placeholder="End date"
							onChange={(value) => updateRange(row.id, 'toDate', value)}
						/>
					);
				} else {
					return (
						<>
							<BasicInputUI
								type="time"
								name={`to_time_${row.id}`}
								value={row.toTime}
								placeholder="12"
								onChange={(value) => updateRange(row.id, 'toTime', value)}
							/>
							{/* <span>:</span>
							<BasicInputUI
								type="time"
								name={`to_min_${row.id}`}
								value={row.toMin}
								placeholder="00"
								onChange={(value) => updateRange(row.id, 'toMin', value)}
							/>
							<SelectInputUI
								name={`to_period_${row.id}`}
								type="single-select"
								options={[
									{ label: 'AM', value: 'AM' },
									{ label: 'PM', value: 'PM' },
								]}
								value={row.toTimePeriod}
								onChange={(value) => updateRange(row.id, 'toTimePeriod', value)}
							/> */}
						</>
					);
				}
			},
		},
		baseCost: {
			label: __('Base cost ?', 'multivendorx'),
			render: (row) => (
				<>
					<BasicInputUI
						type="number"
						name={`base_cost_${row.id}`}
						value={row.baseCost}
						placeholder="0"
						onChange={(value) => updateRange(row.id, 'baseCost', value)}
					/>
				</>
			),
		},
		blockCost: {
			label: __('Block cost ?', 'multivendorx'),
			render: (row) => (
				<BasicInputUI
					type="number"
					name={`block_cost_${row.id}`}
					value={row.blockCost}
					placeholder="0"
					onChange={(value) => updateRange(row.id, 'blockCost', value)}
				/>
			),
		},
		action: {
			type: 'action',
			label: __('Action', 'multivendorx'),
			actions: [
				{
					label: __('Remove', 'multivendorx'),
					icon: 'delete',
					onClick: (row) => {
						if (row) {
							removeRange(row.id);
						}
					},
				},
			],
		},
	};

	return (
		<>
			{/* Cost Ranges Section */}
			<Card title={__('Cost ranges', 'multivendorx')} desc={__('Set different costs for specific date or time ranges.', 'multivendorx')}>
				<FormGroupWrapper>
					<FormGroup cols={3} label={__('Base cost', 'multivendorx')}>
						<BasicInputUI
							name="name"
						// value={product.name}
						// onChange={(value) => handleChange('name', value)}
						/>
					</FormGroup>
					<FormGroup cols={3} label={__('Block cost', 'multivendorx')}>
						<BasicInputUI
							name="name"
						// value={product.name}
						// onChange={(value) => handleChange('name', value)}
						/>
					</FormGroup>
					<FormGroup cols={3} label={__('Display cost', 'multivendorx')}>
						<BasicInputUI
							name="name"
						// value={product.name}
						// onChange={(value) => handleChange('name', value)}
						/>
					</FormGroup>
				</FormGroupWrapper>
				{ranges.length > 0 && (
					<TableCard
						headers={rangeTableHeaders}
						rows={ranges}
						showMenu={false}
					/>
				)}

				<ButtonInputUI
					buttons={[
						{
							text: __('Add range', 'multivendorx'),
							icon: 'plus',
							onClick: addNewRange,
						},
					]}
				/>
			</Card>

			<Card title={__('Related products', 'multivendorx')} desc={__('Suggest other items to help customers discover more of your store.', 'multivendorx')}>
				<FormGroupWrapper>
					<FormGroup cols={2} label={__('Recommend alongside this product', 'multivendorx')} desc={__('Shown as "You might also like" on the product page.', 'multivendorx')}>
						<BasicInputUI
							name="name"
						// value={product.name}
						// onChange={(value) => handleChange('name', value)}
						/>
					</FormGroup>
					<FormGroup cols={2} label={__('Offer as an add-on at checkout', 'multivendorx')} desc={__('Suggested when a customer adds this item to their cart.', 'multivendorx')}>
						<BasicInputUI
							name="name"
						// value={product.name}
						// onChange={(value) => handleChange('name', value)}
						/>
					</FormGroup>
				</FormGroupWrapper>
			</Card>

			<Card title={__('Availability settings', 'multivendorx')} desc={__('Control when this bookable product can be reserved', 'multivendorx')}>
				<FormGroupWrapper>
					<FormGroup cols={2} label={__('Max bookings per block', 'multivendorx')} desc={__('Maximum simultaneous bookings allowed per time block', 'multivendorx')}>
						<BasicInputUI
							name="name"
						// value={product.name}
						// onChange={(value) => handleChange('name', value)}
						/>
					</FormGroup>
					<FormGroup cols={2} label={__('Buffer days between bookings', 'multivendorx')} desc={__('Required gap before the next booking can start', 'multivendorx')}>
						<BasicInputUI
							name="name"
						// value={product.name}
						// onChange={(value) => handleChange('name', value)}
						/>
					</FormGroup>
					<FormGroup cols={2} label={__('Minimum block bookable', 'multivendorx')}>
						<BasicInputUI
							name="name"
						// value={product.name}
						// onChange={(value) => handleChange('name', value)}
						/>
					</FormGroup>
					<FormGroup cols={2} label={__('Maximum block bookable', 'multivendorx')}>
						<BasicInputUI
							name="name"
						// value={product.name}
						// onChange={(value) => handleChange('name', value)}
						/>
					</FormGroup>
					<FormGroup cols={2} label={__('All dates are...', 'multivendorx')}>
						<SelectInputUI
							name="discount_type"
							// value={formData.discount_type}
							options={AllDatesAre}
						// onChange={(value) =>
						// 	setFormData({
						// 		...formData,
						// 		discount_type: value || '',
						// 	})
						// }
						/>
					</FormGroup>
					<FormGroup cols={2} label={__('All dates are...', 'multivendorx')}>
						<SelectInputUI
							name="discount_type"
							// value={formData.discount_type}
							options={CheckRulesAgainst}
						// onChange={(value) =>
						// 	setFormData({
						// 		...formData,
						// 		discount_type: value || '',
						// 	})
						// }
						/>
					</FormGroup>
					<FormGroup cols={2} label={__('Adjacent buffering', 'multivendorx')} desc={__('By default the buffer period applies forward into the future of a booking. Enable this to apply the buffer both before and after each booking.', 'multivendorx')}>
						<div className="toggle-checkbox">
							<MultiCheckBoxUI
								type="checkbox"
								look="toggle"
								// value={trialEnabled}
								// onChange={(value) => {
								// 	setTrialEnabled(value);
								// }}
								options={[
									{ key: 'trial', value: 'trial', },
								]}
							/>
						</div>
					</FormGroup>
					<FormGroup cols={2} label={__('Restrict selectable days', 'multivendorx')} desc={__('Restrict which days of the week can be selected on the calendar. This does not affect your availability rules.', 'multivendorx')}>
						<div className="toggle-checkbox">
							<MultiCheckBoxUI
								type="checkbox"
								look="toggle"
								// value={trialEnabled}
								// onChange={(value) => {
								// 	setTrialEnabled(value);
								// }}
								options={[
									{ key: 'trial', value: 'trial', },
								]}
							/>
						</div>
					</FormGroup>
					<FormGroup>
						<DynamicRowSetting
							keyName="downloads"
							template={downloadTemplate}
							value={product.downloads || []}
							emptyText={__(
								'No downloadable files added',
								'multivendorx'
							)}
							addLabel={__('Add new', 'multivendorx')}
							onChange={(rows) => {
								const cleanedRows = rows.map(({ upload, ...rest }) => rest);

								setProduct((prev) => ({
									...prev,
									downloads: cleanedRows,
								}));
							}}
						/>
					</FormGroup>
				</FormGroupWrapper>
			</Card>

			<Card title={__('Availability settings', 'multivendorx')} desc={__('Control when this bookable product can be reserved', 'multivendorx')}>
				<FormGroupWrapper>
					<FormGroup cols={2} label={__('Affiliate Rate Type', 'multivendorx')} desc={__('Maximum simultaneous bookings allowed per time block', 'multivendorx')}>
						<BasicInputUI
							name="name"
						// value={product.name}
						// onChange={(value) => handleChange('name', value)}
						/>
					</FormGroup>
					<FormGroup cols={2} label={__('Affiliate Rate', 'multivendorx')} desc={__('Maximum simultaneous bookings allowed per time block', 'multivendorx')}>
						<BasicInputUI
							name="name"
						// value={product.name}
						// onChange={(value) => handleChange('name', value)}
						/>
					</FormGroup>
					<FormGroup cols={2} row label={__('Disable referrale', 'multivendorx')} desc={__('By default the buffer period applies forward into the future of a booking. Enable this to apply the buffer both before and after each booking.', 'multivendorx')}>
						<div className="toggle-checkbox">
							<MultiCheckBoxUI
								type="checkbox"
								look="toggle"
								// value={trialEnabled}
								// onChange={(value) => {
								// 	setTrialEnabled(value);
								// }}
								options={[
									{ key: 'trial', value: 'trial', },
								]}
							/>
						</div>
					</FormGroup>
				</FormGroupWrapper>
			</Card>
		</>
	);
};

addFilter(
	'multivendorx_add_product_middle_section',
	'multivendorx/related_list',
	(content, product, setProduct, handleChange, productFields) => {
		return (
			<>
				{content}
				{productFields.includes('linked_product') && (
					<RelatedList
						product={product}
						setProduct={setProduct}
						handleChange={handleChange}
					/>
				)}
			</>
		);
	},
	40
);