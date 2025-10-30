import React, { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  PieChart,
  ResponsiveContainer,
  Pie,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  LineChart,
  Line,
  Tooltip
} from "recharts";
import { __ } from "@wordpress/i18n";
import { CalendarInput, getApiLink, Table, TableCell } from "zyra";
import axios from "axios";
import { PaginationState, RowSelectionState, ColumnDef } from "@tanstack/react-table";

const overview = [
  { id: "sales", label: "Total Products", count: 15, icon: "adminlib-star red" },
  { id: "earnings", label: "New Products", count: 625, icon: "adminlib-support green" },
  { id: "Vendors", label: "Low Stock", count: 8, icon: "adminlib-global-community yellow" },
  { id: "free", label: "Out of Stock", count: 8, icon: "adminlib-global-community blue" },
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
  dateCreated: string;
};

type FilterData = {
  searchField?: string;
  store_id?: string;
  orderBy?: string;
  order?: string;
  date?: { start_date?: Date; end_date?: Date };
};

type ToggleState = { [key: string]: boolean };

export interface RealtimeFilter {
  name: string;
  render: (
    updateFilter: (key: string, value: any) => void,
    filterValue: any
  ) => React.ReactNode;
}

const Revenue: React.FC = () => {
  const [data, setData] = useState<ProductRow[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [totalRows, setTotalRows] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);
  const [store, setStore] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openCards, setOpenCards] = useState<ToggleState>({});
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
      url: `${appLocalizer.apiUrl}/wc/v3/products`,
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

    // Fetch total orders count
    axios({
      method: 'GET',
      url: `${appLocalizer.apiUrl}/wc/v3/reports/products/totals`,
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
    })
      .then((response) => {
        console.log("report",response)
      })
      .catch(() => {
        setError(__('Failed to load total rows', 'multivendorx'));
      });

  }, []);
  const toggleCard = (key: string) => {
    setOpenCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ✅ Fixed table columns for WooCommerce products
  const columns: ColumnDef<ProductRow>[] = [
    {
      id: "select",
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
      header: __("Product", "multivendorx"),
      cell: ({ row }) => (
        <TableCell>
          <a
            href={`${appLocalizer.site_url}/wp-admin/post.php?post=${row.original.id}&action=edit`}
            target="_blank"
            className="product-wrapper"
          >
            {row.original.image ? (
              <img
                src={row.original.image}
                alt={row.original.store_name}
              />
            ) : (
              <i className="adminlib-store-inventory"></i>
            )}
            <div className="details">
              <span className="title">
                {row.original.title}
              </span>
            </div>
          </a>
        </TableCell>
      ),
    },
    { header: __("Store", "multivendorx"), cell: ({ row }) => <TableCell>{row.original.store_name}</TableCell> },
    { header: __("SKU", "multivendorx"), cell: ({ row }) => <TableCell>{row.original.sku}</TableCell> },
    { header: __("Items sold", "multivendorx"), cell: ({ row }) => <TableCell>{row.original.itemsSold}</TableCell> },
    { header: __("Net sales", "multivendorx"), cell: ({ row }) => <TableCell>{row.original.netSales}</TableCell> },
    { header: __("Category", "multivendorx"), cell: ({ row }) => <TableCell>{row.original.category}</TableCell> },
    {
      id: 'date',
      accessorKey: 'date',
      enableSorting: true,
      header: __("Date Created", "multivendorx"),
      cell: ({ row }) => <TableCell>{row.original.dateCreated}</TableCell>,
    }

  ];

  /**
       * ✅ Fetch WooCommerce products (with explicit UTC offset for reliable server filtering)
       * FIX: Adjusts the UTC time to align with a UTC+05:30 (IST) server's day start/end.
       */
  const requestData = async (
    rowsPerPage = 10,
    currentPage = 1,
    searchField = "",
    store_id = "",
    orderBy = "",
    order = "",
    startDate?: Date,
    endDate?: Date
  ) => {
    try {
      setData([]);

      const params: any = {
        page: currentPage,
        per_page: rowsPerPage,
        meta_key: "multivendorx_store_id",
        value: store_id,
        search: searchField,
      };

      // ✅ Add Date Filtering (only if both are valid Date objects)
      if (startDate instanceof Date && endDate instanceof Date) {
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {

          // --- Date Construction and UTC Offset Logic ---

          // 1. Create Start Date (Start of Day in BROWSER's local time)
          const startLocal = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            0, 0, 0 // Time set to 00:00:00
          );

          // 2. Create End Date (End of Day in BROWSER's local time)
          const endLocal = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate() + 1, // Go to the next day
            0, 0, 0, 0
          );
          endLocal.setMilliseconds(endLocal.getMilliseconds() - 1); // Back to 23:59:59.999

          // 3. Apply UTC+05:30 offset adjustment (5 hours, 30 minutes)
          // This is a common requirement when the server is in IST but the API only accepts UTC/Z-time.
          const offsetMinutes = 330; // 5 hours * 60 minutes + 30 minutes = 330

          // Calculate UTC equivalent of the server's 00:00:00 boundary.
          const afterDate = new Date(startLocal.getTime() - (startLocal.getTimezoneOffset() + offsetMinutes) * 60000);

          // Calculate UTC equivalent of the server's 23:59:59 boundary.
          const beforeDate = new Date(endLocal.getTime() - (endLocal.getTimezoneOffset() + offsetMinutes) * 60000);


          // 4. Convert to ISO String (UTC/Z-time)
          // Using the adjusted Date objects to produce the correct UTC string.
          params.after = afterDate.toISOString();
          params.before = beforeDate.toISOString();
        }
      }

      // ✅ Sorting
      if (orderBy) {
        params.orderby = orderBy;
        params.order = order || "asc";
      }

      console.log("🕒 Filter params (Forced IST to UTC):", params);

      const response = await axios({
        method: "GET",
        url: `${appLocalizer.apiUrl}/wc/v3/products`,
        headers: { "X-WP-Nonce": appLocalizer.nonce },
        params,
      });

      // ... (rest of the code remains the same)
      const formattedData: ProductRow[] = response.data.map((product: any) => ({
        id: product.id,
        title: product.name,
        sku: product.sku || "-",
        image: product.images?.[0]?.src || "",
        store_name: product.store_name,
        itemsSold: product.total_sales ? parseInt(product.total_sales) : 0,
        netSales: product.price
          ? `${appLocalizer.currency_symbol}${product.price}`
          : "-",
        category:
          product.categories?.map((c: any) => c.name).join(", ") || "-",
        dateCreated: product.date_created
          ? new Date(product.date_created).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })
          : "-",
      }));

      setData(formattedData);
    } catch (error) {
      console.error("❌ Product fetch failed:", error);
      const errorMessage = (error as any).response?.data?.message || __("Failed to load product data", "multivendorx");
      setError(errorMessage);
      setData([]);
    }
  };


  useEffect(() => {
    const currentPage = pagination.pageIndex + 1;
    const rowsPerPage = pagination.pageSize;
    requestData(rowsPerPage, currentPage);
    setPageCount(Math.ceil(totalRows / rowsPerPage));
  }, [pagination.pageIndex, pagination.pageSize, totalRows]);

  /**
   * Realtime filter logic
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

  const realtimeFilter: RealtimeFilter[] = [
    {
      name: "store_id",
      render: (updateFilter, filterValue) => (
        <div className="group-field">
          <select
            name="store_id"
            onChange={(e) => updateFilter(e.target.name, e.target.value)}
            value={filterValue || ""}
            className="basic-select"
          >
            <option value="">{__("All Stores", "multivendorx")}</option>
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
      name: "searchField",
      render: (updateFilter, filterValue) => (
        <div className="search-section">
          <input
            name="searchField"
            type="text"
            placeholder={__("Search", "multivendorx")}
            onChange={(e) => updateFilter(e.target.name, e.target.value)}
            value={filterValue || ""}
            className="basic-select"
          />
          <i className="adminlib-search"></i>
        </div>
      ),
    },
  ];

  // --- Static UI below remains unchanged ---
  const bestSellingCategories = ["Electronics", "Clothing", "Home & Garden"];
  const leadingBrands = ["Apple", "Nike", "Samsung"];
  const renderTopItems = () => (
    <>
      <div className="items">
        <div className="left-side">
          <div className="icon"><span className="admin-icon"><i className="adminlib-catalog"></i></span></div>
          <div className="details"><div className="item-title">Lather & Loom</div><div className="sub-text">3 orders</div></div>
        </div>
        <div className="right-side"><div className="price">$380</div></div>
      </div>
      <div className="items">
        <div className="left-side">
          <div className="icon"><span className="admin-icon"><i className="adminlib-bulk-action"></i></span></div>
          <div className="details"><div className="item-title">Lather & Loom</div><div className="sub-text">3 orders</div></div>
        </div>
        <div className="right-side"><div className="price">$380</div></div>
      </div>
    </>
  );

  return (
    <div className="dashboard-overview">
      {/* Keep entire top dashboard layout */}
      <div className="row">
        <div className="column">
          <div className="card-header">
            <div className="left"><div className="title">Revenue Trend Analysis</div></div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#5007aa" strokeWidth={3} />
              <Line type="monotone" dataKey="net_sale" stroke="#ff7300" strokeWidth={3} />
              <Line type="monotone" dataKey="admin_amount" stroke="#00c49f" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="column">
          <div className="card-header">
            <div className="left"><div className="title">Account Overview</div></div>
            <div className="right"><span>Updated 1 month ago</span></div>
          </div>
          <div className="card-body">
            <div className="analytics-container">
              {overview.map((item, idx) => (
                <div key={idx} className="analytics-item">
                  <div className="analytics-icon"><i className={item.icon}></i></div>
                  <div className="details"><div className="number">{item.count}</div><div className="text">{item.label}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Keep categories and brands */}
      <div className="row">
        <div className="column">
          <div className="card-header"><div className="left"><div className="title">Best-Selling Categories</div></div></div>
          {bestSellingCategories.map((category) => (
            <div className="column" key={category}>
              <div className="card-header" onClick={() => toggleCard(category)}>
                <div className="left"><div className="product-name">{category}</div><div className="price"><b>Total Sales:</b> $125,000</div></div>
                <div className="right"><i className="adminlib-pagination-right-arrow"></i></div>
              </div>
              {openCards[category] && <div className="top-items">{renderTopItems()}</div>}
            </div>
          ))}
        </div>

        <div className="column">
          <div className="card-header"><div className="left"><div className="title">Leading Brands</div></div></div>
          {leadingBrands.map((brand) => (
            <div className="column" key={brand}>
              <div className="card-header" onClick={() => toggleCard(brand)}>
                <div className="left"><div className="product-name">{brand}</div><div className="price"><b>Total Sales:</b> $125,000</div></div>
                <div className="right"><i className="adminlib-pagination-right-arrow"></i></div>
              </div>
              {openCards[brand] && <div className="top-items">{renderTopItems()}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Fixed Table Section */}
      <div className="row">
        <div className="column">
          <div className="card-header"><div className="left"><div className="title">Revenue Distribution</div></div></div>
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
    </div>
  );
};

export default Revenue;
