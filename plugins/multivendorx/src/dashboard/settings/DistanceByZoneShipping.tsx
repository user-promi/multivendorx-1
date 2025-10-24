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
    MultiCheckBox,
} from "zyra";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { __ } from "@wordpress/i18n";

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
    const [addShipping, setAddShipping] = useState<boolean>(false);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

    const [formData, setFormData] = useState<any>({
        shippingMethod: [],
        localPickupCost: "",
        taxStatus: false,
        freeShippingType: [],
        minOrderCost: "",
        flatRateCost: "",
        flatRateTaxStatus: false,
        flatRateClassCost: "",
        flatRateCalculationType: [],
    });

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

    const handleAdd = (zone: Zone) => {
        setSelectedZone(zone);
        setAddShipping(true);
        setFormData({
            shippingMethod: [],
            localPickupCost: "",
            taxStatus: false,
            freeShippingType: [],
            minOrderCost: "",
            flatRateCost: "",
            flatRateTaxStatus: false,
            flatRateClassCost: "",
            flatRateCalculationType: "",
        });
    };

    const handleChange = (key: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        try {
            // Prepare the data for API call
            const shippingData = {
                settings: {}
            };
            // Prepare settings based on selected shipping method
            if (formData.shippingMethod.includes("local_pickup")) {
                shippingData.settings = {
                    title: "Local Pickup", // You might want to make this dynamic
                    cost: formData.localPickupCost || '0',
                    tax_status: formData.taxStatus ? 'taxable' : 'none',
                    description: "Local pickup shipping method" // Add description field if needed
                };
            } else if (formData.shippingMethod.includes("free_shipping")) {
                shippingData.settings = {
                    title: "Free Shipping",
                    requires: formData.freeShippingType.includes("min_order") ? 'min_amount' : 'coupon',
                    min_amount: formData.minOrderCost || '0',
                    description: "Free shipping method"
                };
            } else if (formData.shippingMethod.includes("flat_rate")) {
                shippingData.settings = {
                    title: "Flat Rate",
                    cost: formData.flatRateCost || '0',
                    tax_status: formData.flatRateTaxStatus ? 'taxable' : 'none',
                    class_cost: formData.flatRateClassCost || '',
                    calculation_type: formData.flatRateCalculationType || 'class', // Fixed: get first array element
                    description: "Flat rate shipping method"
                };
            }
    
            console.log("Submitting shipping data:", shippingData);
    
            // Make API call to add shipping method
            const response = await axios({
                method: "POST",
                url: getApiLink(appLocalizer, "zone-shipping"), // You'll need to check the exact API endpoint
                headers: { 
                    "X-WP-Nonce": appLocalizer.nonce,
                    "Content-Type": "application/json"
                },
                params: {
                    zoneID: selectedZone?.zone_id,
                    method: formData.shippingMethod, // Fixed: get first array element
                    storeId: appLocalizer.store_id,
                    settings: shippingData.settings,
                }
            });
    
            if (response.data.success) {
                console.log("Shipping method added successfully:", response.data);
                // Refresh the zones data
                await fetchZones();
                // Close the popup
                setAddShipping(false);
                // Reset form data
                setFormData({
                    shippingMethod: [],
                    localPickupCost: "",
                    taxStatus: false,
                    freeShippingType: [],
                    minOrderCost: "",
                    flatRateCost: "",
                    flatRateTaxStatus: false,
                    flatRateClassCost: "",
                    flatRateCalculationType: [],
                });
            } else {
                console.error("Failed to add shipping method:", response.data);
                alert(__("Failed to add shipping method", "multivendorx"));
            }
    
        } catch (err) {
            console.error("Error adding shipping method:", err);
            alert(__("Error adding shipping method", "multivendorx"));
        }
    };

    const columns: ColumnDef<Zone>[] = [
        {
            header: __("Zone Name", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.zone_name || "—"}</TableCell>,
        },
        {
            header: __("Region(s)", "multivendorx"),
            cell: ({ row }) => <TableCell>{row.original.formatted_zone_location || "—"}</TableCell>,
        },
        {
            header: __("Shipping Method(s)", "multivendorx"),
            cell: ({ row }) => {
                const methodsObj = row.original.shipping_methods || {};
                const methodsArray = Object.values(methodsObj);

                if (methodsArray.length === 0) return <TableCell>No shipping methods</TableCell>;

                const methodNames = methodsArray.map((m: any) => m.title).join(", ");
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
                                label: __("Add", "multivendorx"),
                                icon: "adminlib-plus",
                                onClick: () => handleAdd(row.original),
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

            {addShipping && selectedZone && (
                <CommonPopup
                    open={addShipping}
                    width="800px"
                    height="50%"
                    header={
                        <>
                            <div className="title flex items-center gap-2">
                                <i className="adminlib-cart"></i>
                                {__("Add Shipping — ", "multivendorx")}
                                {selectedZone.zone_name}
                            </div>
                            <i
                                className="icon adminlib-close cursor-pointer"
                                onClick={() => setAddShipping(false)}
                            ></i>
                        </>
                    }
                    footer={
                        <div className="flex justify-end gap-2 p-3">
                            <button
                                className="btn btn-default"
                                onClick={() => setAddShipping(false)}
                            >
                                {__("Cancel", "multivendorx")}
                            </button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {__("Save", "multivendorx")}
                            </button>
                        </div>
                    }
                >
                    <div className="content p-3 space-y-4">
                        {/* Select Shipping Method */}
                        <label className="font-medium">{__("Shipping Method", "multivendorx")}</label>
                        <ToggleSetting
                            wrapperClass="setting-form-input"
                            value={formData.shippingMethod}
                            onChange={(val: string[]) => handleChange("shippingMethod", val)}
                            options={[
                                { key: "local_pickup", value: "local_pickup", label: "Local pickup" },
                                { key: "free_shipping", value: "free_shipping", label: "Free shipping" },
                                { key: "flat_rate", value: "flat_rate", label: "Flat Rate" },
                            ]}
                        />

                        {/* Local Pickup */}
                        {formData.shippingMethod.includes("local_pickup") && (
                            <>
                                <p className="font-medium mb-2">{__("Local Pickup Options", "multivendorx")}</p>

                                <div className="form-group">
                                    <label className="font-medium">{__("Cost", "multivendorx")}</label>
                                    <BasicInput
                                        type="number"
                                        name="localPickupCost"
                                        placeholder="Enter cost"
                                        value={formData.localPickupCost}
                                        onChange={(e: any) => handleChange("localPickupCost", e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="font-medium">{__("Tax Status", "multivendorx")}</label>
                                    <MultiCheckBox
                                        wrapperClass="toggle-btn"
                                        inputWrapperClass="toggle-checkbox-header"
                                        inputInnerWrapperClass="toggle-checkbox"
                                        inputClass="tax-checkbox"
                                        idPrefix="tax-status-local"
                                        type="checkbox"
                                        options={[
                                            {
                                                key: "taxable",
                                                value: "taxable",
                                            },
                                        ]}
                                        value={formData.taxStatus ? ["taxable"] : []}
                                        onChange={(e) => {
                                            if (Array.isArray(e)) {
                                                handleChange("taxStatus", e.includes("taxable"));
                                            } else {
                                                handleChange("taxStatus", e.target.checked);
                                            }
                                        }}
                                    />
                                </div>
                            </>
                        )}

                        {/* Free Shipping */}
                        {formData.shippingMethod.includes("free_shipping") && (
                            <>
                                <p className="font-medium mb-2">{__("Free Shipping Options", "multivendorx")}</p>
                                <ToggleSetting
                                    wrapperClass="setting-form-input"
                                    value={formData.freeShippingType}
                                    onChange={(val: string[]) => handleChange("freeShippingType", val)}
                                    options={[
                                        { key: "min_order", value: "min_order", label: "Min Order" },
                                        { key: "coupon", value: "coupon", label: "Coupon" },
                                    ]}
                                />
                                {formData.freeShippingType.includes("min_order") && (
                                    <div className="form-group mt-2">
                                        <label className="font-medium">{__("Minimum Order Cost", "multivendorx")}</label>
                                        <BasicInput
                                            type="number"
                                            name="minOrderCost"
                                            placeholder="Enter minimum order cost"
                                            value={formData.minOrderCost}
                                            onChange={(e: any) => handleChange("minOrderCost", e.target.value)}
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {/* Flat Rate */}
                        {formData.shippingMethod.includes("flat_rate") && (
                            <>
                                <p className="font-medium mb-2">{__("Flat Rate Options", "multivendorx")}</p>

                                <div className="form-group">
                                    <label className="font-medium">{__("Cost", "multivendorx")}</label>
                                    <BasicInput
                                        type="number"
                                        name="flatRateCost"
                                        placeholder="Enter cost"
                                        value={formData.flatRateCost}
                                        onChange={(e: any) => handleChange("flatRateCost", e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="font-medium">{__("Tax Status", "multivendorx")}</label>
                                    <MultiCheckBox
                                        wrapperClass="toggle-btn"
                                        inputWrapperClass="toggle-checkbox-header"
                                        inputInnerWrapperClass="toggle-checkbox"
                                        inputClass="tax-checkbox"
                                        idPrefix="tax-status-flat"
                                        type="checkbox"
                                        options={[
                                            {
                                                key: "taxable",
                                                value: "taxable",
                                            },
                                        ]}
                                        value={formData.flatRateTaxStatus ? ["taxable"] : []}
                                        onChange={(e) => {
                                            if (Array.isArray(e)) {
                                                handleChange("flatRateTaxStatus", e.includes("taxable"));
                                            } else {
                                                handleChange("flatRateTaxStatus", e.target.checked);
                                            }
                                        }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="font-medium">{__("Cost of Shipping Class", "multivendorx")}</label>
                                    <BasicInput
                                        type="text"
                                        name="flatRateClassCost"
                                        placeholder="Enter class cost"
                                        value={formData.flatRateClassCost}
                                        onChange={(e: any) => handleChange("flatRateClassCost", e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="font-medium">{__("Calculation Type", "multivendorx")}</label>
                                    <ToggleSetting
                                        wrapperClass="setting-form-input"
                                        value={formData.flatRateCalculationType}
                                        onChange={(val: string[]) => handleChange("flatRateCalculationType", val)}
                                        options={[
                                            { key: "per_class", value: "per_class", label: "Per Class" },
                                            { key: "per_order", value: "per_order", label: "Per Order" },
                                        ]}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </CommonPopup>
            )}
        </>
    );
};

export default DistanceByZoneShipping;




