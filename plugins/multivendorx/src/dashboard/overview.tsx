import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell, CalendarInput } from 'zyra';
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Tooltip } from 'react-leaflet';
import { ColumnDef } from '@tanstack/react-table';



// const overviewData = [
//     { icon: "adminlib-tools green", number: "$47,540.00", text: "Total Sales" },
//     { icon: "adminlib-book red", number: "344", text: "Total Orders" },
//     { icon: "adminlib-global-community yellow", number: "$42,786.00", text: "Earnings" },
//     { icon: "adminlib-global-community blue", number: "$42,786.00", text: "Pending Payouts" },

// ];
const analyticsData = [
    { icon: "adminlib-tools theme-color1", number: "230k", text: "Total Sales" },
    { icon: "adminlib-book theme-color2", number: "45k", text: "Total Orders" },
    { icon: "adminlib-global-community theme-color3", number: "1.2M", text: "Earnings" },
    { icon: "adminlib-wholesale theme-color4", number: "500k", text: "Pending Payouts" },
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
const pieData = [
    { name: "Completed", value: 300 },
    { name: "Pending", value: 2400 },
    { name: "Cancelled", value: 800 },
];
const COLORS = ["#5007aa", "#00c49f", "#ff7300", "#d400ffff", "#00ff88ff"];
const demoData: overviewRow[] = [
    { id: 1, product: "Wireless Headphones", unitsSold: 145, sales: "$12,450" },
    { id: 2, product: "Smart Watch Pro", unitsSold: 98, sales: "$9,800" },
    { id: 3, product: "USB-C Cable Pack", unitsSold: 362, sales: "$7,230" },
    { id: 4, product: "Phone Stand", unitsSold: 189, sales: "$5,670" },
    { id: 5, product: "Laptop Sleeve", unitsSold: 123, sales: "$4,920" },
];

const columns: ColumnDef<overviewRow>[] = [
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
        header: __('Product', 'multivendorx'),
        cell: ({ row }) => (
            <TableCell title={row.original.store_name || ''}>
                {row.original.product || '-'}
            </TableCell>
        ),
    },
    {
        header: __('Units Sold', 'multivendorx'),
        cell: ({ row }) => (
            <TableCell title={row.original.store_name || ''}>
                {row.original.unitsSold || '-'}
            </TableCell>
        ),
    },
    {
        header: __('Sales', 'multivendorx'),
        cell: ({ row }) => (
            <TableCell title={row.original.store_name || ''}>
                {row.original.sales || '-'}
            </TableCell>
        ),
    },
];
const Overview: React.FC = () => {

    const [data, setData] = useState<overviewRow[] | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);
    // Handle pagination and filter changes
    const requestApiForData = (
        rowsPerPage: number,
        currentPage: number,
    ) => {

    };
    type StoreRow = {
        id: number;
        vendor: string;
        amount: string;
        commission: string;
        date: string;
        status: "Paid" | "Unpaid";
    };
    return (
        <>
            <div className="page-title-wrapper">
                <div className="page-title">
                    <div className="title">Overview</div>
                    <div className="des">Here's what's happening with your store today.</div>
                </div>
            </div>

            <div className="row">
                <div className="column transparent">
                    <div className="card">
                        <div className="card-body">
                            <div className="analytics-container">

                                {analyticsData.map((item, idx) => (
                                    <div key={idx} className="analytics-item">
                                        <div className="details">
                                            <div className="text">{item.text}</div>
                                            <div className="number">{item.number}</div>
                                            <div className="report"><span>10%</span> | This month</div>
                                        </div>
                                        <div className="analytics-icon">
                                            <i className={item.icon}></i>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="column w-65">
                    <div className="card">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Sales Overview (7 Days)
                                </div>
                                {/* <div className="des">Lorem ipsum dolor sit amet.</div> */}
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <div className="card-body">
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
                    </div>

                </div>
                <div className="column w-35">
                    <div className="card">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Sales Overview (7 Days)
                                </div>
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={250}>
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
                </div>
            </div>
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
            />
        </>
    );
};

export default Overview;