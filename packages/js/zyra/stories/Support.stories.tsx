import React from 'react';
import Support from '../src/components/Support';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Support> = {
    title: 'Zyra/Components/Support',
    component: Support,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Support>;

export const TestSupport: Story = {
    args: {
        url: 'https://support.example.com', // URL for embedded support video
        title: 'Need Help?', // Main heading for support section
        subTitle: 'Find answers to common questions below.', // Subtitle for support section
        faqData: [
            {
                question: 'How do I reset my password?',
                answer: "Click on 'Forgot password' at the login screen and follow the instructions.",
                open: false,
            },
            {
                question: 'Where can I access my account settings?',
                answer: 'Go to the dashboard and click on your profile icon to access settings.',
                open: false,
            },
        ],
    },
    render: (args) => <Support {...args} />,
};
