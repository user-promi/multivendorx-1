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
                    onClick: () => setgenerateAi(true),
                },
                ...buttons,
            ]
        );

        return () => removeFilter('multivendorx_product_button', filterName);
    }, []);

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
                    <div className="ai-content-wrapper">
                        {/* LEFT PREVIEW */}
                        <div className="section left">
                            <div className="product">
                                {aiSuggestions.productName[selectedIndex]}
                            </div>

                            <div className="product-image"></div>

                            <SectionUI title={__('Product Details', 'multivendorx')} />

                            <div className="title">Short Description</div>
                            <div className="desc">
                                {aiSuggestions.shortDescription[selectedIndex]}
                            </div>

                            <div className="title">Description</div>
                            <div className="desc">
                                {aiSuggestions.productDescription[selectedIndex]}
                            </div>
                        </div>

                        {/* RIGHT LIST */}
                        <div className="section right">
                            {aiSuggestions.productName.map((name, index) => (
                                <div
                                    className="generated-product"
                                    key={index}
                                    onClick={() => {
                                        setSelectedIndex(index);
                                        setProduct({
                                            ...product,
                                            title: name,
                                            short_description: aiSuggestions.shortDescription[index],
                                            description: aiSuggestions.productDescription[index],
                                        });
                                    }}
                                >
                                    <div className="product">
                                        {name}

                                        <ButtonInputUI
                                            buttons={[
                                                {
                                                    icon: 'plus-circle',
                                                    text: 'Append the product',
                                                    color: 'purple',
                                                    onClick: () => {
                                                        handleChange('title', name);
                                                        handleChange(
                                                            'short_description',
                                                            aiSuggestions.shortDescription[index]
                                                        );
                                                        handleChange(
                                                            'description',
                                                            aiSuggestions.productDescription[index]
                                                        );
                                                        setgeneratedAi(false);
                                                    },
                                                },
                                            ]}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                <ButtonInputUI
                    buttons={[
                        {
                            icon: 'plus-circle',
                            text: 'Regenerate',
                            color: 'purple',
                            onClick: generateSuggestions,
                        },
                    ]}
                />
            </PopupUI>
        </>
    );
};

export default AiButtonSection;