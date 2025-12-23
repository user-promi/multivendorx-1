import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import PaymentTabsComponent from '../src/components/PaymentTabsComponent';

const meta: Meta<typeof PaymentTabsComponent> = {
    title: 'Zyra/Components/PaymentTabsComponent',
    component: PaymentTabsComponent,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PaymentTabsComponent>;

// Dummy Payment Methods
const dummyMethods = [
    {
        id: 'paypal',
        icon: 'adminlib-paypal',
        label: 'PayPal',
        desc: 'Connect your PayPal account for online payments.',
        connected: true,
        disableBtn: false,
        countBtn: false,
        formFields: [
            { key: 'email', type: 'text', label: 'Email', placeholder: 'Enter PayPal Email', desc: 'PayPal email address' },
            { key: 'sandbox', type: 'checkbox', label: 'Enable Sandbox', desc: 'Use sandbox environment for testing.' },
        ],
    },
    {
        id: 'stripe',
        icon: 'adminlib-stripe',
        label: 'Stripe',
        desc: 'Connect your Stripe account for credit card payments.',
        connected: false,
        disableBtn: true,
        countBtn: false,
        formFields: [
            { key: 'api_key', type: 'text', label: 'API Key', placeholder: 'Enter Stripe API Key', desc: 'Stripe secret key' },
            { key: 'mode', type: 'multi-checkbox', label: 'Payment Modes', desc: 'Select available modes', options: [{ value: 'card', label: 'Card' }, { value: 'bank', label: 'Bank Transfer' }], selectDeselect: true },
        ],
    },
    {
        id: 'manual',
        icon: 'adminlib-wallet',
        label: 'Manual Payment',
        desc: 'Enable manual offline payments.',
        connected: false,
        disableBtn: false,
        countBtn: true,
        formFields: [
            { key: 'instructions', type: 'textarea', label: 'Payment Instructions', desc: 'Provide payment instructions for customers.', rowNumber: 4, colNumber: 50 },
        ],
    },
];

// Default field values
const defaultValue = {
    paypal: { email: '', sandbox: false },
    stripe: { api_key: '', mode: [] },
    manual: { instructions: '' },
};

// ---------------- Basic Payment Tabs ----------------
export const BasicPaymentTabs: Story = {
    args: {
        name: 'paymentTabs',
        methods: dummyMethods,
        value: defaultValue,
        onChange: (updated) => console.log('Updated values:', updated),
        appLocalizer: { khali_dabba: false, site_url: 'https://example.com' },
        moduleEnabled: true,
    },
    render: (args) => <PaymentTabsComponent {...args} />,
};

// ---------------- Wizard Mode Tabs ----------------
export const WizardPaymentTabs: Story = {
    args: {
        name: 'wizardTabs',
        methods: dummyMethods.map((m) => ({ ...m, isWizardMode: true })),
        value: defaultValue,
        onChange: (updated) => console.log('Wizard updated values:', updated),
        appLocalizer: { khali_dabba: false, site_url: 'https://example.com' },
        isWizardMode: true,
        modules: [],
        moduleChange: (mod) => console.log('Module changed:', mod),
    },
    render: (args) => <PaymentTabsComponent {...args} />,
};

// ---------------- Multi-Checkbox & Copy Text Example ----------------
const checkboxMethods = [
    {
        id: 'manual',
        icon: 'adminlib-wallet',
        label: 'Manual Payment',
        desc: 'Enable manual offline payments.',
        connected: true,
        disableBtn: false,
        formFields: [
            { key: 'copy', type: 'copy-text', title: 'Bank Account: 1234567890', desc: 'Click to copy account number.' },
            { key: 'options', type: 'multi-checkbox', label: 'Payment Modes', desc: 'Select available modes', options: [{ value: 'cash', label: 'Cash' }, { value: 'cheque', label: 'Cheque' }], selectDeselect: true },
        ],
    },
];

export const MultiCheckboxAndCopyText: Story = {
    args: {
        name: 'checkboxCopyTabs',
        methods: checkboxMethods,
        value: { manual: { copy: '', options: [] } },
        onChange: (updated) => console.log('Updated values:', updated),
        appLocalizer: { khali_dabba: false, site_url: 'https://example.com' },
        modules: [],
        moduleChange: (mod) => console.log('Module changed:', mod),
    },
    render: (args) => <PaymentTabsComponent {...args} />,
};
