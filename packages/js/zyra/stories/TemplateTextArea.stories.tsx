/**
 * External dependencies
 */
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Internal dependencies
 */
import TemplateTextArea from '../src/components/TemplateTextArea';

const meta: Meta<typeof TemplateTextArea> = {
    title: 'Zyra/Components/TemplateTextArea',
    component: TemplateTextArea,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TemplateTextArea>;

/**
 * Basic TemplateTextArea (controlled)
 */
export const Basic: Story = {
    render: () => {
        const [formField, setFormField] = useState({
            label: 'Message',
            placeholder: 'Enter your message',
        });

        const handleChange = (field: string, value: string) => {
            console.log('Changed:', field, value);
            setFormField((prev) => ({
                ...prev,
                [field]: value,
            }));
        };

        return (
            <TemplateTextArea
                formField={formField}
                onChange={handleChange}
            />
        );
    },
};
