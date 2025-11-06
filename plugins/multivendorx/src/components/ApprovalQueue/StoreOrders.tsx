import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { CalendarInput, getApiLink, Table, TableCell } from 'zyra';
import { ColumnDef, RowSelectionState, PaginationState } from '@tanstack/react-table';
import { formatCurrency } from '../../services/commonFunction';

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
};

interface Props {
  onUpdated?: () => void;
}

const StoreOrders: React.FC<Props> = ({ onUpdated }) => {
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
      params: { meta_key: 'multivendorx_store_id', refund_status: 'refund_request' },
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
   * Fetch data from backend (WooCommerce Orders)
   */
  const requestData = (
    rowsPerPage = 10,
    currentPage = 1,
    searchField = '',
    store_id = '',
    orderBy = '',
    order = '',
    startDate = new Date(0),
    endDate = new Date(),
  ) => {
    setData([]);

    //Base WooCommerce query params
    const params: any = {
      page: currentPage,
      per_page: rowsPerPage,
      meta_key: 'multivendorx_store_id',
      value: store_id,
      search: searchField,
      refund_status: 'refund_request'
    };

    //Add Date Filtering — only if both are valid Date objects
    if (startDate && endDate) {
      // Convert to UTC ISO8601 format (WooCommerce expects this)
      params.after = startDate.toISOString();
      params.before = endDate.toISOString();
    }

    //Add Sorting
    if (orderBy) {
      params.orderby = orderBy;
      params.order = order || 'asc';
    }

    axios({
      method: 'GET',
      url: `${appLocalizer.apiUrl}/wc/v3/orders`,
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      params,
    })
      .then((response) => {
        const orders: StoreRow[] = response.data.map((order: any) => ({
          id: order.id,
          store_name: order.store_name || '-',
          amount: formatCurrency(order.total),
          commission_amount: order.commission_amount
            ? formatCurrency(order.commission_amount)
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
      .catch((error) => {
        console.error('❌ Order fetch failed:', error);
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
      id: 'date',
      accessorKey: 'date',
      enableSorting: true,
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
    {
      id: 'action',
      header: __('Action', 'multivendorx'),
      cell: ({ row }) => {
        const orderId = row.original.id;
        const orderUrl = `${appLocalizer.site_url.replace(/\/$/, '')}/wp-admin/post.php?post=${orderId}&action=edit`;

        return (
          <TableCell
            type="action-dropdown"
            rowData={row.original}
            header={{
              actions: [
                {
                  label: __('View Order', 'multivendorx'),
                  icon: 'adminlib-eye',
                  onClick: () => {
                    window.open(orderUrl, '_blank', 'noopener,noreferrer');
                  },
                  hover: true,
                },
              ],
            }}
          />
        );
      },
    },

  ];

  return (
    <>
      <div className="card-header">
        <div className="left">
          <div className="title">
            Store Orders
          </div>
          <div className="des">Waiting for your response</div>
        </div>
        <div className="right">
          <i className="adminlib-more-vertical"></i>
        </div>
      </div>
      <div className="admin-table-wrapper">
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
        {error && <div className="error-message">{error}</div>}
      </div>
    </>
  );
};

export default StoreOrders;
