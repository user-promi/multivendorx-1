import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TableCard from './TableCard';
import { TableHeader, TableRow } from './types';
import './table.scss';

/**
 * Table headers
 */
const headers: TableHeader[] = [
	{
		key: 'name',
		label: 'Product',
		isSortable: true,
		isLeftAligned: true,
		defaultSort: true,
	},
	{
		key: 'sku',
		label: 'SKU',
		isSortable: true,
	},
	{
		key: 'price',
		label: 'Price',
		isSortable: true,
		isNumeric: true,
	},
	{
		key: 'sales',
		label: 'Total Sales',
		isSortable: true,
		isNumeric: true,
	},
	{
		key: 'status',
		label: 'Status',
	},
];

const TableCardDemo: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	const [query, setQuery] = useState({
		orderby: 'date',
		order: 'desc',
		paged: 1,
		per_page: 20,
	});

	/**
	 * Fetch data from API
	 */
	const fetchData = async () => {
		setIsLoading(true);

		try {
			console.log(query)
			const response = await axios({
				method: 'GET',
				url: `${appLocalizer.apiUrl}/wc/v3/products`,
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: {
					meta_key: 'multivendorx_store_id',
					per_page: query.per_page,
					page: query.paged,
					orderby: query.orderby,
					order: query.order,
				},
			});

			/**
			 * Transform API response → TableRow[][]
			 * Adjust mapping based on actual API payload
			 */
			const mappedRows: TableRow[][] = response.data.map(
				(product: any) => [
					{
						display: (
							<a
								href={`/wp-admin/post.php?post=${product.id}&action=edit`}
								target="_blank"
								rel="noopener noreferrer"
							>
								{product.name}
							</a>
						),
						value: product.id, 
					},
					{
						display: product.sku || '—',
						value: product.sku || '',
					},
					{
						display: `$${product.price}`,
						value: Number(product.price),
					},
					{
						display: product.total_sales,
						value: product.total_sales,
					},
					{
						display: product.status,
						value: product.status,
					},
				]
			);


			setRows(mappedRows);

			/**
			 * WooCommerce sends total count via headers
			 */
			setTotalRows(
				Number(response.headers['x-wp-total']) || 0
			);
		} catch (error) {
			console.error('Failed to fetch table data', error);
			setRows([]);
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Refetch when query changes
	 */
	useEffect(() => {
		fetchData();
	}, [query]);

	/**
	 * TableCard query handler
	 */
	const onQueryChange =
		(param: string) =>
			(value?: string, direction?: string) => {
				setQuery((prev) => ({
					...prev,
					[param]:
						param === 'paged' || param === 'per_page'
							? Number(value)
							: value,
					order:
						param === 'sort'
							? direction
							: prev.order,
					orderby:
						param === 'sort'
							? value
							: prev.orderby,
				}));
			};

	return (
		<div style={{ padding: 20 }}>
			<h1>TableCard API Demo</h1>

			<TableCard
				title="Revenue Report"
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				rowsPerPage={query.per_page}
				query={query}
				isLoading={isLoading}
				onQueryChange={onQueryChange}
				rowKey={(row) => String(row[0]?.value)}
				tablePreface={
					<div>
						Data loaded from WooCommerce REST API.
					</div>
				}
				ids={rows.map((row, i) => String(row[0]?.value))}
				bulkActions={[
					{ label: 'Delete Selected', value: 'delete' },
					{ label: 'Mark as Featured', value: 'feature' },
				]}
				onBulkActionApply={(action, selectedIds) => {
					console.log('Action:', action, 'Selected IDs:', selectedIds);
					// Perform your API call or state update here
				}}
				search={{
					placeholder: 'Search Products...',
					// options: [
					// 	{ label: 'All', value: '' },
					// 	{ label: 'Published', value: 'publish' },
					// 	{ label: 'Draft', value: 'draft' },
					// ],
				}}
			/>
		</div>
	);
};

export default TableCardDemo;
