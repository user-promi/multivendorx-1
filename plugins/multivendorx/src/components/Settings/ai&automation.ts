import { __ } from '@wordpress/i18n';

export default {
    id: 'ai-automation',
    priority: 10,
    name: 'AI & Automation',
    // Updated description for AI
    desc: __('Enable and configure third-party AI services to assist with product detail generation and other automation tasks.', 'multivendorx'),
    icon: 'adminlib-automation', // Keep a relevant icon
    submitUrl: 'settings',
    modal: [
        // --- AI Provider Choice ---
        {
            key: 'choose_ai_provider',
            type: 'setting-toggle',
            defaulValue: 'gemini_api',
            label: __('Default AI Provider', 'multivendorx'),
            settingDescription: __('Choose the primary AI service for product detail suggestions.', 'multivendorx'),
            desc: __('<ul><li>Gemini API - Powerful model from Google for general and creative tasks.<li>OpenAI API - Widely used models like GPT-4, requires an OpenAI API key.<li>Custom AI API - Option to use another third-party generative AI service.</li></ul>', 'multivendorx'),
            options: [
                {
                    key: 'gemini_api',
                    label: __('Gemini (Google)', 'multivendorx'),
                    value: __('gemini_api', 'multivendorx'),
                    icon: 'adminlib-google',
                },
                {
                    key: 'openai_api',
                    label: __('OpenAI (ChatGPT)', 'multivendorx'),
                    value: __('openai_api', 'multivendorx'),
                    icon: 'adminlib-openai',
                },
                {
                    key: 'openrouter_api',
                    label: __('OpenRouter (Free/Open Models)', 'multivendorx'),
                    value: __('openrouter_api', 'multivendorx'),
                    icon: 'adminlib-cloud',   // choose any icon
                }
            ],            
        },
        // --- Gemini API Key Section ---
        {
            key: 'gemini_api_key',
            type: 'text',
            label: __('Gemini API Key', 'multivendorx'),
            desc: __(
                '<a href="https://ai.google.dev/gemini-api/docs/api-key" target="_blank">Click here to generate your Gemini API key.</a>',
                'multivendorx'
            ),
            dependent: {
                key: 'choose_ai_provider',
                set: true,
                value: 'gemini_api',
            },
        },
        // --- OpenAI API Key Section ---
        {
            key: 'openai_api_key',
            type: 'text',
            label: __('OpenAI API Key (for ChatGPT)', 'multivendorx'),
            desc: __(
                '<a href="https://platform.openai.com/api-keys" target="_blank">Click here to generate your OpenAI API key.</a>',
                'multivendorx'
            ),
            dependent: {
                key: 'choose_ai_provider',
                set: true,
                value: 'openai_api',
            },
        },
        // --- OpenRouter API Key Section ---
        {
            key: 'openrouter_api_key',
            type: 'text',
            label: __('OpenRouter API Key', 'multivendorx'),
            desc: __(
                '<a href="https://openrouter.ai/settings/keys" target="_blank">Generate an OpenRouter Key</a>',
                'multivendorx'
            ),
            dependent: {
                key: 'choose_ai_provider',
                set: true,
                value: 'openrouter_api',
            },
        },
        {
            key: 'openrouter_api_model',
            type: 'select',
            label: __('OpenRouter Model', 'multivendorx'),
            desc: __('Choose your preferred AI model from OpenRouter.', 'multivendorx'),
            dependent: {
                key: 'choose_ai_provider',
                set: true,
                value: 'openrouter_api',
            },
            className: "select-class",
            options: [
                {
                    key: 'openai/gpt-4o-mini',
                    label: 'OpenAI GPT-4o Mini (Fast + Cheap)',
                    value: 'openai/gpt-4o-mini',
                },
                {
                    key: 'openai/gpt-5-mini',
                    label: 'OpenAI GPT-5 Mini',
                    value: 'openai/gpt-5-mini',
                },
                {
                    key: 'google/gemini-2.0-flash-exp:free',
                    label: 'Google Gemini 2.0 Flash (Fast + Cheap)',
                    value: 'google/gemini-2.0-flash-exp:free',
                }
            ],
        },      
    ],
};
