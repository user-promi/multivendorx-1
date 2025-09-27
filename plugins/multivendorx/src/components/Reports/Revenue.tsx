import React, { useEffect, useState } from "react";
import { Tooltip } from "react-leaflet";
import { Cell, Legend, PieChart, ResponsiveContainer, Pie, BarChart, CartesianGrid, XAxis, YAxis, Bar, LineChart, Line } from "recharts";
import { __ } from '@wordpress/i18n';
import { Table, TableCell } from "zyra";
import axios from "axios";
import { PaginationState, RowSelectionState } from "@tanstack/react-table";

const overview = [
  {
    id: 'sales',
    label: 'Total Products',
    count: 15,
    icon: 'adminlib-star red',
  },
  {
    id: 'earnings',
    label: 'New Products',
    count: 625,
    icon: 'adminlib-support green',
  },
  {
    id: 'Vendors',
    label: 'Low Stock',
    count: 8,
    icon: 'adminlib-global-community yellow',
  },
  {
    id: 'free',
    label: 'Out of Stock',
    count: 8,
    icon: 'adminlib-global-community blue',
  },
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
const data = [
  { month: "Jan", revenue: 4000, net_sale: 2400, admin_amount: 1200 },
  { month: "Feb", revenue: 3000, net_sale: 2000, admin_amount: 1000 },
  { month: "Mar", revenue: 4500, net_sale: 2800, admin_amount: 1300 },
  { month: "Apr", revenue: 5000, net_sale: 3200, admin_amount: 1500 },
  { month: "May", revenue: 4200, net_sale: 2500, admin_amount: 1400 },
  { month: "Jun", revenue: 4800, net_sale: 3000, admin_amount: 1600 },
  { month: "Jul", revenue: 5200, net_sale: 3400, admin_amount: 1700 },
  { month: "Aug", revenue: 4700, net_sale: 2900, admin_amount: 1500 },
];
type ProductRow = {
  id: number;
  title: string;
  sku: string;
  itemsSold: number;
  netSales: string;
  orders: number;
  category: string;
  stock: string;
};

const Revenue: React.FC = () => {
  const [demoData, setDemoData] = useState<ProductRow[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [totalRows, setTotalRows] = useState<number>(0);

  const requestApiForData = async (rowsPerPage: number, currentPage: number) => {
    try {
      // 1. Fetch products filtered by your custom key
      const productResponse = await axios.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
        headers: { "X-WP-Nonce": appLocalizer.nonce },
        params: {
          per_page: rowsPerPage,
          page: currentPage + 1,
          meta_key: "multivendorx_store_id",   // your custom key
        },
      });

      const productCount = parseInt(productResponse.headers['x-wp-total'] || '0', 10);
      setTotalRows(productCount);
      const products = productResponse.data;

      // 2. Map products to table rows
      const tableData: ProductRow[] = await Promise.all(
        products.map(async (product: any) => {
          // Fetch **only 1 order** to get total count from headers
          const ordersResponse = await axios.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
            headers: { "X-WP-Nonce": appLocalizer.nonce },
            params: {
              per_page: 1,         // fetch only 1 order
              product: product.id, // filter by product
            },
          });

          // Total orders for this product from header
          const orderCount = parseInt(ordersResponse.headers['x-wp-total'] || '0', 10);

          // Calculate net sales for this product
          let netSales = 0;
          const orders = ordersResponse.data;
          orders.forEach((order: any) => {
            order.line_items.forEach((item: any) => {
              if (item.product_id === product.id) netSales += parseFloat(item.total);
            });
          });

          return {
            id: product.id,
            title: product.name,
            sku: product.sku || "-",
            itemsSold: product.total_sales || 0,
            netSales: `${appLocalizer.currency_symbol}${netSales.toFixed(2)}`,
            orders: orderCount,
            category: product.categories?.map((c: any) => c.name).join(", ") || "-",
            stock: product.stock_status,
          };
        })
      );

      setDemoData(tableData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };



  useEffect(() => {
    requestApiForData(pagination.pageSize, pagination.pageIndex);
  }, [pagination.pageSize, pagination.pageIndex]);

  const columns: ColumnDef<ProductRow>[] = [
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
      header: __('Product title', 'multivendorx'),
      cell: ({ row }) => {
        const editLink = `${appLocalizer.siteUrl}/wp-admin/post.php?post=${row.original.id}&action=edit`;
        return (
          <TableCell>
            <a href={editLink} target="_blank" rel="noopener noreferrer">
              {row.original.title}
            </a>
          </TableCell>
        );
      },
    },
    {
      header: __('SKU', 'multivendorx'),
      cell: ({ row }) => <TableCell>{row.original.sku}</TableCell>,
    },
    {
      header: __('Items sold', 'multivendorx'),
      cell: ({ row }) => <TableCell>{row.original.itemsSold}</TableCell>,
    },
    {
      header: __('Net sales', 'multivendorx'),
      cell: ({ row }) => <TableCell>{row.original.netSales}</TableCell>,
    },
    {
      header: __('Orders', 'multivendorx'),
      cell: ({ row }) => <TableCell>{row.original.orders}</TableCell>,
    },
    {
      header: __('Category', 'multivendorx'),
      cell: ({ row }) => <TableCell>{row.original.category}</TableCell>,
    },
    {
      header: __('Stock', 'multivendorx'),
      cell: ({ row }) => <TableCell>{row.original.stock}</TableCell>,
    },
  ];

  return (
    <div className="dashboard-overview">
      <div className="row">
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Revenue Trend Analysis
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#5007aa" strokeWidth={3} name="Top Category" />
              <Line type="monotone" dataKey="net_sale" stroke="#ff7300" strokeWidth={3} name="Top Brand" />
              <Line type="monotone" dataKey="admin_amount" stroke="#00c49f" strokeWidth={3} name="Top Store" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="column">
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
              {overview.map((item, idx) => (
                <div key={idx} className="analytics-item">
                  <div className="analytics-icon">
                    <i className={item.icon}></i>
                  </div>
                  <div className="details">
                    <div className="number">{item.count}</div>
                    <div className="text">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
      <div className="row">
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Top Categories
              </div>
              <div className="des">3 categories showing top performers</div>
            </div>
          </div>
          {/* 1st product */}
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="product-name">
                  Electronics
                </div>
              </div>
              <div className="right">
                <div className="price">
                  <b>Total Sales:</b> $125,000
                </div>
              </div>
            </div>
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon red">#1</span>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon green">#2</span>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
            </div>
          </div>
          {/* 2nd product */}
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="product-name">
                  Clothing
                </div>
              </div>
              <div className="right">
                <div className="price">
                  <b>Total Sales:</b> $125,000
                </div>
              </div>
            </div>
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon red">#1</span>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon green">#2</span>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
            </div>
          </div>
          {/* 3rd product */}
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="product-name">
                  Home & Garden
                </div>
              </div>
              <div className="right">
                <div className="price">
                  <b>Total Sales:</b> $125,000
                </div>
              </div>
            </div>
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon red">#1</span>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon green">#2</span>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Top Brands
              </div>
              <div className="des">3 brands showing top performers</div>
            </div>
          </div>
          {/* 1st product */}
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="product-name">
                  Apple
                </div>
              </div>
              <div className="right">
                <div className="price">
                  <b>Total Sales:</b> $125,000
                </div>
              </div>
            </div>
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon red">#1</span>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon green">#2</span>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
            </div>
          </div>
          {/* 2nd product */}
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="product-name">
                  Nike
                </div>
              </div>
              <div className="right">
                <div className="price">
                  <b>Total Sales:</b> $125,000
                </div>
              </div>
            </div>
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon red">#1</span>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon green">#2</span>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
            </div>
          </div>
          {/* 3rd product */}
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="product-name">
                  Samsung
                </div>
              </div>
              <div className="right">
                <div className="price">
                  <b>Total Sales:</b> $125,000
                </div>
              </div>
            </div>
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon red">#1</span>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon green">#2</span>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Top Stores
              </div>
              <div className="des">3 stores showing top performers</div>
            </div>
          </div>
          {/* 1st product */}
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="product-name">
                  Downtown Flagship
                </div>
              </div>
              <div className="right">
                <div className="price">
                  <b>Total Sales:</b> $125,000
                </div>
              </div>
            </div>
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon red">#1</span>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon green">#2</span>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
            </div>
          </div>
          {/* 2nd product */}
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="product-name">
                  Mall Location
                </div>
              </div>
              <div className="right">
                <div className="price">
                  <b>Total Sales:</b> $125,000
                </div>
              </div>
            </div>
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon red">#1</span>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon green">#2</span>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
            </div>
          </div>
          {/* 3rd product */}
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="product-name">
                  Suburban Store
                </div>
              </div>
              <div className="right">
                <div className="price">
                  <b>Total Sales:</b> $125,000
                </div>
              </div>
            </div>
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon red">#1</span>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon green">#2</span>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Revenue Distribution
              </div>
            </div>
          </div>
          <Table
            data={demoData}
            columns={columns as ColumnDef<Record<string, any>, any>[]}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            defaultRowsPerPage={10}
            pageCount={1}
            pagination={pagination}
            onPaginationChange={setPagination}
            handlePagination={requestApiForData}
            perPageOption={[10, 25, 50]}
            typeCounts={[]}
            totalCounts={totalRows}
          />
        </div>
      </div>
    </div>
  );
};

export default Revenue;
