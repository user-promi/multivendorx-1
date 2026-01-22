import React, { Fragment, useState } from 'react';
import Table from './table';
import TableSummary, { TableSummaryPlaceholder } from './summary';
import Pagination from '../pagination/Pagination';
import { TableCardProps, TableRow } from './types';
import TablePlaceholder from './TablePlaceholder';
import './table.scss';
import BulkActionDropdown from './BulkActionDropdown';

/**
 * Default no-op handlers
 */
const defaultOnQueryChange =
	(param: string) =>
		(value?: string, direction?: string): void => { };

const defaultOnColumnsChange = (
	showCols: string[],
	key?: string
): void => { };

/**
 * Pure React TableCard
 */
const TableCard: React.FC<TableCardProps> = ({
	actions,
	className,
	hasSearch,
	tablePreface,
	headers = [],
	ids = [],
	isLoading = false,
	onQueryChange = defaultOnQueryChange,
	onColumnsChange = defaultOnColumnsChange,
	onSort,
	query = {},
	rowHeader = 0,
	bulkActions = [],
	onBulkActionApply,
	rows = [],
	rowsPerPage = 10,
	showMenu = true,
	summary,
	title,
	totalRows = 0,
	rowKey,
	emptyMessage,
	...props
}) => {
	const [selectedIds, setSelectedIds] = useState<number[]>([]);

	// Toggle single row
	const handleSelectRow = (id: number, selected: boolean) => {
		setSelectedIds((prev) =>
			selected ? [...prev, id] : prev.filter((x) => x !== id)
		);
	};

	// Toggle all rows
	const handleSelectAll = (selected: boolean) => {
		setSelectedIds(selected ? [...ids] : []);
	};

	// Handle bulk action apply
	const handleBulkApply = (action: string) => {
		onBulkActionApply?.(action, selectedIds);
		// optional: clear selection after apply
		setSelectedIds([]);
	};
	/**
	 * Determine default visible columns
	 */
	const getShowCols = (headersList: TableCardProps['headers'] = []) => {
		return headersList
			.map(({ key, visible }) =>
				visible === false ? null : key
			)
			.filter((k): k is string => Boolean(k));
	};

	const [showCols, setShowCols] = useState<string[]>(
		getShowCols(headers)
	);

	/**
	 * Toggle column visibility
	 */
	const onColumnToggle = (key: string) => () => {
		const isVisible = showCols.includes(key);

		if (isVisible) {
			// Reset sorting if hiding sorted column
			if (query.orderby === key) {
				const defaultSort =
					headers.find((h) => h.defaultSort) ||
					headers[0];

				if (defaultSort?.key) {
					onQueryChange('sort')(defaultSort.key, 'desc');
				}
			}

			const updated = showCols.filter((c) => c !== key);
			setShowCols(updated);
			onColumnsChange(updated, key);
		} else {
			const updated = [...showCols, key];
			setShowCols(updated);
			onColumnsChange(updated, key);
		}
	};

	/**
	 * Pagination handler
	 */
	const onPageChange = (
		newPage: number,
		direction?: 'previous' | 'next' | 'goto'
	) => {
		props.onPageChange?.(newPage, direction);
		onQueryChange('paged')(String(newPage), direction);
	};

	/**
	 * Derived visible headers & rows
	 */
	const visibleHeaders = headers.filter(({ key }) =>
		showCols.includes(key)
	);

	const visibleRows: TableRow[][] = rows.map((row) =>
		headers
			.map(({ key }, index) =>
				showCols.includes(key) ? row[index] : null
			)
			.filter((cell): cell is TableRow => cell !== null)
	);

	/**
	 * Root className (manual)
	 */
	const rootClassName = [
		'table-card',
		className,
		actions ? 'has-actions' : '',
		showMenu ? 'has-menu' : '',
		hasSearch ? 'has-search' : '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={rootClassName}>
			{/* HEADER */}
			<div className="table-card__header">
				<h2 className="table-card__title">{title}</h2>

				{actions && (
					<div className="table-card__actions">
						{actions}
					</div>
				)}

				{showMenu && (
					<div className="table-card__column-menu">
						<strong>Columns</strong>
						<ul>
							{headers.map(({ key, label, required }) => {
								if (required) return null;

								return (
									<li key={key}>
										<label>
											<input
												type="checkbox"
												checked={showCols.includes(key)}
												onChange={onColumnToggle(key)}
											/>
											{label}
										</label>
									</li>
								);
							})}
						</ul>
					</div>
				)}
			</div>

			{/* BODY */}
			<div className="table-card__body">
				{tablePreface && (
					<div className="table-card__preface">
						{tablePreface}
					</div>
				)}

				{isLoading ? (
					<Fragment>
						<span className="">
							Loading data
						</span>
						<TablePlaceholder
							numberOfRows={rowsPerPage}
							headers={visibleHeaders}
							rowHeader={rowHeader}
							caption={title}
							query={query}
						/>
					</Fragment>
				) : (
					<>
						{bulkActions.length > 0 && (
							<BulkActionDropdown
								actions={bulkActions}
								selectedIds={selectedIds}
								onApply={handleBulkApply}
							/>
						)}

						<Table
							rows={visibleRows}
							headers={visibleHeaders}
							rowHeader={rowHeader}
							caption={title}
							query={query}
							onSort={
								onSort ||
								(onQueryChange('sort') as (
									key: string,
									direction: string
								) => void)
							}
							rowKey={rowKey}
							emptyMessage={emptyMessage}
							ids={ids}
							selectedIds={selectedIds}
							onSelectRow={handleSelectRow}
							onSelectAll={handleSelectAll}
						/>
					</>

				)}

			</div>

			{/* FOOTER */}
			<div className="table-card__footer">
				{isLoading ? (
					<TableSummaryPlaceholder />
				) : (
					<Fragment>
						<Pagination
							key={Number(query.paged) || 1}
							page={Number(query.paged) || 1}
							perPage={rowsPerPage}
							total={totalRows}
							onPageChange={onPageChange}
							onPerPageChange={(perPage) =>
								onQueryChange('per_page')(String(perPage))
							}
						/>

						{summary && <TableSummary data={summary} />}
					</Fragment>
				)}
			</div>
		</div>
	);
};

export default TableCard;
