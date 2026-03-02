// External dependencies
import React, { useState } from 'react';

// Internal dependencies
import '../styles/web/MultiCheckboxTable.scss';
import { FieldComponent } from './types';
import { SelectInputUI } from './SelectInput';
import { PopupUI } from './Popup';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Option {
    value: string | number;
    label: string;
}

/**
 * Value stored at setting[`${column.key}_${row.key}`] when column.type === 'shift'.
 * Represents a single shift slot — start and end time as "HH:mm" strings.
 */
export interface ShiftTimeValue {
    start: string;
    end: string;
}

const DEFAULT_SHIFT_TIME: ShiftTimeValue = { start: '', end: '' };

interface Column {
    key: string;
    label: string;
    /**
     * Cell type:
     *  - 'checkbox'    → default (string[] at setting[column.key])
     *  - 'description' → read-only text from row.description
     *  - 'shift'       → inline start/end time pickers
     */
    type?: 'checkbox' | 'description' | 'shift';
    moduleEnabled?: string;
    proSetting?: string;
    /**
     * Mark a shift column as the "split shift" column.
     * It is hidden until the user enables the split shift toggle.
     * Only meaningful when type === 'shift'.
     */
    isSplitShift?: boolean;
}

/**
 * When provided, renders a "Split Shift" toggle above the table.
 * Toggling it shows/hides every column marked `isSplitShift: true`.
 *
 * key   → setting key where the boolean is persisted  (e.g. 'split_shift')
 * label → label shown next to the toggle              (e.g. 'Split Shift (2 Time Slots)')
 * icon  → optional adminfont icon class suffix        (e.g. 'split-shift')
 */
interface SplitShiftToggle {
    key: string;
    label: string;
    icon?: string;
}

interface Row {
    key: string;
    label: string;
    description?: string;
    options?: Option[];
    /**
     * When set, the label cell shows a toggle checkbox.
     * setting[enabledKey] is a string[] of active row.key values.
     * Disabled rows grey-out all cells including shift inputs.
     */
    enabledKey?: string;
}

interface CapabilityGroup {
    label: string;
    desc: string;
    capability: Record<string, string>;
}

type GroupedRows = Record<string, CapabilityGroup>;

// Flat setting bag:
//   shift columns    → ShiftTimeValue  at key `${column.key}_${row.key}`
//   select columns   → Option[]        at key `${column.key}_${row.key}`
//   checkbox columns → string[]        at key `${column.key}`
//   split toggle     → boolean         at key splitShiftToggle.key
type FieldSetting = Record<string, string[] | Option[] | ShiftTimeValue | boolean>;

interface MultiCheckboxTableUIProps {
    rows: Row[] | GroupedRows;
    columns: Column[];
    onChange: (subKey: string, value: string[] | Option[] | ShiftTimeValue | boolean) => void;
    setting: FieldSetting;
    proSetting?: boolean;
    modules: string[];
    storeTabSetting: Record<string, string[]>;
    khali_dabba: boolean;
    onBlocked?: (type: 'pro' | 'module', payload?: string) => void;
    /** When provided, a split-shift toggle is rendered above the table. */
    splitShiftToggle?: SplitShiftToggle;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalizeShiftTime = (raw: unknown): ShiftTimeValue => {
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        const r = raw as Partial<ShiftTimeValue>;
        return {
            start: typeof r.start === 'string' ? r.start : '',
            end:   typeof r.end   === 'string' ? r.end   : '',
        };
    }
    return { ...DEFAULT_SHIFT_TIME };
};

// ─── TableCheckbox ────────────────────────────────────────────────────────────

interface TableCheckboxProps {
    id: string;
    checked: boolean;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
}

const TableCheckbox: React.FC<TableCheckboxProps> = ({ id, checked, disabled = false, onChange }) => (
    <div className="default-checkbox table-checkbox">
        <input
            type="checkbox"
            id={id}
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
        />
        <label htmlFor={id} className="checkbox-label" />
    </div>
);

// ─── SplitShiftToggleBar ──────────────────────────────────────────────────────
// The toggle row shown above the table, matching the design's
// "Split Shift (2 Time Slots)" pill with a toggle switch.

