import React, { useState, useEffect } from "react";
import "../styles/web/NestedComponent.scss";
import ToggleSetting from "./ToggleSetting";
import BasicInput from "./BasicInput";
import SelectInput from "./SelectInput";
import TimeSelect from "./TimeSelect";

interface NestedFieldOption {
  key?: string;
  value: string;
  label: string;
  proSetting?: boolean;
}

interface NestedField {
  key: string;
  type: "number" | "select" | "text" | "url" | "dropdown" | "time";
  label?: string;
  placeholder?: string;
  options?: NestedFieldOption[];
  dependent?: { key: string; set: boolean; value: string };
  firstRowOnly?: boolean;
  skipFirstRow?: boolean;
  skipLabel?: boolean;
  parameter?: string;
  preParameter?: string;
  before?: string;
  after?: string;
  desc?: string;
  size?: string;
  min?: number;
  defaultValue?: string; // ✅ needed for TimeSelect
  className?: string; // ✅ needed for SelectInput
  proSetting?: boolean;
}
declare const appLocalizer: { khali_dabba?: boolean }; // ✅ for TimeSelect
declare function isProSetting(value: boolean): boolean; // ✅ for SelectInput & TimeSelect
declare function setModelOpen(value: boolean): void; // ✅ for TimeSelect

interface NestedComponentProps {
  id: string;
  label?: string;
  fields: NestedField[];
  value: Record<string, any>[];
  addButtonLabel?: string;
  deleteButtonLabel?: string;
  onChange: (value: Record<string, any>[]) => void;
  single?: boolean;
  description?: string;
}

const NestedComponent: React.FC<NestedComponentProps> = ({
  id,
  fields,
  value = [],
  onChange,
  addButtonLabel = "Add",
  deleteButtonLabel = "Delete",
  single = false,
  description
}) => {
  const [rows, setRows] = useState<Record<string, any>[]>([]);

  // sync value → state
  useEffect(() => {
    setRows(single ? (value.length ? [value[0]] : [{}]) : value.length ? value : [{}]);
  }, [value, single]);

  function updateAndSave(updated: Record<string, any>[]) {
    setRows(updated);
    onChange(updated);
  }

  function handleChange(rowIndex: number, key: string, value: any) {
    updateAndSave(rows.map((row, i) => (i === rowIndex ? { ...row, [key]: value } : row)));
  }

  function isLastRowComplete() {
    if (rows.length === 0) return true;
    const lastRow = rows.at(-1) || {};

    return fields.every((f) => {
      if (f.skipFirstRow && rows.length === 1) return true;
      if (f.firstRowOnly && rows.length > 1) return true;

      const val = lastRow[f.key];

      // dependency check
      if (f.dependent) {
        const depVal = lastRow[f.dependent.key];
        if (
          (f.dependent.set && depVal !== f.dependent.value) ||
          (!f.dependent.set && depVal === f.dependent.value)
        ) {
          return true; // not required in this case
        }
      }

      return val !== undefined && val !== "";
    });
  }

  function addRow() {
    if (single) return;
    if (!isLastRowComplete()) return;
    updateAndSave([...rows, {}]);
  }

  function removeRow(index: number) {
    if (!single) updateAndSave(rows.filter((_, i) => i !== index));
  }

  function renderField(field: NestedField, row: Record<string, any>, rowIndex: number) {
    if (rowIndex === 0 && field.skipFirstRow) return null;
    if (rowIndex > 0 && field.firstRowOnly) return null;

    const val = row[field.key] ?? "";

    if (field.dependent) {
      const depVal = row[field.dependent.key];
      if (
        (field.dependent.set && depVal !== field.dependent.value) ||
        (!field.dependent.set && depVal === field.dependent.value)
      ) {
        return null;
      }
    }

    switch (field.type) {
      case "select":
        return (
          <div className="settings-input-content" key={field.key}>
            {!(rowIndex === 0 && field.skipLabel) && field.label && <label>{field.label}</label>}
            <ToggleSetting
              key={field.key}
              options={field.options || []}
              value={val}
              onChange={(newVal) => handleChange(rowIndex, field.key, newVal)}
            />
          </div>
        );

      case "number":
      case "text":
      case "url":
        return (
          <div className="settings-input-content" key={field.key}>
            {!(rowIndex === 0 && field.skipLabel) && field.label && <label>{field.label}</label>}
            <BasicInput
              type={field.type}
              descClass="settings-metabox-description"
              id={`${field.key}-${rowIndex}`}
              name={field.key}
              value={val}
              preParameter={field.preParameter}
              parameter={field.parameter}
              before={field.before}
              after={field.after}
              min={field.min ?? 0}
              description={field.desc}
              size={field.size}
              placeholder={field.placeholder}
              onChange={(e) => handleChange(rowIndex, field.key, e.target.value)}
              wrapperClass="setting-form-input"
            />
          </div>
        );

      case "dropdown": // 🔹 NEW: SelectInput
        return (
          <div className="settings-input-content" key={field.key}>
            {!(rowIndex === 0 && field.skipLabel) && field.label && <label>{field.label}</label>}
            <SelectInput
              wrapperClass="form-select-field-wrapper"
              descClass="settings-metabox-description"
              name={field.key}
              description={field.desc}
              inputClass={field.className}
              options={
                Array.isArray(field.options)
                  ? field.options.map((opt) => ({
                    value: String(opt.value),
                    label: opt.label ?? String(opt.value),
                  }))
                  : []
              }
              value={typeof val === "number" ? val.toString() : val}
              // proSetting={isProSetting(field.proSetting ?? false)}
              onChange={(newVal) => handleChange(rowIndex, field.key, newVal)}
            />
          </div>
        );

      case "time": // 🔹 NEW: TimeSelect
        return (
          <div className="settings-input-content" key={field.key}>
            {!(rowIndex === 0 && field.skipLabel) && field.label && <label>{field.label}</label>}
            <TimeSelect
              khali_dabba={appLocalizer?.khali_dabba ?? false}
              wrapperClass="setting-form-input"
              descClass="settings-metabox-description"
              description={field.desc}
              key={field.key}
              value={String(val ?? field.defaultValue ?? "")}
              // proSetting={isProSetting(field.proSetting ?? false)}
              onChange={(data) => handleChange(rowIndex, field.key, data)}
              proChanged={() => setModelOpen(true)}
            />
          </div>
        );

      default:
        return null;
    }
  }


  return (
    <div className="nested-wrapper" id={id}>
      {rows.map((row, rowIndex) => (
        <div key={`nested-row-${rowIndex}`} className={`nested-row ${single ? "" : "multiple"}`}>
          {fields.map((field) => renderField(field, row, rowIndex))}
          {!single && rowIndex === rows.length - 1 && (
            <div className="buttons-wrapper">
              <button
                type="button"
                className="admin-btn btn-green"
                onClick={addRow}
                disabled={!isLastRowComplete()}
              >
                + {addButtonLabel}
              </button>
              {rows.length > 1 && (
                <button
                  type="button"
                  className="admin-btn btn-red"
                  onClick={() => removeRow(rowIndex)}
                >
                  {deleteButtonLabel}
                </button>
              )}
            </div>
          )}
        </div>
      ))}
      {description && (
        <p
          className={`settings-metabox-description`}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
    </div>
  );
};

export default NestedComponent;
