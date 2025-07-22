import React, { useState, useEffect } from 'react';

interface NestedField {
  key: string;
  type: 'number' | 'select';
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface NestedComponentProps {
  id: string;
  label?: string;
  fields: NestedField[];
  value: Record<string, any>[];
  addButtonLabel?: string;
  deleteButtonLabel?: string;
  onChange: (value: Record<string, any>[]) => void;
}

const NestedComponent: React.FC<NestedComponentProps> = ({
  id,
  label,
  fields,
  value = [],
  onChange,
  addButtonLabel = 'Add',
  deleteButtonLabel = 'Delete',
}) => {
  const [rows, setRows] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    setRows(value.length ? value : [{}]);
  }, [value]);

  const handleFieldChange = (index: number, key: string, val: any) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [key]: val };
    setRows(updated);
    onChange(updated);
  };

  const addRow = () => {
    const updated = [...rows, {}];
    setRows(updated);
    onChange(updated);
  };

  const removeRow = (index: number) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
    onChange(updated);
  };

  return (
    <div className="nested-component-wrapper">
      {rows.map((row, rowIndex) => (
        <div
          className="nested-row"
          key={rowIndex}
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '10px',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          {fields.map((nestedField) => {
            const inputValue = row[nestedField.key] ?? '';
            return (
              <div key={nestedField.key} style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                  {nestedField.label}
                </label>
                {nestedField.type === 'select' ? (
                  <select
                    value={inputValue}
                    onChange={(e) => handleFieldChange(rowIndex, nestedField.key, e.target.value)}
                    style={{ width: '100%', padding: '4px' }}
                  >
                    <option value="">Select</option>
                    {nestedField.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    value={inputValue}
                    placeholder={nestedField.placeholder || ''}
                    onChange={(e) => handleFieldChange(rowIndex, nestedField.key, e.target.value)}
                    style={{ width: '100%', padding: '4px' }}
                  />
                )}
              </div>
            );
          })}

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '4px' }}>
            {rowIndex === rows.length - 1 && (
              <button type="button" onClick={addRow} style={{ padding: '4px 8px' }}>
                {addButtonLabel}
              </button>
            )}
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(rowIndex)}
                style={{ color: 'red', padding: '4px 8px' }}
              >
                {deleteButtonLabel}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NestedComponent;
