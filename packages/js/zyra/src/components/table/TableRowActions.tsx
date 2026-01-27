import React from 'react';

export interface ActionItem {
  label?: string;
  icon?: React.ReactNode;
  onClick: (rowId?: string | number) => void;
  className?: string;
}

interface TableRowActionsProps {
  rowId?: string | number;
  rowActions: ActionItem[];
}

const TableRowActions: React.FC<TableRowActionsProps> = ({
  rowId,
  rowActions,
}) => {
  return (
    <div className="row-actions">
      {rowActions.map((action, index) => (
        <button
          key={index}
          type="button"
          className={`action-btn ${action.className || ''}`}
          onClick={() => action.onClick(rowId)}
        >
          {action.icon}
          {action.label && <span className="action-label">{action.label}</span>}
        </button>
      ))}
    </div>
  );
};

export default TableRowActions;
