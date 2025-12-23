import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import {
	BasicInput,
	useModules,
	Table,
	TableCell,
	MultiCalendarInput,
} from 'zyra';
import {
	ColumnDef,
	RowSelectionState,
	PaginationState,
} from '@tanstack/react-table';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatCurrency } from '../services/commonFunction';
import AddProductCom from './add-products';
import SpmvProducts from './spmv-products';
import { ReactNode } from 'react';
import { applyFilters } from '@wordpress/hooks';

type ProductRow = {
	id: number;
	product_name?: string;
	product_sku?: string;
	price?: string;
	stock?: string;
	categories?: string;
	date?: string;
	status?: string;
};

type FilterData = {
	searchAction?: string;
	searchField?: string;
	category?: any;
	stock_status?: string;
	productType?: string;
};
export interface RealtimeFilter {
	name: string;
	render: (
		updateFilter: (key: string, value: any) => void,
		filterValue: any
	) => ReactNode;
}
const formatWooDate = (dateString: string) => {
	if (!dateString) {
		return '-';
	}
	const date = new Date(dateString);
	return date.toLocaleString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
};

const stockStatusOptions = [
	{ key: '', name: 'Stock Status' },
	{ key: 'instock', name: 'In Stock' },
	{ key: 'outofstock', name: 'Out of Stock' },
	{ key: 'onbackorder', name: 'On Backorder' },
];
const productTypeOptions = [
	{ key: '', name: 'Product Type' },
	{ key: 'simple', name: 'Simple Product' },
	{ key: 'variable', name: 'Variable Product' },
	{ key: 'grouped', name: 'Grouped Product' },
	{ key: 'external', name: 'External/Affiliate Product' },
];
const AllProduct: React.FC = () => {
	const [data, setData] = useState<ProductRow[]>([]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [totalRows, setTotalRows] = useState<number>(0);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [AddProduct, setAddProduct] = useState(false);
	const [categoriesList, setCategoriesList] = useState<
		{ id: number; name: string }[]
	>([]);
	const [pageCount, setPageCount] = useState(0);
	const { modules } = useModules();
	const [newProductId, setNewProductId] = useState(null);

	const location = useLocation();
	const navigate = useNavigate();

	const query = new URLSearchParams(location.search);
	let element = query.get('element');

	if (!element) {
		const parts = location.pathname.split('/').filter(Boolean);
		if (parts.length >= 3) {
			element = element || parts[2];
		}
		// if (parts.length >= 4) {
		//     element = element || parts[2];
		// }
	}

	const isAddProduct = element === 'edit';
	const isSpmvOn = element === 'add';

	const tabs = [
		{
			id: 'general',
			label: __('General', 'multivendorx'),
			content: (
				<>
					<div className="form-group-wrapper">
						<div className="form-group">
							<label>{__('Discount type', 'multivendorx')}</label>
							<BasicInput type="text" name="discount_type" />
						</div>
					</div>

					<div className="form-group-wrapper">
						<div className="form-group">
							<label>{__('Coupon amount', 'multivendorx')}</label>
							<BasicInput type="number" name="coupon_amount" />
						</div>
					</div>

					<div className="form-group-wrapper">
						<div className="form-group">
							<label>
								{__('Allow free shipping', 'multivendorx')}
							</label>
							<BasicInput type="text" name="free_shipping" />
						</div>
					</div>

					<div className="form-group-wrapper">
						<div className="form-group">
							<label>
								{__('Coupon expiry date', 'multivendorx')}
							</label>
							<BasicInput type="date" name="expiry_date" />
						</div>
					</div>
				</>
			),
		},
		{
			id: 'limits',
			label: __('Usage Limits', 'multivendorx'),
			content: (
				<>
					<div className="form-group-wrapper">
						<div className="form-group">
							<label>
								{__('Usage limit per coupon', 'multivendorx')}
							</label>
							<BasicInput type="number" name="limit_per_coupon" />
						</div>
					</div>

					<div className="form-group-wrapper">
						<div className="form-group">
							<label>
								{__('Limit usage to X items', 'multivendorx')}
							</label>
							<BasicInput type="number" name="limit_per_items" />
						</div>
					</div>

					<div className="form-group-wrapper">
						<div className="form-group">
							<label>
								{__('Usage limit per user', 'multivendorx')}
							</label>
							<BasicInput type="number" name="limit_per_user" />
						</div>
					</div>
				</>
			),
		},
		{
			id: 'restriction',
			label: __('Usage Restriction', 'multivendorx'),
			content: (
				<>
					<div className="form-group-wrapper">
						<div className="form-group">
							<label>{__('Minimum spend', 'multivendorx')}</label>
							<BasicInput type="number" name="min_spend" />
						</div>
					</div>

					<div className="form-group-wrapper">
						<div className="form-group">
							<label>{__('Maximum spend', 'multivendorx')}</label>
							<BasicInput type="number" name="max_spend" />
						</div>
					</div>

					<div className="form-group-wrapper">
						<div className="form-group">
							<label>
								{__('Individual use only', 'multivendorx')}
							</label>
							<BasicInput type="checkbox" name="individual_use" />
						</div>
					</div>

					<div className="form-group-wrapper">
						<div className="form-group">
							<label>
								{__('Exclude sale items', 'multivendorx')}
							</label>
							<BasicInput
								type="checkbox"
								name="exclude_sale_items"
							/>
						</div>
					</div>

					<div className="form-group-wrapper">
						<div className="form-group">
							<label>{__('Products', 'multivendorx')}</label>
							<BasicInput type="text" name="products" />
						</div>
					</div>

					<div className="form-group-wrapper">
						<div className="form-group">
							<label>
								{__('Exclude products', 'multivendorx')}
							</label>
							<BasicInput type="text" name="exclude_products" />
						</div>
					</div>

					<div className="form-group-wrapper">
						<div className="form-group">
							<label>
								{__('Product categories', 'multivendorx')}
							</label>
							<BasicInput type="text" name="product_categories" />
						</div>
					</div>

					<div className="form-group-wrapper">
						<div className="form-group">
							<label>
								{__('Exclude categories', 'multivendorx')}
							</label>
							<BasicInput type="text" name="exclude_categories" />
						</div>
					</div>

					<div className="form-group-wrapper">
						<div className="form-group">
							<label>
								{__('Allowed emails', 'multivendorx')}
							</label>
							<BasicInput type="text" name="allowed_emails" />
						</div>
					</div>
				</>
			),
		},
	];

	const fetchCategories = async () => {
		try {
			const response = await axios.get(
				`${appLocalizer.apiUrl}/wc/v3/products/categories`,
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				}
			);
			setCategoriesList(response.data);
		} catch (error) {
			console.error('Error fetching categories:', error);
		}
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	const columns: ColumnDef<ProductRow>[] = [
		// {
		// 	id: 'select',
		// 	header: ({ table }) => (
		// 		<input
		// 			type="checkbox"
		// 			checked={table.getIsAllRowsSelected()}
		// 			onChange={table.getToggleAllRowsSelectedHandler()}
		// 		/>
		// 	),
		// 	cell: ({ row }) => (
		// 		<input
		// 			type="checkbox"
		// 			checked={row.getIsSelected()}
		// 			onChange={row.getToggleSelectedHandler()}
		// 		/>
		// 	),
		// },
		{
			header: __('Product Name', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.name}>
					<a
						href={row.original.permalink}
						target="_blank"
						rel="noopener noreferrer"
						className="product-wrapper"
					>
						{row.original.image ? (
							// <img
							// 	src={row.original.image}
							// 	alt={row.original.name}
							// />
							<></>
						) : (
							<i className="item-icon adminlib-multi-product"></i>
						)}

						<div className="details">
							<span className="title">{row.original.name}</span>
							<span className="des">SKU: {row.original.sku}</span>
						</div>
					</a>
				</TableCell>
			),
		},
		{
			id: 'price',
			accessorKey: 'price',
			accessorFn: (row) => parseFloat(row.price || '0'),
			enableSorting: true,
			header: __('Price', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell>
					{row.original.price !== '-'
						? formatCurrency(row.original.price)
						: '-'}
				</TableCell>
			),
		},
		{
			header: __('Stock', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell>
					{row.original.stock_status === 'instock' && (
						<span className="admin-badge green-color">
							In Stock
						</span>
					)}
					{row.original.stock_status === 'outofstock' && (
						<span className="admin-badge red-color">
							Out of Stock
						</span>
					)}
					{row.original.stock_status === 'onbackorder' && (
						<span className="admin-badge yellow-color">
							On Backorder
						</span>
					)}
					{!row.original.stock_status && '-'}
				</TableCell>
			),
		},
		{
			header: __('Categories', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell>
					{row.original.categories?.length
						? row.original.categories.map((c) => c.name).join(', ')
						: '-'}
				</TableCell>
			),
		},
		{
			id: 'date_created',
			accessorKey: 'date_created',
			enableSorting: true,
			header: __('Date', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell>
					{formatWooDate(row.original.date_created)}
				</TableCell>
			),
		},
		{
			id: 'status',
			header: __('Status', 'multivendorx'),
			cell: ({ row }) => {
				return <TableCell type="status" status={row.original.status} />;
			},
		},
		{
			id: 'action',
			header: __('Action', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell
					type="action-dropdown"
					rowData={row.original}
					header={{
						actions: [
							{
								label: __('Edit', 'multivendorx'),
								icon: 'adminlib-edit',
								onClick: (rowData) => {
									if (appLocalizer.permalink_structure) {
										navigate(
											`/${appLocalizer.dashboard_slug}/products/edit/${rowData.id}/`
										);
									} else {
										navigate(
											`?page_id=${appLocalizer.dashboard_page_id}&segment=products&element=edit&context_id=${rowData.id}`
										);
									}
								},
								hover: true,
							},
							{
								label: __('View', 'multivendorx'),
								icon: 'adminlib-eye',
								onClick: () => {
									window.location.assign(
										`${row.original.permalink}`
									);
								},
							},
							{
								label: __('Copy URL', 'multivendorx'),
								icon: 'adminlib-vendor-form-copy',
								onClick: () => {
									const url = row.original.permalink;
									navigator.clipboard
										.writeText(url)
										.catch(() => {});
								},
							},
							{
								label: __('Delete', 'multivendorx'),
								icon: 'adminlib-delete delete',
								onClick: (rowData) => {
									handleDelete(rowData.id);
								},
								hover: true,
							},
						],
					}}
				/>
			),
		},
	];

	const realtimeFilter: RealtimeFilter[] = [
		{
			name: 'category',
			render: (
				updateFilter: (key: string, value: string) => void,
				filterValue: string | undefined
			) => (
				<div className="group-field">
					<select
						name="category"
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					>
						<option value="">Category</option>
						{categoriesList?.map((s: any) => (
							<option key={s.id} value={s.id}>
								{s.name}
							</option>
						))}
					</select>
				</div>
			),
		},
		{
			name: 'productType',
			render: (
				updateFilter: (key: string, value: string) => void,
				filterValue: string | undefined
			) => (
				<div className="group-field">
					<select
						name="productType"
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					>
						{productTypeOptions?.map((s: any) => (
							<option key={s.key} value={s.key}>
								{s.name}
							</option>
						))}
					</select>
				</div>
			),
		},
		{
			name: 'stock_status',
			render: (
				updateFilter: (key: string, value: string) => void,
				filterValue: string | undefined
			) => (
				<div className="group-field">
					<select
						name="stock_status"
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					>
						{stockStatusOptions?.map((s: any) => (
							<option key={s.key} value={s.key}>
								{s.name}
							</option>
						))}
					</select>
				</div>
			),
		},
		{
			name: 'date',
			render: (updateFilter) => (
				<div className="right">
					<MultiCalendarInput
						wrapperClass=""
						inputClass=""
						onChange={(range: any) => {
							updateFilter('date', {
								start_date: range.startDate,
								end_date: range.endDate,
							});
						}}
					/>
				</div>
			),
		},
	];
	const searchFilter: RealtimeFilter[] = [
		{
			name: 'searchField',
			render: (updateFilter, filterValue) => (
				<>
					<div className="search-section">
						<input
							name="searchField"
							type="text"
							placeholder={__('Search', 'multivendorx')}
							onChange={(e) => {
								updateFilter(e.target.name, e.target.value);
							}}
							className="basic-select"
							value={filterValue || ''}
						/>
						<i className="adminlib-search"></i>
					</div>
				</>
			),
		},
	];

	useEffect(() => {
		const currentPage = pagination.pageIndex + 1;
		const rowsPerPage = pagination.pageSize;
		requestData(rowsPerPage, currentPage);
	}, [pagination]);

	// Fetch data from backend.
	function requestData(
		rowsPerPage = 10,
		currentPage = 1,
		category = '',
		stockStatus = '', // <-- Positional Argument 4
		searchField = '', // <-- Positional Argument 5
		productType = '', // <-- Positional Argument 6
		startDate = new Date(0),
		endDate = new Date()
	) {
		setData([]);

		const params: any = {
			page: currentPage,
			row: rowsPerPage,
			category: category,
			after: startDate,
			before: endDate,
			meta_key: 'multivendorx_store_id',
			value: appLocalizer.store_id,
		};

		if (stockStatus) {
			params.stock_status = stockStatus;
		}

		if (searchField) {
			params.search = searchField;
		}
		if (productType) {
			params.type = productType;
		}
		axios({
			method: 'GET',
			url: `${appLocalizer.apiUrl}/wc/v3/products`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: params, // Use the dynamically built params object
		})
			.then((response) => {
				const formattedProducts = response.data.map((p: any) => ({
					id: p.id,
					name: p.name,
					sku: p.sku || '-',
					price: p.price ? `${p.price}` : '-',
					stock_status: p.stock_status,
					categories: p.categories,
					date_created: p.date_created,
					status: p.status,
					permalink: p.permalink,
				}));
				setData(formattedProducts);

				const total = parseInt(response.headers['x-wp-total']);
				setTotalRows(total);
				setPageCount(Math.ceil(total / rowsPerPage));
			})
			.catch(() => {
				setData([]);
				setTotalRows(0);
				setPageCount(0);
			});
	}

	// Handle pagination and filter changes
	const requestApiForData = (
		rowsPerPage: number,
		currentPage: number,
		filterData: FilterData
	) => {
		setData([]);
		// Arguments must be passed in the exact order requestData expects them.
		requestData(
			rowsPerPage, // 1: rowsPerPage
			currentPage, // 2: currentPage
			filterData?.category, // 3: category
			filterData?.stock_status, // 4: stockStatus
			filterData?.searchField, // 5: searchField (Assuming filterData uses searchField for the search box value)
			filterData?.productType, // 6: productType
			filterData?.date?.start_date, // 7: startDate
			filterData?.date?.end_date // 8: endDate
		);
	};

	const handleDelete = async (productId) => {
		const res = await axios.delete(
			`${appLocalizer.apiUrl}/wc/v3/products/${productId}`,
			{
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			}
		);

		requestData();
	};

	const createAutoDraftProduct = () => {
		try {
			const payload = {
				name: 'Auto Draft',
				status: 'draft',
			};

			axios
				.post(`${appLocalizer.apiUrl}/wc/v3/products/`, payload, {
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				})
				.then((res) => {
					setNewProductId(res.data.id);
				});
		} catch (err) {
			console.error(
				'Error creating auto-draft:',
				err.response?.data || err
			);
		}
	};

	useEffect(() => {
		if (!newProductId) {
			return;
		}

		if (appLocalizer.permalink_structure) {
			navigate(
				`/${appLocalizer.dashboard_slug}/products/edit/${newProductId}`
			);
		} else {
			navigate(
				`?page_id=${appLocalizer.dashboard_page_id}&segment=products&element=edit&context_id=${newProductId}`
			);
		}
	}, [newProductId]);

	return (
		<>
			{!isAddProduct && !isSpmvOn && (
				<>
					<div className="page-title-wrapper">
						<div className="page-title">
							<div className="title">{__('All Products', 'multivendorx')}</div>
							<div className="des">
								{__('Manage your store products', 'multivendorx')}
							</div>
						</div>
						<div className="buttons-wrapper">
							{modules.includes('import-export') && 
								applyFilters(
									'product_import_export',
									null,
									{
										requestData,
										rowSelection,
										data,
									}
								)								
							}
							<div
								className="admin-btn btn-purple-bg"
								onClick={() => {
									if (modules.includes('spmv')) {
										if (appLocalizer.permalink_structure) {
											navigate(
												`/${appLocalizer.dashboard_slug}/products/add/`
											);
										} else {
											navigate(
												`?page_id=${appLocalizer.dashboard_page_id}&segment=products&element=add`
											);
										}
									} else {
										createAutoDraftProduct();
									}
								}}
							>
								<i className="adminlib-plus"></i> {__('Add New', 'multivendorx')}
							</div>
						</div>
					</div>
					<div className="admin-table-wrapper">
						<Table
							data={data}
							columns={
								columns as ColumnDef<Record<string, any>, any>[]
							}
							rowSelection={rowSelection}
							onRowSelectionChange={setRowSelection}
							defaultRowsPerPage={10}
							pageCount={pageCount}
							pagination={pagination}
							onPaginationChange={setPagination}
							perPageOption={[10, 25, 50]}
							typeCounts={[]}
							realtimeFilter={realtimeFilter}
							handlePagination={requestApiForData}
							totalCounts={totalRows}
							searchFilter={searchFilter}
						/>
					</div>
				</>
			)}

			{isAddProduct && <AddProductCom />}
			{isSpmvOn && <SpmvProducts />}
		</>
	);
};

export default AllProduct;
