/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';

import '../styles/web/SettingMetaBox.scss';

// Types
interface FormField {
    type: string;
    name: string;
    placeholder?: string;
    charlimit?: number;
    row?: number;
    column?: number;
    sitekey?: string;
    filesize?: number;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
}

interface InputType {
    value: string;
    label: string;
}

interface Option {
    label: string;
    value: string;
    isdefault?: boolean;
}

interface SettingMetaBoxProps {
    formField?: FormField;
    inputTypeList?: InputType[];
    onChange: (field: string, value: any) => void;
    onTypeChange?: (value: string) => void;
    opened: { click: boolean };
    metaType?: string;
    option?: Option;
    setDefaultValue?: () => void;
}

interface FieldWrapperProps {
    label: string;
    className?: string;
    children: React.ReactNode;
}

interface InputFieldProps {
    label: string;
    type?: string;
    value: any;
    onChange: (value: string) => void;
    className?: string;
    readonly?: boolean;
}

interface FormFieldSelectProps {
    inputTypeList: InputType[];
    formField: FormField;
    onTypeChange: (value: string) => void;
}

// ---------------- Components ----------------

const FieldWrapper: React.FC<FieldWrapperProps> = ({ label, children, className }) => (
    <div
        className={`edit-field-wrapper ${className || ''}`}
        role="button"
        tabIndex={0}
        onClick={(e) => e.stopPropagation()}
    >
        <label>{label}</label>
        {children}
    </div>
);

const InputField: React.FC<InputFieldProps> = ({ label, type = 'text', value, onChange, className, readonly = false }) => (
    <FieldWrapper label={label} className={className}>
        <input
            type={type}
            value={value || ''}
            className="basic-input"
            onChange={(e) => onChange(e.target.value)}
            readOnly={readonly}
        />
    </FieldWrapper>
);

const FormFieldSelect: React.FC<FormFieldSelectProps> = ({ inputTypeList, formField, onTypeChange }) => (
    <FieldWrapper label="Type">
        <select
            onChange={(e) => onTypeChange(e.target.value)}
            value={formField.type}
            className="basic-select"
        >
            {inputTypeList.map((inputType) => (
                <option key={inputType.value} value={inputType.value}>
                    {inputType.label}
                </option>
            ))}
        </select>
    </FieldWrapper>
);

// ---------------- Main Component ----------------