interface SplitShiftToggleBarProps {
    config: SplitShiftToggle;
    enabled: boolean;
    onChange: (val: boolean) => void;
}

const SplitShiftToggleBar: React.FC<SplitShiftToggleBarProps> = ({ config, enabled, onChange }) => (
    <div className={`split-shift-bar ${enabled ? 'split-shift-bar--active' : ''}`}>
        {config.icon && <i className={`adminfont-${config.icon}`} />}
        <span className="split-shift-bar__label">{config.label}</span>
        {/* Reuse the existing toggle-checkbox pattern from the codebase */}
        <div className="toggle-checkbox split-shift-bar__toggle">
            <input
                type="checkbox"
                id="split-shift-toggle"
                checked={enabled}
                onChange={(e) => onChange(e.target.checked)}
            />
            <label htmlFor="split-shift-toggle" className="checkbox-label" />
        </div>
    </div>
);

// ─── TableCellSelect ──────────────────────────────────────────────────────────

interface TableCellSelectProps {
    settingKey: string;
    rowLabel: string;
    rowOptions: Option[];
    currentValue: Option[];
    onChange: (key: string, value: Option[]) => void;
    isBlocked: () => boolean;
    disabled?: boolean;
}

const TableCellSelect: React.FC<TableCellSelectProps> = ({
    settingKey,
    rowLabel,
    rowOptions,
    currentValue,
    onChange,
    isBlocked,
    disabled = false,
}) => {
    const [popupOpen, setPopupOpen] = useState(false);

    const optionStrings   = rowOptions.map((o) => ({ value: String(o.value), label: o.label }));
    const selectedStrings = currentValue.map((v) => String(v.value));

    const handleChange = (raw: string | string[]) => {
        if (isBlocked()) return;
        const selected = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const resolved: Option[] = selected.map(
            (s) => rowOptions.find((o) => String(o.value) === s) ?? { value: s, label: s }
        );
        onChange(settingKey, resolved);
    };

    const sharedSelectProps = {
        type: 'creatable-multi' as const,
        options: optionStrings,
        value: selectedStrings,
        onChange: handleChange,
        isClearable: true,
        placeholder: 'Select...',
        disabled,
    };

    return (
        <>
            <SelectInputUI
                {...sharedSelectProps}
                maxVisibleItems={2}
                onOverflowClick={() => setPopupOpen(true)}
                wrapperClass="table-cell-select"
            />
            <PopupUI
                position="lightbox"
                open={popupOpen}
                onClose={() => setPopupOpen(false)}
                showBackdrop
                width="28rem"
                height="fit-content"
                header={{ title: rowLabel, showCloseButton: true }}
            >
                <SelectInputUI
                    {...sharedSelectProps}
                    wrapperClass="table-cell-select-popup"
                />
            </PopupUI>
        </>
    );
};

// ─── TableCellShift ───────────────────────────────────────────────────────────
// Inline [HH:MM] – [HH:MM] time pickers rendered directly in the cell.

interface TableCellShiftProps {
    settingKey: string;
    value: ShiftTimeValue;
    onChange: (key: string, value: ShiftTimeValue) => void;
    isBlocked: () => boolean;
    disabled?: boolean;
}

const TableCellShift: React.FC<TableCellShiftProps> = ({
    settingKey,
    value,
    onChange,
    isBlocked,
    disabled = false,
}) => {
    const handleChange = (field: keyof ShiftTimeValue, newVal: string) => {
        if (isBlocked() || disabled) return;
        onChange(settingKey, { ...value, [field]: newVal });
    };

    return (
        <div className={`shift-time-cell${disabled ? ' shift-time-cell--disabled' : ''}`}>
            <input
                type="time"
                className="shift-time-cell__input"
                value={value.start}
                disabled={disabled}
                onChange={(e) => handleChange('start', e.target.value)}
            />
            <span className="shift-time-cell__sep">–</span>
            <input
                type="time"
                className="shift-time-cell__input"
                value={value.end}
                disabled={disabled}
                onChange={(e) => handleChange('end', e.target.value)}
            />
        </div>
    );
};

// ─── MultiCheckboxTableUI ─────────────────────────────────────────────────────

