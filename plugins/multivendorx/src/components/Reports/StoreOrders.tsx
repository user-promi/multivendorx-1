import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { CalendarInput, getApiLink, Table, TableCell } from 'zyra';
import { ColumnDef, RowSelectionState, PaginationState } from '@tanstack/react-table';

interface StoreRow {
  id: number;
  store_name: string;
  amount: string;
  commission_amount: string;
  date: string;
  status: string;
  currency_symbol: string;
}

export interface RealtimeFilter {
  name: string;
  render: (
    updateFilter: (key: string, value: any) => void,
    filterValue: any
  ) => React.ReactNode;
}

type FilterData = {
  searchAction?: string;
  searchField?: string;
  store_id?: string;
  orderBy?: any;
  order?: any;
  date?: {
    start_date?: string;
    end_date?: string;
  };
};

const StoreOrders: React.FC = () => {
  const [data, setData] = useState<StoreRow[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);
  const [store, setStore] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch store list on mount
   */
  useEffect(() => {
    // Fetch store list
    axios
      .get(getApiLink(appLocalizer, 'store'), {
        headers: { 'X-WP-Nonce': appLocalizer.nonce },
      })
      .then((response) => setStore(response.data.stores || []))
      .catch(() => {
        setError(__('Failed to load stores', 'multivendorx'));
        setStore([]);
      });

    // Fetch total orders count
    axios({
      method: 'GET',
      url: `${appLocalizer.apiUrl}/wc/v3/orders`,
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      params: { meta_key: 'multivendorx_store_id' },
    })
      .then((response) => {
        const total = Number(response.headers['x-wp-total']) || 0;
        setTotalRows(total);
        setPageCount(Math.ceil(total / pagination.pageSize));
      })
      .catch(() => {
        setError(__('Failed to load total rows', 'multivendorx'));
      });
  }, []);

  useEffect(() => {
    const currentPage = pagination.pageIndex + 1;
    const rowsPerPage = pagination.pageSize;
    requestData(rowsPerPage, currentPage);
    setPageCount(Math.ceil(totalRows / rowsPerPage));
  }, [pagination.pageIndex, pagination.pageSize, totalRows]);

  /**
   * Fetch data from backend
   */
  const requestData = (
    rowsPerPage = 10,
    currentPage = 1,
    searchField = '',
    store_id = '',
    orderBy = '',
    order = '',
    startDate?: string,
    endDate?: string
  ) => {
    setData([]);
    axios({
      method: 'GET',
      url: `${appLocalizer.apiUrl}/wc/v3/orders`,
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      params: {
        page: currentPage,
        per_page: rowsPerPage,
        meta_key: 'multivendorx_store_id',
        value:store_id,
        search:searchField,
        // orderBy,
        // order,
        // startDate,
        // endDate,
      },
    })
      .then((response) => {
        const orders: StoreRow[] = response.data.map((order: any) => ({
          id: order.id,
          store_name: order.store_name || '-',
          amount: `${order.currency_symbol || ''}${order.total}`,
          commission_amount: order.commission_amount
            ? `${order.currency_symbol || ''}${order.commission_amount}`
            : '-',
          date: new Date(order.date_created).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
          }),
          status: order.status,
          currency_symbol: order.currency_symbol,
        }));
        setData(orders);
      })
      .catch(() => {
        setError(__('Failed to load order data', 'multivendorx'));
        setData([]);
      });
  };

  /**
   * Handle pagination & filter
   */
  const requestApiForData = (
    rowsPerPage: number,
    currentPage: number,
    filterData: FilterData
  ) => {
    requestData(
      rowsPerPage,
      currentPage,
      filterData?.searchField,
      filterData?.store_id,
      filterData?.orderBy,
      filterData?.order,
      filterData?.date?.start_date,
      filterData?.date?.end_date
    );
  };

  /**
   * Realtime Filters
   */
  const realtimeFilter: RealtimeFilter[] = [
    {
      name: 'store_id',
      render: (updateFilter, filterValue) => (
        <div className="group-field">
          <select
            name="store_id"
            onChange={(e) => updateFilter(e.target.name, e.target.value)}
            value={filterValue || ''}
            className="basic-select"
          >
            <option value="">{__('All Stores', 'multivendorx')}</option>
            {store.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.store_name.charAt(0).toUpperCase() + s.store_name.slice(1)}
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
          <CalendarInput
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
      name: 'searchAction',
      render: (updateFilter, filterValue) => (
        <div className="search-action">
          <select
            className="basic-select"
            value={filterValue || 'order_id'}
            onChange={(e) => updateFilter('searchAction', e.target.value)}
          >
            <option value="order_id">{__('Order ID', 'multivendorx')}</option>
            <option value="customer">{__('Customer', 'multivendorx')}</option>
          </select>
        </div>
      ),
    },
    {
      name: 'searchField',
      render: (updateFilter, filterValue) => (
        <div className="search-section">
          <input
            name="searchField"
            type="text"
            placeholder={__('Search', 'multivendorx')}
            onChange={(e) => updateFilter(e.target.name, e.target.value)}
            value={filterValue || ''}
            className="basic-select"
          />
          <i className="adminlib-search"></i>
        </div>
      ),
    },
  ];

  /**
   * Table Columns
   */
  const columns: ColumnDef<StoreRow>[] = [
    {
      id: 'order_id',
      header: __('Order', 'multivendorx'),
      cell: ({ row }) => {
        const id = row.original.id;
        const url = `${appLocalizer.site_url.replace(/\/$/, '')}/wp-admin/post.php?post=${id}&action=edit`;
        return (
          <TableCell>
            <a href={url} target="_blank" rel="noopener noreferrer">
              #{id}
            </a>
          </TableCell>
        );
      },
    },
    {
      header: __('Store', 'multivendorx'),
      cell: ({ row }) => <TableCell>{row.original.store_name}</TableCell>,
    },
    {
      header: __('Amount', 'multivendorx'),
      cell: ({ row }) => <TableCell>{row.original.amount}</TableCell>,
    },
    {
      header: __('Commission', 'multivendorx'),
      cell: ({ row }) => <TableCell>{row.original.commission_amount}</TableCell>,
    },
    {
      header: __('Date', 'multivendorx'),
      cell: ({ row }) => <TableCell>{row.original.date}</TableCell>,
    },
    {
      header: __('Status', 'multivendorx'),
      cell: ({ row }) => {
        const status = row.original.status;
        const badgeClass =
          status === 'completed'
            ? 'green'
            : status === 'processing'
              ? 'blue'
              : status === 'refunded'
                ? 'red'
                : 'yellow';
        return (
          <TableCell>
            <span className={`admin-badge ${badgeClass}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </TableCell>
        );
      },
    },
  ];

  return (
    <div className="row">
      <div className="column">
        <div className="card-header">
          <div className="left">
            <div className="title">
              {__('Revenue Distribution', 'multivendorx')}
            </div>
            <div className="des">
              {__('Total Orders:', 'multivendorx')} {totalRows}
            </div>
          </div>
        </div>

        <Table
          data={data}
          columns={columns as ColumnDef<Record<string, any>, any>[]}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          defaultRowsPerPage={pagination.pageSize}
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          handlePagination={requestApiForData}
          perPageOption={[10, 25, 50]}
          realtimeFilter={realtimeFilter}
          searchFilter={searchFilter}
          totalCounts={totalRows}
        />
      </div>
    </div>
  );
};

export default StoreOrders;
