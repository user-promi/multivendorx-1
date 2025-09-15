import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Table, TableCell } from "zyra";

const overview = [
  {
    id: 'sales',
    label: 'Admin Net Earning',
    count: 15,
    icon: 'adminlib-star',
  },
  {
    id: 'earnings',
    label: 'Vendor Commission',
    count: 625,
    icon: 'adminlib-support',
  },
  {
    id: 'Vendors',
    label: 'Vendor Net Commission',
    count: 8,
    icon: 'adminlib-global-community',
  },
  {
    id: 'free',
    label: 'Sub Total',
    count: 758,
    icon: 'adminlib-global-community',
  },
  {
    id: 'free',
    label: 'Shipping',
    count: 85,
    icon: 'adminlib-global-community',
  },
];
const Transactions: React.FC = () => {
  const [data, setData] = useState<StoreRow[] | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);
  type StoreRow = {
  id: number;
  vendor: string;
  amount: string;
  commission: string;
  date: string;
  status: "Paid" | "Unpaid";
};

  const demoData: StoreRow[] = [
  { id: 54211, vendor: "John's Electronics", amount: "$1200", commission: "$120", date: "2025-09-01", status: "Paid" },
  { id: 84211, vendor: "Jane's Apparel", amount: "$850", commission: "$85", date: "2025-09-02", status: "Unpaid" },
  { id: 84211, vendor: "Tech Hub", amount: "$2300", commission: "$230", date: "2025-09-03", status: "Paid" },
  { id: 84211, vendor: "Gadget World", amount: "$670", commission: "$67", date: "2025-09-04", status: "Unpaid" },
  { id: 84211, vendor: "Fashion Store", amount: "$980", commission: "$98", date: "2025-09-05", status: "Paid" },
  { id: 64211, vendor: "Mobile Planet", amount: "$1500", commission: "$150", date: "2025-09-06", status: "Unpaid" },
  { id: 54211, vendor: "Home Essentials", amount: "$720", commission: "$72", date: "2025-09-07", status: "Paid" },
  { id: 8211, vendor: "Office Supplies Co.", amount: "$430", commission: "$43", date: "2025-09-08", status: "Unpaid" },
  { id: 4211, vendor: "Luxury Bags", amount: "$1250", commission: "$125", date: "2025-09-09", status: "Paid" },
  { id: 84211, vendor: "Kitchen King", amount: "$980", commission: "$98", date: "2025-09-10", status: "Unpaid" },
];

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
      header: __('Order ID', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_name || ''}>
          #{row.original.id || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Status', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.status || ''}>
          {row.original.status === "Paid" && (
            <span className="admin-badge green">Paid</span>
          )}
          {row.original.status === "Unpaid" && (
            <span className="admin-badge red">Unpaid</span>
          )}
        </TableCell>
      ),
    },
    {
      header: __('Date', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_slug || ''}>
          {row.original.date || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Vendor', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_name || ''}>
          {row.original.vendor || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Order Total', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_slug || ''}>
          {row.original.amount || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Vendor Commission', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_slug || ''}>
          {row.original.commission || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Shipping', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_slug || ''}>
          {row.original.amount || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Vendor Net Earnings', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_slug || ''}>
          {row.original.commission || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Admin Earnings', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_slug || ''}>
          {row.original.commission || '-'}
        </TableCell>
      ),
    },
  ];
  const analyticsData = [
          { icon: "adminlib-tools red", number: "230k", text: "Total Earnings" },
          { icon: "adminlib-book green", number: "45k", text: "Awaiting Disbursement" },
          { icon: "adminlib-global-community yellow", number: "1.2M", text: "Pending Withdrawal" },
          { icon: "adminlib-wholesale blue", number: "500k", text: "Completed / Paid Disbursement" },
          { icon: "adminlib-tools red", number: "230k", text: "Refund / Chargeback Impact" },
          { icon: "adminlib-book green", number: "45k", text: "Manual Adjustments" },
          { icon: "adminlib-global-community yellow", number: "1.2M", text: "Upcoming Unlock" },
      ];
  return (
    <>
      <div className="row">
                    <div className="column width-65">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Account Overview
                                </div>
                            </div>
                            <div className="right">
                                <span>Updated 1 month ago</span>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="analytics-container">

                                {analyticsData.map((item, idx) => (
                                    <div key={idx} className="analytics-item">
                                        <div className="analytics-icon">
                                            <i className={item.icon}></i>
                                        </div>
                                        <div className="details">
                                            <div className="number">{item.number}</div>
                                            <div className="text">{item.text}</div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>
                    </div>
      </div>
      <div className="admin-table-wrapper">
        <Table
          data={demoData}
          columns={columns as ColumnDef<Record<string, any>, any>[]}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          defaultRowsPerPage={10}
          // pageCount={pageCount}
          // pagination={pagination}
          onPaginationChange={setPagination}
          // handlePagination={requestApiForData}
          perPageOption={[10, 25, 50]}
          typeCounts={[]}
        />
      </div>
    </>
  );
};

export default Transactions;
