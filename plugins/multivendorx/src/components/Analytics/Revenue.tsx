import React from "react";
import { Tooltip } from "react-leaflet";
import { Cell, Legend, PieChart, ResponsiveContainer, Pie, BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts";
import { __ } from '@wordpress/i18n';
import { Table, TableCell } from "zyra";

type Product = {
  id: number;
  title: string;
  price: string;
};
const pieData = [
  { name: "Admin", value: 1200 },
  { name: "Vendor", value: 2400 },
  { name: "Shipping", value: 800 },
  { name: "Free", value: 200 },
];
const COLORS = ["#5007aa", "#00c49f", "#ff7300", "#d400ffff"];
const overview = [
  {
    id: 'sales',
    label: 'Products Sold',
    count: 15,
    icon: 'adminlib-star',
  },
  {
    id: 'earnings',
    label: 'New Products',
    count: 625,
    icon: 'adminlib-support',
  },
  {
    id: 'Vendors',
    label: 'Low Stock',
    count: 8,
    icon: 'adminlib-global-community',
  },
  {
    id: 'free',
    label: 'Out of Stock',
    count: 8,
    icon: 'adminlib-global-community',
  },
];
const products: Product[] = [
  {
    id: 1,
    title: "Total Admin Net Earning",
    price: "$5,072.31",
  },
  {
    id: 1,
    title: "Total Vendor Commission",
    price: "$1,713.85",
  },
  {
    id: 1,
    title: "Total Vendor Net Commission",
    price: "$75",
  },
  {
    id: 1,
    title: "Total Sub Total",
    price: "$1,713.85",
  },
  {
    id: 1,
    title: "Shipping",
    price: "$0",
  },
];
const overviewData = [
    { name: "Jan", orders: 120, sold_out: 30 },
    { name: "Feb", orders: 90, sold_out: 20 },
    { name: "Mar", orders: 150, sold_out: 40 },
    { name: "Apr", orders: 170, sold_out: 35 },
    { name: "May", orders: 140, sold_out: 25 },
    { name: "Jun", orders: 180, sold_out: 50 },
    { name: "Jul", orders: 200, sold_out: 45 },
    { name: "Aug", orders: 160, sold_out: 30 },
  ];
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
const Revenue: React.FC = () => {
  return (
    <div className="dashboard-overview">
      <div className="row">
        <div className="overview-card-wrapper">
          {overview.map((stat) => (
            <div className="action" key={stat.id}>
              <div className="title">
                {stat.count}
                <i className={stat.icon}></i>
              </div>
              <div className="description">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* <div className="row">
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Revenue Distribution
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Breakdown
              </div>
            </div>
          </div>
          <div className="top-items">
            {products.map((product) => (
              <div className="items" key={product.id}>
                <div className="left-side">
                  <div className="details">
                    <div className="item-title">{product.title}</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">{product.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}
      <div className="row">
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Category Performance
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overviewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#5007aa" barSize={40} name="Orders" />
              <Bar dataKey="sold_out" fill="#00c49f" barSize={40} name="Sold Out" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Stock Status Overview
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
      <Table
        data={demoData}
        columns={columns as ColumnDef<Record<string, any>, any>[]}
        // rowSelection={rowSelection}
        // onRowSelectionChange={setRowSelection}
        defaultRowsPerPage={10}
        // pageCount={pageCount}
        // pagination={pagination}
        // onPaginationChange={setPagination}
        // handlePagination={requestApiForData}
        perPageOption={[10, 25, 50]}
        typeCounts={[]}
      />
    </div>
  );
};

export default Revenue;
