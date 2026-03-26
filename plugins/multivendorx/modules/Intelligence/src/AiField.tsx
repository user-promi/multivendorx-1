/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import { PopupUI, ButtonInputUI } from 'zyra';
import { __ } from '@wordpress/i18n';

const AI_STORAGE_KEY = 'multivendorx_ai_product_suggestions';

interface AiFieldProps {
    product: any;
    setProduct: (p: any) => void;
    field: 'name' | 'short_description' | 'description';
}

const FIELD_MAP: Record<string, string> = {
    name: 'productName',
    short_description: 'shortDescription',
    description: 'productDescription',
};

const AiField: React.FC<AiFieldProps> = ({ product, setProduct, field }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        const allData = localStorage.getItem(AI_STORAGE_KEY);
        if (!allData) return;

        const parsed = JSON.parse(allData);
        const productData = parsed[product?.id || 'new-product'];
        const key = FIELD_MAP[field];

        if (productData && productData[key]) {
            setSuggestions(productData[key].filter((s: string) => s && s.trim()));
        } else {
            setSuggestions([]);
        }
    }, [product, field]);

    const handleSelect = (value: string) => {
        setProduct({
            ...product,
            [field]: value,
        });
    };

    const handleRegenerate = () => {
        const allData = localStorage.getItem(AI_STORAGE_KEY);
        if (!allData) return;

        const parsed = JSON.parse(allData);
        const productData = parsed[product?.id || 'new-product'];
        const key = FIELD_MAP[field];

        if (productData) {
            delete productData[key];
            parsed[product?.id || 'new-product'] = productData;
            localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(parsed));
        }
        setSuggestions([]);
    };

    return (
        <PopupUI
            position="menu-dropdown"
            toggleIcon="star-notifima"
            width={20}
            header={{
                icon: 'form-textarea',
                title: `Change ${field.replace('_', ' ')}`,
            }}
        >
            <div className="ai-wrapper">
                {suggestions.length > 0 ? (
                    <>
                        {suggestions.map((item, index) => (
                            <div
                                key={index}
                                className="title"
                                onClick={() => handleSelect(item)}
                                style={{ cursor: 'pointer' }}
                            >
                                {item}
                            </div>
                        ))}
                        <ButtonInputUI
                            buttons={[
                                {
                                    icon: 'refresh',
                                    text: __('Regenerate', 'multivendorx'),
                                    color: 'purple',
                                    onClick: handleRegenerate,
                                },
                            ]}
                        />
                    </>
                ) : (
                    <div className="title">
                        {__('No suggestions found. Click regenerate to create.', 'multivendorx')}
                        <ButtonInputUI
                            buttons={[
                                {
                                    icon: 'refresh',
                                    text: __('Regenerate', 'multivendorx'),
                                    color: 'purple',
                                    onClick: handleRegenerate,
                                },
                            ]}
                        />
                    </div>
                )}
            </div>
        </PopupUI>
    );
};

export default AiField;