/**
 * External dependencies
 */
import React, { useState } from "react";
import { ReactSortable } from "react-sortablejs";

/**
 * Internal dependencies
 */
import Elements from "./Elements"; // Sidebar block selector

// Types
interface BlockItem {
  id: string;
  type: string;
  label: string;
  children?: Column[];
}

interface Column {
  id: string;
  blocks: BlockItem[];
}

interface Container {
  id: string;
  columns: Column[];
}

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

// Supported blocks
const BLOCK_OPTIONS = [
  { icon: "adminlib-module icon-form-textbox", value: "block-layout", label: "Block Layout" },
  { icon: "adminlib-t-letter-bold icon-form-textbox", value: "text", label: "Textbox" },
  { icon: "adminlib-unread icon-form-email", value: "email", label: "Email" },
  { icon: "adminlib-text icon-form-textarea", value: "textarea", label: "Textarea" },
  { icon: "adminlib-checkbox icon-form-checkboxes", value: "checkboxes", label: "Checkboxes" },
  { icon: "adminlib-multi-select icon-form-multi-select", value: "multiselect", label: "Multi Select" },
  { icon: "adminlib-radio icon-form-radio", value: "radio", label: "Radio" },
  { icon: "adminlib-dropdown-checklist icon-form-dropdown", value: "dropdown", label: "Dropdown" },
  { icon: "adminlib-captcha-automatic-code icon-form-recaptcha", value: "recaptcha", label: "reCaptcha v3" },
  { icon: "adminlib-submission-message icon-form-attachment", value: "attachment", label: "Attachment" },
  { icon: "adminlib-form-section icon-form-section", value: "section", label: "Section" },
  { icon: "adminlib-calendar icon-form-store-description", value: "datepicker", label: "Date Picker" },
  { icon: "adminlib-alarm icon-form-address", value: "TimePicker", label: "Time Picker" },
  { icon: "adminlib-divider icon-form-address", value: "divider", label: "Divider" },
];

/**
 * Recursive BlockLayout Component
 */
const BlockLayout: React.FC<{ depth?: number }> = ({ depth = 0 }) => {
  const [columnsCount, setColumnsCount] = useState<number>(2);
  const [container, setContainer] = useState<Container>({
    id: generateId(),
    columns: [
      { id: generateId(), blocks: [] },
      { id: generateId(), blocks: [] },
    ],
  });

  const handleColumnsChange = (count: number) => {
    const newColumns: Column[] = [];
    for (let i = 0; i < count; i++) {
      newColumns.push(container.columns[i] || { id: generateId(), blocks: [] });
    }
    setColumnsCount(count);
    setContainer({ ...container, columns: newColumns });
  };

  const addBlock = (columnIndex: number, type: string) => {
    const selected = BLOCK_OPTIONS.find((b) => b.value === type);
    if (!selected) return;

    const newBlock: BlockItem = {
      id: generateId(),
      type: selected.value,
      label: selected.label,
      children: selected.value === "block-layout" ? [] : undefined,
    };

    const newColumns = [...container.columns];
    newColumns[columnIndex].blocks.push(newBlock);
    setContainer({ ...container, columns: newColumns });
  };

  return (
    <div
      className="container-block-wrapper"
      style={{
        border: "1px solid #ccc",
        borderRadius: "6px",
        padding: "10px",
        marginBottom: "10px",
        background: depth === 0 ? "#f8f8f8" : "#fff",
      }}
    >
      {/* Header: only show for top-level */}
      {depth === 0 && (
        <div className="container-header" style={{ marginBottom: "10px" }}>
          <label>Columns:</label>
          <select
            value={columnsCount}
            onChange={(e) => handleColumnsChange(Number(e.target.value))}
            className="basic-select"
          >
            {[1, 2, 3, 4].map((num) => (
              <option key={num} value={num}>
                {num} Column{num > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Columns */}
      <div className="container-columns" style={{ display: "flex", gap: "10px" }}>
        {container.columns.map((col, colIndex) => (
          <div
            key={col.id}
            className="container-column"
            style={{
              flex: 1,
              minHeight: "150px",
              padding: "10px",
              border: "1px dashed #bbb",
              borderRadius: "4px",
              background: "#fdfdfd",
            }}
          >
            <h4>Column {colIndex + 1}</h4>

            {/* Add Block Button */}
            <Elements
              label="Add Block"
              selectOptions={BLOCK_OPTIONS}
              onClick={(type) => addBlock(colIndex, type)}
            />

            {/* Sortable inner blocks */}
            <ReactSortable
              list={col.blocks}
              setList={(newList) => {
                const newColumns = [...container.columns];
                newColumns[colIndex].blocks = newList;
                setContainer({ ...container, columns: newColumns });
              }}
              group="shared-blocks"
              animation={150}
              className="blocks-wrapper"
            >
              {col.blocks.map((block) => (
                <div
                  key={block.id}
                  className="block-item"
                  style={{
                    padding: "8px",
                    marginBottom: "5px",
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    cursor: "grab",
                  }}
                >
                  {block.type === "block-layout" ? (
                    <BlockLayout depth={depth + 1} />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <i className={`adminlib-${block.type}`}></i>
                      <span>{block.label}</span>
                    </div>
                  )}
                </div>
              ))}
            </ReactSortable>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockLayout;