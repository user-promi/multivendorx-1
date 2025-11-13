import React, { useState, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';
import SimpleInput from './SimpleInput';
import MultipleOptions from './MultipleOption';
import { FormField } from './RegistrationForm';

interface SubField {
    id: number; // Use number for ReactSortable
    key: string;
    label: string;
    type: 'text' | 'select';
    placeholder?: string;
    options?: string[];
    required?: boolean;
    readonly?: boolean;
}

interface AddressFormField {
    id: number;
    type: string;
    label: string;
    fields?: SubField[];
    value?: Record<string, any>;
    readonly?:boolean;
}

interface AddressFieldProps {
    formField: AddressFormField;
    onChange: (key: string, value: any) => void;
    opendInput: FormField | null;
    setOpendInput: React.Dispatch<React.SetStateAction<FormField | null>>;
}

const AddressField: React.FC<AddressFieldProps> = ({ formField, onChange, opendInput, setOpendInput }) => {
    const [subFields, setSubFields] = useState<SubField[]>(formField.fields || []);

    useEffect(() => {
        setSubFields(formField.fields || []);
    }, [formField.fields]);

    // Update parent
    const updateParent = (updated: SubField[]) => {
        setSubFields(updated);
        onChange('fields', updated);
    };

    return (
        <div className="address-field-wrapper">
            <ReactSortable
                list={subFields}
                setList={updateParent}
                handle=".drag-handle"
                animation={150}
            >
                {subFields.map(f => (
                    <div
                        key={f.id}
                        className={`form-field ${opendInput?.id === f.id ? 'active' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpendInput({ ...f, readonly:formField.readonly, parentId: formField.id } as unknown as FormField);
                        }}
                    >
                        <div className="meta-menu">
                            <span className="admin-badge blue drag-handle">
                                <i className="admin-font adminlib-drag"></i>
                            </span>
                        </div>

                        {f.type === 'text' && (
                            <SimpleInput
                                formField={{ label: f.label, placeholder: f.placeholder }}
                            />
                        )}

                        {f.type === 'select' && (
                            <MultipleOptions
                                formField={{
                                    label: f.label,
                                    type: 'dropdown',
                                    options: f.options?.map(opt => ({ id: opt, value: opt, label: opt })) || [],
                                }}
                                type="dropdown"
                                selected={false}
                            />
                        )}
                    </div>
                ))}
            </ReactSortable>
        </div>
    );
};

export default AddressField;