export const MultiCheckboxTableUI: React.FC<MultiCheckboxTableUIProps> = ({
    rows,
    columns,
    onChange,
    setting,
    storeTabSetting,
    proSetting,
    modules,
    onBlocked,
    khali_dabba,
    splitShiftToggle,
}) => {
    const [openGroup, setOpenGroup] = useState<string | null>(() => {
        if (!Array.isArray(rows) && rows && Object.keys(rows).length > 0) {
            return Object.keys(rows)[0];
        }
        return null;
    });

    // ── Split shift state ─────────────────────────────────────────────────────
    // Read from setting so it persists across renders/saves.
    const splitShiftEnabled = splitShiftToggle
        ? Boolean(setting[splitShiftToggle.key])
        : false;

    // Filter visible columns: always show non-split columns;
    // show isSplitShift columns only when the toggle is on.
    const visibleColumns = columns.filter(
        (col) => !col.isSplitShift || splitShiftEnabled
    );

    // ── Block checker ─────────────────────────────────────────────────────────

    const makeBlockChecker = (column: Column) => (): boolean => {
        if (column.proSetting && !khali_dabba) { onBlocked?.('pro'); return true; }
        if (column.moduleEnabled && !modules.includes(column.moduleEnabled)) {
            onBlocked?.('module', column.moduleEnabled); return true;
        }
        return false;
    };

    const handleCheckboxChange = (column: Column, rowKey: string, checked: boolean) => {
        if (makeBlockChecker(column)()) return;
        const current = Array.isArray(setting[column.key]) ? (setting[column.key] as string[]) : [];
        onChange(column.key, checked ? [...current, rowKey] : current.filter((k) => k !== rowKey));
    };

    // ── Unified cell renderer ─────────────────────────────────────────────────

    const renderCell = (
        column: Column,
        rowKey: string,
        rowLabel: string,
        rowOptions: Option[] | undefined,
        isRowActive: boolean,
    ) => {
        const isBlocked = makeBlockChecker(column);

        // Description column
        if (column.type === 'description') {
            const row = Array.isArray(rows)
                ? (rows as Row[]).find((r) => r.key === rowKey)
                : undefined;
            return <td key={`desc_${rowKey}`}>{row?.description || '—'}</td>;
        }

        // Shift column — inline time pickers
        if (column.type === 'shift') {
            const cellKey = `${column.key}_${rowKey}`;
            return (
                <td key={cellKey} className="shift-td">
                    <TableCellShift
                        settingKey={cellKey}
                        value={normalizeShiftTime(setting[cellKey])}
                        onChange={(key, val) => {
                            if (isBlocked()) return;
                            onChange(key, val);
                        }}
                        isBlocked={isBlocked}
                        disabled={!isRowActive}
                    />
                </td>
            );
        }

        // Select column (row has an options pool)
        if (rowOptions?.length) {
            const cellKey = `${column.key}_${rowKey}`;
            const rawVal  = setting[cellKey];
            const cellValue: Option[] = Array.isArray(rawVal)
                ? (rawVal as any[]).filter((v) => v && typeof v === 'object' && 'value' in v)
                : [];

            return (
                <td key={cellKey}>
                    <TableCellSelect
                        settingKey={cellKey}
                        rowLabel={rowLabel}
                        rowOptions={rowOptions}
                        currentValue={cellValue}
                        onChange={onChange}
                        isBlocked={isBlocked}
                        disabled={!isRowActive}
                    />
                </td>
            );
        }

        // Default: checkbox column
        const isChecked =
            Array.isArray(setting[column.key]) &&
            (setting[column.key] as string[]).includes(rowKey);

        return (
            <td key={`${column.key}_${rowKey}`}>
                <TableCheckbox
                    id={`chk_${column.key}_${rowKey}`}
                    checked={isChecked}
                    disabled={!isRowActive}
                    onChange={(checked) => handleCheckboxChange(column, rowKey, checked)}
                />
            </td>
        );
    };

    // ── Flat rows ─────────────────────────────────────────────────────────────

    const renderFlatRows = (flatRows: Row[]) =>
        flatRows.map((row) => {
            const isRowActive = row.enabledKey
                ? (setting[row.enabledKey] as string[] | undefined)?.includes(row.key) ?? false
                : true;

            const handleRowToggle = (checked: boolean) => {
                const current = (setting[row.enabledKey!] as string[]) ?? [];
                onChange(row.enabledKey!, checked
                    ? [...current, row.key]
                    : current.filter((k) => k !== row.key));
            };

            return (
                <tr key={row.key} className={row.enabledKey && !isRowActive ? 'row-disabled' : ''}>
                    <td>
                        {row.enabledKey ? (
                            <div className="row-label-toggle">
                                <TableCheckbox
                                    id={`row-toggle_${row.key}`}
                                    checked={isRowActive}
                                    onChange={handleRowToggle}
                                />
                                <span>{row.label}</span>
                            </div>
                        ) : (
                            row.label
                        )}
                    </td>
                    {visibleColumns.map((col) =>
                        renderCell(col, row.key, row.label, row.options, isRowActive)
                    )}
                </tr>
            );
        });

    // ── Grouped rows ──────────────────────────────────────────────────────────

    const renderGroupedRows = (groupedRows: GroupedRows) => {
        const totalCols = visibleColumns.length + 1;
        return Object.entries(groupedRows).map(([groupKey, group]) => {
            const isOpen = openGroup === groupKey;
            return (
                <React.Fragment key={groupKey}>
                    <tr className="toggle-header-row">
                        <td colSpan={totalCols}>
                            <div
                                className="toggle-header"
                                onClick={() => setOpenGroup(isOpen ? null : groupKey)}
                            >
                                <div className="header-title">
                                    {group.label}
                                    <i className={`adminfont-${isOpen ? 'keyboard-arrow-down' : 'pagination-right-arrow'}`} />
                                </div>
                            </div>
                        </td>
                    </tr>

                    {isOpen && Object.entries(group.capability).map(([capKey, capLabel]) => {
                        const hasExists =
                            storeTabSetting &&
                            Object.values(storeTabSetting).some((arr) => arr?.includes(capKey));

                        return (
                            <tr key={capKey}>
                                <td>{capLabel}</td>
                                {visibleColumns.map((col) =>
                                    renderCell(col, capKey, capLabel, undefined, hasExists)
                                )}
                            </tr>
                        );
                    })}
                </React.Fragment>
            );
        });
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            {proSetting && (
                <span className="admin-pro-tag">
                    <i className="adminfont-pro-tag" /> Pro
                </span>
            )}

            {/* Split shift toggle bar — only shown when configured */}
            {splitShiftToggle && (
                <SplitShiftToggleBar
                    config={splitShiftToggle}
                    enabled={splitShiftEnabled}
                    onChange={(val) => onChange(splitShiftToggle.key, val)}
                />
            )}

            <table className="grid-table">
                <thead>
                    <tr>
                        <th />
                        {visibleColumns.map((column) => (
                            <th key={column.key}>
                                {column.label}
                                {column?.proSetting && !khali_dabba && (
                                    <span className="admin-pro-tag">
                                        <i className="adminfont-pro-tag" /> Pro
                                    </span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(rows)
                        ? renderFlatRows(rows as Row[])
                        : renderGroupedRows(rows as GroupedRows)}
                </tbody>
            </table>
        </>
    );
};

// ─── FieldComponent wrapper ───────────────────────────────────────────────────

const MultiCheckboxTable: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer, modules, settings, onBlocked, storeTabSetting }) => {
        const currentSetting: FieldSetting =
            value && typeof value === 'object' && !Array.isArray(value)
                ? (value as FieldSetting)
                : (settings as FieldSetting) ?? {};

        const handleChange = (subKey: string, subVal: string[] | Option[] | ShiftTimeValue | boolean) => {
            if (!canAccess) return;
            onChange({ ...currentSetting, [subKey]: subVal });
        };

        return (
            <MultiCheckboxTableUI
                khali_dabba={appLocalizer?.khali_dabba ?? false}
                rows={field.rows ?? []}
                columns={field.columns ?? []}
                setting={currentSetting}
                storeTabSetting={storeTabSetting ?? {}}
                proSetting={field.proSetting ?? false}
                modules={modules ?? []}
                onBlocked={onBlocked}
                onChange={handleChange}
                splitShiftToggle={field.splitShiftToggle}
            />
        );
    },

    validate: () => null,
};

export default MultiCheckboxTable;