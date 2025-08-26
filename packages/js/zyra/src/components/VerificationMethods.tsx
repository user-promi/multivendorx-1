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
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

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
    newRows[index] = { ...newRows[index], label: form.label };
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
    if (openDropdownIndex === index) setOpenDropdownIndex(null);
  };

  const toggleActive = (index: number) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], active: !newRows[index].active };
    setRows(newRows);
    onChange(newRows);
  };

  const toggleRequired = (index: number) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], required: !newRows[index].required };
    setRows(newRows);
    onChange(newRows);
  };

  return (
    <div className="fileds-wrapper">
      {label && <h4>{label}</h4>}

      <button type="button" className="admin-btn btn-purple" onClick={startAdd}>
        {addButtonLabel}
      </button>

      <ul className="fileds">
        {rows.map((row, idx) => (
          <li key={idx} className="row-item">
            <div className="name">
              {editingIndex === idx ? (
                <div className="edit-row">
                  <div className="edit-form">
                    <label>Label</label>
                    <input
                      type="text"
                      placeholder="Enter label"
                      value={form.label || ''}
                      onChange={(e) => handleFieldChange('label', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault(); // prevent page reload
                          saveRow(idx);       // save on Enter
                        }
                      }}
                    />
                  </div>
                  <div className="button-wrapper">
                    <button type="button" onClick={() => saveRow(idx)}>
                      <i className="adminlib-check"></i>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>{row.label}</div>
                </>
              )}
            </div>

            <div className="action-section">
              <div className="action-icons">
                {/* toggle dropdown */}
                <i
                  className="adminlib-more-vertical"
                  onClick={() =>
                    setOpenDropdownIndex(openDropdownIndex === idx ? null : idx)
                  }
                ></i>

                <div className={`action-dropdown ${openDropdownIndex === idx ? 'show' : ''}`}>
                  <ul>
                    {editingIndex !== idx && (
                      <>
                        <li onClick={() => startEdit(idx)}>
                          <i className="adminlib-create"></i>Edit
                        </li>
                        <li onClick={() => toggleRequired(idx)}>
                          <i className="adminlib-delete"></i>
                          {row.required ? 'Not Required' : 'Required'}
                        </li>
                        <li onClick={() => toggleActive(idx)}>
                          <i className={row.active ? "adminlib-eye" : "adminlib-eye-blocked"}></i>
                          {row.active ? "Active" : "Inactive"}
                        </li>
                        <li onClick={() => deleteRow(idx)}>
                          <i className="adminlib-delete"></i>Delete
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VerificationMethods;
