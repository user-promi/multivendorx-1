/**
 * External dependencies
 */
import React, { useState, FocusEvent, KeyboardEvent } from 'react';
import "../styles/web/MultiInputString.scss";

// Types
interface MultiStringItem {
  value: string;
  locked?: boolean;
  iconClass?: string;
  description?: string;
  required?: boolean;
  tag?: string;
}

interface MultiStringProps {
  inputType: 'multi-string';
  values?: MultiStringItem[];
  placeholder?: string;
  wrapperClass?: string;
  inputClass?: string;
  buttonClass?: string;
  listClass?: string;
  itemClass?: string;
  iconOptions?: string[];
  onStringChange?: (e: { target: { name?: string; value: MultiStringItem[] } }) => void;
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
  descEnable?: boolean;
  requiredEnable?: boolean;
  maxItems?: number;
  allowDuplicates?: boolean;
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
    iconOptions = [],
    onStringChange,
    onFocus,
    onBlur,
    id,
    name,
    proSetting,
    iconEnable,
    descEnable = false,
    requiredEnable = false,
    description,
    descClass,
    maxItems,
    allowDuplicates = false,
  } = props;

  const [inputValue, setInputValue] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [requiredChecked, setRequiredChecked] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [iconDropdownOpen, setIconDropdownOpen] = useState(false);

  // --- Add or Update Item ---
  const handleAddOrUpdate = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    if (!allowDuplicates) {
      const duplicate = values.some((item, idx) => item.value === trimmedValue && idx !== editIndex);
      if (duplicate) return;
    }

    const updatedValues = [...values];

    if (editIndex !== null) {
      if (updatedValues[editIndex].locked) return;
      updatedValues[editIndex] = {
        ...updatedValues[editIndex],
        value: trimmedValue,
        description: itemDescription,
        iconClass: selectedIcon || updatedValues[editIndex].iconClass,
        required: requiredChecked,
      };
      setEditIndex(null);
    } else {
      if (maxItems && updatedValues.length >= maxItems) return;
      updatedValues.push({
        value: trimmedValue,
        description: itemDescription,
        iconClass: selectedIcon,
        required: requiredChecked,
      });
    }

    onStringChange?.({ target: { name, value: updatedValues } });
    resetFields();
  };

  // --- Delete Item ---
  const handleDelete = (index: number) => {
    if (values[index].locked) return;
    const updatedValues = values.filter((_, idx) => idx !== index);
    onStringChange?.({ target: { name, value: updatedValues } });
    if (editIndex === index) resetFields();
  };

  // --- Edit Item ---
  const handleEdit = (index: number) => {
    if (values[index].locked) return;
    const item = values[index];
    setEditIndex(index);
    setInputValue(item.value);
    setItemDescription(item.description || "");
    setSelectedIcon(item.iconClass || "");
    setRequiredChecked(item.required || false);
  };

  // --- Keyboard Support ---
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddOrUpdate();
    if (e.key === "Escape") resetFields();
  };

  const resetFields = () => {
    setEditIndex(null);
    setInputValue("");
    setItemDescription("");
    setSelectedIcon("");
    setRequiredChecked(false);
    setIconDropdownOpen(false);
  };

  return (
    <div className={wrapperClass}>
      <div className="multi-input-row">
        <ul className={listClass || "multi-string-list"}>
          {values.map((item, index) => (
            <li key={index} className={itemClass}>
              <div className="details">
                {iconEnable && item.iconClass && <i className={item.iconClass}></i>}
                <div className={`title ${item.locked ? "locked" : ""}`}>{item.value}</div>
                {item.description && <div className="item-description">{item.description}</div>}
                {requiredEnable && item.required && <span className="required-label">Required</span>}
                {item.tag && <span className="item-tag">{item.tag}</span>}
              </div>
              <div className="action-wrapper">
                {!item.locked && (
                  <>
                    <span className="icon adminlib-create" onClick={() => handleEdit(index)}></span>
                    <span className="icon adminlib-delete" onClick={() => handleDelete(index)}></span>
                  </>
                )}
              </div>
            </li>
          ))}

          <li className="multi-input-edit">
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
              onKeyDown={handleKeyDown}
            />

            {descEnable && (
              <input
                type="text"
                value={itemDescription}
                placeholder="Enter description (optional)"
                className="multi-input-description"
                onChange={(e) => setItemDescription(e.target.value)}
              />
            )}

            {requiredEnable && (
              <label className="multi-input-required">
                <input
                  type="checkbox"
                  checked={requiredChecked}
                  onChange={(e) => setRequiredChecked(e.target.checked)}
                />
                Required
              </label>
            )}

            {iconEnable && iconOptions.length > 0 && (
              <div className="multi-input-icon-dropdown">
                <div className="selected-icon" onClick={() => setIconDropdownOpen(!iconDropdownOpen)}>
                  {selectedIcon ? <i className={selectedIcon}></i> : "Select Icon"}
                  <span className="dropdown-arrow">▾</span>
                </div>
                {iconDropdownOpen && (
                  <ul className="icon-options-list">
                    {iconOptions.map((icon) => (
                      <li
                        key={icon}
                        className={`icon-option ${selectedIcon === icon ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedIcon(icon);
                          setIconDropdownOpen(false);
                        }}
                      >
                        <i className={icon}></i>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <span
              className={editIndex !== null ? `${buttonClass || "admin-btn"} btn-green` : `${buttonClass || "admin-btn"} btn-purple`}
              onClick={handleAddOrUpdate}
            >
              <i className={editIndex !== null ? "adminlib-create" : "adminlib-plus-circle-o"}></i>
              {editIndex !== null ? "Update" : "Add"}
            </span>
          </li>
        </ul>
      </div>

      {proSetting && (
        <span className="admin-pro-tag">
          <i className="adminlib-pro-tag"></i>Pro
        </span>
      )}

      {description && (
        <p className={`${descClass} settings-metabox-description`} dangerouslySetInnerHTML={{ __html: description }} />
      )}
    </div>
  );
};

export default MultiInput;
