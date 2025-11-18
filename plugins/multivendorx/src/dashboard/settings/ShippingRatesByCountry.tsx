import React, { useState, useEffect } from "react";
import { BasicInput, SelectInput, getApiLink } from "zyra";
import axios from "axios";

interface ShippingStateRate {
    state: string;
    cost: string;
}

interface ShippingCountryRate {
    country: string;
    cost: string;
    states: ShippingStateRate[];
}

const ShippingRatesByCountry: React.FC = () => {
    const [rates, setRates] = useState<ShippingCountryRate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Extract countries and states from appLocalizer
    const countries: { [key: string]: string } = appLocalizer?.country_list || {};
    const statesByCountry: {
        [countryCode: string]: { [stateCode: string]: string } | [];
    } = appLocalizer?.state_list || {};

    console.log("state list", appLocalizer.state_list);

    // Fetch initial shipping rates
    useEffect(() => {
        if (!appLocalizer?.store_id) return;

        const fetchShippingRates = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(
                    getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
                    {
                        headers: { "X-WP-Nonce": appLocalizer.nonce },
                    }
                );

                const data = response.data || {};
                console.log("Fetched data:", data);

                let shippingRates: ShippingCountryRate[] = [];

                try {
                    shippingRates =
                        typeof data.multivendorx_shipping_rates === "string"
                            ? JSON.parse(data.multivendorx_shipping_rates)
                            : data.multivendorx_shipping_rates || [];
                } catch (e) {
                    console.error("Failed to parse shipping rates:", e);
                    shippingRates = [];
                }

                console.log("Parsed shipping rates:", shippingRates);
                setRates(shippingRates);
            } catch (err) {
                console.error("Error fetching shipping rates:", err);
                setError("Failed to load shipping rates");
                setRates([]);
            } finally {
                setLoading(false);
            }
        };

        fetchShippingRates();
    }, [appLocalizer?.store_id]);

    // Auto-save helper
    const autoSave = async (updatedRates: ShippingCountryRate[]) => {
        setRates(updatedRates);
        setError(null);

        if (!appLocalizer?.store_id) return;

        try {
            const saveData = {
                multivendorx_shipping_rates: JSON.stringify(
                    updatedRates.map((rate) => ({
                        country: rate.country || "",
                        cost: rate.cost === "" ? "" : rate.cost,
                        states: (rate.states || []).map((state) => ({
                            state: state.state || "",
                            cost: state.cost === "" ? "" : state.cost,
                        })),
                    }))
                ),
                
            };

            const response = await axios.put(
                getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
                saveData,
                {
                    headers: {
                        "X-WP-Nonce": appLocalizer.nonce,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data && response.data.success !== false) {
                console.log("Save successful:", response.data);
            } else {
                throw new Error(response.data?.message || "Save failed");
            }
        } catch (err) {
            console.error("Error saving shipping rates:", err);
            setError("Failed to save shipping rates. Please try again.");
        }
    };

    // Country handlers
    const handleAddCountry = () => {
        const newRates = [...rates, { country: "", cost: "", states: [] }];
        autoSave(newRates);
    };

    const handleRemoveCountry = (index: number) => {
        const newRates = rates.filter((_, i) => i !== index);
        autoSave(newRates);
    };

    const handleCountryChange = (index: number, key: "country" | "cost", val: string) => {
        const updated = [...rates];
        updated[index] = { ...updated[index], [key]: val };

        if (key === "country") {
            updated[index].states = [];
        }

        autoSave(updated);
    };

    // State handlers
    const handleAddState = (countryIndex: number) => {
        const updated = [...rates];
        updated[countryIndex].states = [
            ...updated[countryIndex].states,
            { state: "", cost: "" },
        ];
        autoSave(updated);
    };

    const handleStateChange = (
        countryIndex: number,
        stateIndex: number,
        key: keyof ShippingStateRate,
        val: string
    ) => {
        const updated = [...rates];
        updated[countryIndex].states[stateIndex] = {
            ...updated[countryIndex].states[stateIndex],
            [key]: val,
        };
        autoSave(updated);
    };

    const handleRemoveState = (countryIndex: number, stateIndex: number) => {
        const updated = [...rates];
        updated[countryIndex].states = updated[countryIndex].states.filter(
            (_, i) => i !== stateIndex
        );
        autoSave(updated);
    };

    if (loading) return <div className="p-4 text-center">Loading shipping rates...</div>;

    return (
        <div className="shipping-country-wrapper">
            {error && (
                <div className="">
                    {error}
                </div>
            )}

            {rates.length === 0 && !loading ? (
                <div className="no-shipping-data">
                    No shipping rates configured. Add your first country to get started.
                </div>

            ) : (
                rates.map((countryItem, index) => {
                    const countryCode = countryItem.country?.trim()?.toUpperCase() || "";
                    const rawStates = statesByCountry[countryCode];
                    const countryStates =
                        Array.isArray(rawStates) && rawStates.length === 0
                            ? {} // if empty array, treat as no states
                            : (rawStates as Record<string, string>) || {};

                    return (
                        <div
                            key={index}
                            className="shipping-country"
                        >
                            <div className="country item">
                                <div className="location-icon adminlib-geo-location"></div>
                                <SelectInput
                                    label="Country"
                                    name={`country-${index}`}
                                    value={countryItem.country}
                                    options={[
                                        { value: "", label: "Select Country" },
                                        { value: "everywhere", label: "Everywhere Else" },
                                        ...(Array.isArray(countries)
                                            ? countries
                                            : Object.entries(countries).map(([value, label]) => ({
                                                value,
                                                label,
                                            }))),
                                    ]}
                                    onChange={(opt: any) =>
                                        opt?.value &&
                                        handleCountryChange(index, "country", opt.value)
                                    }
                                />

                                <BasicInput
                                    label="Cost"
                                    type="number"
                                    name={`cost-${index}`}
                                    value={countryItem.cost}
                                    onChange={(e) =>
                                        handleCountryChange(index, "cost", e.target.value)
                                    }
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />

                                <span onClick={() => handleRemoveCountry(index)} className="delete-icon adminlib-delete"></span>
                            </div>

                            {countryItem.country &&
                                Object.keys(countryStates).length > 0 && (
                                    <div className="State-wrapper">

                                        <div className="header">
                                            <div className="left">
                                                <div className="title">
                                                    State/Region Rates
                                                </div>
                                                <div className="des">
                                                    State/region rates are added to the Default Shipping Price. Example: If Default Shipping is $5 and State Rate is $3, the total shipping will be $8.
                                                </div>
                                            </div>
                                            <div className="right">
                                                <button
                                                    type="button"
                                                    className="admin-btn btn-purple-bg"
                                                    onClick={() => handleAddState(index)}
                                                >
                                                    <i className="adminlib-plus-circle-o"></i> Add State/Region
                                                </button>
                                            </div>
                                        </div>

                                        {countryItem.states.map((stateItem, sIndex) => (
                                            <div
                                                key={sIndex}
                                                className="state item"
                                            >
                                                <SelectInput
                                                    label="State"
                                                    name={`state-${index}-${sIndex}`}
                                                    value={stateItem.state}
                                                    options={[
                                                        { value: "", label: "Select State" },
                                                        ...Object.entries(
                                                            countryStates
                                                        ).map(([value, label]) => ({
                                                            label,
                                                            value,
                                                        })),
                                                    ]}
                                                    onChange={(opt: any) =>
                                                        opt?.value &&
                                                        handleStateChange(
                                                            index,
                                                            sIndex,
                                                            "state",
                                                            opt.value
                                                        )
                                                    }
                                                />
                                                <BasicInput
                                                    label="Cost"
                                                    type="number"
                                                    name={`state-cost-${index}-${sIndex}`}
                                                    value={stateItem.cost}
                                                    onChange={(e) =>
                                                        handleStateChange(
                                                            index,
                                                            sIndex,
                                                            "cost",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                />
                                                <span onClick={() => handleRemoveState(index, sIndex)} className="delete-icon adminlib-delete"></span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                        </div>
                    );
                })
            )}

            <button
                type="button"
                className="admin-btn btn-purple-bg"
                onClick={handleAddCountry}
            >
                <i className="adminlib-plus-circle-o"></i> Add Country
            </button>
        </div>
    );
};

export default ShippingRatesByCountry;
