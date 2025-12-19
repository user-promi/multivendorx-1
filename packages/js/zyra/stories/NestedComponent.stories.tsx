// NestedComponent.stories.tsx
import React, { useState } from 'react';
import { Meta, Story } from '@storybook/react';
import NestedComponent from './NestedComponent';
import type { NestedField, RowType } from './NestedComponent';

export default {
    title: 'Zyra/Components/NestedComponent',
    component: NestedComponent,
} as Meta;

const fields: NestedField[] = [
    {
        key: 'name',
        type: 'text',
        label: 'Name',
        placeholder: 'Enter name',
        proSetting: false,
    },
    {
        key: 'email',
        type: 'text',
        label: 'Email',
        placeholder: 'Enter email',
    },
    {
        key: 'role',
        type: 'select',
        label: 'Role',
        options: [
            { value: 'admin', label: 'Admin' },
            { value: 'editor', label: 'Editor' },
            { value: 'subscriber', label: 'Subscriber' },
        ],
    },
    {
        key: 'active',
        type: 'checkbox',
        label: 'Active',
        options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
        ],
    },
];

const Template: Story<{
    id: string;
    fields: NestedField[];
    value: RowType[];
    khali_dabba?: boolean;
}> = (args) => {
    const [value, setValue] = useState<RowType[]>(args.value || [{}]);

    return (
        <NestedComponent
            {...args}
            value={value}
            onChange={setValue}
            appLocalizer={{ khali_dabba: args.khali_dabba ?? true }}
        />
    );
};

export const Default = Template.bind({});
Default.args = {
    id: 'nested-1',
    fields: fields,
    value: [{}],
    khali_dabba: true, // enables pro fields
};

export const SingleRow = Template.bind({});
SingleRow.args = {
    id: 'nested-single',
    fields: fields,
    value: [{}],
    single: true,
    khali_dabba: true,
};

export const WithoutProAccess = Template.bind({});
WithoutProAccess.args = {
    id: 'nested-no-pro',
    fields: [
        ...fields,
        {
            key: 'proField',
            type: 'text',
            label: 'Pro Field',
            proSetting: true,
        },
    ],
    value: [{}],
    khali_dabba: false, // disables pro fields
};
