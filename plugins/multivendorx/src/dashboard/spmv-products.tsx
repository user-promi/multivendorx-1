import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../services/commonFunction';

const SpmvProducts: React.FC = () => {
    const [products, setProducts] = useState([]);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get(`${appLocalizer.apiUrl}/wc/v3/products/?per_page=100`, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
            })
            .then(function (res) {
                const filtered = res.data.filter((product) => {
                    const meta = product.meta_data?.find(
                        (m) => m.key === 'multivendorx_store_id'
                    );
                    const storeId = meta ? Number(meta.value) : null;
                    return storeId !== Number(appLocalizer.store_id);
                });
                setProducts(filtered);
            });
    }, []);

    const filteredProducts = products.filter((p) => {
        const name = p.name?.toLowerCase() || '';
        const category = p.categories?.[0]?.name?.toLowerCase() || '';
        const q = query.toLowerCase();

        return name.includes(q) || category.includes(q);
    });

    const duplicateProduct = async (product) => {
        const newProductPayload = {
            name: product.name + ' Copy',
            type: product.type,
            regular_price: product.price,
            description: product.description,
            short_description: product.short_description,
            categories: product.categories,
            images: product.images,
            original_id: product.id,
            meta_data: [
                ...(product.meta_data || []),
                { key: 'multivendorx_store_id', value: appLocalizer.store_id },
            ],
        };

        // Create new product via REST API
        const newProduct = await axios.post(
            `${appLocalizer.apiUrl}/wc/v3/products`,
            newProductPayload,
            { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
        );

        if (appLocalizer.permalink_structure) {
            navigate(
                `/${appLocalizer.dashboard_slug}/products/edit/${newProduct.data.id}/`
            );
        } else {
            navigate(
                `?page_id=${appLocalizer.dashboard_page_id}&segment=products&element=edit&context_id=${newProduct.data.id}`
            );
        }
    };

    return (
        <>
            <div className="product-category-select-wrapper">
                <div className="title">Select a category from the list</div>
                <div className="search-section-wrapper">
                    <div className="search-field">
                        <div className="search-section">
                            <input
                                type="text"
                                placeholder="Search Products"
                                className="basic-input"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <i className="adminlib-search"></i>
                        </div>
                    </div>
                </div>

                <div className="product-wrapper">
                    {filteredProducts.length === 0 && (
                        <div>No products found.</div>
                    )}

                    {filteredProducts.map((product) => {
                        const imageSrc =
                            product.images && product.images.length > 0
                                ? product.images[0].src
                                : null;

                        return (
                            <div className="product" key={product.id}>
                                {imageSrc ? (
                                    <img
                                        src={imageSrc}
                                        alt={product.name}
                                        className="product-thumb"
                                    />
                                ) : (
                                    <i className="product-icon adminlib-multi-product"></i>
                                )}

                                <div className="name">{product.name}</div>

                                <div className="category">
                                    {product.categories?.[0]?.name ||
                                        'No Category'}
                                </div>

                                <div className="price">
                                    {formatCurrency(product.price || '0.00')}
                                </div>

                                <div className="overley">
                                    <div
                                        className="admin-btn btn-purple-bg"
                                        onClick={() =>
                                            duplicateProduct(product)
                                        }
                                    >
                                        <i className="adminlib-plus-circle-o"></i>{' '}
                                        Copy
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default SpmvProducts;
