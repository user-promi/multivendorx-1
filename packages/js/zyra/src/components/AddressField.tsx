/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';

/**
 * Internal dependencies
 */
import SimpleInput from './SimpleInput';
import MultipleOptions from './MultipleOption';

/**
 * Props and Types
 */
interface SubField {
    id: string | number;
    key: string;
    label: string;
    type: 'text' | 'select';
    placeholder?: string;
    options?: string[];
    required?: boolean;
}

interface AddressFormField {
    id: number;
    type: string;
    label: string;
    fields?: SubField[];
    value?: Record<string, any>;
}

interface AddressFieldProps {
    formField: AddressFormField;
    onChange: (key: string, value: any) => void;
}

const AddressField: React.FC<AddressFieldProps> = ({ formField, onChange }) => {
    const [subFields, setSubFields] = useState<SubField[]>(formField.fields ?? []);

    // Sync with parent updates (important if external updates happen)
    useEffect(() => {
        setSubFields(formField.fields ?? []);
    }, [formField.fields]);

    // Update parent (and eventually DB)
    const updateParent = (updated: SubField[]) => {
        setSubFields(updated);
        onChange('fields', updated); // this should save to parent + DB
    };

    return (
        <div className="address-field-wrapper" style={{ position: 'relative' }}>
            <ReactSortable
                list={subFields}
                setList={(newList: SubField[]) => {
                    updateParent(newList);
                }}
                handle=".drag-handle"
                animation={150}
            >
                {subFields.map((f) => (
                    <div key={f.id} className="address-subfield">
                        <div className="address-subfield-header">
                            <span className="admin-badge gray drag-handle">
                                <i className="admin-font adminlib-drag"></i>
                            </span>
                            {/* <label>{f.label}</label> */}
                        </div>

                        {/* Render actual field preview */}
                        {f.type === 'text' && (
                            <SimpleInput
                                formField={{
                                    label: f.label,
                                    placeholder: f.placeholder,
                                }}
                                onChange={() => {}}
                            />
                        )}

                        {f.type === 'select' && (
                            <MultipleOptions
                                formField={{
                                    label: f.label,
                                    type: 'dropdown',
                                    options:
                                        f.options?.map((opt) => ({
                                            id: opt,
                                            label: opt,
                                            value: opt,
                                        })) || [],
                                }}
                                type="dropdown"
                                selected={false}
                                onChange={() => {}}
                            />
                        )}
                    </div>
                ))}
            </ReactSortable>
        </div>
    );
};

export default AddressField;
