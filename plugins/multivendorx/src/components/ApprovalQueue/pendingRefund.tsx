import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { CalendarInput, CommonPopup, getApiLink, Table, TableCell, TextArea } from 'zyra';
import { ColumnDef, RowSelectionState, PaginationState } from '@tanstack/react-table';
import { formatCurrency } from '../../services/commonFunction';

interface StoreRow {
  id: number;
  store_name: string;
  store_id?: string;
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
  date?:any;
};

interface Props {
  onUpdated?: () => void;
}

const PendingRefund: React.FC<Props> = ({ onUpdated }) => {
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
  const [popupOpen, setPopupOpen] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ content: "" });
  const [submitting, setSubmitting] = useState(false);

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
      params: { meta_key: 'multivendorx_store_id', status: 'refund-requested', page: 1, per_page: 1 },
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
  }, []);

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
      status: 'refund-requested'
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
        const orders: StoreRow[] = response.data.map((order: any) => {
          const metaData = order.meta_data || [];

          //Extract store ID
          const storeMeta = metaData.find(
            (meta: any) => meta.key === 'multivendorx_store_id'
          );
          const store_id = storeMeta ? storeMeta.value : null;

          //Extract refund reason
          const reasonMeta = metaData.find(
            (meta: any) => meta.key === '_customer_refund_reason'
          );
          const refundReason = reasonMeta ? reasonMeta.value : '-';

          return {
            id: order.id,
            store_id, // ✅ added
            store_name: order.store_name || '-', // fallback
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
            reason: refundReason,
          };
        });



        setData(orders);
      })
      .catch((error) => {
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
  const handleRejectClick = (orderId: number) => {
    setRejectOrderId(orderId);
    setPopupOpen(true);
  };

  const handleCloseForm = () => {
    setPopupOpen(false);
    setRejectOrderId(null);
    setFormData({ content: "" });
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!rejectOrderId) return;

    setSubmitting(true);

    try {
      //Add order note
      await axios({
        method: "POST",
        url: `${appLocalizer.apiUrl}/wc/v3/orders/${rejectOrderId}/notes`,
        headers: { "X-WP-Nonce": appLocalizer.nonce },
        data: {
          note: formData.content,
          customer_note: false
        }
      });

      //Update order status + meta
      await axios({
        method: "PUT",
        url: `${appLocalizer.apiUrl}/wc/v3/orders/${rejectOrderId}`,
        headers: { "X-WP-Nonce": appLocalizer.nonce },
        data: {
          status: 'processing',
          meta_data: [
            {
              key: "_customer_refund_order",
              value: "refund_rejected"
            }
          ]
        }
      });

      handleCloseForm();
      requestData(pagination.pageSize, pagination.pageIndex + 1);
      onUpdated?.();

    } catch (err) {
      setError(__('Failed to reject order', 'multivendorx'));
    }

    setSubmitting(false);
  };


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
          <TableCell title={''}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              #{id}
            </a>
          </TableCell>
        );
      },
    },
    {
      header: __('Store', 'multivendorx'),
      cell: ({ row }) => {
        const { store_id, store_name } = row.original;
        const baseUrl = `${window.location.origin}/wp-admin/admin.php?page=multivendorx#&tab=stores`;
        const storeLink = store_id
          ? `${baseUrl}&edit/${store_id}/&subtab=store-overview`
          : '#';

        return (
          <TableCell title={store_name || ''}>
            {store_id ? (
              <a
                href={storeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                {store_name || '-'}
              </a>
            ) : (
              store_name || '-'
            )}
          </TableCell>
        );
      },
    },
    {
      header: __('Amount', 'multivendorx'),
      cell: ({ row }) => <TableCell title={'amount'}>{row.original.amount}</TableCell>,
    },
    {
      header: __('Commission', 'multivendorx'),
      cell: ({ row }) => <TableCell title={'commission'}>{row.original.commission_amount}</TableCell>,
    },
    {
      header: __('Refund Reason', 'multivendorx'),
      cell: ({ row }: any) => (
        <TableCell title={row.original.reason || ''}>
          {row.original.reason || '-'}
        </TableCell>
      ),
    },
    {
      id: 'date',
      accessorKey: 'date',
      enableSorting: true,
      header: __('Date', 'multivendorx'),
      cell: ({ row }) => <TableCell title={'title'}>{row.original.date}</TableCell>,
    },
    {
      header: __('Action', 'multivendorx'),
      cell: ({ row }) => {
        const orderId = row.original.id;
        const orderUrl = `${appLocalizer.site_url.replace(/\/$/, '')}/wp-admin/post.php?post=${orderId}&action=edit`;

        return (
          <TableCell
            title={'action'}
            type="action-dropdown"
            rowData={row.original}
            header={{
              actions: [
                {
                  label: __('View Order', 'multivendorx'),
                  icon: 'adminlib-preview',
                  onClick: () => {
                    window.open(orderUrl, '_blank', 'noopener,noreferrer');
                  },
                  hover: true,
                },
                {
                  label: __('Reject', 'multivendorx'),
                  icon: 'adminlib-close',
                  onClick: () => handleRejectClick(orderId),
                  hover: true
                }
              ],
            }}
          />
        );
      },
    },

  ];

  return (
    <>
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
        <CommonPopup
          open={popupOpen}
          onClose={handleCloseForm}
          width="500px"
          header={
            <>
              <div className="title">
                <i className="adminlib-announcement"></i>
                {__('Reject Order', 'multivendorx')}
              </div>
              <p>{__('Provide a rejection message for this order.', 'multivendorx')}</p>
              <i onClick={handleCloseForm} className="icon adminlib-close"></i>
            </>
          }
          footer={
            <>
              <div onClick={handleCloseForm} className="admin-btn btn-red">
                Cancel
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                className="admin-btn btn-purple"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Submit'}
              </button>
            </>
          }
        >
          <div className="content">
            <div className="form-group-wrapper">
              <div className="form-group">
                <label htmlFor="content">Reject Message</label>
                <TextArea
                  name="content"
                  inputClass="textarea-input"
                  value={formData.content}
                  onChange={handleChange}
                  usePlainText={false}
                  tinymceApiKey={appLocalizer.settings_databases_value['marketplace']['tinymce_api_section'] ?? ''}
                />
              </div>
            </div>
          </div>
        </CommonPopup>
      </div>
    </>
  );
};

export default PendingRefund;
