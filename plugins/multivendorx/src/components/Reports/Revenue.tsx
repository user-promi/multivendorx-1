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
import { formatCurrency } from '../../services/commonFunction';

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
  const [toReviewedProduct, setToReviewedProduct] = useState<any[]>([]);
  const [toSellingProduct, setToSellingProduct] = useState<any[]>([]);
  const [openReviewedCards, setOpenReviewedCards] = useState<ToggleState>({});
  const [openSellingCards, setOpenSellingCards] = useState<ToggleState>({});
  const [chartData, setChartData] = useState<any[]>([]);
  const [inStockCount, setInStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [onBackorderCount, setOnBackorderCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [newProducts, setNewProducts] = useState(0);


  const toggleReviewedCard = (key: string) => {
    setOpenReviewedCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSellingCard = (key: string) => {
    setOpenSellingCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /**
   * Fetch store list on mount
   */
  // useEffect(() => {
  //   // Fetch store list
  //   axios
  //     .get(getApiLink(appLocalizer, 'store'), {
  //       headers: { 'X-WP-Nonce': appLocalizer.nonce },
  //     })
  //     .then((response) => setStore(response.data.stores || []))
  //     .catch(() => {
  //       setError(__('Failed to load stores', 'multivendorx'));
  //       setStore([]);
  //     });

  //   // Fetch total orders count
  //   axios({
  //     method: 'GET',
  //     url: `${appLocalizer.apiUrl}/wc/v3/products`,
  //     headers: { 'X-WP-Nonce': appLocalizer.nonce },
  //     params: { meta_key: 'multivendorx_store_id' },
  //   })
  //     .then((response) => {
  //       const total = Number(response.headers['x-wp-total']) || 0;
  //       setTotalRows(total);
  //       setPageCount(Math.ceil(total / pagination.pageSize));
  //     })
  //     .catch(() => {
  //       setError(__('Failed to load total rows', 'multivendorx'));
  //     });

  //   axios({
  //     method: "GET",
  //     url: `${appLocalizer.apiUrl}/wc/v3/products`,
  //     headers: { "X-WP-Nonce": appLocalizer.nonce },
  //     params: { meta_key: "multivendorx_store_id", per_page: 20 },
  //   })
  //     .then((response) => {
  //       const products = response.data || [];

  //       const data = products
  //         .filter((p: any) => Number(p.total_sales) > 0)
  //         .map((p: any) => ({
  //           name: p.name,
  //           net_sales:
  //             parseFloat(p.price || 0) * parseInt(p.total_sales || 0),
  //           items_sold: parseInt(p.total_sales || 0),
  //         }));

  //       setChartData(data);
  //     })
  //     .catch(() => {
  //       setError("Failed to load product sales data");
  //     });

  //   axios({
  //     method: 'GET',
  //     url: `${appLocalizer.apiUrl}/wc/v3/products`,
  //     headers: { 'X-WP-Nonce': appLocalizer.nonce },
  //     params: {
  //       per_page: 5,
  //       meta_key: 'multivendorx_store_id',
  //       orderby: 'rating',
  //       order: 'desc',
  //     },
  //   })
  //     .then(response => {
  //       const filtered = response.data.filter(
  //         (product: any) => parseFloat(product.average_rating) > 0
  //       );
  //       console.log("Top reviewed products:", filtered);
  //       setToReviewedProduct(filtered);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching top reviewed products:', error);
  //     });

  //   axios({
  //     method: 'GET',
  //     url: `${appLocalizer.apiUrl}/wc/v3/products`,
  //     headers: { 'X-WP-Nonce': appLocalizer.nonce },
  //     params: {
  //       per_page: 5,
  //       meta_key: 'multivendorx_store_id',
  //       orderby: 'popularity',
  //       order: 'desc',
  //     },
  //   })
  //     .then(response => {
  //       const filtered = response.data.filter(
  //         (product: any) => Number(product.total_sales) > 0
  //       );
  //       console.log("Top selling products:", filtered);
  //       setToSellingProduct(filtered);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching top selling products:', error);
  //     });

  //   axios({
  //     method: 'GET',
  //     url: `${appLocalizer.apiUrl}/wc/v3/products`,
  //     headers: { 'X-WP-Nonce': appLocalizer.nonce },
  //     params: {
  //       per_page: 1, // Get only 1 product, but retrieve the count of all matching products
  //       stock_status: 'outofstock', // Filter for out-of-stock products
  //     },
  //   })
  //     .then(response => {
  //       // 2. Get the Count from the Header
  //       const outOfStockCount = response.headers['x-wp-total'];

  //       console.log("Total Out of Stock Count:", outOfStockCount);
  //       // You can set this count to a state variable here, e.g., setOutOfStockCount(outOfStockCount);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching out of stock count:', error);
  //     });
  //   axios({
  //     method: 'GET',
  //     url: `${appLocalizer.apiUrl}/wc/v3/products`,
  //     headers: { 'X-WP-Nonce': appLocalizer.nonce },
  //     params: {
  //       per_page: 1, // Crucial: only request 1 item to minimize data transfer
  //       stock_status: 'onbackorder', // Filter for products available for backorder
  //       // Include this if you need to filter by a specific store/vendor:
  //       // meta_key: 'multivendorx_store_id', 
  //     },
  //   })
  //     .then(response => {
  //       // 💡 The total count is provided in the 'X-WP-Total' response header
  //       const onBackorderCount = response.headers['x-wp-total'];

  //       console.log("Total On Backorder Count:", onBackorderCount);

  //       // You can now use this variable to update your UI or state
  //       // setOnBackorderCount(onBackorderCount);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching on backorder count:', error);
  //     });
  //   axios({
  //     method: 'GET',
  //     url: `${appLocalizer.apiUrl}/wc/v3/products`,
  //     headers: { 'X-WP-Nonce': appLocalizer.nonce },
  //     params: {
  //       per_page: 1, // Only need 1 result to retrieve the total count from the header
  //       stock_status: 'instock', // <-- Filter for in-stock products
  //       // Include this if you are filtering by a specific store/vendor ID:
  //       // meta_key: 'multivendorx_store_id', 
  //     },
  //   })
  //     .then(response => {
  //       // Access the total count from the custom header 'x-wp-total'
  //       const inStockCount = response.headers['x-wp-total'];

  //       console.log("Total In Stock Count:", inStockCount);

  //       // You can set this value to a state variable here, e.g., setInStockCount(inStockCount);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching in stock count:', error);
  //     });

  //   // Define your low stock threshold (e.g., 2)
  //   const lowStockThreshold = 2;

  //   axios({
  //     method: 'GET',
  //     url: `${appLocalizer.apiUrl}/wc/v3/products`,
  //     headers: { 'X-WP-Nonce': appLocalizer.nonce },
  //     params: {
  //       per_page: 1,
  //       stock_status: 'instock',         // Must be in stock
  //       min_stock_quantity: 1,           // Stock must be greater than or equal to 1
  //       max_stock_quantity: lowStockThreshold, // Stock must be less than or equal to the threshold
  //       // meta_key: 'multivendorx_store_id', // Keep if filtering by vendor
  //     },
  //   })
  //     .then(response => {
  //       // Access the total count from the 'X-WP-Total' header
  //       const lowStockCount = response.headers['x-wp-total'];

  //       console.log(`Total Low Stock Count (Stock <= ${lowStockThreshold}):`, lowStockCount);

  //       // setLowStockCount(lowStockCount);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching low stock count:', error);
  //     });

  // }, []);



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

    // Chart data for revenue trend
    axios({
      method: "GET",
      url: `${appLocalizer.apiUrl}/wc/v3/products`,
      headers: { "X-WP-Nonce": appLocalizer.nonce },
      params: { meta_key: "multivendorx_store_id", per_page: 20 },
    })
      .then((response) => {
        const products = response.data || [];

        const data = products
          .filter((p: any) => Number(p.total_sales) > 0)
          .map((p: any) => ({
            name: p.name,
            net_sales: parseFloat(p.price || 0) * parseInt(p.total_sales || 0),
            items_sold: parseInt(p.total_sales || 0),
          }));

        setChartData(data);
      })
      .catch(() => {
        setError("Failed to load product sales data");
      });

    // Top reviewed products
    axios({
      method: 'GET',
      url: `${appLocalizer.apiUrl}/wc/v3/products`,
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      params: {
        per_page: 5,
        meta_key: 'multivendorx_store_id',
        orderby: 'rating',
        order: 'desc',
      },
    })
      .then(response => {
        const filtered = response.data.filter(
          (product: any) => parseFloat(product.average_rating) > 0
        );
        setToReviewedProduct(filtered);
      })
      .catch(error => {
        console.error('Error fetching top reviewed products:', error);
      });

    // Top selling products
    axios({
      method: 'GET',
      url: `${appLocalizer.apiUrl}/wc/v3/products`,
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      params: {
        per_page: 5,
        meta_key: 'multivendorx_store_id',
        orderby: 'popularity',
        order: 'desc',
      },
    })
      .then(response => {
        const filtered = response.data.filter(
          (product: any) => Number(product.total_sales) > 0
        );
        setToSellingProduct(filtered);
      })
      .catch(error => {
        console.error('Error fetching top selling products:', error);
      });

    // Count: Out of stock
    axios({
      method: 'GET',
      url: `${appLocalizer.apiUrl}/wc/v3/products`,
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      params: {
        meta_key: 'multivendorx_store_id',
        per_page: 1,
        stock_status: 'outofstock',
      },
    })
      .then(response => {
        const outOfStockCount = Number(response.headers['x-wp-total']) || 0;
        setOutOfStockCount(outOfStockCount);
      })
      .catch(error => {
        console.error('Error fetching out of stock count:', error);
      });

    // Count: On backorder
    axios({
      method: 'GET',
      url: `${appLocalizer.apiUrl}/wc/v3/products`,
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      params: {
        meta_key: 'multivendorx_store_id',
        per_page: 1,
        stock_status: 'onbackorder',
      },
    })
      .then(response => {
        const onBackorderCount = Number(response.headers['x-wp-total']) || 0;
        setOnBackorderCount(onBackorderCount);
      })
      .catch(error => {
        console.error('Error fetching on backorder count:', error);
      });

    // Count: In stock
    axios({
      method: 'GET',
      url: `${appLocalizer.apiUrl}/wc/v3/products`,
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      params: {
        meta_key: 'multivendorx_store_id',
        per_page: 1,
        stock_status: 'instock',
      },
    })
      .then(response => {
        const inStockCount = Number(response.headers['x-wp-total']) || 0;
        setInStockCount(inStockCount);
      })
      .catch(error => {
        console.error('Error fetching in stock count:', error);
      });

    // Count: Low stock
    const lowStockThreshold = 2;
    axios({
      method: 'GET',
      url: `${appLocalizer.apiUrl}/wc/v3/products`,
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      params: {
        per_page: 1,
        meta_key: 'multivendorx_store_id',
        stock_status: 'instock',
        min_stock_quantity: 1,
        max_stock_quantity: lowStockThreshold,
      },
    })
      .then(response => {
        const lowStockCount = Number(response.headers['x-wp-total']) || 0;
        setLowStockCount(lowStockCount);
      })
      .catch(error => {
        console.error('Error fetching low stock count:', error);
      });

  }, []);

  const overview = [
    { id: "sales", label: "Total Products", count: totalRows, icon: "adminlib-star red" },
    { id: "earnings", label: "In Stock", count: inStockCount, icon: "adminlib-support green" },
    { id: "Vendors", label: "On backorder", count: onBackorderCount, icon: "adminlib-global-community yellow" },
    { id: "free", label: "Out of Stock", count: outOfStockCount, icon: "adminlib-global-community blue" },
  ];

  //Fixed table columns for WooCommerce products
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
              <div className="des">{row.original.sku}</div>
            </div>
          </a>
        </TableCell>
      ),
    },
    { header: __("Store", "multivendorx"), cell: ({ row }) => <TableCell>{row.original.store_name}</TableCell> },
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

      //Add Date Filtering (only if both are valid Date objects)
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

      //Sorting
      if (orderBy) {
        params.orderby = orderBy;
        params.order = order || "asc";
      }

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
          ? formatCurrency(product.price)
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
      console.error("Product fetch failed:", error);
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
  return (
    <div className="dashboard-overview">
      {/* Keep entire top dashboard layout */}
      <div className="row">
        {/* <div className="column">
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
        </div> */}
        <div className="column transparent">
          <div className="analytics-container report">
            {overview.map((item, idx) => (
              <div key={idx} className="analytics-item">
                <div className="analytics-icon"><i className={item.icon}></i></div>
                <div className="details"><div className="number">{item.count}</div><div className="text">{item.label}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">Revenue & Sales Comparison</div>
            </div>
          </div>

          {error ? (
            <p className="text-red-500">{error}</p>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="net_sales" fill="#5007aa" name="Net Sales" />
                <Bar dataKey="items_sold" fill="#00c49f" name="Items Sold" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 p-2">No product sales data found.</p>
          )}
        </div>
      </div>

      {/* Keep categories and brands */}
      <div className="row">
        {/*Top Reviewed Products Section */}
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">Top Reviewed Products</div>
            </div>
          </div>

          {toReviewedProduct.length > 0 ? (
            toReviewedProduct.map((product: any) => (
              <div className="column" key={`review-${product.id}`}>
                <div
                  className="card-header cursor-pointer"
                  onClick={() => toggleReviewedCard(product.id.toString())}
                >
                  <div className="left">
                    <div className="product-name font-medium">{product.name}</div>
                    <div className="price text-sm text-gray-600">
                      <b>Rating:</b> {product.average_rating || "0"} ⭐
                    </div>
                  </div>
                  <div className="right">
                    <i
                      className={`adminlib-pagination-right-arrow ${openReviewedCards[product.id] ? "rotate-90 transition-transform" : ""
                        }`}
                    ></i>
                  </div>
                </div>

                {openReviewedCards[product.id] && (
                  <div className="top-items">
                    <div className="items">
                      <div className="left-side flex items-center gap-3 p-2">
                        {product.images?.[0]?.src ? (
                          <img
                            src={product.images[0].src}
                            alt={product.name}
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: 6,
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <i className="adminlib-store-inventory text-xl"></i>
                        )}

                        <div className="details text-sm leading-6">
                          <div>
                            <b>Price:</b>{" "}
                            <span
                              dangerouslySetInnerHTML={{
                                __html: product.price_html || product.price || "—",
                              }}
                            />
                          </div>
                          <div>
                            <b>Total Sales:</b> {product.total_sales || 0}
                          </div>
                          <div>
                            <b>Category:</b>{" "}
                            {product.categories?.map((c: any) => c.name).join(", ") || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 p-2">No reviewed products found.</p>
          )}

        </div>

        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">Top Selling Products</div>
            </div>
          </div>

          {toSellingProduct.length > 0 ? (
            toSellingProduct.map((product: any) => (
              <div className="info-item" key={`selling-${product.id}`}>
                <div className="details-wrapper">
                  <div className="avatar">
                    <img
                      src={
                        product.images?.length
                          ? product.images[0].src
                          : "https://via.placeholder.com/100?text=No+Image"
                      }
                      alt={product.name}
                    />
                  </div>
                  <div className="details">
                    <div className="name">{product.name}</div>
                    <div className="des">Total Sales: {product.total_sales || 0}</div>
                  </div>
                </div>
                <div className="right-details">
                  <div className="price">
                   
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No top selling products found.</p>
          )}


        </div>

      </div>

      {/*Fixed Table Section */}
      <div className="card-header p-top">
        <div className="left">
          <div className="title">Revenue Distribution</div>
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
  );
};

export default Revenue;
