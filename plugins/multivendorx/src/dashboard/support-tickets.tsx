import { useEffect, useState } from "react";
import { Table, TableCell } from "zyra";
import { __ } from '@wordpress/i18n';
import { ColumnDef } from "@tanstack/react-table";

type StoreRow = {
    id: number;
    store_name?: string;   // Coupon Name
    store_slug?: string;   // Reused but we'll map different fields into it
    type?: string;         // Coupon Type
    amount?: string;       // Coupon Amount
    usage?: string;        // Usage / Limit
    expiry?: string;       // Expiry Date
    status?: string;
};

const Reviews: React.FC = () => {
    const [storeProducts, setStoreProducts] = useState<{ value: string; label: string }[]>([]);
    const [data, setData] = useState<StoreRow[]>([]);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    // 🔹 Add demo data on mount
    useEffect(() => {
        const demoData: StoreRow[] = [
            {
                id: 25831,
                store_name: "EAA2US8Z",
                type: "Fixed Cart Discount",
                amount: "10.6",
                usage: "0 / 200",
                expiry: "2025-12-31",
                status: "Active",
            },
            {
                id: 25832,
                store_name: "WELCOME10",
                type: "Percentage",
                amount: "10%",
                usage: "12 / 100",
                expiry: "2026-01-15",
                status: "Active",
            },
            {
                id: 25833,
                store_name: "FREESHIP",
                type: "Free Shipping",
                amount: "—",
                usage: "5 / ∞",
                expiry: "2025-10-01",
                status: "Expired",
            },
        ];
        setData(demoData);
        setTotalRows(demoData.length);
    }, []);


    const columns: ColumnDef<StoreRow>[] = [
        {
            header: __('Coupon Name', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.store_name || ''}>
                    {row.original.store_name || '-'}
                </TableCell>
            ),
        },
    ];
    return (
        <>
            {/* page title start */}
            < div className="page-title-wrapper" >
                <div className="page-title">
                    <div className="title">view Order</div>
                    <div className="des">Manage your store information and preferences</div>
                </div>
                <div className="buttons-wrapper">
                    <div className="admin-btn btn-purple">
                        Order
                    </div>
                </div>

            </div > {/* page title end */}
            <div className="row">
                <div className="column">
                    <div className="details-wrapper">
                        <div className="details">
                            <div className="heading">Order date :</div>
                            <div className="text">	September 10, 2025 8:10 am</div>
                        </div>
                        <div className="details">
                            <div className="heading">Payment method :</div>
                            <div className="text">Payment via Direct bank transfer</div>
                        </div>
                        <div className="details">
                            <div className="heading">Delivery location from map </div>
                            <div className="text">California, USA</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="column">
                    <div className="card">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">Billing address</div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div> Test customer</div>
                            <div> NewYork</div>
                            <div> New York, NY 07008</div>
                            <div>  United States (US)</div>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="card">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">Shipping address</div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div> Test customer</div>
                            <div> NewYork</div>
                            <div> New York, NY 07008</div>
                            <div>  United States (US)</div>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="card">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">Customer detail</div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div> Test customer</div>
                            <div> NewYork</div>
                            <div> New York, NY 07008</div>
                            <div>  United States (US)</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* <Table
                        data={data}
                        columns={columns as ColumnDef<Record<string, any>, any>[]}
                        // rowSelection={rowSelection}
                        // onRowSelectionChange={setRowSelection}
                        defaultRowsPerPage={10}
                        // pageCount={pageCount}
                        // pagination={pagination}
                        // onPaginationChange={setPagination}
                        // perPageOption={[10, 25, 50]}
                        // typeCounts={[]}
                        // realtimeFilter={[]}
                        pagination={false}
                    /> */}
            </div>
            <div className="row">
                <div className="column">
                    <div className="coupons-calculation-wrapper">
                        <div className="left">
                            <div className="admin-btn btn-purple">Refund</div>
                        </div>
                        <div className="right">
                            <table>
                                <tbody>
                                    <tr>
                                        <td>commission</td>
                                        <td>$29</td>
                                    </tr>
                                    <tr>
                                        <td>Discount</td>
                                        <td>$29</td>
                                    </tr>
                                    <tr>
                                        <td>Discount</td>
                                        <td>$29</td>
                                    </tr>
                                    <tr>
                                        <td>Discount</td>
                                        <td>$29</td>
                                    </tr>
                                    <tr>
                                        <td>Total Earned</td>
                                        <td>$529</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

};

export default Reviews;