/**
 * External dependencies
 */
import React, { useState } from "react";
import { ReactSortable } from "react-sortablejs";

/**
 * Internal dependencies
 */
import Elements from "./Elements"; // Your Elements.tsx
// import BlockLayout from "./BlockLayout"; // For 'block-layout' type

// Types
interface BlockItem {
  id: string;
  type: string;
  label: string;
}

interface Column {
  id: string;
  blocks: BlockItem[];
}

interface Container {
  id: string;
  columns: Column[];
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

// All block types supported
const BLOCK_OPTIONS = [
  // { icon: "adminlib-module icon-form-textbox", value: "block-layout", label: "Block Layout" },
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

const BlockLayout: React.FC = () => {
  const [columnsCount, setColumnsCount] = useState<number>(2);
  const [container, setContainer] = useState<Container>({
    id: generateId(),
    columns: [
      { id: generateId(), blocks: [] },
      { id: generateId(), blocks: [] },
    ],
  });

  // Change number of columns
  const handleColumnsChange = (count: number) => {
    const newColumns: Column[] = [];
    for (let i = 0; i < count; i++) {
      newColumns.push(container.columns[i] || { id: generateId(), blocks: [] });
    }
    setColumnsCount(count);
    setContainer({ ...container, columns: newColumns });
  };

  // Add a block to a column
  const addBlock = (columnIndex: number, type: string) => {
    const newBlock: BlockItem = {
      id: generateId(),
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
    };
    const newColumns = [...container.columns];
    newColumns[columnIndex].blocks.push(newBlock);
    setContainer({ ...container, columns: newColumns });
  };

  return (
    <div className="container-block-wrapper">
      {/* Columns Selector */}
      <div className="container-header">
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
              border: "1px solid #ccc",
              borderRadius: "4px",
              background: "#f9f9f9",
            }}
          >
            <h4>Column {colIndex + 1}</h4>

            {/* Elements.tsx for adding blocks */}
            <Elements
              label="Add Block"
              selectOptions={BLOCK_OPTIONS}
              onClick={(type) => addBlock(colIndex, type)}
            />

            {/* Sortable blocks inside the column */}
            <ReactSortable
              list={col.blocks}
              setList={(newList) => {
                const newColumns = [...container.columns];
                newColumns[colIndex].blocks = newList;
                setContainer({ ...container, columns: newColumns });
              }}
              group="container-blocks"
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
                    borderRadius: "3px",
                    cursor: "grab",
                  }}
                >
                  {/* Render Block Layout as nested component */}
                  {block.type === "block-layout" ? (
                    <BlockLayout />
                  ) : (
                    block.label
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
