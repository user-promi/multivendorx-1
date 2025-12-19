import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import {
	BasicInput,
	useModules,
	Table,
	TableCell,
	MultiCalendarInput,
	CommonPopup,
	SelectInput,
	MultiCheckBox,
	getApiLink,
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

// Import mode options
const importModeOptions = [
	{ value: 'create', label: 'Create New Products Only' },
	{ value: 'update', label: 'Update Existing Products Only' },
	{ value: 'both', label: 'Create & Update' },
];

// Export format options
const exportFormatOptions = [
	{ value: 'csv', label: 'CSV' },
	{ value: 'json', label: 'JSON' },
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

	// Import/Export states
	const [showImportPopup, setShowImportPopup] = useState(false);
	const [showExportPopup, setShowExportPopup] = useState(false);
	const [importFile, setImportFile] = useState<File | null>(null);
	const [importMode, setImportMode] = useState('both');
	const [importSettings, setImportSettings] = useState({
		skipErrors: true,
		updateStock: true,
		updatePrice: true,
		updateCategories: true,
	});
	const [isImporting, setIsImporting] = useState(false);
	const [importProgress, setImportProgress] = useState<any>(null);
	const [importId, setImportId] = useState<string>('');
	const [exportFormat, setExportFormat] = useState('csv');
	const [exportFields, setExportFields] = useState([
		'id',
		'name',
		'sku',
		'price',
		'stock_quantity',
		'stock_status',
		'categories',
		'description',
	]);
	const [isExporting, setIsExporting] = useState(false);

	if (!element) {
		const parts = location.pathname.split('/').filter(Boolean);
		if (parts.length >= 3) {
			element = element || parts[2];
		}
	}

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

	// Fetch data from backend
	function requestData(
		rowsPerPage = 10,
		currentPage = 1,
		category = '',
		stockStatus = '',
		searchField = '',
		productType = '',
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
			params: params,
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

	const requestApiForData = (
		rowsPerPage: number,
		currentPage: number,
		filterData: FilterData
	) => {
		setData([]);
		requestData(
			rowsPerPage,
			currentPage,
			filterData?.category,
			filterData?.stock_status,
			filterData?.searchField,
			filterData?.productType,
			filterData?.date?.start_date,
			filterData?.date?.end_date
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

	const normalizeProductId = (id: any): number | null => {
		if (!id) return null;
		const parsed = parseInt(String(id).trim(), 10);
		return Number.isNaN(parsed) ? null : parsed;
	  };	  

	// Parse CSV/TSV file in browser (native implementation)
	const parseCSV = (file: File): Promise<any[]> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const text = e.target?.result as string;
					const lines = text.split('\n').filter(line => line.trim());
					
					if (lines.length === 0) {
						resolve([]);
						return;
					}
					
					// Detect delimiter (tab or comma)
					const firstLine = lines[0];
					let delimiter = ',';
					if (firstLine.includes('\t') && !firstLine.includes(',,')) {
						delimiter = '\t';
					}
					
					// Parse headers
					const headers = parseCSVLine(lines[0], delimiter);
					
					// Parse data rows
					const data = [];
					for (let i = 1; i < lines.length; i++) {
						const values = parseCSVLine(lines[i], delimiter);
						const row: any = {};
						
						headers.forEach((header, index) => {
							row[header.trim()] = values[index] ? values[index].trim() : '';
						});
						
						data.push(row);
					}
					
					resolve(data);
				} catch (error) {
					reject(error);
				}
			};
			reader.onerror = () => reject(reader.error);
			reader.readAsText(file);
		});
	};

	// Helper to parse CSV/TSV line (handles quoted values)
	const parseCSVLine = (line: string, delimiter: string = ','): string[] => {
		const result = [];
		let current = '';
		let inQuotes = false;
		
		for (let i = 0; i < line.length; i++) {
			const char = line[i];
			
			if (char === '"') {
				// Handle escaped quotes
				if (inQuotes && line[i + 1] === '"') {
					current += '"';
					i++; // Skip next quote
				} else {
					inQuotes = !inQuotes;
				}
			} else if (char === delimiter && !inQuotes) {
				result.push(current);
				current = '';
			} else {
				current += char;
			}
		}
		
		result.push(current);
		return result;
	};

	// Escape CSV fields
	const escapeCSVField = (field: string): string => {
		if (field === null || field === undefined) return '';
		const stringField = String(field);
		
		// If field contains commas, quotes, or newlines, wrap in quotes
		if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
			// Escape existing quotes
			const escaped = stringField.replace(/"/g, '""');
			return `"${escaped}"`;
		}
		
		return stringField;
	};

	// Unescape CSV fields
	const unescapeCSVField = (field: string): string => {
		if (field.startsWith('"') && field.endsWith('"')) {
			field = field.slice(1, -1);
		}
		return field.replace(/""/g, '"');
	};

	// Convert product to CSV format
	const productToCSVRow = (product: any) => {
		return {
			'ID': product.id,
			'Name': escapeCSVField(product.name),
			'SKU': escapeCSVField(product.sku || ''),
			'Price': product.price || '',
			'Regular Price': product.regular_price || '',
			'Sale Price': product.sale_price || '',
			'Stock Quantity': product.stock_quantity || '',
			'Stock Status': product.stock_status || '',
			'Description': escapeCSVField(product.description || ''),
			'Short Description': escapeCSVField(product.short_description || ''),
			'Categories': product.categories?.map((c: any) => escapeCSVField(c.name)).join('|') || '',
			'Tags': product.tags?.map((t: any) => escapeCSVField(t.name)).join('|') || '',
			'Type': product.type || 'simple',
			'Status': product.status || 'publish',
			'Featured': product.featured ? 'yes' : 'no',
			'Virtual': product.virtual ? 'yes' : 'no',
			'Downloadable': product.downloadable ? 'yes' : 'no',
			'Manage Stock': product.manage_stock ? 'yes' : 'no',
			'Backorders': product.backorders || 'no',
			'Sold Individually': product.sold_individually ? 'yes' : 'no'
		};
	};

	// Convert CSV row to product data - UPDATED FOR WOOCOMMERCE CSV FORMAT
	const convertCSVRowToProduct = (row: any) => {
		// Map WooCommerce CSV column names to API field names
		const getField = (wooFieldName: string, alternativeNames: string[] = []) => {
			const fieldNames = [wooFieldName, ...alternativeNames];
			
			for (const fieldName of fieldNames) {
				if (row[fieldName] !== undefined && row[fieldName] !== '') {
					return row[fieldName];
				}
			}
			return '';
		};

		// Handle multiple type values (e.g., "simple, downloadable, virtual")
		const typeField = getField('Type', ['type']);
		let productType = 'simple';
		if (typeField.includes('simple')) {
			productType = 'simple';
		} else if (typeField.includes('variable')) {
			productType = 'variable';
		} else if (typeField.includes('grouped')) {
			productType = 'grouped';
		} else if (typeField.includes('external')) {
			productType = 'external';
		}

		// Handle published status
		const publishedField = getField('Published', ['published']);
		const isPublished = publishedField === '1' || publishedField.toLowerCase() === 'yes';
		
		// Handle stock status
		const inStockField = getField('In stock?', ['In stock?', 'stock_status']);
		let stockStatus = 'instock';
		if (inStockField === '0' || inStockField.toLowerCase() === 'no' || inStockField.toLowerCase() === 'outofstock') {
			stockStatus = 'outofstock';
		}

		// Handle backorders - FIXED
		const backordersField = getField('Backorders allowed?', ['Backorders allowed?', 'backorders']);
		let backordersValue = 'no';
		if (backordersField === '1' || backordersField.toLowerCase() === 'yes') {
			backordersValue = 'yes';
		} else if (backordersField.toLowerCase() === 'notify') {
			backordersValue = 'notify';
		}

		const productData: any = {
			name: getField('Name', ['name']) || '',
			type: productType,
			status: isPublished ? 'publish' : 'draft',
			sku: getField('SKU', ['sku']) || '',
			regular_price: getField('Regular price', ['Regular price', 'regular_price']) || '',
			sale_price: getField('Sale price', ['Sale price', 'sale_price']) || '',
			price: getField('Price', ['price']) || '',
			description: unescapeCSVField(getField('Description', ['description']) || ''),
			short_description: unescapeCSVField(getField('Short description', ['Short description', 'short_description']) || ''),
			manage_stock: (getField('Manage Stock', ['Manage Stock', 'manage_stock']) || 'no').toLowerCase() === 'yes',
			stock_quantity: parseInt(getField('Stock', ['Stock', 'stock_quantity']) || '0'),
			stock_status: stockStatus,
			backorders: backordersValue, // FIXED: Now properly mapped to 'no', 'notify', or 'yes'
			featured: (getField('Is featured?', ['Is featured?', 'featured']) || '0') === '1' || getField('Is featured?', ['Is featured?', 'featured']).toLowerCase() === 'yes',
			virtual: typeField.includes('virtual') || (getField('Virtual', ['virtual']) || 'no').toLowerCase() === 'yes',
			downloadable: typeField.includes('downloadable') || (getField('Downloadable', ['downloadable']) || 'no').toLowerCase() === 'yes',
			sold_individually: (getField('Sold individually?', ['Sold individually?', 'sold_individually']) || '0') === '1' || getField('Sold individually?', ['Sold individually?', 'sold_individually']).toLowerCase() === 'yes',
			weight: getField('Weight (lbs)', ['Weight (lbs)', 'weight']) || '',
			dimensions: {
				length: getField('Length (in)', ['Length (in)', 'length']) || '',
				width: getField('Width (in)', ['Width (in)', 'width']) || '',
				height: getField('Height (in)', ['Height (in)', 'height']) || ''
			}
		};

		// Clean up numeric fields - ensure they're valid numbers or empty strings
		const cleanNumericField = (value: string): string => {
			if (!value || value.trim() === '') return '';
			
			// Remove any currency symbols, commas, etc.
			const cleaned = value.replace(/[^\d.-]/g, '');
			const num = parseFloat(cleaned);
			
			// Return empty string for invalid numbers
			if (isNaN(num)) return '';
			
			// For WooCommerce, prices should have exactly 2 decimal places
			if (value.includes('.')) {
				return num.toFixed(2);
			}
			
			return num.toString();
		};

		productData.regular_price = cleanNumericField(productData.regular_price);
		productData.sale_price = cleanNumericField(productData.sale_price);
		productData.price = cleanNumericField(productData.price);
		productData.weight = cleanNumericField(productData.weight);

		// Handle categories (WooCommerce format: "Clothing > Tshirts")
		const categoriesField = getField('Categories', ['categories']) || '';
		if (categoriesField) {
			const categoryPaths = categoriesField.split('|').map((path: string) => path.trim()).filter(Boolean);
			productData.categories = categoryPaths.map((path: string) => {
				// For hierarchical categories like "Clothing > Tshirts", we need to handle them differently
				// For now, just use the last part as the category name
				const parts = path.split('>').map(part => part.trim());
				return { name: parts[parts.length - 1] };
			});
		}

		// Handle tags
		const tagsField = getField('Tags', ['tags']) || '';
		if (tagsField) {
			const tagNames = tagsField.split('|').map((t: string) => t.trim()).filter(Boolean);
			productData.tags = tagNames.map((name: string) => ({ name }));
		}

		// Handle images (comma-separated URLs)
		const imagesField = getField('Images', ['images']) || '';
		if (imagesField) {
			const imageUrls = imagesField.split(',').map((url: string) => url.trim()).filter(Boolean);
			productData.images = imageUrls.map((url: string) => ({ src: url }));
		}

		// Add store ID
		if (!productData.meta_data) {
			productData.meta_data = [];
		}
		
		productData.meta_data.push({
			key: 'multivendorx_store_id',
			value: appLocalizer.store_id
		});

		// Clean up - remove empty fields that might cause validation errors
		Object.keys(productData).forEach(key => {
			if (productData[key] === '' || productData[key] === null || productData[key] === undefined) {
				delete productData[key];
			}
		});

		// Remove empty dimensions object
		if (productData.dimensions && 
			(!productData.dimensions.length && !productData.dimensions.width && !productData.dimensions.height)) {
			delete productData.dimensions;
		}

		// Remove manage_stock if false (WooCommerce API prefers it not to be included when false)
		if (productData.manage_stock === false) {
			delete productData.manage_stock;
		}

		// For variable products, we need to handle them differently
		if (productType === 'variable') {
			// Variable products should not have regular_price or sale_price at parent level
			delete productData.regular_price;
			delete productData.sale_price;
			delete productData.price;
			delete productData.stock_quantity;
			delete productData.stock_status;
			delete productData.manage_stock;
			delete productData.backorders;
		}

		return productData;
	};

	// Start import directly from React
	const startImport = async () => {
		if (!importFile) {
			alert(__('Please select a file to import', 'multivendorx'));
			return;
		}

		try {
			setIsImporting(true);
			setImportProgress({
				total: 0,
				processed: 0,
				success: 0,
				failed: 0,
				errors: []
			});

			// Parse CSV in browser
			const csvData = await parseCSV(importFile);
			
			setImportProgress(prev => ({
				...prev,
				total: csvData.length
			}));

			const results = [];
			const errors = [];
			
			// Process each row
			for (let i = 0; i < csvData.length; i++) {
				try {
					const row = csvData[i];
					
					// Skip empty rows or rows without name
					if (!row.Name && !row.name && !row['Product Name']) {
						continue;
					}
					
					const productData = convertCSVRowToProduct(row);
					
					// Log product data for debugging (remove in production)
					console.log(`Processing row ${i + 1}:`, {
						name: productData.name,
						type: productData.type,
						backorders: productData.backorders,
						regular_price: productData.regular_price,
						sale_price: productData.sale_price
					});
					
					// Check if product exists
					const rawId = row.ID || row.id || row['Product ID'];
					const productId = normalizeProductId(rawId);

					
					let response;
					if (importMode === 'create' || !productId) {
						// Create new product
						response = await axios.post(
							`${appLocalizer.apiUrl}/wc/v3/products`,
							productData,
							{
								headers: { 'X-WP-Nonce': appLocalizer.nonce }
							}
						);
					} else if (importMode === 'update' && productId) {
						// Update existing product - but first check if product exists and belongs to current store
						try {
							// First, try to get the product to check if it belongs to this store
							const existingProduct = await axios.get(
								`${appLocalizer.apiUrl}/wc/v3/products/${productId}`,
								{
									headers: { 'X-WP-Nonce': appLocalizer.nonce }
								}
							);
							
							// Check if product belongs to current store
							const storeIdMeta = existingProduct.data.meta_data?.find(
								(meta: any) => meta.key === 'multivendorx_store_id'
							);
							
							if (storeIdMeta && storeIdMeta.value == appLocalizer.store_id) {
								// Update existing product
								response = await axios.put(
									`${appLocalizer.apiUrl}/wc/v3/products/${productId}`,
									productData,
									{
										headers: { 'X-WP-Nonce': appLocalizer.nonce }
									}
								);
							} else {
								throw new Error('Product does not belong to your store');
							}
						} catch (getError) {
							if (getError.response?.status === 404) {
								throw new Error('Product not found');
							} else {
								throw getError;
							}
						}
					} else if (importMode === 'both') {
						// Create or update
						if (productId) {
							try {
							  const existing = await axios.get(
								`${appLocalizer.apiUrl}/wc/v3/products/${productId}`,
								{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
							  );
						  
							  // Verify store ownership
							  const storeMeta = existing.data.meta_data?.find(
								(m: any) => m.key === 'multivendorx_store_id'
							  );
						  
							  if (!storeMeta || storeMeta.value != appLocalizer.store_id) {
								throw new Error('NOT_OWNED');
							  }
						  
							  // ✅ Safe update
							  response = await axios.put(
								`${appLocalizer.apiUrl}/wc/v3/products/${productId}`,
								productData,
								{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
							  );
						  
							} catch (err: any) {
							  // ❗ If ANY issue → create instead
							  response = await axios.post(
								`${appLocalizer.apiUrl}/wc/v3/products`,
								productData,
								{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
							  );
							}
						} else {
						// No ID → create
						response = await axios.post(
							`${appLocalizer.apiUrl}/wc/v3/products`,
							productData,
							{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
						);
						}
					}

					results.push({ success: true, data: response.data });
					
					setImportProgress(prev => ({
						...prev,
						processed: i + 1,
						success: prev.success + 1
					}));
					
				} catch (error) {
					console.error(`Error processing row ${i + 1}:`, error.response?.data || error);
					
					const errorMessage = error.response?.data?.message || 
										error.response?.data?.error?.message || 
										error.message || 
										'Unknown error';
					results.push({ 
						success: false, 
						error: errorMessage,
						row: i + 1,
						details: error.response?.data?.params || {}
					});
					
					errors.push(`Row ${i + 1}: ${errorMessage}`);
					if (error.response?.data?.params) {
						errors.push(`Invalid params: ${JSON.stringify(error.response.data.params)}`);
					}
					
					setImportProgress(prev => ({
						...prev,
						processed: i + 1,
						failed: prev.failed + 1,
						errors: errors.slice(-5) // Keep only last 5 errors
					}));
					
					// If importSettings.skipErrors is false, stop on first error
					if (!importSettings.skipErrors) {
						break;
					}
				}

				// Small delay to prevent rate limiting
				if (i % 5 === 0) {
					await new Promise(resolve => setTimeout(resolve, 200));
				}
			}

			setIsImporting(false);
			
			// Refresh product list
			requestData();
			
			// Show summary
			if (results.some(r => !r.success)) {
				alert(__(
					`Import completed with ${results.filter(r => !r.success).length} errors.\nSuccess: ${results.filter(r => r.success).length}\nFailed: ${results.filter(r => !r.success).length}`,
					'multivendorx'
				));
			} else {
				alert(__(
					`Import completed successfully!\nImported: ${results.length} products`,
					'multivendorx'
				));
			}
			
		} catch (error) {
			console.error('Import failed:', error);
			setIsImporting(false);
			alert(__('Failed to parse CSV file. Please check the file format.', 'multivendorx'));
		}
	};

	const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			if (!file.name.endsWith('.csv')) {
				alert(__('Please select a CSV file', 'multivendorx'));
				return;
			}
			setImportFile(file);
		}
	};

	// Handle export directly from React
	const handleExport = async () => {
		try {
			setIsExporting(true);
			
			// Get selected product IDs or all products
			const selectedIds = Object.keys(rowSelection)
				.filter(id => rowSelection[id])
				.map(id => data[parseInt(id)]?.id)
				.filter(id => id);

			// Build query params
			const params: any = {
				per_page: selectedIds.length > 0 ? selectedIds.length : 100,
				page: 1
			};

			if (selectedIds.length > 0) {
				params.include = selectedIds.join(',');
			}

			// Add store filter
			params.meta_key = 'multivendorx_store_id';
			params.value = appLocalizer.store_id;

			// Fetch products
			const response = await axios.get(
				`${appLocalizer.apiUrl}/wc/v3/products`,
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: params
				}
			);

			const products = response.data;
			
			// Convert to CSV
			const csvData = products.map(productToCSVRow);
			
			if (csvData.length === 0) {
				alert(__('No products found to export.', 'multivendorx'));
				setIsExporting(false);
				return;
			}
			
			// Get headers
			const headers = Object.keys(csvData[0]);
			
			// Create CSV string
			let csvString = '';
			
			// Add headers
			csvString += headers.map(escapeCSVField).join(',') + '\n';
			
			// Add data rows
			csvData.forEach(row => {
				const rowValues = headers.map(header => escapeCSVField(String(row[header] || '')));
				csvString += rowValues.join(',') + '\n';
			});

			// For CSV format
			if (exportFormat === 'csv') {
				// Create BLOB and download
				const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				const timestamp = new Date().toISOString().split('T')[0];
				link.download = `products-export-${timestamp}.csv`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			} 
			// For JSON format
			else {
				const jsonData = products.map(product => ({
					id: product.id,
					name: product.name,
					sku: product.sku,
					price: product.price,
					regular_price: product.regular_price,
					sale_price: product.sale_price,
					stock_quantity: product.stock_quantity,
					stock_status: product.stock_status,
					categories: product.categories?.map((c: any) => c.name),
					tags: product.tags?.map((t: any) => t.name),
					type: product.type,
					status: product.status
				}));
				
				const jsonString = JSON.stringify(jsonData, null, 2);
				const blob = new Blob([jsonString], { 
					type: 'application/json;charset=utf-8;' 
				});
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				const timestamp = new Date().toISOString().split('T')[0];
				link.download = `products-export-${timestamp}.json`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			}
			
			setIsExporting(false);
			setShowExportPopup(false);
			
		} catch (error) {
			console.error('Export failed:', error);
			setIsExporting(false);
			alert(__('Export failed. Please try again.', 'multivendorx'));
		}
	};

	// Download sample template
	const downloadSampleTemplate = () => {
		const sampleData = [
			{
				'ID': '',
				'Name': 'Premium T-Shirt',
				'SKU': 'TSHIRT-001',
				'Price': '29.99',
				'Regular Price': '39.99',
				'Sale Price': '29.99',
				'Stock Quantity': '100',
				'Stock Status': 'instock',
				'Description': 'Premium quality cotton t-shirt...',
				'Short Description': 'Comfortable premium t-shirt',
				'Categories': 'Clothing|T-Shirts',
				'Tags': 'Summer|Cotton',
				'Type': 'simple',
				'Status': 'publish',
				'Featured': 'no',
				'Virtual': 'no',
				'Downloadable': 'no',
				'Manage Stock': 'yes',
				'Backorders': 'no',
				'Sold Individually': 'no'
			},
			{
				'ID': 'Row number (optional for new products)',
				'Name': 'Product name (required)',
				'SKU': 'Stock keeping unit (optional)',
				'Price': 'Current price',
				'Regular Price': 'Regular price before sale',
				'Sale Price': 'Sale price',
				'Stock Quantity': 'Stock quantity number',
				'Stock Status': 'instock/outofstock/onbackorder',
				'Description': 'Full description',
				'Short Description': 'Short description',
				'Categories': 'Pipe separated: Category1|Category2',
				'Tags': 'Pipe separated: Tag1|Tag2',
				'Type': 'simple/variable/grouped/external',
				'Status': 'publish/draft/pending',
				'Featured': 'yes/no',
				'Virtual': 'yes/no',
				'Downloadable': 'yes/no',
				'Manage Stock': 'yes/no',
				'Backorders': 'no/notify/yes',
				'Sold Individually': 'yes/no'
			}
		];

		const headers = Object.keys(sampleData[0]);
		let csvString = '';
		
		// Add headers
		csvString += headers.map(escapeCSVField).join(',') + '\n';
		
		// Add data rows
		sampleData.forEach(row => {
			const rowValues = headers.map(header => escapeCSVField(String(row[header] || '')));
			csvString += rowValues.join(',') + '\n';
		});

		// Create BLOB and download
		const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'product-import-template.csv';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const resetImportForm = () => {
		setImportFile(null);
		setImportMode('both');
		setImportSettings({
			skipErrors: true,
			updateStock: true,
			updatePrice: true,
			updateCategories: true,
		});
		setImportProgress(null);
		setIsImporting(false);
	};

	const handleImportPopupClose = () => {
		setShowImportPopup(false);
		setTimeout(resetImportForm, 300);
	};

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
							{modules.includes('import-export') && (
								<>
									<div
										className="admin-btn btn-purple-bg"
										onClick={() => setShowImportPopup(true)}
									>
										<i className="adminlib-import"></i>
										{__('Import', 'multivendorx')}
									</div>
									<div
										className="admin-btn btn-purple-bg"
										onClick={() => setShowExportPopup(true)}
									>
										<i className="adminlib-export"></i>
										{__('Export', 'multivendorx')}
									</div>
								</>
							)}
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

			{/* Import Products Popup */}
			{showImportPopup && (
				<CommonPopup
					open={showImportPopup}
					onClick={() => setShowImportPopup(false)}
					width="50%"
					height="auto"
					header={
						<>
							<div className="title">
								<i className="adminlib-import"></i>
								{__('Import Products', 'multivendorx')}
							</div>
							<p>
								{__('Upload a CSV file to import products to your store', 'multivendorx')}
							</p>
							<i
								className="icon adminlib-close"
								onClick={handleImportPopupClose}
							></i>
						</>
					}
					footer={
						<>
							<div
								className="admin-btn btn-red"
								onClick={handleImportPopupClose}
							>
								{__('Cancel', 'multivendorx')}
							</div>
							<div
								className={`admin-btn btn-purple-bg ${isImporting ? 'disabled' : ''}`}
								onClick={!isImporting ? startImport : undefined}
							>
								{isImporting
									? __('Importing...', 'multivendorx')
									: __('Start Import', 'multivendorx')}
							</div>
						</>
					}
				>
					<div className="content">
						{/* File Upload Section */}
						<div className="form-group-wrapper">
							<div className="form-group">
								<label>{__('Select CSV File', 'multivendorx')}</label>
								<div className="file-upload-wrapper">
									<input
										type="file"
										accept=".csv"
										onChange={handleImportFileChange}
										disabled={isImporting}
										className="basic-input"
									/>
									{importFile && (
										<div className="file-info">
											<i className="adminlib-file"></i>
											<span>{importFile.name}</span>
											<span className="file-size">
												{(importFile.size / 1024).toFixed(2)} KB
											</span>
										</div>
									)}
								</div>
								<p className="settings-metabox-description">
									{__('Download the ', 'multivendorx')}
									<a 
										href="#" 
										onClick={(e) => {
											e.preventDefault();
											downloadSampleTemplate();
										}}
										style={{color: '#7c3aed', textDecoration: 'underline'}}
									>
										{__('sample template', 'multivendorx')}
									</a>
									{__(' for correct formatting', 'multivendorx')}
								</p>
							</div>
						</div>

						{/* Import Mode */}
						<div className="form-group-wrapper">
							<div className="form-group">
								<label>{__('Import Mode', 'multivendorx')}</label>
								<SelectInput
									options={importModeOptions}
									value={importMode}
									onChange={(selected) => setImportMode(selected.value)}
									disabled={isImporting}
								/>
							</div>
						</div>

						{/* Import Settings */}
						<div className="form-group-wrapper">
							<div className="form-group">
								<label>{__('Import Settings', 'multivendorx')}</label>
								<div className="checkbox-group">
									<MultiCheckBox
										wrapperClass="toggle-btn"
										inputWrapperClass="toggle-checkbox-header"
										inputInnerWrapperClass="toggle-checkbox"
										idPrefix="import-settings"
										type="checkbox"
										value={Object.keys(importSettings).filter(key => importSettings[key])}
										onChange={(values) => {
											const newSettings = { ...importSettings };
											Object.keys(importSettings).forEach(key => {
												newSettings[key] = values.includes(key);
											});
											setImportSettings(newSettings);
										}}
										disabled={isImporting}
										options={[
											{ key: 'skipErrors', value: 'skipErrors', label: 'Skip rows with errors' },
											{ key: 'updateStock', value: 'updateStock', label: 'Update stock quantities' },
											{ key: 'updatePrice', value: 'updatePrice', label: 'Update prices' },
											{ key: 'updateCategories', value: 'updateCategories', label: 'Update categories' },
										]}
									/>
								</div>
							</div>
						</div>

						{/* Import Progress */}
						{importProgress && (
							<div className="form-group-wrapper">
								<div className="form-group">
									<label>{__('Import Progress', 'multivendorx')}</label>
									<div className="progress-wrapper">
										<div className="progress-bar">
											<div 
												className="progress-fill"
												style={{ 
													width: `${importProgress.total > 0 ? (importProgress.processed / importProgress.total) * 100 : 0}%` 
												}}
											></div>
										</div>
										<div className="progress-stats">
											<span>
												{importProgress.processed} / {importProgress.total} {__('rows processed', 'multivendorx')}
											</span>
											<span>
												{__('Success:', 'multivendorx')} {importProgress.success || 0}
											</span>
											<span>
												{__('Failed:', 'multivendorx')} {importProgress.failed || 0}
											</span>
										</div>
										{importProgress.errors && importProgress.errors.length > 0 && (
											<div className="import-errors">
												<strong>{__('Recent Errors:', 'multivendorx')}</strong>
												<ul>
													{importProgress.errors.map((error: string, index: number) => (
														<li key={index}>{error}</li>
													))}
												</ul>
											</div>
										)}
									</div>
								</div>
							</div>
						)}
					</div>
				</CommonPopup>
			)}

			{/* Export Products Popup */}
			{showExportPopup && (
				<CommonPopup
					open={showExportPopup}
					onClick={() => setShowExportPopup(false)}
					width="40%"
					height="auto"
					header={
						<>
							<div className="title">
								<i className="adminlib-export"></i>
								{__('Export Products', 'multivendorx')}
							</div>
							<p>
								{__('Export your products to CSV or JSON format', 'multivendorx')}
							</p>
							<i
								className="icon adminlib-close"
								onClick={() => setShowExportPopup(false)}
							></i>
						</>
					}
					footer={
						<>
							<div
								className="admin-btn btn-red"
								onClick={() => setShowExportPopup(false)}
							>
								{__('Cancel', 'multivendorx')}
							</div>
							<div
								className={`admin-btn btn-purple-bg ${isExporting ? 'disabled' : ''}`}
								onClick={!isExporting ? handleExport : undefined}
							>
								{isExporting
									? __('Exporting...', 'multivendorx')
									: __('Export Products', 'multivendorx')}
							</div>
						</>
					}
				>
					<div className="content">
						{/* Export Format */}
						<div className="form-group-wrapper">
							<div className="form-group">
								<label>{__('Export Format', 'multivendorx')}</label>
								<SelectInput
									options={exportFormatOptions}
									value={exportFormat}
									onChange={(selected) => setExportFormat(selected.value)}
									disabled={isExporting}
								/>
							</div>
						</div>

						{/* Export Selection */}
						<div className="form-group-wrapper">
							<div className="form-group">
								<label>{__('Products to Export', 'multivendorx')}</label>
								<div className="export-selection">
									<p className="settings-metabox-description">
										{Object.keys(rowSelection).length > 0
											? `${Object.keys(rowSelection).length} ${__('products selected', 'multivendorx')}`
											: __('All products will be exported', 'multivendorx')}
									</p>
									{Object.keys(rowSelection).length === 0 && (
										<p className="settings-metabox-description">
											{__('Tip: Select specific products from the table above to export only those', 'multivendorx')}
										</p>
									)}
								</div>
							</div>
						</div>

						{/* Export Fields */}
						<div className="form-group-wrapper">
							<div className="form-group">
								<label>{__('Fields to Include', 'multivendorx')}</label>
								<div className="checkbox-group">
									<MultiCheckBox
										wrapperClass="toggle-btn"
										inputWrapperClass="toggle-checkbox-header"
										inputInnerWrapperClass="toggle-checkbox"
										idPrefix="export-fields"
										type="checkbox"
										value={exportFields}
										onChange={(values) => setExportFields(values)}
										disabled={isExporting}
										options={[
											{ key: 'id', value: 'id', label: 'ID' },
											{ key: 'name', value: 'name', label: 'Product Name' },
											{ key: 'sku', value: 'sku', label: 'SKU' },
											{ key: 'price', value: 'price', label: 'Price' },
											{ key: 'regular_price', value: 'regular_price', label: 'Regular Price' },
											{ key: 'sale_price', value: 'sale_price', label: 'Sale Price' },
											{ key: 'stock_quantity', value: 'stock_quantity', label: 'Stock Quantity' },
											{ key: 'stock_status', value: 'stock_status', label: 'Stock Status' },
											{ key: 'categories', value: 'categories', label: 'Categories' },
											{ key: 'description', value: 'description', label: 'Description' },
											{ key: 'short_description', value: 'short_description', label: 'Short Description' },
											{ key: 'type', value: 'type', label: 'Product Type' },
											{ key: 'status', value: 'status', label: 'Status' },
										]}
									/>
								</div>
							</div>
						</div>
					</div>
				</CommonPopup>
			)}
		</>
	);
};

export default AllProduct;
