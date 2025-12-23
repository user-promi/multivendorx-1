// MultiInput.stories.tsx
import React, { useState } from 'react';
import type { Meta, StoryFn } from '@storybook/react-vite';
import MultiInput from '../src/components/MultiInput';

// Define type for the items
interface MultiStringItem {
  value: string;
  locked?: boolean;
  iconClass?: string;
  description?: string;
  required?: boolean;
  tag?: string;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
}

const meta: Meta<typeof MultiInput> = {
  title: 'Zyra/Components/MultiInput',
  component: MultiInput,
  tags: ['autodocs'],
};

export default meta;

// Template with state to allow live editing
const Template: StoryFn<typeof MultiInput> = (args) => {
  const [items, setItems] = useState<MultiStringItem[]>(args.values || []);

  const handleChange = (e: { target: { name?: string; value: MultiStringItem[] } }) => {
    setItems(e.target.value);
  };

  return <MultiInput {...args} values={items} onStringChange={handleChange} />;
};

// Default story
export const Default = Template.bind({});
Default.args = {
  inputType: 'multi-string',
  placeholder: 'Enter a value',
  values: [
    { value: 'Item 1', description: 'First item', iconClass: 'adminlib-icon-1' },
    { value: 'Item 2', description: 'Second item', iconClass: 'adminlib-icon-2', required: true },
  ],
  wrapperClass: 'multi-input-wrapper',
  inputClass: 'basic-input',
  listClass: 'multi-input-list',
  itemClass: 'multi-input-item',
  iconOptions: ['adminlib-icon-1', 'adminlib-icon-2', 'adminlib-icon-3'],
  iconEnable: true,
  descEnable: true,
  requiredEnable: true,
  maxItems: 10,
};

// Locked items story
export const LockedItems = Template.bind({});
LockedItems.args = {
  ...Default.args,
  values: [
    { value: 'Locked Item', locked: true, iconClass: 'adminlib-icon-1' },
    { value: 'Editable Item', description: 'You can edit this', iconClass: 'adminlib-icon-2' },
  ],
};

// Limited items story
export const LimitedItems = Template.bind({});
LimitedItems.args = {
  ...Default.args,
  maxItems: 2,
};

// Story without icons
export const NoIcons = Template.bind({});
NoIcons.args = {
  ...Default.args,
  iconEnable: false,
};

// Story with only one item
export const SingleItem = Template.bind({});
SingleItem.args = {
  ...Default.args,
  values: [{ value: 'Single Item', description: 'Only one here' }],
};
