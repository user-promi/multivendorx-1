import { useEffect, useRef, useState } from "react";
import { BasicInput, SelectInput, TextArea } from "zyra";
import axios from "axios";


const AddOrder = () => {
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [addedProducts, setAddedProducts] = useState([]);
    const [showAddressEdit, setShowAddressEdit] = useState(false);


    const ownerOptions = [
        { label: "Choose an action...", value: "" },
        { label: "Send order details to customer", value: "send_order_details" },
        { label: "Resend new order notification", value: "send_order_details_admin" },
        { label: "Regenerate download permissions", value: "regenerate_download_permissions" },
        { label: "Regenerate suborders", value: "regenerate_suborders" },
    ];
    const customerOptions = [
        { label: "Choose customer...", value: "" },
        { label: "customer 1", value: "customer" },
        { label: "customer 2", value: "customer" },
        { label: "customer 3", value: "customer" },
        { label: "customer 4", value: "customer" },

    ];
    const addressEditRef = useRef(null);

    useEffect(() => {
        if (!showAddressEdit) return;

        function handleClickOutside(e) {
            if (addressEditRef.current && !addressEditRef.current.contains(e.target)) {
                setShowAddressEdit(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showAddressEdit]);

    useEffect(() => {
        axios.get(`${appLocalizer.apiUrl}/wp/v2/users?roles=customer&per_page=100`, {
            headers: { "X-WP-Nonce": appLocalizer.nonce },
        })
            .then((res) => {
                const mapped = res.data.map(c => ({
                    label: c.name || c.username,
                    value: c.id,
                    raw: c,
                }));
                setCustomers(mapped);
            })
            .catch(err => console.log("Error loading customers", err));
    }, []);
    useEffect(() => {
        if (!showAddProduct) return;

        axios.get(`${appLocalizer.apiUrl}/wc/v3/products?per_page=100`, {
            headers: { "X-WP-Nonce": appLocalizer.nonce },
        })
            .then((res) => setAllProducts(res.data))
            .catch((e) => console.log("Error loading products", e));
    }, [showAddProduct]);
    const subtotal = addedProducts.reduce((sum, item) => {
        return sum + item.price * (item.qty || 1);
    }, 0);

    const taxRate = 0.18; // 18% GST example
    const tax = subtotal * taxRate;

    const shipping = 50; // Example flat shipping

    const discount = 0; // If you add discount input later

    const grandTotal = subtotal + tax + shipping - discount;

    return (
        <>
            <div className="page-title-wrapper">
                <div className="page-title">
                    <div className="title">
                        Add Order
                    </div>

                    <div className="des">
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quas accusantium obcaecati labore nam quibusdam minus.
                    </div>
                </div>
            </div>


            <div className="container-wrapper">
                <div className="card-wrapper w-65">
                    <div className="card-content">
                        <div className="table-wrapper view-order-table">
                            <table className="admin-table">
                                <thead className="admin-table-header">
                                    <tr className="header-row">
                                        <td className="header-col">Item</td>
                                        <td className="header-col">Price</td>
                                        <td className="header-col">Qty</td>
                                        <td className="header-col">Total</td>
                                    </tr>
                                </thead>
                                <tbody className="admin-table-body">
                                    {addedProducts.length > 0 &&
                                        addedProducts.map((item) => (
                                            <tr key={`added-${item.id}`} className="admin-row simple">
                                                <td className="admin-column">
                                                    <div className="item-details">
                                                        <div className="image">
                                                            <img
                                                                src={item?.images?.[0]?.src}
                                                                width={40}
                                                                alt={item.name}
                                                            />
                                                        </div>
                                                        <div className="detail">
                                                            <div className="name">{item.name}</div>
                                                            {item?.sku && <div className="sku">SKU: {item.sku}</div>}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="admin-column">${item.price}</td>

                                                <td className="admin-column">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="basic-input"
                                                        value={item.qty || 1}
                                                        onChange={(e) => {
                                                            const qty = +e.target.value;
                                                            setAddedProducts(prev => prev.map(p => p.id === item.id ? { ...p, qty } : p));
                                                        }}
                                                    />
                                                </td>

                                                <td className="admin-column">
                                                    ${(item.price * (item.qty || 1)).toFixed(2)}
                                                </td>

                                                {/* <td className="admin-column">${item.price}</td> */}
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                            <div className="card-content">
                                <div className="total-summary">
                                    <div className="row">
                                        <span>Subtotal:</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>

                                    <div className="row">
                                        <span>Tax (18%):</span>
                                        <span>${tax.toFixed(2)}</span>
                                    </div>

                                    <div className="row">
                                        <span>Shipping:</span>
                                        <span>${shipping.toFixed(2)}</span>
                                    </div>

                                    <div className="row total">
                                        <strong>Grand Total:</strong>
                                        <strong>${grandTotal.toFixed(2)}</strong>
                                    </div>
                                </div>
                                <div className="buttons">
                                    <button className="admin-btn btn-purple-bg" onClick={() => setShowAddProduct(true)}>
                                        + Add Product
                                    </button>
                                </div>

                                {showAddProduct && (
                                    <div className="select-product-wrapper">
                                        <label>Select Product</label>

                                        <SelectInput
                                            name="product_select"
                                            type="single-select"
                                            options={[
                                                { label: "Select a product", value: "" },
                                                ...allProducts.map((p) => ({
                                                    label: p.name,
                                                    value: p.id
                                                }))
                                            ]}
                                            onChange={(selected) => {
                                                if (!selected?.value) return;

                                                const prod = allProducts.find(p => p.id == selected.value);
                                                if (prod) {
                                                    setAddedProducts(prev => [...prev, { ...prod, qty: 1 }]);
                                                }
                                                setShowAddProduct(false);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-wrapper w-35">
                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Order actions
                                </div>
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <SelectInput
                                    name="new_owner"
                                    // value={selectedOwner?.value}
                                    options={ownerOptions}
                                    type="single-select"
                                // onChange={(val) => val && setSelectedOwner(val)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Customer details
                                </div>
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Select Customer</label>
                                <SelectInput
                                    name="new_owner"
                                    options={customerOptions}
                                    type="single-select"
                                />
                            </div>
                        </div>


                        <div className="store-owner-details">
                            <div className="profile">
                                <div className="avater">
                                    <span>C</span>
                                </div>

                                <div className="details">
                                    <div className="name">Guest Customer</div>
                                    <div className="des">Customer ID: #854</div>
                                    <div className="des"><i className="adminlib-mail" /> test@gmail.com</div>
                                    <div className="des"><i className="adminlib-phone" /> 9875413369</div>
                                </div>
                            </div>

                            <div className="admin-badge blue">
                                <i className="adminlib-edit"></i>
                            </div>
                        </div>



                    </div>

                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Shipping address
                                </div>
                            </div>
                        </div>
                        {!showAddressEdit && (
                            <div className="address-wrapper">
                                <div className="address">
                                    <span>45 Roker Terrace</span>
                                    <span>Latheronwheel</span>
                                    <span>KW5 8NW, London</span>
                                    <span>UK</span>
                                </div>
                                <div className="admin-badge blue" onClick={() => setShowAddressEdit(true)}>
                                    <i className="adminlib-edit"></i>
                                </div>
                            </div>
                        )}

                        {showAddressEdit && (
                            < div ref={addressEditRef}>
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">Address</label>
                                        <BasicInput name="address" wrapperClass="setting-form-input" />
                                    </div>
                                </div>

                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">City</label>
                                        <BasicInput name="city" wrapperClass="setting-form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">Postcode / ZIP</label>
                                        <BasicInput name="postcode" wrapperClass="setting-form-input" />
                                    </div>
                                </div>

                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">Country / Region</label>
                                        <SelectInput name="country" options={[]} type="single-select" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">State / County</label>
                                        <SelectInput name="state" options={[]} type="single-select" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Billing address
                                </div>
                            </div>
                        </div>
                        {!showAddressEdit && (
                            <div className="address-wrapper">
                                <div className="address">
                                    <span>45 Roker Terrace</span>
                                    <span>Latheronwheel</span>
                                    <span>KW5 8NW, London</span>
                                    <span>UK</span>
                                </div>
                                <div className="admin-badge blue" onClick={() => setShowAddressEdit(true)}>
                                    <i className="adminlib-edit"></i>
                                </div>
                            </div>
                        )}

                        {showAddressEdit && (
                            <div ref={addressEditRef}>
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">Address</label>
                                        <BasicInput name="address" wrapperClass="setting-form-input" />
                                    </div>
                                </div>

                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">City</label>
                                        <BasicInput name="city" wrapperClass="setting-form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">Postcode / ZIP</label>
                                        <BasicInput name="postcode" wrapperClass="setting-form-input" />
                                    </div>
                                </div>

                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">Country / Region</label>
                                        <SelectInput name="country" options={[]} type="single-select" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">State / County</label>
                                        <SelectInput name="state" options={[]} type="single-select" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Order note
                                </div>
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <TextArea name="shipping_policy" wrapperClass="setting-from-textarea"
                                    inputClass="textarea-input"
                                    descClass="settings-metabox-description"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddOrder