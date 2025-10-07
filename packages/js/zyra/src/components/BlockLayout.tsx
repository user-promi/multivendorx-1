/**
 * External dependencies
 */
import React, { useState } from "react";
import { ReactSortable } from "react-sortablejs";

// import "../styles/web/BlockLayout.scss";

// Types
interface ElementItem {
  id: number;
  name: string;
}

const BlockLayout: React.FC = () => {
  const [columns, setColumns] = useState<number>(2);

  const [blocks, setBlocks] = useState<Record<number, ElementItem[]>>({
    1: [
      { id: 1, name: "Name Field" },
      { id: 2, name: "Email Field" },
    ],
    2: [{ id: 3, name: "Textarea Field" }],
  });

  const handleColumnChange = (value: number) => {
    const newBlocks: Record<number, ElementItem[]> = {};
    for (let i = 1; i <= value; i++) {
      newBlocks[i] = blocks[i] || [];
    }
    setColumns(value);
    setBlocks(newBlocks);
  };

  return (
    <div className="block-layout-wrapper">
      <div className="block-header">
        <label>Block Name Columns:</label>
        <select
          value={columns}
          onChange={(e) => handleColumnChange(Number(e.target.value))}
          className="basic-select"
        >
          {[1, 2, 3, 4].map((num) => (
            <option key={num} value={num}>
              {num} Column{num > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="block-columns">
        {Array.from({ length: columns }, (_, i) => i + 1).map((col) => (
          <div key={col} className="block-column">
            <h4>Column {col}</h4>
            <ReactSortable
              list={blocks[col]}
              setList={(newList) =>
                setBlocks((prev) => ({ ...prev, [col]: newList }))
              }
              group="shared-elements"
              animation={150}
              className="elements-container"
            >
              {blocks[col].map((item) => (
                <div key={item.id} className="element-item">
                  {item.name}
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
