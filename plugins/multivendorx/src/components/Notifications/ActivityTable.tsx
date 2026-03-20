/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, Container, Column, TableCard, InfoItem } from 'zyra';
import { QueryProps, TableRow } from '@/services/type';
import { getUrl } from '@/services/commonFunction';

const ActivityTable = (React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'notifications'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
				},
			})
			.then((response) => {
				const items = response.data || [];

				setRows(items);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Failed to fetch announcements', error);
				setError(__('Failed to load announcements', 'multivendorx'));
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	const headers = {
		store_name: {
			label: __('Store', 'multivendorx'),
			render: (row) => (
				<InfoItem
					title={row.store_name}
					titleLink={getUrl(row.store_id, 'store', 'edit')}
					avatar={{
						iconClass: 'store-inventory',
					}}
				/>
			),
		},
		title: {
			label: __('Title', 'multivendorx'),
		},
		type: {
			label: __('Type', 'multivendorx'),
			type: 'status',
		},
		created_at: {
			label: __('Date', 'multivendorx'),
			type: 'date',
		},
	};

	return (
		<Container general>
			<Column>
				{error && <div className="error-notice">{error}</div>}
				<TableCard
					headers={headers}
					rows={rows}
					totalRows={totalRows}
					isLoading={isLoading}
					onQueryUpdate={doRefreshTableData}
					format={appLocalizer.date_format}
				/>
			</Column>
		</Container>
	);
});

export default ActivityTable;
