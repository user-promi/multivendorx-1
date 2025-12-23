import SuccessNotice from '../src/components/SuccessNotice';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof SuccessNotice> = {
    title: 'Zyra/Components/SuccessNotice',
    component: SuccessNotice,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SuccessNotice>;

export const DefaultNotice: Story = {
    args: {
        message: 'Your settings have been saved successfully.',
    },
};

export const CustomTitleAndIcon: Story = {
    args: {
        title: 'Success!',
        message: 'Your profile has been updated.',
        iconClass: 'adminlib-icon-success',
    },
};

export const NoMessage: Story = {
    args: {
        message: '', // component should render nothing
    },
};
