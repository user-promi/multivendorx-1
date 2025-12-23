import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Dummy types matching your ProPopup component
interface PopupMessage {
    text: string;
    des?: string;
    icon?: string;
}

interface BtnLink {
    site: string;
    price: string;
    link: string;
}

interface PopupProps {
    proUrl?: string;
    title?: string;
    messages?: PopupMessage[];
    moreText?: string;
    moduleName?: string;
    settings?: string;
    plugin?: string;
    message?: string;
    moduleButton?: string;
    pluginDescription?: string;
    pluginButton?: string;
    SettingDescription?: string;
    pluginUrl?: string;
    modulePageUrl?: string;
    btnLink?: BtnLink[];
    upgradeBtnText?: string;
}

// Dummy ProPopup component for Storybook
const ProPopup: React.FC<PopupProps> = (props) => {
    return (
        <div style={{ padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
            <h2>{props.title || props.moduleName || 'Popup Title'}</h2>
            {props.messages && (
                <ul>
                    {props.messages.map((msg, idx) => (
                        <li key={idx}>
                            {msg.icon && <i className={msg.icon}></i>} {msg.text} - {msg.des}
                        </li>
                    ))}
                </ul>
            )}
            {props.btnLink && props.btnLink.length > 0 && (
                <select>
                    {props.btnLink.map((btn, idx) => (
                        <option key={idx} value={btn.link}>
                            {btn.site} - {btn.price}
                        </option>
                    ))}
                </select>
            )}
            {props.message && <p>{props.message}</p>}
        </div>
    );
};

// Storybook setup
const meta: Meta<typeof ProPopup> = {
    title: 'Zyra/Components/ProPopup',
    component: ProPopup,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProPopup>;

// Dummy button links
const sampleBtnLinks: BtnLink[] = [
    { site: '1 Site', price: '$29', link: '#' },
    { site: '5 Sites', price: '$79', link: '#' },
];

// Dummy messages
const sampleMessages: PopupMessage[] = [
    { text: 'Unlock premium features', des: 'Access advanced tools.', icon: 'adminlib-star' },
    { text: 'Priority Support', des: 'Get faster assistance.', icon: 'adminlib-support' },
];

// Pro Upgrade Popup
export const ProUpgradePopup: Story = {
    args: {
        title: 'Upgrade to Pro',
        moreText: 'Choose a license to unlock premium features:',
        btnLink: sampleBtnLinks,
        messages: sampleMessages,
        upgradeBtnText: 'Upgrade Now',
    },
    render: (args) => <ProPopup {...args} />,
};

// Module Activation Popup
export const ModuleActivationPopup: Story = {
    args: {
        moduleName: 'Custom Module',
        message: 'Activate this module to enable custom functionality.',
        moduleButton: 'Go to Module',
        modulePageUrl: '#',
    },
    render: (args) => <ProPopup {...args} />,
};

// Settings Popup
export const SettingsPopup: Story = {
    args: {
        settings: 'settings',
        message: 'Enable advanced settings for better control.',
        SettingDescription: 'Advanced settings allow detailed configuration.',
    },
    render: (args) => <ProPopup {...args} />,
};
