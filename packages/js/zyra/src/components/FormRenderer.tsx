// External Dependencies
import React from 'react';

// Internal Dependencies
import CanvasEditor from './CanvasEditor/CanvasEditor';
import { FieldComponent } from './types';
import { Block } from './CanvasEditor/blockTypes';
import '../styles/web/RegistrationForm.scss';

const OPTION_PRESETS = [
    { id: '1', label: 'Manufacture', value: 'manufacture' },
    { id: '2', label: 'Trader', value: 'trader' },
    { id: '3', label: 'Authorized Agent', value: 'authorized_agent' },
];

const REGISTRATION_BLOCK_GROUPS = [
    {
        id: 'registration',
        label: 'Registration Fields',
        icon: 'user',
        blocks: [
            { id: 'text', icon: 't-letter-bold', value:'text', label: 'Enter the text', placeholder: 'Enter your text here' },
            { id: 'email', icon: 'unread', value: 'email', label: 'Email', placeholder: 'Enter your email here' },
            { id: 'textarea', icon: 'text', value: 'textarea', label: 'Enter your text', placeholder: 'Enter your message here' },
            { id: 'date', icon: 'calendar', value: 'date', label: 'Date Picker', placeholder: 'Select a date' },
            { id: 'time', icon: 'alarm ', value: 'time', label: 'Time Picker', placeholder: 'Select a time' },
            { id: 'checkboxes', icon: 'checkbox', value: 'checkboxes', label: 'Nature Of Business', options: OPTION_PRESETS },
            { id: 'multi-select', icon: 'multi-select', value: 'multi-select', label: 'Multi Select', options: OPTION_PRESETS },
            { id: 'radio', icon: 'radio icon-form-radio', value: 'radio', label: 'Radio', options: OPTION_PRESETS },
            { id: 'dropdown', icon: 'dropdown-checklist', value: 'dropdown', label: 'Dropdown', options: OPTION_PRESETS },
            { id: 'address', icon: 'form-address ', value: 'address', label: 'Address' },
            { id: 'attachment', icon: 'submission-message ', value: 'attachment', label: 'Attachment' },
            { id: 'richtext', icon: 'text ', value: 'richtext', label: 'Rich Text Block' },
            { id: 'heading', icon: 'form-textarea', value: 'heading', label: 'Heading' },
            { id: 'image', icon: 'image', value: 'image', label: 'Image' },
            { id: 'button', icon: 'button', value: 'button', placeholder: 'Click me' },
            { id: 'columns', icon: 'blocks', value: 'columns' },
            { id: 'section', icon: 'form-section', value: 'section' },
            { id: 'recaptcha', icon: 'captcha-automatic-code', value: 'recaptcha', label: 'reCaptcha v3' },
        ]
    }
];


const EMAIL_BLOCK_GROUPS = [
{
    id: 'email',
    label: 'Email Blocks',
    blocks: [
        { id: 'columns', icon: 'blocks', value: 'columns', label: 'Columns' },
        { id: 'heading', icon: 'form-textarea', value: 'heading', label: 'Heading', placeholder: 'Enter your heading here' },
        { id: 'richtext', icon: 't-letter-bold', value: 'richtext', label: 'Text', placeholder: '<p>Enter your text content here</p>' },
        { id: 'image', icon: 'image', value: 'image', label: 'Image' },
        { id: 'button', icon: 'button', value: 'button', label: 'Button', placeholder: 'Click me' },
        { id: 'section', icon: 'section', value: 'section', label: 'Section' },
    ]
}];

export interface EmailTemplate {
    id: string;
    name: string;
    previewText?: string;
    blocks: Block[];
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
{
    id: 'default',
    name: 'Default Template',
    previewText: 'Start with a blank email template',
    blocks: [],
}];

export const FormBuilderUI: React.FC<any> = ({
    value,
    onChange,
    field,
    setting = {},
    proSettingChange = () => false,
    name = field?.key,
}) => {

    const context = field?.context || 'registration';
    const isEmailBuilder = context === 'email';

    /* ---------------------------
    EMAIL TEMPLATE STATE
    --------------------------- */

    const savedData = value || setting[name] || {};

    const [templates, setTemplates] = React.useState<EmailTemplate[]>(() => {

        if (!isEmailBuilder) return [];

        // Templates coming from field config (your TS file)
        if (field?.templates?.length) {
            return field.templates.map((t: EmailTemplate) => ({
                ...t,
                ...savedData.templates?.find((st: EmailTemplate) => st.id === t.id),
            }));
        }

        // Saved templates
        if (savedData.templates?.length) {
            return savedData.templates;
        }

        // Default fallback
        return DEFAULT_TEMPLATES;
    });

    const [activeTemplateId, setActiveTemplateId] = React.useState(
        savedData.activeTemplateId ||
        field?.defaultTemplateId ||
        templates[0]?.id ||
        DEFAULT_TEMPLATES[0].id
    );

    const activeTemplate = templates.find(t => t.id === activeTemplateId);

    /* ---------------------------
    BLOCK CHANGE HANDLER
    --------------------------- */

    const handleBlocksChange = React.useCallback((blocks: Block[]) => {

        if (!isEmailBuilder) {
            onChange({ formfieldlist: blocks });
            return;
        }

        setTemplates(prev => {
            const updated = prev.map(t =>
                t.id === activeTemplateId ? { ...t, blocks } : t
            );

            onChange({ templates: updated, activeTemplateId });

            return updated;
        });

    }, [isEmailBuilder, activeTemplateId, onChange]);

    /* ---------------------------
    TEMPLATE SELECT
    --------------------------- */

    const handleTemplateSelect = React.useCallback((id: string) => {
        setActiveTemplateId(id);
    }, []);

    /* ---------------------------
    INITIAL BLOCKS
    --------------------------- */

    const initialBlocks = React.useMemo(() => {

        if (isEmailBuilder) {
            return activeTemplate?.blocks || [];
        }

        if (Array.isArray(value?.formfieldlist)) return value.formfieldlist;
        if (Array.isArray(setting[name]?.formfieldlist)) return setting[name].formfieldlist;

        return [];

    }, [value, setting, name, isEmailBuilder, activeTemplate]);

    /* ---------------------------
    RENDER
    --------------------------- */

    return (
        <CanvasEditor
            blocks={initialBlocks}
            onChange={handleBlocksChange}
            blockGroups={isEmailBuilder ? EMAIL_BLOCK_GROUPS : REGISTRATION_BLOCK_GROUPS}
            visibleGroups={[context]}
            groupName={context}
            proSettingChange={proSettingChange}
            context={context}

            {...(isEmailBuilder && {
                templates,
                activeTemplateId,
                onTemplateSelect: handleTemplateSelect,
                showTemplatesTab: true,
            })}
        />
    );
};

/* ---------------------------------------------------
FIELD EXPORT
--------------------------------------------------- */

const FormBuilder: FieldComponent = {
    render: FormBuilderUI,
};

export default FormBuilder;