import React, { useState, useEffect } from 'react';
import "../styles/web/NestedComponent.scss";
import MultiNumInput from './MultiNumInput'; // adjust path accordingly

interface NestedFieldOption {
  value: string;
  label: string;
  proSetting?: boolean;
}

interface NestedField {
  key: string;
  type: 'number' | 'select' | 'multi-number' | 'checkbox';
  label: string;
  placeholder?: string;
  options?: NestedFieldOption[];
  dependent?: { key: string; set: boolean; value: string };
}

interface NestedComponentProps {
  id: string;
  label?: string;
  fields: NestedField[];
  value: Record<string, any>[];
  addButtonLabel?: string;
  deleteButtonLabel?: string;
  onChange: (value: Record<string, any>[]) => void;
  single?: boolean;
}

const NestedComponent: React.FC<NestedComponentProps> = ({
  id,
  fields,
  value = [],
  onChange,
  addButtonLabel = 'Add',
  deleteButtonLabel = 'Delete',
  single = false,
}) => {
  const [rows, setRows] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    if (single) {
      setRows(value.length ? [value[0]] : [{}]);
    } else {
      setRows(value.length ? value : [{}]);
    }
  }, [value, single]);

  const isRowComplete = (row: Record<string, any>) => {
    return fields.every((field) => {
      const val = row[field.key];
      if (field.type === 'multi-number') {
        return Array.isArray(val) && val.length > 0;
      }
      return val !== undefined && val !== null && val !== '';
    });
  };

  const handleFieldChange = (index: number, key: string, val: any) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [key]: val };
    setRows(updated);

    // save only complete rows (or first row)
    const filteredRows = updated.map((row, i) => (i === 0 || isRowComplete(row) ? row : null))
      .filter(Boolean) as Record<string, any>[];
    onChange(filteredRows);
  };

  const handleMultiNumChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    parentKey: string,
    optionKey: string,
    rowIndex: number
  ) => {
    const updated = [...rows];
    const parentValue = updated[rowIndex][parentKey] || [];
    const newVal = e.target.value;
    const existingIndex = parentValue.findIndex((v: any) => v.key === optionKey);
    if (existingIndex > -1) parentValue[existingIndex].value = newVal;
    else parentValue.push({ key: optionKey, value: newVal });

    updated[rowIndex][parentKey] = parentValue;
    setRows(updated);

    const filteredRows = updated.map((row, i) => (i === 0 || isRowComplete(row) ? row : null))
      .filter(Boolean) as Record<string, any>[];
    onChange(filteredRows);
  };

  const addRow = () => {
    if (!single) {
      const updated = [...rows, {}];
      setRows(updated);
    }
  };

  const removeRow = (index: number) => {
    if (!single) {
      const updated = rows.filter((_, i) => i !== index);
      setRows(updated);

      const filteredRows = updated.map((row, i) => (i === 0 || isRowComplete(row) ? row : null))
        .filter(Boolean) as Record<string, any>[];
      onChange(filteredRows);
    }
  };

  return (
    <div className="nested-wrapper" id={id}>
      {rows.map((row, rowIndex) => {
        const prevComplete = rowIndex === 0 || isRowComplete(rows[rowIndex - 1]);
        return (
          <div key={`nested-row-${rowIndex}`} className="nested-row">
            {fields.map((field) => {
              const inputValue = row[field.key] ?? '';

              if (field.dependent) {
                const depVal = row[field.dependent.key];
                if (
                  (field.dependent.set && depVal !== field.dependent.value) ||
                  (!field.dependent.set && depVal === field.dependent.value)
                ) return null;
              }

              const disabled = !prevComplete && rowIndex > 0;

              if (field.type === 'select') {
                if (rowIndex === 0) return null;
                return (
                  <div key={field.key}>
                    <label>{field.label}</label>
                    <div className="toggle-setting-container">
                      <div className="toggle-setting-wrapper">
                        {field.options?.map((opt) => (
                          <div
                            key={opt.value}
                            role="button"
                            tabIndex={0}
                            onClick={() => !disabled && handleFieldChange(rowIndex, field.key, opt.value)}
                            style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
                          >
                            <input
                              type="radio"
                              id={`${field.key}-${rowIndex}-${opt.value}`}
                              name={`${field.key}-${rowIndex}`}
                              value={opt.value}
                              checked={inputValue === opt.value}
                              readOnly
                              className="toggle-setting-form-input"
                            />
                            <label htmlFor={`${field.key}-${rowIndex}-${opt.value}`}>
                              {opt.label}
                            </label>
                            {opt.proSetting && <span className="admin-pro-tag">Pro</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              if (field.type === 'multi-number') {
                return (
                  <div key={field.key}>
                    <label>{field.label}</label>
                    <MultiNumInput
                      parentWrapperClass="settings-basic-input-class"
                      childWrapperClass="settings-basic-child-wrap"
                      inputWrapperClass="settings-basic-input-child-class"
                      innerInputWrapperClass="setting-form-input"
                      inputLabelClass="setting-form-basic-input"
                      idPrefix="setting-integer-input"
                      options={field.options || []}
                      value={row[field.key] || []}
                      onChange={(e, k, optKey) => !disabled && handleMultiNumChange(e, field.key, optKey || '', rowIndex)}
                      // disabled={disabled}
                    />
                  </div>
                );
              }

              return (
                <div key={field.key}>
                  <label>{field.label}</label>
                  <input
                    type="number"
                    value={inputValue}
                    placeholder={field.placeholder || ''}
                    onChange={(e) => !disabled && handleFieldChange(rowIndex, field.key, e.target.value)}
                    className="basic-input"
                    disabled={disabled}
                  />
                </div>
              );
            })}
            {!single && (
              <div className="buttons-wrapper">
                <button type="button" className="admin-btn btn-green" onClick={addRow} disabled={rowIndex > 0 && !prevComplete}>
                  + {addButtonLabel}
                </button>
                {rows.length > 1 && (
                  <button type="button" className="admin-btn btn-red" onClick={() => removeRow(rowIndex)}>
                    {deleteButtonLabel}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NestedComponent;
