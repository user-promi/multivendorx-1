// ConditionalLogicModal.stories.tsx
import React, { useState } from 'react';
import ConditionalLogicModal from '../src/components/ConditionalLogic';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ConditionalLogicModal> = {
    title: 'Zyra/Components/ConditionalLogicModal',
    component: ConditionalLogicModal,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ConditionalLogicModal>;

// Sample fields for testing
const fields = [
    { id: '1', name: 'firstName', label: 'First Name', type: 'text' },
    { id: '2', name: 'lastName', label: 'Last Name', type: 'text' },
    { id: '3', name: 'email', label: 'Email', type: 'email' },
    { id: '4', name: 'country', label: 'Country', type: 'select' },
];

export const Default: Story = {
    render: () => {
        const [modalOpen, setModalOpen] = useState(true);
        const [logic, setLogic] = useState(undefined);

        return (
            <>
                {modalOpen && (
                    <ConditionalLogicModal
                        formField={{
                            id: '5',
                            name: 'City',
                            label: 'City',
                            type: 'text',
                        }}
                        allFields={fields}
                        onClose={() => setModalOpen(false)}
                        onSave={(savedLogic) => {
                            setLogic(savedLogic);
                            setModalOpen(false);
                            console.log('Saved conditional logic:', savedLogic);
                        }}
                    />
                )}
                {logic && (
                    <pre style={{ marginTop: '1rem', background: '#f5f5f5', padding: '1rem' }}>
                        {JSON.stringify(logic, null, 2)}
                    </pre>
                )}
            </>
        );
    },
};

export const WithExistingRules: Story = {
    render: () => {
        const [modalOpen, setModalOpen] = useState(true);
        const [logic, setLogic] = useState({
            enabled: true,
            action: 'show',
            rules: [
                { field: 'firstName', operator: 'equals', value: 'John' },
                { field: 'country', operator: 'not_equals', value: 'US' },
            ],
        });

        return (
            <>
                {modalOpen && (
                    <ConditionalLogicModal
                        formField={{
                            id: '5',
                            name: 'City',
                            label: 'City',
                            type: 'text',
                            conditionalLogic: logic,
                        }}
                        allFields={fields}
                        onClose={() => setModalOpen(false)}
                        onSave={(savedLogic) => {
                            setLogic(savedLogic);
                            setModalOpen(false);
                            console.log('Saved conditional logic:', savedLogic);
                        }}
                    />
                )}
                {logic && (
                    <pre style={{ marginTop: '1rem', background: '#f5f5f5', padding: '1rem' }}>
                        {JSON.stringify(logic, null, 2)}
                    </pre>
                )}
            </>
        );
    },
};
