/**
 * External dependencies
 */
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Internal dependencies
 */
import TemplateSection from '../src/components/TemplateSection';

const meta: Meta<typeof TemplateSection> = {
    title: 'Zyra/Components/TemplateSection',
    component: TemplateSection,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TemplateSection>;

/**
 * Basic TemplateSection (controlled label)
 */
export const Basic: Story = {
    render: () => {
        const [formField, setFormField] = useState({
            label: 'Email Template',
        });

        const handleChange = (key: string, value: string) => {
            console.log('Changed:', key, value);
            setFormField((prev) => ({
                ...prev,
                [key]: value,
            }));
        };

        return (
            <TemplateSection
                formField={formField}
                onChange={handleChange}
            />
        );
    },
};
