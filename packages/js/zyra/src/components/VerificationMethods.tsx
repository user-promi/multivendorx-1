import React, { useState, useEffect } from 'react';

interface VerificationField {
  key: string;
  type: 'text' | 'checkbox' | 'number' | 'select';
  label: string;
  placeholder?: string;
}

interface VerificationMethodsProps {
  label?: string;
  addButtonLabel?: string;
  deleteButtonLabel?: string;
  value?: Array<Record<string, any>>;
  nestedFields: VerificationField[];
  onChange: (value: Array<Record<string, any>>) => void;
}

const VerificationMethods: React.FC<VerificationMethodsProps> = ({
  label,
  addButtonLabel = 'Add',
  deleteButtonLabel = 'Remove',
  value = [],
  nestedFields,
  onChange,
}) => {
  const [rows, setRows] = useState<Array<Record<string, any>>>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    setRows(value.length ? value : []);
  }, [value]);

  useEffect(() => {
    if (editingIndex === null) setForm({});
    else setForm(rows[editingIndex] || {});
  }, [editingIndex, rows]);

  const handleFieldChange = (key: string, val: any) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const startAdd = () => {
    setRows((prev) => [...prev, {}]);
    setEditingIndex(rows.length);
    setForm({});
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setForm({});
  };

  const saveRow = (index: number) => {
    if (!form.label || !form.label.trim()) {
      alert('Label is required');
      return;
    }
    const newRows = [...rows];
    newRows[index] = form;
    setRows(newRows);
    onChange(newRows);
    setEditingIndex(null);
    setForm({});
  };

  const deleteRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
    onChange(newRows);
    if (editingIndex === index) cancelEdit();
  };

  const toggleActive = (index: number) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], active: !newRows[index].active };
    setRows(newRows);
    onChange(newRows);
  };

  return (
    <div className="fileds-wrapper">
      {label && <h4>{label}</h4>}

      <button type="button" className="admin-btn btn-purple" onClick={startAdd}>
        {addButtonLabel}
      </button>

      <ul>
        {rows.map((row, idx) => (
          <li key={idx} className="row-item">
            <div className="name">
              {editingIndex === idx ? (
                <div className="edit-row">
                  {nestedFields.map(({ key, type, label, placeholder }) => {
                    if (type === 'checkbox') {
                      return (
                        <label key={key}>
                          <input
                            type="checkbox"
                            checked={!!form[key]}
                            onChange={(e) => handleFieldChange(key, e.target.checked)}
                          />
                          {label}
                        </label>
                      );
                    }
                    return (
                      <div className="edit-form">
                        <label>{label}</label>
                        <input
                          type="text"
                          placeholder={placeholder}
                          value={form[key] || ''}
                          onChange={(e) => handleFieldChange(key, e.target.value)}
                        />
                      </div>
                    );
                  })}
                  <div className="button-wrapper">
                    <button type="button" onClick={() => saveRow(idx)}><i className="adminlib-check"></i></button>
                    <button type="button" onClick={cancelEdit}><i className="adminlib-close"></i></button>
                  </div>
                </div>
              ) : (
                <>
                  <div>{row.label}</div>
                  {row.required && <span className="admin-badge red">(Required)</span>}
                </>
              )}
            </div>

            <div className="icon-wrapper">
              {editingIndex !== idx && (
                <>
                  <button type="button" onClick={() => startEdit(idx)} aria-label="Edit">
                    <i className="adminlib-create"></i>
                  </button>
                  <button type="button" onClick={() => deleteRow(idx)} aria-label="Delete">
                    <i className="adminlib-delete"></i>
                  </button>
                  <button type="button" onClick={() => toggleActive(idx)}
                  >
                    <i className={row.active ? "adminlib-eye" : "adminlib-eye-blocked"}></i>
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VerificationMethods;
