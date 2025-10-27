import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, TableCell } from "zyra";
import { ColumnDef, RowSelectionState, PaginationState } from '@tanstack/react-table';

type StoreRow = {
  id: number;
  vendor: string;
  amount: string;
  commission: string;
  date: string;
  status: string;
  currency: string;
};

const getApiLink = (appLocalizer: any, endpoint: string) => {
  return `${appLocalizer.apiUrl}/${endpoint}`;
};

const StoreOrders: React.FC = () => {
  const [data, setData] = useState<StoreRow[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState<number>(0);
  const [pageCount, setPageCount] = useState(0);

  const fetchCommissionAmount = async (commissionId: string, currencySymbol: string) => {
    if (!commissionId) return `${currencySymbol}0`;

    try {
      const response = await axios({
        method: "GET",
        url: getApiLink(appLocalizer, `commission/${commissionId}`),
        headers: { "X-WP-Nonce": appLocalizer.nonce },
      });
      return `${currencySymbol}${response.data.commission_amount || 0}`;
    } catch (err) {
      console.error(`Error fetching commission for ID ${commissionId}:`, err);
      return `${currencySymbol}0`;
    }
  };

  const requestApiForData = async (rowsPerPage: number, currentPage: number) => {
    try {
      const response = await axios({
        method: 'GET',
        url: `${appLocalizer.apiUrl}/wc/v3/orders`,
        headers: { 'X-WP-Nonce': appLocalizer.nonce },
        params: {
          per_page: rowsPerPage,
          page: currentPage + 1,
          key: 'multivendorx_store_id',
        },
      });

      const total = Number(response.headers['x-wp-total']) || 0;
      setTotalRows(total);

      // Fetch orders and their commission dynamically
      const orders: StoreRow[] = await Promise.all(response.data.map(async (order: any) => {
        const lineItem = order.line_items[0] || {};
        const storeMeta = lineItem.meta_data.find((meta: any) => meta.key === 'multivendorx_sold_by');
        const commissionMeta = order.meta_data.find((meta: any) => meta.key === 'multivendorx_commission_id');

        const commission = commissionMeta 
          ? await fetchCommissionAmount(commissionMeta.value, order.currency_symbol)
          : `${order.currency_symbol}0`;

        return {
          id: order.id,
          vendor: storeMeta ? storeMeta.value : '-',
          amount: `${order.currency_symbol}${order.total}`,
          commission,
          date: order.date_created.split('T')[0],
          status: order.status,
          currency: order.currency_symbol,
        };
      }));

      setData(orders);
      setPageCount(Math.ceil(total / rowsPerPage));

    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    requestApiForData(pagination.pageSize, pagination.pageIndex);
  }, [pagination.pageSize, pagination.pageIndex]);

  const columns: ColumnDef<StoreRow>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    {
      header: __('Order Id', 'multivendorx'),
      cell: ({ row }) => <TableCell>#{row.original.id}</TableCell>,
    },
    {
      header: __('Store', 'multivendorx'),
      cell: ({ row }) => <TableCell>{row.original.vendor}</TableCell>,
    },
    {
      header: __('Amount', 'multivendorx'),
      cell: ({ row }) => <TableCell>{row.original.amount}</TableCell>,
    },
    {
      header: __('Commission', 'multivendorx'),
      cell: ({ row }) => <TableCell>{row.original.commission}</TableCell>,
    },
    {
      header: __('Date', 'multivendorx'),
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        const formattedDate = date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        });
        return <TableCell>{formattedDate}</TableCell>;
      },
    },
    {
      header: __('Status', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell>
          {row.original.status === "completed" && (
            <span className="admin-badge green">Completed</span>
          )}
          {row.original.status === "processing" && (
            <span className="admin-badge blue">Processing</span>
          )}
          {row.original.status === "refunded" && (
            <span className="admin-badge red">Refunded</span>
          )}
          {row.original.status !== "completed" &&
           row.original.status !== "processing" &&
           row.original.status !== "refunded" && (
            <span className="admin-badge yellow">{row.original.status}</span>
          )}
        </TableCell>
      ),
    },
  ];

  return (
    <div className="row">
      <div className="column">
        <div className="card-header">
          <div className="left">
            <div className="title">Revenue Distribution</div>
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
          defaultRowsPerPage={10}
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          handlePagination={requestApiForData}
          perPageOption={[10, 25, 50]}
          typeCounts={[]}
          totalCounts={totalRows}
        />
      </div>
    </div>
  );
};

export default StoreOrders;
