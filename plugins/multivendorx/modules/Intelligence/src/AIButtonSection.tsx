import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ButtonInputUI, PopupUI, FormGroupWrapper, FormGroup, TextAreaUI, SectionUI, getApiLink, Skeleton, NoticeManager } from 'zyra';
import { __ } from '@wordpress/i18n';
import { addFilter, removeFilter } from '@wordpress/hooks';
import axios from 'axios';
import AiField from './AIField';

interface AIButtonSectionProps {
    product: any;
    setProduct: (p: any) => void;
}

interface GeneratedImage {
    id: string;
    url: string;
    thumbnail: string;
    timestamp: number;
}

const AI_STORAGE_KEY = 'multivendorx_ai_product_suggestions';
const AI_IMAGE_HISTORY_KEY = 'multivendorx_ai_image_history';

const StorageHelper = (() => {
    let cache: Record<string, any> = {};

    try {
        const stored = localStorage.getItem(AI_STORAGE_KEY);
        cache = stored ? JSON.parse(stored) : {};
    } catch (e) {
        console.error("Failed to initialize AI storage cache", e);
    }

    return {
        get: (productId: string | number) => cache[productId],
        save: (productId: string | number, data: any) => {
            cache[productId] = data;
            try {
                localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(cache));
            } catch (e) {
                console.error("Save failed", e);
            }
        },
        remove: (productId: string | number) => {
            if (productId in cache) {
                delete cache[productId];
                try {
                    localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(cache));
                } catch (e) {
                    console.error("Remove failed", e);
                }
            }
        }
    };
})();

const ImageHistoryHelper = (() => {
    let cache: Record<string, GeneratedImage[]> = {};

    try {
        const stored = localStorage.getItem(AI_IMAGE_HISTORY_KEY);
        cache = stored ? JSON.parse(stored) : {};
    } catch (e) {
        console.error("Failed to initialize image history cache", e);
    }

    return {
        get: (productId: string | number) => cache[productId] || [],
        addMultiple: (productId: string | number, images: GeneratedImage[]) => {
            const current = cache[productId] || [];
            // Add new images at the beginning, avoid duplicates by URL
            const existingUrls = new Set(current.map(img => img.url));
            const newImages = images.filter(img => !existingUrls.has(img.url));
            const updated = [...newImages, ...current].slice(0, 20); // Keep last 20 images
            cache[productId] = updated;
            try {
                localStorage.setItem(AI_IMAGE_HISTORY_KEY, JSON.stringify(cache));
            } catch (e) {
                console.error("Save failed", e);
            }
            return updated;
        },
        add: (productId: string | number, image: GeneratedImage) => {
            const current = cache[productId] || [];
            // Avoid duplicates by URL
            const exists = current.some(img => img.url === image.url);
            if (!exists) {
                const updated = [image, ...current].slice(0, 20);
                cache[productId] = updated;
                try {
                    localStorage.setItem(AI_IMAGE_HISTORY_KEY, JSON.stringify(cache));
                } catch (e) {
                    console.error("Save failed", e);
                }
                return updated;
            }
            return current;
        },
        clear: (productId: string | number) => {
            delete cache[productId];
            try {
                localStorage.setItem(AI_IMAGE_HISTORY_KEY, JSON.stringify(cache));
            } catch (e) {
                console.error("Clear failed", e);
            }
        }
    };
})();

