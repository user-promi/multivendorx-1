import React, { useState, useEffect } from 'react';
import { ButtonInputUI, PopupUI, FormGroupWrapper, FormGroup, TextAreaUI, SectionUI } from 'zyra';
import { __ } from '@wordpress/i18n';
import { applyFilters, addFilter } from '@wordpress/hooks'; // add addFilter import

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
    productFields,
    typeFields,
    modules,
}) => {
    const [generateAi, setgenerateAi] = useState(false);
    const [generatedAi, setgeneratedAi] = useState(false);
    const [generateAiImage, setgenerateAiImage] = useState(false);

    const handleCloseForm = () => {
        setgenerateAi(false);
    };
    const generatedAiClose = () => {
        setgeneratedAi(false);
    };

    useEffect(() => {
        // Add AI button dynamically on mount
        addFilter(
            'multivendorx_product_button',
            'my-plugin/add-ai-button',
            (buttons, context) => {
                buttons.unshift({
                    label: __('Generate with AI', 'multivendorx'),
                    icon: 'star-notifima',
                    color: 'purple',
                    onClick: () => setgenerateAi(true),
                });
                return buttons;
            }
        );
    }, []);

    return (
        <>
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
                                name="reject_reason"
                                placeholder={__(
                                    'Enter reason for rejecting this store...',
                                    'multivendorx'
                                )}
                                rows={5}
                            />
                        </FormGroup>
                        <ButtonInputUI
                            buttons={[
                                {
                                    icon: 'star-notifima',
                                    text: 'Generate Now',
                                    color: 'purple',
                                    onClick: () => {
                                        setgenerateAi(false);
                                        setTimeout(() => {
                                            setgeneratedAi(true);
                                        }, 0);
                                    },
                                },
                            ]}
                        />
                    </FormGroupWrapper>
                </div>
            </PopupUI>

            {/* 2nd screen */}
            <PopupUI
                open={generatedAi}
                onClose={generatedAiClose}
                position="lightbox"
                width={'70%'}
                height={80}
            >
                <div className="ai-content-wrapper">
                    <div className="section left">
                        <div className="product">Product 1</div>
                        {/* <img src="" alt="" /> */}
                        <div className="product-image"></div>
                        <SectionUI
                            title={__('Product Details', 'multivendorx')}
                        />

                        <div className="title">Short Description</div>
                        <div className="desc">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Quae natus voluptatem temporibus facere
                            dignissimos optio sit, vero harum nobis suscipit ea
                            ipsa repellendus, commodi architecto?
                        </div>

                        <div className="title">Description</div>
                        <div className="desc">
                            Lorem ipsum dolor, sit amet consectetur adipisicing
                            elit. Ipsa ipsam atque accusantium voluptatibus.
                            Quasi maiores officiis ipsa? Nulla doloribus quae
                            iusto est perspiciatis cumque sequi maiores
                            voluptates dolor possimus, voluptate fugiat sed
                            corrupti nihil cum distinctio suscipit voluptas
                            placeat. Harum incidunt assumenda cum, perferendis
                            facilis accusantium sapiente iusto cupiditate
                            quidem?{' '}
                        </div>
                    </div>
                    <div className="section right">
                        <div className="generated-product">
                            <div className="product">
                                <div className="title">
                                    Lorem ipsum dolor sit amet.
                                </div>
                                <div className="desc">
                                    Lorem ipsum dolor sit amet consectetur
                                    adipisicing elit. Dolor, perferendis. Rerum
                                    explicabo ducimus, praesentium a excepturi
                                    ut! Aliquam quidem exercitationem ipsum!
                                    Placeat, molestias? Ea, animi.
                                </div>

                                <ButtonInputUI
                                    buttons={[
                                        {
                                            icon: 'plus-circle',
                                            text: 'Append the product',
                                            color: 'purple',
                                        },
                                    ]}
                                />
                            </div>
                            <div className="product">
                                <div className="title">
                                    Lorem ipsum dolor sit amet.
                                </div>
                                <div className="desc">
                                    Lorem ipsum dolor sit amet consectetur
                                    adipisicing elit. Dolor, perferendis. Rerum
                                    explicabo ducimus, praesentium a excepturi
                                    ut! Aliquam quidem exercitationem ipsum!
                                    Placeat, molestias? Ea, animi.
                                </div>

                                <ButtonInputUI
                                    buttons={[
                                        {
                                            icon: 'refresh',
                                            text: 'Regenerate Product',
                                            color: 'blue',
                                        },
                                        {
                                            icon: 'plus-circle',
                                            text: 'Append the product',
                                            color: 'purple',
                                        },
                                    ]}
                                />
                            </div>
                        </div>

                        <ButtonInputUI
                            buttons={[
                                {
                                    icon: 'close',
                                    text: 'Cancel',
                                    color: 'red',
                                    // onClick: () =>
                                    //     dispatch( {
                                    //         type: 'SET_ACTIVE_TAB',
                                    //         id: isOpen ? null : method.id,
                                    //     } ),
                                },
                                {
                                    icon: 'plus-circle',
                                    text: 'Append the product',
                                    color: 'purple-bg',
                                    // onClick: () =>
                                    //     dispatch( {
                                    //         type: 'SET_ACTIVE_TAB',
                                    //         id: isOpen ? null : method.id,
                                    //     } ),
                                },
                            ]}
                        />
                    </div>
                </div>
            </PopupUI>

            {/* image generate popup */}
            <PopupUI
                open={generateAiImage}
                onClose={generatedAiClose}
                position="lightbox"
                width={'70%'}
                height={80}
            >
                <div className="ai-content-wrapper image">
                    {/* single image  */}
                    {/* <div className="section left left1">
											<div className="image"></div>
										</div> */}

                    {/* multi image  */}
                    <div className="section left left2">
                        <div className="image"></div>
                        <div className="image"></div>
                        <div className="image"></div>
                        <div className="image"></div>
                    </div>
                    <div className="section right">
                        <FormGroupWrapper>
                            <FormGroup
                                label={__(
                                    'Describe your image',
                                    'multivendorx'
                                )}
                            >
                                <TextAreaUI
                                    name="reject_reason"
                                    placeholder={__(
                                        'Enter reason for rejecting this store...',
                                        'multivendorx'
                                    )}
                                    rows={5}
                                />
                            </FormGroup>
                        </FormGroupWrapper>
                        <ButtonInputUI
                            buttons={[
                                {
                                    icon: 'close',
                                    text: 'Cancel',
                                    color: 'red',
                                    // onClick: () =>
                                    //     dispatch( {
                                    //         type: 'SET_ACTIVE_TAB',
                                    //         id: isOpen ? null : method.id,
                                    //     } ),
                                },
                                {
                                    icon: 'plus-circle',
                                    text: 'Append the product',
                                    color: 'purple-bg',
                                    // onClick: () =>
                                    //     dispatch( {
                                    //         type: 'SET_ACTIVE_TAB',
                                    //         id: isOpen ? null : method.id,
                                    //     } ),
                                },
                            ]}
                        />
                    </div>
                </div>
            </PopupUI>
        </>
    );
};

export default AiButtonSection;

addFilter(
    'multivendorx_ai_field_popup',  // same filter used in AddProduct
    'my-plugin/ai-field-popup',     // unique namespace
    (content, args) => {
        // args = { fieldName, product, handleChange }
        return (
            <AiButtonSection
                product={args.product}
                setProduct={() => {}}        // optional, pass if you want to update full product
                handleChange={args.handleChange}
                productFields={[]}          // optional
                typeFields={[]}             // optional
                modules={[]}                // optional
            />
        );
    }
);