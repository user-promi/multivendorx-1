/**
 * External dependencies
 */
import React, { useEffect, useRef, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import '../styles/web/RegistrationForm.scss';

/**
 * Internal dependencies
 */
import ButtonCustomizer from './ButtonCustomiser';
import Elements from './Elements';
import SettingMetaBox from './SettingMetaBox';
import SimpleInput from './SimpleInput';
import MultipleOptions from './MultipleOption';
import TemplateTextArea from './TemplateTextArea';
import Attachment from './Attachment';
import Recaptcha from './Recaptcha';
import Datepicker from './DatePicker';
import TimePicker from './TimePicker';
import TemplateSection from './TemplateSection';
import DisplayButton from './DisplayButton';
import BlockLayout from './BlockLayout';

// Types
export interface Option {
    id: string;
    label: string;
    value: string;
    isdefault?: boolean;
}

export interface SelectOption {
    icon: string;
    value: string;
    label: string;
    name?: string;
}

interface FormField {
    id: number;
    type: string;
    label: string;
    required: boolean;
    name: string;
    placeholder?: string;
    options?: Option[];
    sitekey?: string;
    readonly?: boolean;
}

interface ButtonSetting { }

interface CustomFormProps {
    onChange: (data: { formfieldlist: FormField[]; butttonsetting: ButtonSetting }) => void;
    name: string;
    proSettingChange: () => boolean;
    formTitlePlaceholder?: string;
    setting: Record<string, any>;
}

// Default values for input options
const DEFAULT_OPTIONS: Option[] = [
    { id: '1', label: 'Manufacture', value: 'manufacture' },
    { id: '2', label: 'Trader', value: 'trader' },
    { id: '3', label: 'Authorized Agent', value: 'authorized_agent' },
];

const DEFAULT_PLACEHOLDER = (type: string): string => `${type}`;
const DEFAULT_LABEL_SIMPLE = (type: string): string => `Enter your ${type}`;
const DEFAULT_LABEL_SELECT = 'Nature of Business';
const DEFAULT_FORM_TITLE = 'Demo Form';

// Example select options
const selectOptions: SelectOption[] = [
    { icon: 'adminlib-module icon-form-textbox', value: 'block-layout', label: 'Block Layout' },
    { icon: 'adminlib-t-letter-bold icon-form-textbox', value: 'text', label: 'Textbox' },
    { icon: 'adminlib-unread icon-form-email', value: 'email', label: 'Email' },
    { icon: 'adminlib-text icon-form-textarea', value: 'textarea', label: 'Textarea' },
    { icon: 'adminlib-checkbox icon-form-checkboxes', value: 'checkboxes', label: 'Checkboxes' },
    { icon: 'adminlib-multi-select icon-form-multi-select', value: 'multiselect', label: 'Multi Select' },
    { icon: 'adminlib-radio icon-form-radio', value: 'radio', label: 'Radio' },
    { icon: 'adminlib-dropdown-checklist icon-form-dropdown', value: 'dropdown', label: 'Dropdown' },
    { icon: 'adminlib-captcha-automatic-code icon-form-recaptcha', value: 'recaptcha', label: 'reCaptcha v3' },
    { icon: 'adminlib-submission-message icon-form-attachment', value: 'attachment', label: 'Attachment' },
    { icon: 'adminlib-form-section icon-form-section', value: 'section', label: 'Section' },
    { icon: 'adminlib-calendar icon-form-store-description', value: 'datepicker', label: 'Date Picker' },
    { icon: 'adminlib-alarm icon-form-address', value: 'TimePicker', label: 'Time Picker' },
    { icon: 'adminlib-divider icon-form-address', value: 'divider', label: 'Divider' },
];

const selectOptionsStore: SelectOption[] = [
    { icon: 'adminlib-t-letter-bold icon-form-textbox', value: 'text', label: 'Store Name', name: 'name' },
    { icon: 'adminlib-text icon-form-textarea', value: 'textarea', label: 'Store Desc', name: 'description' },
    { icon: 'adminlib-t-letter-bold icon-form-textbox', value: 'text', label: 'Address 1', name: 'address_1' },
    { icon: 'adminlib-t-letter-bold icon-form-textbox', value: 'text', label: 'Address 2', name: 'address_2' },
    { icon: 'adminlib-t-letter-bold icon-form-textbox', value: 'text', label: 'Phone', name: 'phone' },
    { icon: 'adminlib-dropdown-checklist icon-form-dropdown', value: 'dropdown', label: 'Country', name: 'country' },
    { icon: 'adminlib-dropdown-checklist icon-form-dropdown', value: 'dropdown', label: 'State', name: 'state' },
    { icon: 'adminlib-t-letter-bold icon-form-textbox', value: 'text', label: 'City', name: 'city' },
    { icon: 'adminlib-t-letter-bold icon-form-textbox', value: 'text', label: 'Post Code', name: 'post_code' },
    { icon: 'adminlib-unread icon-form-email', value: 'email', label: 'Paypal Email', name: 'paypal_email' },
];

const demoFormField = {
    id: 21,
    type: "text",
    label: "Enter your text",
    required: false,
    name: "text-mfpbb9yy",
    placeholder: "text",
    chosen: false,
    selected: false,
};

// Component
const CustomForm: React.FC<CustomFormProps> = ({
    onChange,
    name,
    proSettingChange,
    setting,
    formTitlePlaceholder,
}) => {
    const formSetting = setting[name] || {};
    const settingHasChanged = useRef(false);
    const firstTimeRender = useRef(true);

    const [formFieldList, setFormFieldList] = useState<FormField[]>(() => {
        const inputList = formSetting.formfieldlist || [];
        if (!Array.isArray(inputList) || inputList.length <= 0) {
            return [{ id: 1, type: 'title', label: DEFAULT_FORM_TITLE, required: true }];
        }
        return inputList;
    });

    const [buttonSetting, setButtonSetting] = useState(formSetting.butttonsetting || {});
    const [opendInput, setOpendInput] = useState<FormField | null>(null);
    const [randMaxId, setRendMaxId] = useState<number>(0);

    // Close meta modal if clicked outside
    // useEffect(() => {
    //     const closePopup = (event: MouseEvent) => {
    //         if ((event.target as HTMLElement).closest('.meta-menu, .meta-setting-modal, .react-draggable')) return;
    //         setOpendInput(null);
    //     };
    //     document.body.addEventListener('click', closePopup);
    //     return () => document.body.removeEventListener('click', closePopup);
    // }, []);

    useEffect(() => {
        setRendMaxId(formFieldList.reduce((maxId, field) => Math.max(maxId, field.id), 0) + 1);
    }, [formFieldList]);

    useEffect(() => {
        if (settingHasChanged.current) {
            settingHasChanged.current = false;
            onChange({ formfieldlist: formFieldList, butttonsetting: buttonSetting });
        }
    }, [buttonSetting, formFieldList, onChange]);

    const getUniqueName = () => Date.now().toString(36);

    const getNewFormField = (type = 'text', fixedName?: string): FormField => {
        const newFormField: FormField = {
            id: randMaxId ?? 0,
            type,
            label: '',
            required: false,
            name: fixedName ?? `${type}-${getUniqueName()}`,
        };
        if (['multiselect', 'radio', 'dropdown', 'checkboxes'].includes(type)) {
            newFormField.label = DEFAULT_LABEL_SELECT;
            newFormField.options = DEFAULT_OPTIONS;
        } else {
            newFormField.label = DEFAULT_LABEL_SIMPLE(type);
            newFormField.placeholder = DEFAULT_PLACEHOLDER(type);
        }
        setRendMaxId(prev => (prev ?? 0) + 1);
        return newFormField;
    };

    const appendNewFormField = (index: number, type = 'text', fixedName?: string, readonly = false) => {
        if (proSettingChange()) return;
        const newField: FormField = getNewFormField(type, fixedName);
        if (readonly) newField.readonly = true;
        const newFormFieldList = [...formFieldList.slice(0, index + 1), newField, ...formFieldList.slice(index + 1)];
        settingHasChanged.current = true;
        setFormFieldList(newFormFieldList);
        return newField;
    };

    const deleteParticularFormField = (index: number) => {
        if (proSettingChange()) return;
        const newFormFieldList = formFieldList.filter((_, i) => i !== index);
        settingHasChanged.current = true;
        setFormFieldList(newFormFieldList);
    };

    const handleFormFieldChange = (index: number, key: string, value: any) => {
        if (proSettingChange()) return;
        const newFormFieldList = [...formFieldList];
        newFormFieldList[index] = { ...newFormFieldList[index], [key]: value };
        settingHasChanged.current = true;
        setFormFieldList(newFormFieldList);
    };

    const handleFormFieldTypeChange = (index: number, newType: string) => {
        if (proSettingChange()) return;
        const selectedFormField = formFieldList[index];
        if (selectedFormField.type === newType) return;
        const newFormField = getNewFormField(newType);
        newFormField.id = selectedFormField.id;
        const newFormFieldList = [...formFieldList];
        newFormFieldList[index] = newFormField;
        settingHasChanged.current = true;
        setFormFieldList(newFormFieldList);
    };

    // Tabs
    const [activeTab, setActiveTab] = useState("blocks");
    const tabs = [
        {
            id: "blocks",
            label: "Blocks",
            content: (
                <>
                    <Elements
                        label="General"
                        selectOptions={selectOptions}
                        onClick={(type) => {
                            const newInput = appendNewFormField(formFieldList.length - 1, type);
                            if (newInput) {
                                setOpendInput(newInput);
                            }

                        }}
                    />
                    <Elements
                        label="Store"
                        selectOptions={selectOptionsStore}
                        onClick={(type) => {
                            const option = selectOptionsStore.find(o => o.value === type);
                            const fixedName = option?.name;
                            appendNewFormField(formFieldList.length - 1, type, fixedName, true);
                            setOpendInput(null);
                        }}
                    />
                </>
            ),
        },
        { id: "templates", label: "Templates", content: <div /> },
    ];

    return (
        <div className="registration-from-wrapper">
            <div className="elements-wrapper">
                <div className="tab-titles">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            className={`title ${activeTab === tab.id ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <p>{tab.label}</p>
                        </div>
                    ))}
                </div>
                <div className="tab-contend">
                    {tabs.map(tab => activeTab === tab.id && <div key={tab.id} className="tab-panel">{tab.content}</div>)}
                </div>
            </div>

            <div className="registration-form-main-section">
                {/* Form Title */}
                <div className="form-heading">
                    <input
                        type="text"
                        className="basic-input"
                        placeholder={formTitlePlaceholder}
                        value={formFieldList[0]?.label}
                        onChange={(e) => handleFormFieldChange(0, 'label', e.target.value)}
                    />
                    <DisplayButton
                        wraperClass={'add-new-sections'}
                        children={
                            <div className="icon-wrapper">
                                <span className="admin-font adminlib-move"></span>
                            </div>
                        }
                        onClick={() => {
                            const newInput = appendNewFormField(formFieldList.length - 1);
                            if (newInput) {
                                setOpendInput(newInput);
                            }
                        }}
                        btnType='button'
                    />
                </div>

                {/* Form Fields */}
                <ReactSortable
                    list={formFieldList}
                    setList={(newList) => {
                        if (firstTimeRender.current) {
                            firstTimeRender.current = false;
                            return;
                        }
                        if (proSettingChange()) return;
                        settingHasChanged.current = true;
                        setFormFieldList(newList);
                    }}
                    handle=".drag-handle"
                >
                    {formFieldList.map((formField, index) => {
                        if (index === 0) return <div key={index} style={{ display: 'none' }}></div>;
                        return (
                            <main
                                key={formField.id}
                                className={`form-field 
                                                ${opendInput?.id === formField.id
                                        ? 'active'
                                        : ''
                                    }`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpendInput(formField);
                                }}
                            >
                                {opendInput?.id === formField.id && (
                                    <section className="meta-menu">
                                        <DisplayButton
                                            onClick={() => {
                                                const index = formFieldList.findIndex(f => f.id === opendInput.id);
                                                if (index >= 0) deleteParticularFormField(index);
                                                setOpendInput(null);
                                            }}
                                            wraperClass={`delete`}
                                            children={<i className="admin-font adminlib-delete"></i>}
                                            btnType="button"
                                        />
                                    </section>
                                )}
                                <section className={`form-field-container-wrapper`}>
                                    {['text', 'email', 'number'].includes(formField.type) && (
                                        <SimpleInput
                                            formField={formField}
                                            onChange={(key, value) => handleFormFieldChange(index, key, value)}
                                        />
                                    )}
                                    {['radio', 'dropdown', 'multiselect', 'checkboxes'].includes(formField.type) && (
                                        <MultipleOptions
                                            formField={formField}
                                            onChange={(key, value) => handleFormFieldChange(index, key, value)}
                                            type={formField.type as any}
                                            selected={false}
                                        />
                                    )}
                                    {formField.type === 'datepicker' && (
                                        <Datepicker formField={formField} onChange={(key, value) => handleFormFieldChange(index, key, value)} />
                                    )}
                                    {formField.type === 'TimePicker' && (
                                        <TimePicker formField={formField} onChange={(key, value) => handleFormFieldChange(index, key, value)} />
                                    )}
                                    {formField.type === 'attachment' && (
                                        <Attachment formField={formField} onChange={(key, value) => handleFormFieldChange(index, key, value)} />
                                    )}
                                    {formField.type === 'section' && (
                                        <TemplateSection formField={formField} onChange={(key, value) => handleFormFieldChange(index, key, value)} />
                                    )}
                                    {formField.type === 'block-layout' && (
                                        <BlockLayout />
                                    )}
                                    {formField.type === 'textarea' && (
                                        <TemplateTextArea
                                            formField={formField}
                                            onChange={(key, value) =>
                                                handleFormFieldChange(
                                                    index,
                                                    key,
                                                    value
                                                )
                                            }
                                        />
                                    )}
                                    {formField.type ===
                                        'recaptcha' && (
                                            <Recaptcha
                                                formField={formField}
                                                onChange={(key, value) =>
                                                    handleFormFieldChange(
                                                        index,
                                                        key,
                                                        value
                                                    )
                                                }
                                            />
                                        )}
                                </section>
                            </main>
                        );
                    })}
                </ReactSortable>

                <section className="settings-input-content">
                    <ButtonCustomizer
                        text={
                            (buttonSetting.button_text &&
                                buttonSetting.button_text) ||
                            'Submit'
                        }
                        setting={buttonSetting}
                        onChange={(
                            key,
                            value,
                            isRestoreDefaults = false
                        ) => {
                            if (proSettingChange()) return;
                            settingHasChanged.current = true;
                            const previousSetting = buttonSetting || {};
                            if (isRestoreDefaults) {
                                setButtonSetting(value);
                            } else {
                                setButtonSetting({
                                    ...previousSetting,
                                    [key]: value,
                                });
                            }
                        }}
                    />
                </section>
            </div>

            {/* Meta Setting Modal outside registration-form-main-section */}
            <div className="registration-edit-form">
                {opendInput && !opendInput.readonly && (           
                    <>
                        <SettingMetaBox
                            formField={opendInput}
                            opened={{ click: true }}
                            onChange={(key, value) => {
                                const index = formFieldList.findIndex(f => f.id === opendInput.id);
                                if (index >= 0) {
                                    handleFormFieldChange(index, key, value);
                                    // Update the local open input so the UI updates immediately
                                    setOpendInput({ ...formFieldList[index], [key]: value });
                                }
                            }}
                            onTypeChange={(newType) => {
                                const index = formFieldList.findIndex(f => f.id === opendInput.id);
                                if (index >= 0) {
                                    handleFormFieldTypeChange(index, newType);
                                    // Update the local open input type
                                    setOpendInput({ ...formFieldList[index], type: newType });
                                }
                            }}
                            inputTypeList={selectOptions}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default CustomForm;