const LoadingSkeleton: React.FC = () => {
    return (
        <div className="ai-content-wrapper">
            <div className="section">
                <div className="product-details">
                    <div className="skeleton-wrapper name">
                        <div className="title">Product Name</div>
                        {[1, 2, 3].map((index) => (
                            <div key={index} className="ai-item skeleton-item">
                                <div className="desc">
                                    <Skeleton width="90%" height="1.25rem" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="skeleton-wrapper short-description">
                        <div className="title">Short Description</div>
                        {[1, 2, 3].map((index) => (
                            <div key={index} className="ai-item skeleton-item">
                                <div className="desc">
                                    <Skeleton width="95%" height="2rem" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="image-section">
                    <div className="img-skeleton">
                        <Skeleton width="100%" height="300px" />
                    </div>
                </div>
            </div>
            <div className="skeleton-wrapper description">
                <div className="title">Description</div>
                {[1, 2, 3].map((index) => (
                    <div key={index} className="ai-item skeleton-item">
                        <div className="desc">
                            <Skeleton width="100%" height="3rem" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
/**
 * Moved outside component to prevent re-declaration on every render
 */
const normalizeImage = (img) => {
    if (!img) return '';
    if (img.startsWith('http') || img.startsWith('data:image')) return img;
    return `data:image/png;base64,${img}`;
};
const convertToBase64 = async ({ url }) => {
    if (url.startsWith('data:image')) return url.split(',')[1];

    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = (reader.result).split(',')[1];
            resolve(base64);
        };
        reader.readAsDataURL(blob);
    });
};
const AIButtonSection: React.FC<AIButtonSectionProps> = ({ product, setProduct, setFeaturedImage }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [AIRefresh, setAIRefresh] = useState(0);
    const [loading, setLoading] = useState(false);
    const [userPrompt, setUserPrompt] = useState('');
    const [AISuggestions, setAISuggestions] = useState<any>(null);
    const productId = product?.id;

    // Image states
    const [showImageOptions, setShowImageOptions] = useState(false);
    const [showAIPrompt, setShowAIPrompt] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
    const [imagePrompt, setImagePrompt] = useState('');
    const [enhanceImage, setEnhanceImage] = useState(false);
    const [selected, setSelected] = useState({
        name: null as number | null,
        short: null as number | null,
        desc: null as number | null,
    });

    // Ref for the AI prompt container
    const aiPromptRef = useRef<HTMLDivElement>(null);

    // Load image history on mount
    useEffect(() => {
        if (productId) {
            const history = ImageHistoryHelper.get(productId);
            setImageHistory(history);
            if (history.length > 0) {
                setCurrentImage(history[0]);
            }
        }
    }, [productId]);

    // Handle click outside to close AI prompt
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showAIPrompt && aiPromptRef.current && !aiPromptRef.current.contains(event.target as Node)) {
                setShowAIPrompt(false);
                setImagePrompt(''); // Optional: clear the prompt when closing
            }
        };

        // Add event listener when AI prompt is shown
        if (showAIPrompt) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAIPrompt]);

    const generateSuggestions = useCallback(async () => {
        if (!userPrompt.trim()) return;
        setLoading(true);

        try {
            const response = await axios.post(getApiLink(appLocalizer, 'intelligence'), null, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                params: { endpoint: 'suggestions', user_prompt: userPrompt },
            });

            if (response.data?.productName) {
                const clean = (arr: string[]) => (arr || []).filter(s => s?.trim());
                const newSuggestions = {
                    productName: clean(response.data.productName),
                    shortDescription: clean(response.data.shortDescription),
                    productDescription: clean(response.data.productDescription),
                };

                setAISuggestions(newSuggestions);
                StorageHelper.save(productId, newSuggestions);
                setAIRefresh(prev => prev + 1);

                setSelected({
                    name: newSuggestions.productName?.length > 0 ? 0 : null,
                    short: newSuggestions.shortDescription?.length > 0 ? 0 : null,
                    desc: newSuggestions.productDescription?.length > 0 ? 0 : null,
                });
            }
            // if (response.data?.success === false) {
            //     NoticeManager.add({
            //         message: response.data.message,
            //         type: 'error'
            //     });
            // }
        } catch (err) {
            console.error("AI Generation Error", err);
        } finally {
            setLoading(false);
        }
    }, [userPrompt, productId]);

    // Generate image from product details
    const generateImageFromProduct = useCallback(async () => {
        setImageLoading(true);
        setShowImageOptions(false);
        setShowAIPrompt(false);

        try {
            const response = await axios.post(getApiLink(appLocalizer, 'intelligence'), {
                endpoint: 'image',
                type: 'generate',
                product
            }, {
                headers: {
                    'X-WP-Nonce': appLocalizer.nonce,
                    'Content-Type': 'application/json',
                },
            });
            if (response.data.success && response.data.image) {
                const img = response.data.image;

                const images: GeneratedImage[] = [
                    {
                        id: String(img.id),
                        url: normalizeImage(img.url),
                        thumbnail: normalizeImage(img.thumbnail || img.url),
                        timestamp: Date.now(),
                    }
                ];

                const updatedHistory = ImageHistoryHelper.addMultiple(productId, images);
                setImageHistory(updatedHistory);
                setCurrentImage(images[0]);
            }
        } catch (err) {
            console.error("Image Generation Error", err);
            alert(__('Failed to generate image', 'multivendorx-pro'));
        } finally {
            setImageLoading(false);
        }
    }, [product, productId]);

    // Generate image with custom prompt
    const generateImageWithPrompt = useCallback(async () => {
        if (!imagePrompt.trim()) return;

        setImageLoading(true);
        const payload: any = {
            endpoint: 'image',
            prompt: imagePrompt.trim(),
        };

        if (enhanceImage) {
            payload.type = 'enhance';
            payload.image_base64 = await convertToBase64(currentImage);
        } else {
            payload.type = 'generate';
        }

        try {
            const response = await axios.post(getApiLink(appLocalizer, 'intelligence'), payload, {
                headers: {
                    'X-WP-Nonce': appLocalizer.nonce,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.success && response.data.image) {
                const img = response.data.image;

                const images: GeneratedImage[] = [
                    {
                        id: String(img.id),
                        url: normalizeImage(img.url),
                        thumbnail: normalizeImage(img.thumbnail || img.url),
                        timestamp: Date.now(),
                    }
                ];

                const updatedHistory = ImageHistoryHelper.addMultiple(productId, images);
                setImageHistory(updatedHistory);

                setCurrentImage(images[0]);
            }
        } catch (err) {
            console.error("Image Generation Error", err);
        } finally {
            setImageLoading(false);
            setShowAIPrompt(false);
            setImagePrompt('');
            setEnhanceImage(false)
        }
    }, [imagePrompt, productId]);

    const handleImagePromptKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (imagePrompt.trim() && !imageLoading) {
                generateImageWithPrompt();
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (userPrompt.trim() && !loading) {
                generateSuggestions();
            }
        }
    };

    const openPopup = useCallback(() => {
        const saved = StorageHelper.get(productId);
        if (saved) {
            setAISuggestions(saved);
            setSelected({
                name: saved.productName?.length > 0 ? 0 : null,
                short: saved.shortDescription?.length > 0 ? 0 : null,
                desc: saved.productDescription?.length > 0 ? 0 : null,
            });
        } else {
            setAISuggestions(null);
            setUserPrompt('');
            setSelected({
                name: null,
                short: null,
                desc: null,
            });
        }

        // Reset image states
        setShowImageOptions(false);
        setShowAIPrompt(false);
        setImagePrompt('');

        setShowPopup(true);
    }, [productId]);

    useEffect(() => {
        const B_HOOK = 'multivendorx-pro/add-ai-button';
        const F_HOOK = 'multivendorx-pro/ai-field-suggestion';

        addFilter('multivendorx_product_button', B_HOOK, (buttons) => [
            {
                label: __('Generate with AI', 'multivendorx-pro'),
                icon: 'star-notifima',
                color: 'purple',
                onClick: openPopup,
            },
            ...buttons,
        ]);

        addFilter('multivendorx_product_field_suggestions', F_HOOK, (existing, props) => {
            if (['name', 'short_description', 'description'].includes(props.field)) {
                return (
                    <>
                        {existing}
                        <AiField
                            product={props.product}
                            setProduct={props.setProduct}
                            field={props.field}
                            openGeneratePopup={openPopup}
                            AIRefresh={AIRefresh}
                        />
                    </>
                );
            }
            return existing;
        });

        return () => {
            removeFilter('multivendorx_product_button', B_HOOK);
            removeFilter('multivendorx_product_field_suggestions', F_HOOK);
        };
    }, [productId, AIRefresh, openPopup]);

    const toggleSingle = (type: 'name' | 'short' | 'desc', index: number) => {
        setSelected(prev => ({
            ...prev,
            [type]: prev[type] === index ? null : index
        }));
    };

    const resetSelection = () => {
        setSelected({
            name: null,
            short: null,
            desc: null,
        });
    };

    const handleRegenerate = () => {
        StorageHelper.remove(productId);
        resetSelection();
        setAISuggestions(null);
        setUserPrompt('');
        setAIRefresh(prev => prev + 1);
        setShowImageOptions(false);
        setShowAIPrompt(false);
        setImagePrompt('');
    };

    const handleAppendSelected = () => {
        const updatedProduct = { ...product };

        if (selected.name !== null && AISuggestions?.productName) {
            updatedProduct.name = AISuggestions.productName[selected.name];
        }

        if (selected.short !== null && AISuggestions?.shortDescription) {
            updatedProduct.short_description = AISuggestions.shortDescription[selected.short];
        }

        if (selected.desc !== null && AISuggestions?.productDescription) {
            updatedProduct.description = AISuggestions.productDescription[selected.desc];
        }
        if (currentImage) {
            setFeaturedImage({
                id: parseInt(currentImage.id),
                src: currentImage.url,
                thumbnail: currentImage.thumbnail,
            });
        }
        setProduct(updatedProduct);
        setShowPopup(false);
    };

    const handleSelectImage = (image) => {
        setCurrentImage(image);
    };

    const hasSuggestions = AISuggestions && (
        (AISuggestions.productName?.length > 0) ||
        (AISuggestions.shortDescription?.length > 0) ||
        (AISuggestions.productDescription?.length > 0)
    );

    return (
        <PopupUI
            open={showPopup}
            onClose={() => setShowPopup(false)}
            position="lightbox"
            width={50}
            height={80}
            header={{ icon: 'star-notifima', title: __('Create Product With AI', 'multivendorx-pro') }}
            footer={
                <>
                    <ButtonInputUI
                        wrapperClass="append-section"
                        buttons={[
                            {
                                icon: 'plus-circle',
                                text: 'Append Selected',
                                color: 'green',
                                onClick: handleAppendSelected,
                                disabled: selected.name === null && selected.short === null && selected.desc === null
                            },
                            {
                                icon: 'close',
                                text: 'Clear All',
                                color: 'red',
                                onClick: handleRegenerate
                            }
                        ]}
                    />
                </>
            }
        >
            {loading ? (
                <LoadingSkeleton />
            ) : hasSuggestions ? (
                <div className="ai-content-wrapper">
                    <div className="section">
                        <div className="product-details">
                            {/* product name */}
                            <div className="text-wrapper name">
                                <div className="title">Product Name</div>
                                {AISuggestions.productName?.map((name: string, index: number) => (
                                    <div
                                        key={index}
                                        className={`ai-item ${selected.name === index ? 'selected' : ''}`}
                                        onClick={() => toggleSingle('name', index)}
                                    >
                                        {name}
                                        {selected.name === index && <i className="check-icon adminfont-check-fill" />}
                                    </div>
                                ))}
                            </div>
                            {/* Short Description */}
                            <div className="text-wrapper short-description">
                                <div className="title">Short Description</div>
                                {AISuggestions.shortDescription?.map((text: string, index: number) => (
                                    <div
                                        key={index}
                                        className={`ai-item ${selected.short === index ? 'selected' : ''}`}
                                        onClick={() => toggleSingle('short', index)}
                                    >
                                        {text}
                                        {selected.short === index && <i className="check-icon adminfont-check-fill" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="image-section">
                            {/* Image Display */}
                            <div className="image-display">
                                {imageLoading ? (
                                    <div className="img-skeleton">
                                        <Skeleton width="100%" height="300px" />
                                    </div>
                                ) : currentImage ? (
                                    <img src={currentImage.url} alt="Generated product" />
                                ) : (
                                    <div className="image-placeholder">
                                        <i className="adminfont-image" />
                                        <span>No image generated yet</span>
                                    </div>
                                )}
                            </div>

                            {/* Generate Image Button - Hide when AI Prompt is shown */}
                            {!showImageOptions && !showAIPrompt && (
                                <ButtonInputUI
                                    wrapperClass="image-btn"
                                    buttons={[
                                        {
                                            icon: 'plus-circle',
                                            text: 'Generate Image',
                                            color: 'green',
                                            onClick: () => {
                                                setShowImageOptions(!showImageOptions);
                                            },
                                        },
                                    ]}
                                />
                            )}

                            {/* Image Generation Options */}
                            {showImageOptions && !showAIPrompt && (
                                <div className="image-options">
                                    <ButtonInputUI
                                        buttons={[
                                            {
                                                icon: 'product',
                                                text: 'Generate from Product',
                                                color: 'purple',
                                                onClick: generateImageFromProduct,
                                                disabled: imageLoading,
                                            },
                                            {
                                                icon: 'sparkles',
                                                text: 'Generate with AI',
                                                color: 'blue',
                                                onClick: () => {
                                                    setShowAIPrompt(true);
                                                    setShowImageOptions(false);
                                                },
                                                disabled: imageLoading,
                                            },
                                            {
                                                icon: 'magic',
                                                text: 'Enhance Image',
                                                color: 'green',
                                                onClick: () => {
                                                    setShowAIPrompt(true);
                                                    setShowImageOptions(false);
                                                    setEnhanceImage(true);
                                                },
                                                disabled: imageLoading || !currentImage,
                                            },
                                        ]}
                                    />
                                </div>
                            )}

                            {/* AI Prompt Input - with click outside detection */}
                            {showAIPrompt && (
                                <div ref={aiPromptRef} className="ai-prompt-container">
                                    <div className="prompt-input">
                                        <TextAreaUI
                                            name="ai_image_prompt"
                                            value={imagePrompt}
                                            onChange={setImagePrompt}
                                            onKeyPress={handleImagePromptKeyPress}
                                            placeholder={__('Describe the image you want to generate...', 'multivendorx-pro')}
                                            rows={3}
                                        />
                                        <span
                                            onClick={generateImageWithPrompt}
                                            className={`adminfont-send ${imagePrompt.trim() && !imageLoading ? 'active' : ''}`}
                                            style={{ cursor: imagePrompt.trim() && !imageLoading ? 'pointer' : 'not-allowed', opacity: imagePrompt.trim() && !imageLoading ? 1 : 0.5 }}
                                        ></span>
                                    </div>
                                </div>
                            )}

                            {/* Image History Gallery - Shows all generated images */}
                            {imageHistory.length > 0 && (
                                <div className="gallery-section">
                                    <div className="title">
                                        Image History ({imageHistory.length})
                                        {imageHistory.length === 20 && (
                                            <span className="max-reached"> (Max 20 images)</span>
                                        )}
                                    </div>
                                    <div className="ai-image-gallery">
                                        {imageHistory.map((img, index) => (
                                            <div
                                                key={img.id}
                                                className={`image ${currentImage.url === img.url ? 'active' : ''}`}
                                                onClick={() => handleSelectImage(img)}
                                                title={new Date(img.timestamp).toLocaleString()}
                                            >
                                                <img src={img.thumbnail} alt={`Generated ${index + 1}`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-wrapper description">
                        <div className="title">Description</div>
                        {AISuggestions.productDescription?.map((text: string, index: number) => (
                            <div
                                key={index}
                                className={`ai-item ${selected.desc === index ? 'selected' : ''}`}
                                onClick={() => toggleSingle('desc', index)}
                            >
                                {text}
                                {selected.desc === index && <i className="check-icon adminfont-check-fill" />}
                            </div>
                        ))}
                    </div>
                </div>
            ) :
                <div className='empty-icon'>
                    <i className="adminfont-star-notifima" />
                    <div className="title">{__('What product would you like to create?', 'multivendorx-pro')}</div>
                </div>
            }

            {!showAIPrompt && (
                <div className="ai-wrapper prompt-wrapper">
                    <div className="prompt-input">
                        <TextAreaUI
                            name="ai_prompt"
                            value={userPrompt}
                            onChange={setUserPrompt}
                            onKeyPress={handleKeyPress}
                            placeholder={__('Enter product idea...', 'multivendorx-pro')}
                            rows={5}
                        />
                        <span
                            onClick={generateSuggestions}
                            className={`adminfont-send ${userPrompt.trim() && !loading ? 'active' : ''}`}
                            style={{ cursor: userPrompt.trim() && !loading ? 'pointer' : 'not-allowed', opacity: userPrompt.trim() && !loading ? 1 : 0.5 }}
                        ></span>
                    </div>
                </div>
            )}
        </PopupUI>
    );
};

export default AIButtonSection;