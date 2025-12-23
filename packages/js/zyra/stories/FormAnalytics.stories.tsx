// FormAnalytics.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import FormAnalytics from '../src/components/FormAnalytics';

const meta: Meta<typeof FormAnalytics> = {
    title: 'Zyra/Components/FormAnalytics',
    component: FormAnalytics,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormAnalytics>;

// Mock form fields
const mockFields = [
    { id: 1, type: 'title', label: 'Contact Us', required: true },
    { id: 2, type: 'text', label: 'Full Name', required: true },
    { id: 3, type: 'email', label: 'Email Address', required: true },
    { id: 4, type: 'textarea', label: 'Message', required: false },
    { id: 5, type: 'dropdown', label: 'Country', required: true },
];

// Default story
export const Default: Story = {
    render: () => <FormAnalytics formFields={mockFields} />,
};

// Story with no required fields
export const NoRequiredFields: Story = {
    render: () =>
        <FormAnalytics formFields={mockFields.map(f => ({ ...f, required: false }))} />,
};

// Story with only text fields
export const TextOnlyFields: Story = {
    render: () =>
        <FormAnalytics
            formFields={mockFields.filter(f => f.type === 'text' || f.type === 'title')}
        />,
};
