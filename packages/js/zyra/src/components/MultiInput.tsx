/**
 * External dependencies
 */
import React, { useState, FocusEvent } from 'react';
import "../styles/web/MultiInputString.scss";

// Types
interface MultiStringProps {
    inputType: 'multi-string';
    values?: string[];
    placeholder?: string;
    wrapperClass?: string;
    inputClass?: string;
    buttonClass?: string;
    listClass?: string;
    itemClass?: string;
    onStringChange?: (e: { target: { name?: string; value: string[] } }) => void;
    onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

interface CommonProps {
    id?: string;
    name?: string;
    proSetting?: boolean;
    description?: string;
    descClass?: string;
    iconEnable?: boolean;
}

type MultiInputProps = MultiStringProps & CommonProps;

const MultiInput: React.FC<MultiInputProps> = (props) => {
    const {
        values = [],
        placeholder,
        wrapperClass,
        inputClass,
        buttonClass,
        listClass,
        itemClass,
        onStringChange,
        onFocus,
        onBlur,
        id,
        name,
        proSetting,
        iconEnable,
        description,
        descClass
    } = props;

    const [inputValue, setInputValue] = useState("");
    const [editIndex, setEditIndex] = useState<number | null>(null);

    // Add or update item
    const handleAddOrUpdate = () => {
        const trimmedValue = inputValue.trim();
        if (!trimmedValue) return;

        let updatedValues = [...(Array.isArray(values) ? values : [])];

        if (editIndex !== null) {
            // Update existing item
            updatedValues[editIndex] = trimmedValue;
            setEditIndex(null);
        } else {
            // Add new item
            updatedValues.push(trimmedValue);
        }

        onStringChange?.({ target: { name, value: updatedValues } });
        setInputValue("");
    };

    const handleDelete = (val: string) => {
        const updatedValues = (Array.isArray(values) ? values : []).filter(item => item !== val);
        onStringChange?.({ target: { name, value: updatedValues } });

        if (editIndex !== null && values[editIndex] === val) {
            setEditIndex(null);
            setInputValue("");
        }
    };

    const handleEdit = (val: string, index: number) => {
        setEditIndex(index);
        setInputValue(val);
    };

    return (
        <div className={wrapperClass}>
            <div className="multi-input-row">
                <ul className={listClass || "multi-string-list"}>
                    {Array.isArray(values) && values.map((val, index) => (
                        <li key={index} className={itemClass}>
                            <div className="details">
                                {iconEnable && <i className="adminlib-cart"></i>}
                                <div className="title">{val}</div>
                            </div>

                            <div className="action-wrapper">
                                <span
                                    className="icon adminlib-create"
                                    onClick={() => handleEdit(val, index)}
                                ></span>
                                <span
                                    className="icon adminlib-delete"
                                    onClick={() => handleDelete(val)}
                                ></span>
                            </div>
                        </li>
                    ))}
                    <li>
                        <input
                            type="text"
                            id={id}
                            name={name}
                            value={inputValue}
                            placeholder={placeholder}
                            className={inputClass}
                            onChange={(e) => setInputValue(e.target.value)}
                            onFocus={onFocus}
                            onBlur={onBlur}
                        />
                        <span
                            className={
                                editIndex !== null
                                    ? `${buttonClass || "admin-btn"}  btn-green`
                                    : `${buttonClass || "admin-btn"} btn-purple`
                            }
                            onClick={handleAddOrUpdate}
                        >
                            <i
                                className={
                                    editIndex !== null
                                        ? "adminlib-create" 
                                        : "adminlib-plus-circle-o" 
                                }
                            ></i>
                            {editIndex !== null ? "Update" : "Add"}
                        </span>

                    </li>
                </ul>
            </div>

            {proSetting && <span className="admin-pro-tag"><i className="adminlib-pro-tag"></i>Pro</span>}
            {description && (
                <p
                    className={`${descClass} settings-metabox-description`}
                    dangerouslySetInnerHTML={{ __html: description }}
                />
            )}
        </div>
    );
};

export default MultiInput;
