/**
 * External dependencies
 */
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import type { SortingState, Updater } from '@tanstack/react-table';
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
import '../styles/web/Table.scss';
import { Skeleton } from '@mui/material';

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
    rowId?: any;
    isExpanded?: any;
    onToggleRow?: (e: any) => void;
    onToggleActive?: (e: any) => void;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    showDropdown?: number | null;
    rowData?: any;
}

interface RealtimeFilter {
    name: string;
    render: (
        updateFilter: (key: string, value: any) => void,
        filterValue: any
    ) => ReactNode;
}
interface SearchFilter {
    name: string;
    render: (
        updateFilter: (key: string, value: any) => void,
        filterValue: any
    ) => ReactNode;
}
interface actionButton {
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
    rowId,
    onToggleRow,
    rowData,
}) => {
    const [cellData, setCellData] = useState(fieldValue);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [showDropdown, setShowDropdown] = useState<number | null>(null);

    const toggleDropdown = (id: number) => {
        setShowDropdown(prev => (prev === id ? null : id));
    };
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            // if click is not on dropdown toggle or inside dropdown → close it
            if (
                !(e.target as HTMLElement).closest('.action-dropdown') &&
                !(e.target as HTMLElement).closest(
                    '.adminlib-more-vertical'
                )
            ) {
                setShowDropdown(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () =>
            document.removeEventListener('click', handleClickOutside);
    }, []);
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
                <div className={`${header.class}`}>
                    {type === 'product' && children}
                    <div className="table-data-container">
                        <BasicInput
                            inputClass="main-input"
                            type={header.type}
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
                                    prev === '0'
                                        ? newValue.slice(-1)
                                        : newValue
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

        case 'expander':
            content = (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        rowId && onToggleRow?.(rowId);
                    }}
                    className={`table-data-container ${header.dependent ? '' : 'disable'} ${header.class || ''}`}
                >
                    <button
                        className="setting-btn"
                        disabled={!header.dependent}
                    >
                        <span className="bar bar1"></span>
                        <span className="bar bar2"></span>
                        <span className="bar bar1"></span>
                    </button>
                </div>
            );
            break;

        case 'checkbox':
            content = (
                <div className="toggle-checkbox-header" onClick={(e) => e.stopPropagation()}>
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
                <select
                    className={`${header.class} dropdown-select ${fieldValue}`}
                    value={fieldValue as string}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                        if (onChange) {
                            onChange(e.target as unknown as React.ChangeEvent<HTMLInputElement>);
                        }
                    }}
                >
                    {optionsVal.map((option) => (
                        <option key={option.key} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );
            break;
        case 'action-dropdown':
            content = (
                <div className="action-section">
                    <div className="action-icons">
                        {header.actions && header.actions.length > 2 ? (
                            <>
                                <i
                                    className="adminlib-more-vertical"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDropdown(rowId);
                                    }}
                                ></i>
                                <div className={`action-dropdown ${showDropdown === rowId ? "show" : "hover"}`}>
                                    <ul>
                                        {header.actions.map(action => (
                                            <li
                                                key={action.label}
                                                className={`${action.className || ""} ${action.hover ? "hover" : ""}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    action.onClick(rowData);
                                                }}
                                            >
                                                <i className={action.icon}></i>
                                                <span>{action.label}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <div className="inline-actions">
                                {header.actions?.map(action => (
                                    <div
                                        key={action.label}
                                        className={`inline-action-btn ${action.className || ""}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            action.onClick(rowData);
                                        }}
                                    >
                                        <i className={action.icon}></i>
                                        <span>{action.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                </div>

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
    searchFilter?: SearchFilter[];
    actionButton?: actionButton[];
    bulkActionComp?: () => React.ReactNode;
    pageCount: number;
    pagination: PaginationState;
    onPaginationChange: OnChangeFn<PaginationState>;
    typeCounts: Status[];
    defaultCounts?:string;
    autoLoading?: boolean;
    handlePagination?: (
        rowsPerPage: number,
        pageIndex: number,
        filterData: Record<string, any>
    ) => void;
    perPageOption: number[];
    successMsg?: string;
    expandElement?: Record<string, boolean>;
    expandedRows?: Record<string, boolean>;
    onRowClick?: (rowData: Record<string, any>) => void;
    totalCounts?: number
}

const Table: React.FC<TableProps> = ({
    data,
    columns,
    rowSelection = {},
    onRowSelectionChange,
    defaultRowsPerPage = 10,
    bulkActionComp,
    realtimeFilter,
    searchFilter,
    actionButton,
    pageCount,
    pagination,
    onPaginationChange,
    typeCounts,
    autoLoading,
    handlePagination,
    perPageOption,
    successMsg,
    expandElement,
    expandedRows,
    onRowClick,
    totalCounts = 0,
    defaultCounts ='all'
}) => {
    const [sorting, setSorting] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [filterData, setFilterData] = useState<Record<string, any>>(
        {}
    );
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

    const flattenedData: Record<string, any>[] = [];

    (data || []).forEach((product) => {
        flattenedData.push(product); // Push main product
        if (product.variation && typeof product.variation === 'object') {
            Object.values(product.variation).forEach((variation: any) => {
                flattenedData.push({
                    ...variation,
                    isVariation: true,
                    parentId: product.id,
                });
            });
        }
    });

    const table = useReactTable({
        data: flattenedData,
        columns,
        state: { rowSelection, sorting, ...(pagination ? { pagination } : {}) },
        enableRowSelection: true,
        manualPagination: true,
        manualSorting: true,
        pageCount,
        onPaginationChange,
        onRowSelectionChange,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: (newSorting: Updater<SortingState>) => {
            setSorting(newSorting);

            // Extract sorting information and update filterData
            // This will trigger the existing useEffect that handles API calls
            const sortingArray = typeof newSorting === 'function'
                ? newSorting(table.getState().sorting)
                : newSorting;

            const sortingObj = sortingArray[0];
            const orderBy = sortingObj?.id || '';
            const order = sortingObj?.desc ? 'desc' : 'asc';

            // Update filterData with sorting parameters
            // This will trigger the existing useEffect that calls handlePagination
            setFilterData(prevData => ({
                ...prevData,
                orderBy,
                order
            }));
        },
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const typeCountActive = filterData.typeCount || defaultCounts;
    const { pageIndex, pageSize } = table.getState().pagination;
    const totalRows = flattenedData.length;
    const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
    const end = totalRows === 0 ? 0 : Math.min(start + pageSize - 1, totalRows);
    return (
        <>

            {(typeCounts?.length > 0 || searchFilter) && (
                <div className="admin-top-filter">
                    {typeCounts?.length > 0 &&
                        <div className="filter-wrapper">
                            {typeCounts ? (
                                typeCounts.length > 0 ? (
                                    <>
                                        {typeCounts.map((countInfo, index) => (
                                            <div
                                                key={index}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => setFilterData({ typeCount: countInfo.key })}
                                                className={
                                                    countInfo.key === typeCountActive
                                                        ? "filter-item active"
                                                        : "filter-item"
                                                }
                                            >
                                                {`${countInfo.name} (${countInfo.count})`}
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <span>No types found</span>
                                )
                            ) : (
                                <>
                                    <Skeleton variant="text" width={100} />
                                    <Skeleton variant="text" width={120} />
                                    <Skeleton variant="text" width={90} />
                                </>
                            )}

                        </div>
                    }
                    {searchFilter &&
                        <div className="table-action-wrapper">
                            {searchFilter && (
                                <div className="search-field">
                                    {searchFilter?.map((filter) => (
                                        <React.Fragment key={filter.name}>
                                            {filter.render(handleFilterChange, filterData[filter.name])}
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                            {actionButton && (
                                <div className="action-wrapper">
                                    {actionButton?.map((filter) => (
                                        <React.Fragment key={filter.name}>
                                            {filter.render(handleFilterChange, filterData[filter.name])}
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                        </div>
                    }
                </div>
            )}
            {/* {(typeCounts?.length > 0 || searchFilter) && (
                <div className="admin-top-filter">
                    <div className="filter-wrapper">
                        {typeCounts ? (
                            typeCounts.length > 0 ? (
                                <>
                                    {typeCounts.map((countInfo, index) => (
                                        <div
                                            key={index}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setFilterData({ typeCount: countInfo.key })}
                                            className={
                                                countInfo.key === typeCountActive
                                                    ? "filter-item active"
                                                    : "filter-item"
                                            }
                                        >
                                            {`${countInfo.name} (${countInfo.count})`}
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <span>No types found</span>
                            )
                        ) : (
                            <>
                                <Skeleton variant="text" width={100} />
                                <Skeleton variant="text" width={120} />
                                <Skeleton variant="text" width={90} />
                            </>
                        )}

                    </div>
                    <div className="table-action-wrapper">
                        {searchFilter && (
                            <div className="search-field">
                                {searchFilter?.map((filter) => (
                                    <React.Fragment key={filter.name}>
                                        {filter.render(handleFilterChange, filterData[filter.name])}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                        {actionButton && (
                            <div className="action-wrapper">
                                {actionButton?.map((filter) => (
                                    <React.Fragment key={filter.name}>
                                        {filter.render(handleFilterChange, filterData[filter.name])}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )} */}

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
                                                            onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                                            className={[
                                                                'header-col',
                                                                header.column.getCanSort() ? 'sortable' : null,
                                                                header.column.id ? `${header.column.id}` : null
                                                            ].filter(Boolean).join(' ')}
                                                        >
                                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                                            {header.column.getCanSort() && (
                                                                <span className="sort-icon">
                                                                    {header.column.getIsSorted() === 'asc' && '▲'}
                                                                    {header.column.getIsSorted() === 'desc' && '▼'}
                                                                    {!header.column.getIsSorted() && '⇅'}
                                                                </span>
                                                            )}
                                                        </th>

                                                    ))}
                                                {isSmallScreen && <th></th>}
                                            </tr>
                                        ))}
                                </thead>
                                <tbody className="admin-table-body">
                                    {table.getRowModel().rows.map((row) => {
                                        const product = row.original;
                                        const isVariation = product.isVariation;
                                        const productId = product.id;
                                        const parentId = product.parentId;

                                        // Show variation only if its parent is expanded
                                        if (
                                            isVariation &&
                                            !expandedRows?.[parentId]
                                        )
                                            return null;

                                        return (
                                            <tr
                                                key={productId}
                                                className={`admin-row ${isVariation ? 'variation-row' : ''} ${product.type === 'Variable' ? 'variable' : 'simple'} ${expandElement?.[productId] ? 'active' : ''} ${productId ? `row-${productId}` : ''}`}
                                                onClick={() => onRowClick?.(row.original)}
                                            >
                                                {row.getVisibleCells()
                                                    .filter((cell) =>
                                                        visibleColumns.find(
                                                            (col) =>
                                                                col.id === cell.column.id ||
                                                                col.header === cell.column.id
                                                        )
                                                    )
                                                    .map((cell) => (
                                                        <td
                                                            key={cell.id}
                                                            className={[
                                                                'admin-column',
                                                                cell.column.id ? `${cell.column.id}` : null,
                                                            ].filter(Boolean).join(' ')}
                                                            onClick={(e) => {
                                                                const target = e.target as HTMLElement;
                                                                // Prevent row click if clicking on an interactive element
                                                                if (
                                                                    ['BUTTON', 'INPUT', 'SELECT', 'LABEL', 'TEXTAREA'].includes(
                                                                        target.tagName
                                                                    )
                                                                ) {
                                                                    e.stopPropagation();
                                                                    return;
                                                                }
                                                            }}
                                                        >
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </td>
                                                    ))}

                                                {isSmallScreen && (
                                                    <td className="responsive-cell">
                                                        <details>
                                                            <summary></summary>
                                                            <ul className="text-sm">
                                                                {getHiddenColumns(row).map((cell: any) => (
                                                                    <li key={cell.id}>
                                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </details>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            { /* Pagination Controls */}
                            {pagination && pageCount && perPageOption && (
                                <>
                                    <div className="table-pagination">
                                        <div className="pagination-number-wrapper">
                                            <div className="show-section">
                                                {`Showing ${pagination.pageIndex * pagination.pageSize + 1} to ${Math.min(
                                                    (pagination.pageIndex + 1) * pagination.pageSize,
                                                    totalCounts
                                                )} of ${totalCounts} entries. `}
                                            </div>
                                            <div className="showing-number">
                                                Show
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
                                                entries
                                            </div>
                                        </div>
                                        {totalCounts > pagination.pageSize && (
                                            <div className="pagination-arrow">
                                                <span
                                                    tabIndex={0}
                                                    className={`${!table.getCanPreviousPage()
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
                                                </span>
                                                <span
                                                    tabIndex={0}
                                                    className={`${!table.getCanPreviousPage()
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
                                                </span>
                                                {/* <span>
                                            Page{ ' ' }
                                            { table.getState().pagination
                                                .pageIndex + 1 }{ ' ' }
                                            of { pageCount }
                                        </span> */}
                                                <div className="pagination">
                                                    {Array.from({ length: pageCount }, (_, i) => (
                                                        <button
                                                            key={i}
                                                            className={`number-btn ${table.getState().pagination.pageIndex === i ? "active" : ""}`}
                                                            onClick={() => table.setPageIndex(i)}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    ))}
                                                </div>

                                                <span
                                                    tabIndex={0}
                                                    className={`${!table.getCanNextPage()
                                                        ? 'pagination-button-disabled'
                                                        : ''
                                                        }`}
                                                    onClick={() => {
                                                        if (!table.getCanNextPage())
                                                            return;
                                                        table.nextPage();
                                                    }}
                                                >
                                                    <i className="admin-font adminlib-pagination-right-arrow"></i>
                                                </span>
                                                <span
                                                    tabIndex={0}
                                                    className={`${!table.getCanNextPage()
                                                        ? 'pagination-button-disabled'
                                                        : ''
                                                        }`}
                                                    onClick={() => {
                                                        if (!table.getCanNextPage())
                                                            return;
                                                        table.setPageIndex(pageCount - 1);
                                                    }}
                                                >
                                                    <i className="admin-font adminlib-pagination-next-arrow"></i>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="admin-filter-wrapper ">
                                {Object.keys(rowSelection || {}).length >= 2 ? (

                                    <div className="wrap-bulk-all-date bulk">
                                        <span className="count row">{Object.keys(rowSelection).length} rows selected <i onClick={() => onRowSelectionChange?.({})} className="adminlib-close"></i></span>
                                        <span className="select count"
                                            onClick={() => table.toggleAllRowsSelected(true)}>
                                            Select all
                                        </span>
                                        {bulkActionComp && bulkActionComp()}
                                    </div>
                                ) : (
                                    <>
                                        {data?.length !== 0 && realtimeFilter && realtimeFilter.length > 0 && (
                                            <div className="wrap-bulk-all-date filter">
                                                <span className="title">
                                                    <i className="adminlib-filter"></i> Filter
                                                </span>
                                                {realtimeFilter?.map((filter) => (
                                                    <React.Fragment key={filter.name}>
                                                        {filter.render(handleFilterChange, filterData[filter.name])}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        )}

                                        {/* Show Reset button only if filters are applied */}
                                        {Object.keys(filterData).length > 0 && (
                                            <div className="reset-btn">
                                                <span
                                                    onClick={() => {
                                                        setFilterData({});            // clear all filters
                                                        onRowSelectionChange?.({});   // clear row selection if any
                                                        handlePagination?.(defaultRowsPerPage, 1, {}); // reload data
                                                    }}
                                                    className="admin-badge red"
                                                >
                                                    <i className="adminlib-refresh"></i> Reset
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}
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