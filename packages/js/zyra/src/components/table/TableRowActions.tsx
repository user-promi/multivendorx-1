import React, { useState, useRef } from 'react';
import { useOutsideClick } from '../fieldUtils';
import Tooltip from '../UI/Tooltip';

export interface ActionItem {
    label?: string;
    icon?: React.ReactNode;
    onClick: (row?: Record<string, unknown>) => void;
    className?: string;
    type?: string;
}

interface TableRowActionsProps {
    row: Record<string, unknown>;
    rowActions: ActionItem[];
}

const TableRowActions: React.FC<TableRowActionsProps> = ({
    row,
    rowActions,
}) => {
    const [open, setOpen] = useState(false);
    const showInline = rowActions.length <= 2;

    const containerRef = useRef<HTMLDivElement>(null);

    useOutsideClick(containerRef, () => {
        if (open) {
            setOpen(false);
        }
    });

    return (
        <div className="action-section" ref={containerRef}>
            <div className="action-icons">
                <div className="inline-actions">
                    {showInline ? (
                        rowActions.map((action) => (
                            <Tooltip text={action.label}>
                                <i
                                    onClick={() => action.onClick(row)}
                                    className={`adminfont-${action.icon}`}
                                />
                            </Tooltip>
                        ))
                    ) : (
                        <>
                            <i
                                className="adminfont-more-vertical"
                                onClick={() => setOpen((v) => !v)}
                            />
                            <div
                                className={`action-dropdown ${
                                    open ? 'show' : 'hover'
                                }`}
                            >
                                <ul>
                                    {rowActions.map((action, index) => (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                action.onClick(row);
                                                setOpen(false);
                                            }}
                                        >
                                            <i
                                                className={`adminfont-${action.icon}`}
                                            />
                                            <span className="tooltip-name">
                                                {action.label}
                                            </span>
                                        </div>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TableRowActions;
