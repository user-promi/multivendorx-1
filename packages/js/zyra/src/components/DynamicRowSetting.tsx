/**
 * External dependencies
 */
import React from 'react';
import Select from 'react-select';

/**
 * Internal dependencies
 */
import '../styles/web/ToggleSetting.scss';

// Types
type FieldType = 'text' | 'number' | 'file' | 'select';

interface FieldConfig {
    key: string;
    label?: string;
    type: FieldType;
    placeholder?: string;
    options?: { label: string; value: string; children?: any[] }[];
    width?: string;
}

interface RowConfig {
    fields: FieldConfig[];
}

interface DynamicRowSettingProps {
    description?: string;
    wrapperClass?: string;
    descClass?: string;
    keyName: string;
    template: RowConfig;
    value: any[];
    onChange: (rows: any[]) => void;
    addLabel?: string;

    /** NEW: render nested UI inside each row */
    childrenRenderer?: (row: any, rowIndex: number) => React.ReactNode;
}

const DynamicRowSetting: React.FC<DynamicRowSettingProps> = ({
    description = "",
    wrapperClass = "",
    descClass = "",
    keyName,
    template,
    value,
    onChange,
    addLabel = "Add New",
    childrenRenderer = undefined,
}) => {

    const handleAdd = () => {
        const emptyRow: any = {};
        template.fields.forEach(field => {
            emptyRow[field.key] = field.type === 'file' ? null : "";
        });
        onChange([...value, emptyRow]);
    };

    const handleChange = (rowIndex: number, fieldKey: string, newVal: any) => {
        const updatedRows = [...value];
        updatedRows[rowIndex] = {
            ...updatedRows[rowIndex],
            [fieldKey]: newVal,
        };
        onChange(updatedRows);
    };

    const handleDelete = (rowIndex: number) => {
        onChange(value.filter((_, i) => i !== rowIndex));
    };


    const renderField = (row: any, field: FieldConfig, rowIndex: number) => {
        const val = row[field.key];

        switch (field.type) {
            case "text":
            case "number":
                return (
                    <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={val}
                        onChange={(e) =>
                            handleChange(rowIndex, field.key, e.target.value)
                        }
                    />
                );

            case "file":
                return (
                    <input
                        type="file"
                        onChange={(e: any) => {
                            const file = e.target.files?.[0] || null;
                            handleChange(rowIndex, field.key, file);
                        }}
                    />
                );

            case "select":
                return (
                    <Select
                        placeholder={field.placeholder}
                        value={field.options?.find((opt) => opt.value === val) || null}
                        options={field.options || []}
                        onChange={(selected: any) => {
                            handleChange(rowIndex, field.key, selected?.value || "");

                            if (selected?.children) {
                                handleChange(
                                    rowIndex,
                                    field.key + "_children",
                                    selected.children
                                );
                            }
                        }}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <>
            <div className={`dynamic-row-setting ${wrapperClass}`}>

                <button type="button" className="mvx-add-btn" onClick={handleAdd}>
                    + {addLabel}
                </button>

                {value.map((row, rowIndex) => (
                    <div key={rowIndex} className="mvx-row">

                        {template.fields.map((field) => (
                            <div
                                key={field.key}
                                className="mvx-row-field"
                                style={{ width: field.width || "auto" }}
                            >
                                {field.label && <label>{field.label}</label>}
                                {renderField(row, field, rowIndex)}
                            </div>
                        ))}

                        <button
                            type="button"
                            className="mvx-delete-btn"
                            onClick={() => handleDelete(rowIndex)}
                        >
                            Delete
                        </button>

                        {/* NEW: nested renderer inside each row */}
                        {childrenRenderer && (
                            <div className="mvx-nested-children">
                                {childrenRenderer(row, rowIndex)}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {description && (
                <p
                    className={descClass}
                    dangerouslySetInnerHTML={{ __html: description }}
                ></p>
            )}
        </>
    );
};

export default DynamicRowSetting;
