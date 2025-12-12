import { addFilter } from '@wordpress/hooks';
import { useEffect, useState } from 'react';
import { NestedComponent, BasicInput } from 'zyra';
import { __ } from '@wordpress/i18n';

const MinMax = ({ product, setProduct }) => {

    const toggleCard = (cardId) => {
		const body = document.querySelector(`#${cardId} .card-body`);
		const arrow = document.querySelector(`#${cardId} .arrow-icon`);

		if (!body || !arrow) return;

		body.classList.toggle('hide-body');
		arrow.classList.toggle('rotate');
	};

    const [minMaxMeta, setMinMaxMeta] = useState({
        min_quantity: null,
        max_quantity: null,
        min_amount: null,
        max_amount: null,
    });

    useEffect(() => {
        if (!product?.meta_data) return;

        const found = product.meta_data.find(
            (item) => item.key === "multivendorx_min_max_meta"
        );

        if (found?.value) setMinMaxMeta(found.value);
    }, [product]);

    const handleQuantityChange = (key, value) => {
        setMinMaxMeta((prev) => ({
            ...prev,
            [key]: value,
        }));

        saveMinMaxMeta({ [key]: value });
    };

    const saveMinMaxMeta = (data) => {
        setProduct((prev) => {
            const KEY = "multivendorx_min_max_meta";
            const updatedMeta = [...(prev.meta_data || [])];

            const index = updatedMeta.findIndex((m) => m.key === KEY);

            const existingValue =
                index !== -1
                    ? { ...updatedMeta[index].value }
                    : {
                        min_quantity: null,
                        max_quantity: null,
                        min_amount: null,
                        max_amount: null,
                    };

            const newValue = { ...existingValue };

            Object.keys(data).forEach((key) => {
                let val = data[key];
                newValue[key] = parseInt(val);
            });

            if (index !== -1) {
                updatedMeta[index].value = newValue;
            } else {
                updatedMeta.push({ key: KEY, value: newValue });
            }

            return {
                ...prev,
                meta_data: updatedMeta,
            };
        });
    };

	return (
		<div className="card-content" id="card-min-max">
			<div className="card-header">
				<div className="left">
					<div className="title">Min/Max</div>
				</div>

				<div className="right">
					<i
						className="adminlib-pagination-right-arrow arrow-icon"
						onClick={() => toggleCard('card-min-max')}
					></i>
				</div>
			</div>
			<div className="card-body">
				<div className="form-group-wrapper">
					<div className="form-group">
						<label>Quantity</label>

                        <BasicInput
                            name="min_quantity"
                            type="number"
                            wrapperClass="setting-form-input"
                            preInsideText={__('Min', 'multivendorx')}
                            value={minMaxMeta.min_quantity}
                            onChange={(e) => handleQuantityChange("min_quantity", e.target.value)}
                        />

                        <BasicInput
                            name="max_quantity"
                            type="number"
                            wrapperClass="setting-form-input"
                            preInsideText={__('Max', 'multivendorx')}
                            value={minMaxMeta.max_quantity}
                            onChange={(e) => handleQuantityChange("max_quantity", e.target.value)}
                        />

                       
					</div>
					<div className="form-group">
						<label>Amount</label>
                        <BasicInput
                            name="min_amount"
                            type="number"
                            wrapperClass="setting-form-input"
                            preInsideText={__('Min', 'multivendorx')}
                            value={minMaxMeta.min_amount}
                            onChange={(e) => handleQuantityChange("min_amount", e.target.value)}
                        />

                        <BasicInput
                            name="max_amount"
                            type="number"
                            wrapperClass="setting-form-input"
                            preInsideText={__('Max', 'multivendorx')}
                            value={minMaxMeta.max_amount}
                            onChange={(e) => handleQuantityChange("max_amount", e.target.value)}
                        />
					</div>

				</div>
			</div>
		</div>
	);
}

addFilter(
	'product_min_max',
	'my-plugin/min_max',
	(content, product, setProduct) => {
		return (
			<>
				{content}
				<MinMax
					product={product}
					setProduct={setProduct}
				/>
			</>
		);
	},
	10
);