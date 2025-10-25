/* global appLocalizer */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Table,
    TableCell,
    CommonPopup,
    ToggleSetting,
    BasicInput,
    getApiLink,
} from "zyra";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { __ } from "@wordpress/i18n";

// ✅ Type definition for each zone
type Zone = {
    id: number;
    zone_name: string;
    formatted_zone_location: string;
    shipping_methods: any[];
    zone_id: number;
};

const DistanceByZoneShipping: React.FC = () => {
    const [data, setData] = useState<Zone[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pageCount, setPageCount] = useState<number>(0);
    const [error, setError] = useState<string>();
    const [editShipping, setEditShipping] = useState(false);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [formData, setFormData] = useState({
        shippingMethod: "",
        shippingCost: "",
        localPickupCost: "",
    });

    // ✅ Fetch zones on mount
    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            const res = await axios({
                method: "GET",
                url: getApiLink(appLocalizer, "zone-shipping"),
                headers: { "X-WP-Nonce": appLocalizer.nonce },
                params: { store_id: appLocalizer.store_id },
            });

            const zonesObject: Record<string, Zone> = res?.data || {};
            const zonesArray = Object.values(zonesObject);

            setData(zonesArray);
            setTotalRows(zonesArray.length);
            setPageCount(Math.ceil(zonesArray.length / pagination.pageSize));
        } catch (err) {
            console.error("Error loading zones:", err);
            setError(__("Failed to load shipping zones", "multivendorx"));
        }
    };

    //Edit a zone
    const handleEdit = async (zone: Zone) => {
        try {
            // Build the URL with zone ID
            const url = getApiLink(appLocalizer, `zone-shipping/${zone.zone_id}`);

            // Fetch the latest zone data from backend
            const res = await axios.get(url, {
                headers: { "X-WP-Nonce": appLocalizer.nonce },
                params: {
                    store_id: appLocalizer.store_id, // still pass store_id if required
                    zone_id: zone.zone_id,
                },
            });

            const fetchedZone: Zone = res.data; // should match your Zone type
            setSelectedZone(fetchedZone);

            // Extract first shipping method and local pickup
            const firstMethod = fetchedZone.shipping_methods?.[0];
            const localPickup = fetchedZone.shipping_methods?.find(
                (m: any) => m.method_id === "local_pickup"
            );

            setFormData({
                shippingMethod: firstMethod?.method_id || "flat_rate",
                shippingCost: firstMethod?.settings?.cost || "",
                localPickupCost: localPickup?.settings?.cost || "",
            });

            setEditShipping(true);
        } catch (err) {
            console.error("Failed to fetch zone details:", err);
            alert("Failed to load zone details. Please try again.");
        }
    };


    const handleChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!selectedZone) return;

        try {
            const res = await axios({
                method: "POST",
                url: getApiLink(appLocalizer, "zone-shipping/update"),
                headers: { "X-WP-Nonce": appLocalizer.nonce },
                data: {
                    store_id: appLocalizer.store_id,
                    zone_id: selectedZone.zone_id,
                    shipping_data: formData,
                },
            });

            const updated = data.map((zone) =>
                zone.zone_id === selectedZone.zone_id
                    ? { ...zone, shipping_methods: res.data.shipping_methods }
                    : zone
            );

            setData(updated);
            setEditShipping(false);
        } catch (err) {
            console.error("Failed to update shipping:", err);
            alert("Failed to save shipping changes.");
        }
    };
    //Define Table Columns
    const columns: ColumnDef<Zone>[] = [
        {
            header: __("Zone Name", "multivendorx"),
            cell: ({ row }) => (
                <TableCell>{row.original.zone_name || "—"}</TableCell>
            ),
        },
        {
            header: __("Region(s)", "multivendorx"),
            cell: ({ row }) => (
                <TableCell>
                    {row.original.formatted_zone_location || "—"}
                </TableCell>
            ),
        },
        {
            header: __("Shipping Method(s)", "multivendorx"),
            cell: ({ row }) => {
                const methods = row.original.shipping_methods;
                if (!methods || methods.length === 0)
                    return <TableCell>No shipping methods</TableCell>;
                const methodNames = methods.map((m: any) => m.title).join(", ");
                return <TableCell>{methodNames}</TableCell>;
            },
        },
        {
            header: __("Actions", "multivendorx"),
            cell: ({ row }) => (
                <TableCell
                    type="action-dropdown"
                    header={{
                        actions: [
                            {
                                label: __("Edit", "multivendorx"),
                                icon: "adminlib-edit",
                                onClick: () => handleEdit(row.original),
                            },
                        ],
                    }}
                />
            ),
        },
    ];

    return (
        <>
            <div className="card-title text-lg font-semibold mb-3">
                {__("Zone-wise Shipping Configuration", "multivendorx")}
            </div>

            <div className="admin-table-wrapper">
                <Table
                    data={data}
                    columns={columns as ColumnDef<Record<string, any>, any>[]}
                    rowSelection={{}}
                    onRowSelectionChange={() => { }}
                    defaultRowsPerPage={10}
                    pageCount={pageCount}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    perPageOption={[10, 25, 50]}
                    totalCounts={totalRows}
                />
            </div>

            {editShipping && selectedZone && (
                <CommonPopup
                    open={editShipping}
                    width="500px"
                    height="auto"
                    header={
                        <>
                            <div className="title flex items-center gap-2">
                                <i className="adminlib-cart"></i>
                                {__("Edit Shipping — ", "multivendorx")}
                                {selectedZone.zone_name}
                            </div>
                            <p>
                                {__("Manage the pricing and methods for this zone.", "multivendorx")}
                            </p>
                            <i
                                className="icon adminlib-close cursor-pointer"
                                onClick={() => setEditShipping(false)}
                            ></i>
                        </>
                    }
                    footer={
                        <div className="flex justify-end gap-2 p-3">
                            <button
                                className="btn btn-default"
                                onClick={() => setEditShipping(false)}
                            >
                                {__("Cancel", "multivendorx")}
                            </button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {__("Save", "multivendorx")}
                            </button>
                        </div>
                    }
                >
                    <div className="content p-3">
                        <div className="form-group">
                            <label htmlFor="method">
                                {__("Shipping Method", "multivendorx")}
                            </label>
                            <ToggleSetting
                                wrapperClass="setting-form-input"
                                value={formData.shippingMethod}
                                onChange={(val) => handleChange("shippingMethod", val)}
                                options={[
                                    { key: "flat_rate", value: "Flat rate", label: "Flat rate" },
                                    { key: "free_shipping", value: "Free shipping", label: "Free shipping" },
                                    { key: "local_pickup", value: "Local pickup", label: "Local pickup" },
                                ]}
                            />
                        </div>

                        <div className="form-group mt-3">
                            <label>{__("Shipping Cost ($)", "multivendorx")}</label>
                            <BasicInput
                                type="number"
                                name="shippingCost"
                                value={formData.shippingCost}
                                onChange={(e: any) =>
                                    handleChange("shippingCost", e.target.value)
                                }
                            />
                        </div>

                        <div className="form-group mt-3">
                            <label>{__("Local Pickup Cost ($)", "multivendorx")}</label>
                            <BasicInput
                                type="number"
                                name="localPickupCost"
                                value={formData.localPickupCost}
                                onChange={(e: any) =>
                                    handleChange("localPickupCost", e.target.value)
                                }
                            />
                        </div>
                    </div>
                </CommonPopup>
            )}
        </>
    );
};

export default DistanceByZoneShipping;
