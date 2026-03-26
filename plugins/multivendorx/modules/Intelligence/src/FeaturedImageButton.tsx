import React, { useState } from 'react';
import { ButtonInputUI, PopupUI, FormGroupWrapper, FormGroup, TextAreaUI, getApiLink } from 'zyra';
import { __ } from '@wordpress/i18n';
import axios from 'axios';

interface FeaturedImageButtonProps {
    currentImage: { id: number; src: string; thumbnail: string } | null;
    isFeaturedImage: boolean;
    product?: { name: string; description: string };
    setImage: (image: { id: number; src: string; thumbnail: string } | null) => void;
}

interface AiImage {
    id: number;
    src: string;
    thumbnail: string;
}

const FeaturedImageButton: React.FC<FeaturedImageButtonProps> = ({
    currentImage,
    isFeaturedImage,
    product,
    setImage,
}) => {
    const [promptPopup, setPromptPopup] = useState(false);
    const [resultPopup, setResultPopup] = useState(false);
    const [userPrompt, setUserPrompt] = useState('');
    const [aiImages, setAiImages] = useState<AiImage[]>([]);
    const [loading, setLoading] = useState(false);

    if (!isFeaturedImage) return null;

    const handleButtonClick = () => {
        if (currentImage) {
            setAiImages([currentImage]);
            setResultPopup(true);
        } else {
            setPromptPopup(true);
        }
    };

    const generateAiImages = (options: { prompt?: string; product?: any; type?: 'image' | 'enhance'; image?: string }) => {
        const { prompt, product: prod, type = 'image', image } = options;
        if (!prod && !prompt && type !== 'enhance') return;

        setLoading(true);

        axios
            .post(
                getApiLink(appLocalizer, 'intelligence'),
                {
                    endpoint: 'image',
                    type,
                    prompt: prompt || '',
                    product: prod || undefined,
                    image_base64: image || undefined,
                },
                {
                    headers: {
                        'X-WP-Nonce': appLocalizer.nonce,
                        'Content-Type': 'application/json',
                    },
                }
            )
            .then((res) => {
                if (res.data.success && res.data.image) {
                    const images: AiImage[] = Array.isArray(res.data.image)
                        ? res.data.image.map((img: string, i: number) => ({
                              id: i + 1,
                              src: img,
                              thumbnail: img,
                          }))
                        : [
                              {
                                  id: 1,
                                  src: res.data.image,
                                  thumbnail: res.data.image,
                              },
                          ];
                    setAiImages(images);
                    setPromptPopup(false);
                    setResultPopup(true);
                } else {
                    alert(__('AI failed to generate image.', 'my-plugin'));
                }
            })
            .catch((err) => {
                console.error('AI Image Error:', err);
                alert(__('Failed to generate AI image.', 'my-plugin'));
            })
            .finally(() => setLoading(false));
    };

    const handleGenerateNow = () => generateAiImages({ prompt: userPrompt });
    const handleGenerateFromProduct = () => product && generateAiImages({ product });

    const handleEnhanceImage = (image: AiImage) => {
        const promptText = userPrompt || '';
        generateAiImages({ prompt: promptText, type: 'enhance', image: image.src });
    };

    return (
        <div style={{ marginTop: '10px' }}>
            <ButtonInputUI
                buttons={[
                    {
                        text: __('Generate Featured Image', 'my-plugin'),
                        icon: 'star-notifima',
                        color: 'purple',
                        onClick: handleButtonClick,
                    },
                ]}
            />

            {/* First Popup */}
            <PopupUI
                open={promptPopup}
                onClose={() => setPromptPopup(false)}
                position="lightbox"
                width={33}
                header={{ icon: 'star-notifima', title: __('Generate Image with AI', 'my-plugin') }}
            >
                <div className="ai-wrapper">
                    <FormGroupWrapper>
                        <FormGroup>
                            <TextAreaUI
                                name="ai_image_prompt"
                                value={userPrompt}
                                onChange={(val) => setUserPrompt(val)}
                                placeholder={__('Describe the image you want...', 'my-plugin')}
                                rows={5}
                            />
                        </FormGroup>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <ButtonInputUI
                                buttons={[
                                    {
                                        icon: 'star-notifima',
                                        text: loading ? 'Generating...' : 'Generate Now',
                                        color: 'purple',
                                        onClick: handleGenerateNow,
                                        disabled: loading,
                                    },
                                ]}
                            />
                            <ButtonInputUI
                                buttons={[
                                    {
                                        icon: 'star-notifima',
                                        text: 'Generate from Product',
                                        color: 'purple',
                                        onClick: handleGenerateFromProduct,
                                        disabled: loading || !product,
                                    },
                                ]}
                            />
                        </div>
                    </FormGroupWrapper>
                </div>
            </PopupUI>

            {/* Second Popup */}
            <PopupUI
                open={resultPopup}
                onClose={() => setResultPopup(false)}
                position="lightbox"
                width={'70%'}
                height={80}
                header={{ icon: 'image', title: __('Select Image', 'my-plugin') }}
            >
                <div style={{ display: 'flex', gap: '15px', padding: '10px' }}>
                    {aiImages.map((img) => (
                        <div key={img.id} style={{ textAlign: 'center' }}>
                            <img src={img.thumbnail} alt={`AI Image ${img.id}`} />
                            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                <ButtonInputUI
                                    buttons={[
                                        {
                                            icon: 'plus-circle',
                                            text: 'Set as Featured',
                                            color: 'purple',
                                            onClick: () => {
                                                setImage(img);
                                                setResultPopup(false);
                                            },
                                        },
                                    ]}
                                />
                                <ButtonInputUI
                                    buttons={[
                                        {
                                            icon: 'edit',
                                            text: 'Enhance Image',
                                            color: 'purple',
                                            onClick: () => handleEnhanceImage(img),
                                        },
                                    ]}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <ButtonInputUI
                    buttons={[
                        {
                            icon: 'refresh',
                            text: 'Regenerate',
                            color: 'purple',
                            onClick: () => {
                                setResultPopup(false);
                                setPromptPopup(true);
                            },
                        },
                    ]}
                />
            </PopupUI>
        </div>
    );
};

export default FeaturedImageButton;