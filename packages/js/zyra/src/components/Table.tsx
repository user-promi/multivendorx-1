/**
 * External dependencies
 */
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import {
    useReactTable,
    flexRender,
    /* eslint-disable import/named */
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    /* eslint-enable import/named */
} from '@tanstack/react-table';

import type {
    ColumnDef,
    OnChangeFn,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';

/**
 * Internal dependencies
 */
import BasicInput from './BasicInput';
import SelectInput from './SelectInput';
import '../styles/web/Table.scss';

const PENALTY = 28;
const COOLDOWN = 1;

// Types
type Status = {
    key: string;
    name: string;
    count: number;
};

interface TableCellProps {
    title: string;
    fieldValue?: string | boolean;
    children?: ReactNode;
    type?: string;
    header?: any;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface RealtimeFilter {
    name: string;
    render: (
        updateFilter: (key: string, value: any) => void,
        filterValue: any
    ) => ReactNode;
}

export const TableCell: React.FC<TableCellProps> = ({
    title,
    fieldValue,
    children,
    type = '',
    header,
    onChange,
}) => {
    const [cellData, setCellData] = useState(fieldValue);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        setCellData(fieldValue);
    }, [fieldValue]);

    let content;
    if (header?.editable === false) {
        type = '';
    }
    switch (type) {
        case 'product':
        case 'text':
        case 'number':
            content = (
                <div className={`table-row ${header.class}`}>
                    {type === 'product' && children}
                    <div className="table-data-container">
                        <BasicInput
                            inputClass="main-input"
                            type="text"
                            value={
                                type === 'number'
                                    ? String((cellData as string) || 0)
                                    : (cellData as string)
                            }
                            proSetting={false}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                const newValue = e.target.value;
                                setCellData((prev) =>
                                    prev === '0' ? newValue.slice(-1) : newValue
                                );
                                // Clear previous timeout if still waiting
                                if (timeoutRef.current) {
                                    clearTimeout(timeoutRef.current);
                                }
                                // Debounce the onChange call
                                timeoutRef.current = setTimeout(() => {
                                    if (onChange) {
                                        onChange(e);
                                    }
                                }, 2000);
                            }}
                        />
                    </div>
                </div>
            );
            break;
        case 'checkbox':
            content = (
                <div className="toggle-checkbox-header">
                    <div className="toggle-checkbox">
                        <input
                            type="checkbox"
                            className="toggle-checkbox"
                            name={title}
                            id={title}
                            checked={cellData as boolean}
                            onChange={(e) => {
                                setCellData(
                                    e.target.checked ? 'true' : 'false'
                                );
                                if (onChange) {
                                    onChange(
                                        e as unknown as React.ChangeEvent<HTMLInputElement>
                                    );
                                }
                            }}
                        />
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label htmlFor={title}>&nbsp;</label>
                    </div>
                </div>
            );
            break;
        case 'dropdown':
            const optionsVal = Object.entries(header.options).map(
                ([key, val]) => ({
                    key,
                    value: key,
                    label: String(val),
                })
            );
            content = (
                <SelectInput
                    wrapperClass="select-wrapper"
                    inputClass={`${header.class} dropdown-select`}
                    options={optionsVal}
                    value={fieldValue as string}
                    proSetting={false}
                    onChange={(e) => {
                        if (onChange) {
                            onChange(
                                e as unknown as React.ChangeEvent<HTMLInputElement>
                            );
                        }
                    }}
                />
            );
            break;
        default:
            content = (
                <div
                    title={fieldValue as string}
                    className="order-status table-row-custom"
                >
                    <h4 className="hide-title">{title}</h4>
                    {children}
                </div>
            );
    }

    return <>{content}</>;
};

