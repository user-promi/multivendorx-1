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
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {rates.length === 0 && !loading ? (
                <div className="text-center p-4 text-gray-500">
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
                            className="country-block border p-3 mb-3 rounded-lg bg-white shadow-sm"
                        >
                            <div className="flex gap-3 items-center mb-2">
                                <div className="flex-1">
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
                                </div>

                                <div className="w-32">
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
                                </div>

                                <button
                                    type="button"
                                    className="admin-btn btn-red self-end"
                                    onClick={() => handleRemoveCountry(index)}
                                >
                                    Remove
                                </button>
                            </div>

                            {countryItem.country &&
                                Object.keys(countryStates).length > 0 && (
                                    <div className="ml-6 mt-4 p-3 border rounded bg-gray-50">
                                        <div className="text-sm font-medium mb-2">
                                            State Shipping Rates
                                        </div>
                                        {countryItem.states.map((stateItem, sIndex) => (
                                            <div
                                                key={sIndex}
                                                className="flex gap-3 items-center mb-2"
                                            >
                                                <div className="flex-1">
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
                                                </div>
                                                <div className="w-32">
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
                                                </div>
                                                <button
                                                    type="button"
                                                    className="admin-btn btn-red self-end"
                                                    onClick={() =>
                                                        handleRemoveState(index, sIndex)
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="admin-btn btn-purple mt-2"
                                            onClick={() => handleAddState(index)}
                                        >
                                            + Add State
                                        </button>
                                    </div>
                                )}
                        </div>
                    );
                })
            )}

            <button
                type="button"
                className="admin-btn btn-purple mt-4"
                onClick={handleAddCountry}
            >
                + Add Country
            </button>
        </div>
    );
};

export default ShippingRatesByCountry;
