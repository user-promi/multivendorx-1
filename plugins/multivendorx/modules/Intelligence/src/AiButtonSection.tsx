import React, { useState, useEffect } from 'react';
import { ButtonInputUI, PopupUI, FormGroupWrapper, FormGroup, TextAreaUI, SectionUI, getApiLink } from 'zyra';
import { __ } from '@wordpress/i18n';
import { addFilter, removeFilter } from '@wordpress/hooks';
import axios from 'axios';

interface AiButtonSectionProps {
    product: any;
    setProduct: (p: any) => void;
    handleChange: (field: string, value: any) => void;
    productFields: string[];
    typeFields: string[];
    modules: string[];
}

const AI_STORAGE_KEY = 'multivendorx_ai_product_suggestions';

const AiButtonSection: React.FC<AiButtonSectionProps> = ({
    product,
    setProduct,
    handleChange,
}) => {
    const [generateAi, setgenerateAi] = useState(false);
    const [generatedAi, setgeneratedAi] = useState(false);

    const [userPrompt, setUserPrompt] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState<{
        productName: string[];
        shortDescription: string[];
        productDescription: string[];
    } | null>(null);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleCloseForm = () => setgenerateAi(false);
    const generatedAiClose = () => setgeneratedAi(false);

    /* ---------------- LOCAL STORAGE HELPERS ---------------- */

    const getStoredSuggestions = () => {
        const allData = localStorage.getItem(AI_STORAGE_KEY);
        if (!allData) return null;

        const parsed = JSON.parse(allData);
        return parsed[product?.id || 'new-product'] || null;
    };

    const saveSuggestions = (data) => {
        const allData = localStorage.getItem(AI_STORAGE_KEY);
        const parsed = allData ? JSON.parse(allData) : {};

        parsed[product?.id || 'new-product'] = data;

        localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(parsed));
    };

    const removeStoredSuggestions = () => {
        const allData = localStorage.getItem(AI_STORAGE_KEY);
        if (!allData) return;

        const parsed = JSON.parse(allData);
        delete parsed[product?.id || 'new-product'];

        localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(parsed));
    };

    /* ---------------- AI BUTTON REGISTER ---------------- */

    useEffect(() => {
        const filterName = 'multivendorx/add-ai-button';

        addFilter(
            'multivendorx_product_button',
            filterName,
            (buttons) => [
                {
                    label: __('Generate with AI', 'multivendorx'),
                    icon: 'star-notifima',
                    color: 'purple',
                    onClick: () => {
                        const saved = getStoredSuggestions();

                        if (saved) {
                            setAiSuggestions(saved);
                            setgeneratedAi(true);
                        } else {
                            setgenerateAi(true);
                        }
                    },
                },
                ...buttons,
            ]
        );

        return () => removeFilter('multivendorx_product_button', filterName);
    }, [product]);

    /* ---------------- API CALL ---------------- */

    const generateSuggestions = () => {
        if (!userPrompt.trim()) return;

        setLoading(true);

        axios({
            method: 'POST',
            url: getApiLink(appLocalizer, 'intelligence'),
            headers: {
                'X-WP-Nonce': appLocalizer.nonce,
                'Content-Type': 'application/json',
            },
            params: {
                endpoint: 'suggestions',
                user_prompt: userPrompt,
            },
        })
            .then((response) => {
                if (response.data && response.data.productName) {
                    const newSuggestions = {
                        productName: response.data.productName.filter((s) => s && s.trim()),
                        shortDescription: response.data.shortDescription.filter((s) => s && s.trim()),
                        productDescription: response.data.productDescription.filter((s) => s && s.trim()),
                    };

                    setAiSuggestions(newSuggestions);
                    saveSuggestions(newSuggestions); // store per product

                    setSelectedIndex(0);
                    setgenerateAi(false);
                    setgeneratedAi(true);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <>
            {/* First Popup */}
            <PopupUI
                open={generateAi}
                onClose={handleCloseForm}
                position="lightbox"
                width={33}
                header={{
                    icon: 'star-notifima',
                    title: __('Create With AI', 'multivendorx'),
                }}
            >
                <div className="ai-wrapper">
                    <FormGroupWrapper>
                        <FormGroup>
                            <TextAreaUI
                                name="ai_prompt"
                                value={userPrompt}
                                onChange={(val) => setUserPrompt(val)}
                                placeholder={__('Enter product idea or prompt...', 'multivendorx')}
                                rows={5}
                            />
                        </FormGroup>

                        <ButtonInputUI
                            buttons={[
                                {
                                    icon: 'star-notifima',
                                    text: loading ? 'Generating...' : 'Generate Now',
                                    color: 'purple',
                                    onClick: generateSuggestions,
                                    disabled: loading,
                                },
                            ]}
                        />
                    </FormGroupWrapper>
                </div>
            </PopupUI>

            {/* Second Popup */}
            <PopupUI
                open={generatedAi}
                onClose={generatedAiClose}
                position="lightbox"
                width={'70%'}
                height={80}
            >
                {aiSuggestions ? (
                    aiSuggestions.productName.map((name, index) => (
                        <div className="ai-content-wrapper" key={index}>
                            <div className="section left">
                                {/* Product Name */}
                                <div className="product">
                                    {name}

                                    <ButtonInputUI
                                        buttons={[
                                            {
                                                icon: 'plus-circle',
                                                text: 'Add',
                                                color: 'purple',
                                                onClick: () => {
                                                    setProduct({
                                                        ...product,
                                                        title: aiSuggestions.productName[index],
                                                    });
                                                },
                                            },
                                        ]}
                                    />
                                </div>

                                <div className="product-image"></div>

                                <SectionUI title={__('Product Details', 'multivendorx')} />

                                {/* Short Description */}
                                <div className="title">
                                    Short Description

                                    <ButtonInputUI
                                        buttons={[
                                            {
                                                icon: 'plus-circle',
                                                text: 'Add',
                                                color: 'purple',
                                                onClick: () => {
                                                    setProduct({
                                                        ...product,
                                                        short_description:
                                                            aiSuggestions.shortDescription[index],
                                                    });
                                                },
                                            },
                                        ]}
                                    />
                                </div>

                                <div className="desc">
                                    {aiSuggestions.shortDescription[index]}
                                </div>

                                {/* Description */}
                                <div className="title">
                                    Description

                                    <ButtonInputUI
                                        buttons={[
                                            {
                                                icon: 'plus-circle',
                                                text: 'Add',
                                                color: 'purple',
                                                onClick: () => {
                                                    setProduct({
                                                        ...product,
                                                        description:
                                                            aiSuggestions.productDescription[index],
                                                    });
                                                },
                                            },
                                        ]}
                                    />
                                </div>

                                <div className="desc">
                                    {aiSuggestions.productDescription[index]}
                                </div>
                            </div>
                            <div className="section right">
                                <div className="generated-product">
                                    <div className="product">
                                        {name}

                                        <ButtonInputUI
                                            buttons={[
                                                {
                                                    icon: 'plus-circle',
                                                    text: 'Append the product',
                                                    color: 'purple',
                                                    onClick: () => {
                                                        setProduct({
                                                            ...product,
                                                            name: aiSuggestions.productName[index],
                                                            short_description:
                                                                aiSuggestions.shortDescription[index],
                                                            description:
                                                                aiSuggestions.productDescription[index],
                                                        });
                                                        setgeneratedAi(false);
                                                    },
                                                },
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : null}

                <ButtonInputUI
                    buttons={[
                        {
                            icon: 'plus-circle',
                            text: 'Regenerate',
                            color: 'purple',
                            onClick: () => {
                                removeStoredSuggestions();
                                setgeneratedAi(false);
                                setgenerateAi(true);
                            },
                        },
                    ]}
                />
            </PopupUI>
        </>
    );
};

export default AiButtonSection;