// Loading table component
const LoadingTable: React.FC = () => (
    <table className="load-table">
        <tbody>
            {Array.from({ length: 10 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                    {Array.from({ length: 5 }).map((__, cellIndex) => (
                        <td key={cellIndex} className="load-table-td">
                            <div className="line" />
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    </table>
);

interface TableProps {
    data: Record<string, any>[] | null;
    columns: ColumnDef<Record<string, any>, any>[];
    rowSelection?: Record<string, boolean>;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
    defaultRowsPerPage?: number;
    realtimeFilter?: RealtimeFilter[];
    bulkActionComp?: () => React.ReactNode;
    pageCount: number;
    pagination: PaginationState;
    onPaginationChange: OnChangeFn<PaginationState>;
    typeCounts: Status[];
    autoLoading?: boolean;
    handlePagination?: (
        rowsPerPage: number,
        pageIndex: number,
        filterData: Record<string, any>
    ) => void;
    perPageOption: number[];
    successMsg?: string;
}

const Table: React.FC<TableProps> = ({
    data,
    columns,
    rowSelection = {},
    onRowSelectionChange,
    defaultRowsPerPage = 10,
    bulkActionComp,
    realtimeFilter,
    pageCount,
    pagination,
    onPaginationChange,
    typeCounts,
    autoLoading,
    handlePagination,
    perPageOption,
    successMsg,
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [filterData, setFilterData] = useState<Record<string, any>>({});
    // Counter variable for cooldown effect
    const counter = useRef(0);
    const counterId = useRef<NodeJS.Timeout | null>(null);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Hide some columns if screen is small
    const isSmallScreen = windowWidth < 768;

    // Assume first column is 'select', keep that always
    const visibleColumns = isSmallScreen ? columns.slice(0, 3) : columns;

    const getHiddenColumns = (row: any) => {
        return row
            .getVisibleCells()
            .filter(
                (cell: any) =>
                    !visibleColumns.find(
                        (col) =>
                            col.id === cell.column.id ||
                            col.header === cell.column.id
                    )
            );
    };

    // Function that handles filter changes.
    const handleFilterChange = (key: any, value: any) => {
        setFilterData((prevData) => ({
            ...prevData,
            [key]: value,
        }));
    };

    useEffect(() => {
        // Check if filter data is empty then this effect is for first time rendering.
        // Do nothing in this case.
        if (Object.keys(filterData).length === 0) {
            return;
        }
        // Set counter by penalti
        counter.current = PENALTY;
        // Clear previous counter.
        if (counterId.current) {
            clearInterval(counterId.current);
        }
        // Create new interval
        const intervalId = setInterval(() => {
            counter.current -= COOLDOWN;
            // Cooldown compleate time for db request.
            if (counter.current < 0) {
                // Set the loading
                if (autoLoading) {
                    setLoading(true);
                }
                // Call filter function
                handlePagination?.(defaultRowsPerPage, 1, filterData);
                // Set current page to one.
                // setCurrentPage(1);
                // Clear the interval.
                clearInterval(intervalId);
                counterId.current = null;
            }
        }, 50);
        // Store the interval id.
        counterId.current = intervalId as NodeJS.Timeout;
    }, [filterData, autoLoading, defaultRowsPerPage]);

    useEffect(() => {
        setLoading(data === null);
    }, [data]);

    const table = useReactTable({
        data: data || [],
        columns,
        state: { rowSelection, pagination },
        enableRowSelection: true,
        manualPagination: true,
        pageCount,
        onPaginationChange,
        onRowSelectionChange,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });
    const typeCountActive = filterData.typeCount || 'all';
    return (
        <>
            <div className="admin-table-wrapper-filter">
                {typeCounts &&
                    typeCounts.map((countInfo, index) => (
                        <div
                            key={index} // Add a key for better React performance
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                setFilterData({ typeCount: countInfo.key });
                            }}
                            className={
                                countInfo.key === typeCountActive
                                    ? 'type-count-active'
                                    : ''
                            }
                        >
                            {`${countInfo.name} (${countInfo.count})`}
                            {index !== typeCounts.length - 1 && ' |'}{' '}
                            {/* Add '|' except for the last item */}
                        </div>
                    ))}
            </div>
            <div className="filter-wrapper">
                <div className="wrap-bulk-all-date">
                    {realtimeFilter &&
                        realtimeFilter.map((filter: RealtimeFilter) => (
                            <React.Fragment key={filter.name}>
                                {filter.render(
                                    handleFilterChange,
                                    filterData[
                                        filter.name as keyof Record<string, any>
                                    ]
                                )}
                            </React.Fragment>
                        ))}
                </div>
                {bulkActionComp && bulkActionComp()}
            </div>

            {loading ? (
                <LoadingTable />
            ) : (
                <>
                    {data?.length === 0 && (
                        <div className="no-data">
                            <p>There are no records to display</p>
                        </div>
                    )}
                    {(data?.length as number) > 0 && (
                        <div className="table-wrapper">
                            <table className="admin-table">
                                <thead className="admin-table-header">
                                    {table
                                        .getHeaderGroups()
                                        .map((headerGroup) => (
                                            <tr
                                                key={headerGroup.id}
                                                className="header-row"
                                            >
                                                {headerGroup.headers
                                                    .filter((header) =>
                                                        visibleColumns.find(
                                                            (col) =>
                                                                col.id ===
                                                                    header
                                                                        .column
                                                                        .id ||
                                                                col.header ===
                                                                    header
                                                                        .column
                                                                        .id
                                                        )
                                                    )
                                                    .map((header) => (
                                                        <th
                                                            key={header.id}
                                                            className="header-col"
                                                        >
                                                            {
                                                                flexRender(
                                                                    header
                                                                        .column
                                                                        .columnDef
                                                                        .header,
                                                                    header.getContext()
                                                                ) as React.ReactNode
                                                            }
                                                        </th>
                                                    ))}
                                                {isSmallScreen && <th></th>}
                                            </tr>
                                        ))}
                                </thead>
                                <tbody className="admin-table-body">
                                    {table.getRowModel().rows.map((row) => (
                                        <tr key={row.id} className="admin-row">
                                            {row
                                                .getVisibleCells()
                                                .filter((cell) =>
                                                    visibleColumns.find(
                                                        (col) =>
                                                            col.id ===
                                                                cell.column
                                                                    .id ||
                                                            col.header ===
                                                                cell.column.id
                                                    )
                                                )
                                                .map((cell) => (
                                                    <td
                                                        key={cell.id}
                                                        className="admin-column"
                                                    >
                                                        {
                                                            flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext()
                                                            ) as React.ReactNode
                                                        }
                                                    </td>
                                                ))}
                                            {isSmallScreen && (
                                                <td className="responsive-cell">
                                                    <details>
                                                        <span></span>
                                                        <ul className="text-sm">
                                                            {getHiddenColumns(
                                                                row
                                                            ).map(
                                                                (cell: any) => (
                                                                    <li
                                                                        key={
                                                                            cell.id
                                                                        }
                                                                    >
                                                                        {flexRender(
                                                                            cell
                                                                                .column
                                                                                .columnDef
                                                                                .cell,
                                                                            cell.getContext()
                                                                        )}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </details>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Pagination Controls */}
                            <div className="table-pagination">
                                {/* Page size dropdown */}
                                <div className="pagination-number-wrapper">
                                    Rows per page:
                                    <select
                                        value={
                                            table.getState().pagination.pageSize
                                        }
                                        onChange={(e) =>
                                            table.setPageSize(
                                                Number(e.target.value)
                                            )
                                        }
                                    >
                                        {perPageOption.map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="pagination-arrow">
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        className={`${
                                            !table.getCanPreviousPage()
                                                ? 'pagination-button-disabled'
                                                : ''
                                        }`}
                                        onClick={() => {
                                            if (!table.getCanPreviousPage())
                                                return;
                                            table.setPageIndex(0);
                                        }}
                                    >
                                        <i className="admin-font adminlib-pagination-prev-arrow"></i>
                                    </div>
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        className={`${
                                            !table.getCanPreviousPage()
                                                ? 'pagination-button-disabled'
                                                : ''
                                        }`}
                                        onClick={() => {
                                            if (!table.getCanPreviousPage())
                                                return;
                                            table.previousPage();
                                        }}
                                    >
                                        <i className="admin-font adminlib-pagination-left-arrow"></i>
                                    </div>
                                    <span>
                                        Page{' '}
                                        {table.getState().pagination.pageIndex +
                                            1}{' '}
                                        of {pageCount}
                                    </span>
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        className={`${
                                            !table.getCanNextPage()
                                                ? 'pagination-button-disabled'
                                                : ''
                                        }`}
                                        onClick={() => {
                                            if (!table.getCanNextPage()) return;
                                            table.nextPage();
                                        }}
                                    >
                                        <i className="admin-font adminlib-pagination-right-arrow"></i>
                                    </div>
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        className={`${
                                            !table.getCanNextPage()
                                                ? 'pagination-button-disabled'
                                                : ''
                                        }`}
                                        onClick={() => {
                                            if (!table.getCanNextPage()) return;
                                            table.setPageIndex(pageCount - 1);
                                        }}
                                    >
                                        <i className="admin-font adminlib-pagination-next-arrow"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {successMsg && (
                        <div className="admin-notice-display-title">
                            <i className="admin-font adminlib-icon-yes"></i>
                            {successMsg}
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default Table;
