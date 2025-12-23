// ImageGallery.stories.tsx
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ImageGallery from '../src/components/ImageGallery';

const meta: Meta<typeof ImageGallery> = {
    title: 'Zyra/Components/ImageGallery',
    component: ImageGallery,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ImageGallery>;

// Default story: single select
export const Default: Story = {
    render: (args) => {
        const [selectedImages, setSelectedImages] = useState([]);
        return (
            <div>
                <ImageGallery
                    {...args}
                    selectedImages={selectedImages}
                    onImageSelect={setSelectedImages}
                />
                <div style={{ marginTop: '20px' }}>
                    <strong>Selected Image:</strong>
                    <pre>{JSON.stringify(selectedImages, null, 2)}</pre>
                </div>
            </div>
        );
    },
    args: {
        multiple: false,
    },
};

// Multi-select story
export const MultipleSelect: Story = {
    render: (args) => {
        const [selectedImages, setSelectedImages] = useState([]);
        return (
            <div>
                <ImageGallery
                    {...args}
                    multiple
                    selectedImages={selectedImages}
                    onImageSelect={setSelectedImages}
                />
                <div style={{ marginTop: '20px' }}>
                    <strong>Selected Images:</strong>
                    <pre>{JSON.stringify(selectedImages, null, 2)}</pre>
                </div>
            </div>
        );
    },
    args: {},
};

// Preselected images story
export const PreselectedImages: Story = {
    render: (args) => {
        const [selectedImages, setSelectedImages] = useState([
            {
                id: '3',
                url: 'https://via.placeholder.com/300x200/FF0000',
                alt: 'Placeholder 3',
            },
        ]);

        return (
            <div>
                <ImageGallery
                    {...args}
                    multiple
                    selectedImages={selectedImages}
                    onImageSelect={setSelectedImages}
                />
                <div style={{ marginTop: '20px' }}>
                    <strong>Selected Images:</strong>
                    <pre>{JSON.stringify(selectedImages, null, 2)}</pre>
                </div>
            </div>
        );
    },
    args: {},
};