const SettingMetaBox: React.FC<SettingMetaBoxProps> = ({
    formField,
    inputTypeList = [],
    onChange,
    onTypeChange,
    opened,
    option,
    metaType = 'setting-meta',
    setDefaultValue,
}) => {
    const [hasOpened, setHasOpened] = useState(opened.click);

    const isValidSiteKey = (key: string) => /^6[0-9A-Za-z_-]{39}$/.test(key);
    const [isSiteKeyEmpty, setIsSiteKeyEmpty] = useState(
        formField?.type === 'recaptcha' && !isValidSiteKey(formField.sitekey || '')
    );

    useEffect(() => {
        setHasOpened(opened.click);
    }, [opened]);

    useEffect(() => {
        if (formField?.type === 'recaptcha') {
            onChange('disabled', isSiteKeyEmpty);
        }
    }, [isSiteKeyEmpty, formField?.type, onChange]);

    // Conditional fields
    const renderConditionalFields = () => {
        const commonFields = (
            <>
                <InputField
                    label="Placeholder"
                    value={formField?.placeholder || ''}
                    onChange={(value) => onChange('placeholder', value)}
                />
                <InputField
                    label="Character Limit"
                    type="number"
                    value={formField?.charlimit?.toString() || ''}
                    onChange={(value) => onChange('charlimit', Number(value))}
                />
            </>
        );

        switch (formField?.type) {
            case 'text':
            case 'email':
            case 'url':
            case 'textarea':
                return (
                    <>
                        {commonFields}
                        {formField.type === 'textarea' && (
                            <>
                                <InputField
                                    label="Row"
                                    type="number"
                                    value={formField.row?.toString() || ''}
                                    onChange={(value) => onChange('row', Number(value))}
                                />
                                <InputField
                                    label="Column"
                                    type="number"
                                    value={formField.column?.toString() || ''}
                                    onChange={(value) => onChange('column', Number(value))}
                                />
                            </>
                        )}
                    </>
                );
            case 'multiselect':
                return(
                    <>
                    
                    </>
                );
            case 'recaptcha':
                return (
                    <>
                        <InputField
                            label="Site Key"
                            value={formField.sitekey || ''}
                            className={isSiteKeyEmpty ? 'highlight' : ''}
                            onChange={(value) => {
                                onChange('sitekey', value);
                                setIsSiteKeyEmpty(!isValidSiteKey(value));
                            }}
                        />
                        <p>
                            Register your site with your Google account to obtain the{' '}
                            <a href="https://www.google.com/recaptcha" target="_blank" rel="noopener noreferrer">
                                reCAPTCHA script
                            </a>.
                        </p>
                    </>
                );
            case 'attachment':
                return (
                    <InputField
                        label="Maximum File Size"
                        type="number"
                        value={formField.filesize?.toString() || ''}
                        onChange={(value) => onChange('filesize', Number(value))}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div role="button" tabIndex={0} onClick={() => setHasOpened((prev) => !prev)}>
            {hasOpened && (
                <main className="meta-setting-modal-content">
                    <h3>Input Field Settings</h3>

                    <div className="setting-modal-content-section">
                        <InputField
                            label="Field Label"
                            value={formField?.name || ''}
                            onChange={(value) => onChange('name', value)}
                        />

                        {metaType === 'setting-meta' ? (
                            <FormFieldSelect
                                inputTypeList={inputTypeList}
                                formField={formField as FormField}
                                onTypeChange={(type) => onTypeChange?.(type)}
                            />
                        ) : (
                            <InputField
                                label="Value"
                                value={option?.value || ''}
                                onChange={(value) => onChange('value', value)}
                            />
                        )}

                        <InputField
                            label={metaType === 'setting-meta' ? 'Name' : 'Label'}
                            value={metaType === 'setting-meta' ? formField?.name || '' : option?.label || ''}
                            readonly={metaType === 'setting-meta' && formField?.readonly}
                            onChange={(value) => {
                                if (metaType === 'setting-meta') {
                                    onChange('name', value);
                                } else {
                                    onChange('label', value);
                                }
                            }}
                        />

                        {metaType === 'setting-meta' && renderConditionalFields()}
                    </div>

                    <div className="setting-modal-content-section">
                        {metaType === 'setting-meta' && (
                            <FieldWrapper label="Visibility">
                                <div className="visibility-control-container">
                                    <div className="tabs">
                                        <input
                                            checked={
                                                formField?.type === 'recaptcha' ? !isSiteKeyEmpty : !formField?.disabled
                                            }
                                            onChange={(e) => onChange('disabled', !e.target.checked)}
                                            type="radio"
                                            id="visible"
                                            name="tabs"
                                        />
                                        <label className="tab" htmlFor="visible">
                                            Visible
                                        </label>

                                        <input
                                            checked={formField?.type === 'recaptcha' ? isSiteKeyEmpty : formField?.disabled}
                                            onChange={(e) => onChange('disabled', e.target.checked)}
                                            type="radio"
                                            id="hidden"
                                            name="tabs"
                                        />
                                        <label className="tab" htmlFor="hidden">
                                            Hidden
                                        </label>

                                        <span className="glider" />
                                    </div>
                                </div>
                            </FieldWrapper>
                        )}

                        <FieldWrapper label={metaType === 'setting-meta' ? 'Required' : 'Set default'}>
                            <input
                                type="checkbox"
                                checked={metaType === 'setting-meta' ? formField?.required : option?.isdefault}
                                onChange={(e) => {
                                    if (metaType === 'setting-meta') {
                                        onChange('required', e.target.checked);
                                    } else if (setDefaultValue) {
                                        setDefaultValue();
                                    }
                                }}
                            />
                        </FieldWrapper>
                    </div>
                </main>
            )}
        </div>
    );
};

export default SettingMetaBox;
