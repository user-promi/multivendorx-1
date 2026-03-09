// External dependencies
import React, { useState } from 'react';

// Internal dependencies
import '../styles/web/MultiCheckboxTable.scss';
import { FieldComponent } from './types';
import { SelectInputUI } from './SelectInput';
import { PopupUI } from './Popup';
import { BasicInputUI } from './BasicInput';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Option {
    value: string | number;
    label: string;
}

export interface ShiftTimeValue {
    start: string;
    end: string;
}

const DEFAULT_SHIFT_TIME: ShiftTimeValue = { start: '', end: '' };

// ── Column ────────────────────────────────────────────────────────────────────

export interface Column {
    key: string;
    label: string;
    /**
     * Cell renderer type.
     * Built-in: 'checkbox' | 'description' | 'select' | 'time-range'
     * Defaults to 'checkbox' (or 'select' when the row carries options).
     */
    type?: 'checkbox' | 'description' | 'select' | 'time-range';
    moduleEnabled?: string;
    proSetting?: string;
    /**
     * Column is only rendered when `Boolean(setting[visibleWhen])` is true.
     * Replaces the old isSplitShift / isLunchBreak flags.
     */
    visibleWhen?: string;

    // ── Legacy compat ──────────────────────────────────────────────────────
    /** @deprecated Use `visibleWhen: 'split_shift'` instead */
    isSplitShift?: boolean;
    /** @deprecated Use `visibleWhen: 'lunch_break'` instead */
    isLunchBreak?: boolean;
    /** @deprecated Use `type: 'time-range'` instead */
    shift?: boolean;
}

// ── Toggle ────────────────────────────────────────────────────────────────────

/**
 * Generic toggle pill rendered above the table.
 *
 * effects:
 *   hideTable      – when this toggle is OFF, the table (and row-2 toggles) are hidden
 *   disableColumns – when this toggle is ON, columns whose keys are listed are disabled
 *   mutuallyExclusiveWith – turning this ON turns the listed toggle keys OFF
 *
 * row: 1 = header row (always visible), 2 = secondary row (hidden while table is hidden)
 */
export interface ToggleConfig {
    key: string;
    label: string;
    icon?: string;
    row?: 1 | 2;
    effects?: {
        hideTable?: boolean;
        disableColumns?: string[];
        mutuallyExclusiveWith?: string[];
    };

    // ── Legacy compat ──────────────────────────────────────────────────────
    /** @deprecated Moved to effects.hideTable */
    hidesTable?: boolean;
    /** @deprecated Moved to effects.disableColumns (applied to all shift/time-range cols) */
    disablesShifts?: boolean;
}

// ── Row ───────────────────────────────────────────────────────────────────────

interface Row {
    key: string;
    label: string;
    description?: string;
    options?: Option[];
    enabledKey?: string;
}

interface CapabilityGroup {
    label: string;
    desc: string;
    capability: Record<string, string>;
}

type GroupedRows = Record<string, CapabilityGroup>;

type FieldSetting = Record<string, string[] | Option[] | ShiftTimeValue | boolean>;

// ── Component props ───────────────────────────────────────────────────────────

export type SettingValue = string[] | Option[] | ShiftTimeValue | boolean;
export type BatchChanges = Record<string, SettingValue>;

export interface MultiCheckboxTableUIProps {
    rows: Row[] | GroupedRows;
    columns: Column[];
    /**
     * Called for a single key change, OR with a batch object when multiple
     * keys must update atomically (e.g. mutual-exclusion toggle pairs).
     */
    onChange: (subKeyOrBatch: string | BatchChanges, value?: SettingValue) => void;
    setting: FieldSetting;
    proSetting?: boolean;
    modules: string[];
    storeTabSetting: Record<string, string[]>;
    khali_dabba: boolean;
    onBlocked?: (type: 'pro' | 'module', payload?: string) => void;

    /**
     * Unified toggle schema — preferred API.
     * Use `row: 1` for header toggles and `row: 2` for column toggles.
     */
    toggles?: ToggleConfig[];

    // ── Legacy props (still accepted, converted internally) ────────────────
    /** @deprecated Use `toggles` with `row: 1` */
    headerToggles?: (ToggleConfig & { hidesTable?: boolean; disablesShifts?: boolean })[];
    /** @deprecated Use `toggles` with `row: 2` + `effects.mutuallyExclusiveWith` */
    splitShiftToggle?: ToggleConfig & { hidesTable?: boolean; disablesShifts?: boolean };
    /** @deprecated Use `toggles` with `row: 2` + `effects.mutuallyExclusiveWith` */
    lunchBreakToggle?: ToggleConfig & { hidesTable?: boolean; disablesShifts?: boolean };
}

// ─── Legacy → unified schema adapter ─────────────────────────────────────────

/**
 * Converts the old headerToggles / splitShiftToggle / lunchBreakToggle props
 * into the new unified `ToggleConfig[]` schema so the rest of the component
 * only ever works with one format.
 */
const normalizeToggles = (props: Pick<
    MultiCheckboxTableUIProps,
    'toggles' | 'headerToggles' | 'splitShiftToggle' | 'lunchBreakToggle' | 'columns'
>): ToggleConfig[] => {
    if (props.toggles) return props.toggles;

    const result: ToggleConfig[] = [];

    // Header toggles → row 1
    for (const t of props.headerToggles ?? []) {
        result.push({
            ...t,
            row: 1,
            effects: {
                hideTable: t.hidesTable ?? t.effects?.hideTable,
                disableColumns: t.disablesShifts
                    ? props.columns.filter((c) => c.type === 'time-range' || c.shift).map((c) => c.key)
                    : t.effects?.disableColumns,
                mutuallyExclusiveWith: t.effects?.mutuallyExclusiveWith,
            },
        });
    }

    // splitShiftToggle / lunchBreakToggle → row 2, mutually exclusive with each other
    const ssKey = props.splitShiftToggle?.key;
    const lbKey = props.lunchBreakToggle?.key;

    if (props.lunchBreakToggle) {
        result.push({
            ...props.lunchBreakToggle,
            row: 2,
            effects: {
                ...props.lunchBreakToggle.effects,
                mutuallyExclusiveWith: ssKey ? [ssKey] : props.lunchBreakToggle.effects?.mutuallyExclusiveWith,
            },
        });
    }

    if (props.splitShiftToggle) {
        result.push({
            ...props.splitShiftToggle,
            row: 2,
            effects: {
                ...props.splitShiftToggle.effects,
                mutuallyExclusiveWith: lbKey ? [lbKey] : props.splitShiftToggle.effects?.mutuallyExclusiveWith,
            },
        });
    }

    return result;
};

/**
 * Normalises a column so that legacy `isSplitShift` / `isLunchBreak` / `shift`
 * flags are converted to the new `visibleWhen` / `type` properties.
 */
const normalizeColumn = (col: Column): Column => ({
    ...col,
    type: col.type ?? (col.shift ? 'time-range' : undefined),
    visibleWhen: col.visibleWhen
        ?? (col.isSplitShift ? 'split_shift' : col.isLunchBreak ? 'lunch_break' : undefined),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalizeShiftTime = (raw: unknown): ShiftTimeValue => {
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        const r = raw as Partial<ShiftTimeValue>;
        return {
            start: typeof r.start === 'string' ? r.start : '',
            end: typeof r.end === 'string' ? r.end : '',
        };
    }
    return { ...DEFAULT_SHIFT_TIME };
};

// ─── Primitive sub-components ─────────────────────────────────────────────────

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

interface InlineToggleBarProps {
    config: ToggleConfig;
    enabled: boolean;
    disabled?: boolean;
    onChange: (val: boolean) => void;
}

const InlineToggleBar: React.FC<InlineToggleBarProps> = ({ config, enabled, disabled = false, onChange }) => (
    <div className={`inline-toggle-bar${enabled ? ' inline-toggle-bar--active' : ''}${disabled ? ' inline-toggle-bar--disabled' : ''}`}>
        {config.icon && <i className={`adminfont-${config.icon}`} />}
        <span className="inline-toggle-bar__label">{config.label}</span>
        <div className="toggle-checkbox inline-toggle-bar__toggle">
            <input
                type="checkbox"
                id={`inline-toggle-${config.key}`}
                checked={enabled}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
            />
            <label htmlFor={`inline-toggle-${config.key}`} className="checkbox-label" />
        </div>
    </div>
);

// ─── Cell renderers ───────────────────────────────────────────────────────────

interface CellSelectProps {
    settingKey: string;
    rowLabel: string;
    rowOptions: Option[];
    currentValue: Option[];
    onChange: (key: string, value: Option[]) => void;
    isBlocked: () => boolean;
    disabled?: boolean;
}

const TableCellSelect: React.FC<CellSelectProps> = ({
    settingKey, rowLabel, rowOptions, currentValue, onChange, isBlocked, disabled = false,
}) => {
    const [popupOpen, setPopupOpen] = useState(false);

    const optionStrings = rowOptions.map((o) => ({ value: String(o.value), label: o.label }));
    const selectedStrings = currentValue.map((v) => String(v.value));

    const handleChange = (raw: string | string[]) => {
        if (isBlocked()) return;
        const selected = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const resolved: Option[] = selected.map(
            (s) => rowOptions.find((o) => String(o.value) === s) ?? { value: s, label: s },
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
            />
            <PopupUI
                position="lightbox"
                open={popupOpen}
                onClose={() => setPopupOpen(false)}
                showBackdrop
                width={28}
                header={{ title: rowLabel, showCloseButton: true }}
            >
                <SelectInputUI {...sharedSelectProps} />
            </PopupUI>
        </>
    );
};

interface CellTimeRangeProps {
    settingKey: string;
    value: ShiftTimeValue;
    onChange: (key: string, value: ShiftTimeValue) => void;
    isBlocked: () => boolean;
    disabled?: boolean;
}

const TableCellTimeRange: React.FC<CellTimeRangeProps> = ({
    settingKey, value, onChange, isBlocked, disabled = false,
}) => {
    const handleChange = (field: keyof ShiftTimeValue, newVal: string) => {
        if (isBlocked() || disabled) return;
        onChange(settingKey, { ...value, [field]: newVal });
    };

    return (
        <div className={`shift-time-cell${disabled ? ' shift-time-cell--disabled' : ''}`}>
            <BasicInputUI
                type="time"
                value={value.start}
                disabled={disabled}
                onChange={(v) => handleChange('start', v)}
            />
            <span className="shift-time-cell__sep">–</span>
            <BasicInputUI
                type="time"
                value={value.end}
                disabled={disabled}
                onChange={(v) => handleChange('end', v)}
            />
        </div>
    );
};

// ─── Cell renderer registry ───────────────────────────────────────────────────
// Add new cell types here without touching any other part of the component.


type CellRenderer = (args: {
    column: Column
    rowKey: string
    rowLabel: string
    rowOptions?: Option[]
    setting: FieldSetting
    cellKey: string
    isRowActive: boolean
    isColDisabled: boolean
    onChange: MultiCheckboxTableUIProps["onChange"]
    isBlocked: () => boolean
}) => React.ReactNode

const CELL_RENDERERS: Record<string, CellRenderer> = {

    description: ({ rows, rowKey }) => {
        const row = Array.isArray(rows)
            ? rows.find((r: Row) => r.key === rowKey)
            : undefined

        return <td key={`desc_${rowKey}`}>{row?.description ?? '—'}</td>
    },

    "time-range": ({ cellKey, setting, isBlocked, isRowActive, isColDisabled, onChange }) => (
        <td key={cellKey} className="shift-td">
            <TableCellTimeRange
                settingKey={cellKey}
                value={normalizeShiftTime(setting[cellKey])}
                onChange={(key, val) => { if (!isBlocked()) onChange(key, val) }}
                isBlocked={isBlocked}
                disabled={!isRowActive || isColDisabled}
            />
        </td>
    ),

    select: ({ cellKey, setting, rowLabel, rowOptions, isBlocked, isRowActive, isColDisabled, onChange }) => {

        const rawVal = setting[cellKey]

        const cellValue: Option[] = Array.isArray(rawVal)
            ? rawVal.filter(v => v && typeof v === 'object' && 'value' in v)
            : []

        return (
            <td key={cellKey}>
                <TableCellSelect
                    settingKey={cellKey}
                    rowLabel={rowLabel}
                    rowOptions={rowOptions ?? []}
                    currentValue={cellValue}
                    onChange={onChange}
                    isBlocked={isBlocked}
                    disabled={!isRowActive || isColDisabled}
                />
            </td>
        )
    }

}

// ─── MultiCheckboxTableUI ─────────────────────────────────────────────────────

export const MultiCheckboxTableUI: React.FC<MultiCheckboxTableUIProps> = (props) => {
    const {
        rows,
        onChange,
        setting,
        storeTabSetting,
        proSetting,
        modules,
        onBlocked,
        khali_dabba,
    } = props;

    // ── Normalise legacy props into unified schema ─────────────────────────
    const toggles = normalizeToggles(props);
    const normalizedCols = (props.columns ?? []).map(normalizeColumn);

    // ── Group toggles by row ───────────────────────────────────────────────
    const row1Toggles = toggles.filter((t) => (t.row ?? 1) === 1);
    const row2Toggles = toggles.filter((t) => t.row === 2);

    // ── Derive active effects from current setting values ─────────────────
    const tableHidden = toggles.some(
        (t) => t.effects?.hideTable && !Boolean(setting[t.key]),
    );

    const disabledColumnKeys = new Set<string>(
        toggles.flatMap((t) =>
            Boolean(setting[t.key]) ? (t.effects?.disableColumns ?? []) : [],
        ),
    );

    // ── Visible columns ────────────────────────────────────────────────────
    const visibleColumns = normalizedCols.filter((col) =>
        col.visibleWhen ? Boolean(setting[col.visibleWhen]) : true,
    );

    // ── Toggle change handler (handles mutual exclusion generically) ───────
    // All related keys are emitted in ONE batched call so the FieldComponent
    // wrapper merges them atomically — preventing stale-closure overwrites
    // when mutual exclusion turns OFF a second key in the same interaction.
    const handleToggleChange = (toggle: ToggleConfig, val: boolean) => {
        const batch: BatchChanges = { [toggle.key]: val };
        if (val && toggle.effects?.mutuallyExclusiveWith) {
            toggle.effects.mutuallyExclusiveWith.forEach((k) => { batch[k] = false; });
        }
        onChange(batch);
    };

    // ── Block checker ──────────────────────────────────────────────────────
    const makeBlockChecker = (column: Column) => (): boolean => {
        if (column.proSetting && !khali_dabba) { onBlocked?.('pro'); return true; }
        if (column.moduleEnabled && !modules.includes(column.moduleEnabled)) {
            onBlocked?.('module', column.moduleEnabled); return true;
        }
        return false;
    };

    // ── Cell renderer ──────────────────────────────────────────────────────
    const renderCell = (
        column: Column,
        rowKey: string,
        rowLabel: string,
        rowOptions: Option[] | undefined,
        isRowActive: boolean,
    ) => {
        const isBlocked = makeBlockChecker(column);
        const isColDisabled = disabledColumnKeys.has(column.key);
        const cellKey = `${column.key}_${rowKey}`;

        // Resolve effective cell type:
        // 1. explicit column.type
        // 2. 'select' when the row carries options
        // 3. default 'checkbox'
        const effectiveType =
            column.type ?? (rowOptions?.length ? "select" : "checkbox")

        const renderer = CELL_RENDERERS[effectiveType]

        if (renderer) {
            return renderer({
                column,
                rowKey,
                rowLabel,
                rowOptions,
                setting,
                cellKey,
                isRowActive,
                isColDisabled,
                onChange,
                isBlocked
            })
        }

        const columnValues = setting[column.key] as string[] | undefined
        const isChecked = columnValues?.includes(rowKey) ?? false

        return (
            <td key={`${column.key}_${rowKey}`}>
                <TableCheckbox
                    id={`chk_${column.key}_${rowKey}`}
                    checked={isChecked}
                    disabled={!isRowActive || isColDisabled}
                    onChange={(checked) => {
                        if (makeBlockChecker(column)()) return;
                        const current = Array.isArray(setting[column.key])
                            ? (setting[column.key] as string[])
                            : [];
                        onChange(
                            column.key,
                            checked ? [...current, rowKey] : current.filter((k) => k !== rowKey),
                        );
                    }}
                />
            </td>
        );
    };

    // ── Flat rows ──────────────────────────────────────────────────────────
    const renderFlatRows = (flatRows: Row[]) =>
        flatRows.map((row) => {
            const isRowActive = row.enabledKey
                ? (setting[row.enabledKey] as string[] | undefined)?.includes(row.key) ?? false
                : true;

            const handleRowToggle = (checked: boolean) => {
                const current = (setting[row.enabledKey!] as string[]) ?? [];
                onChange(
                    row.enabledKey!,
                    checked ? [...current, row.key] : current.filter((k) => k !== row.key),
                );
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
                        renderCell(col, row.key, row.label, row.options, isRowActive),
                    )}
                </tr>
            );
        });

    // ── Grouped rows ───────────────────────────────────────────────────────
    const [openGroup, setOpenGroup] = useState<string | null>(() => {
        if (!Array.isArray(rows) && rows && Object.keys(rows).length > 0) {
            return Object.keys(rows)[0];
        }
        return null;
    });

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
                    {isOpen &&
                        Object.entries(group.capability).map(([capKey, capLabel]) => {
                            const hasExists =
                                storeTabSetting &&
                                Object.values(storeTabSetting).some((arr) => arr?.includes(capKey));
                            return (
                                <tr key={capKey}>
                                    <td>{capLabel}</td>
                                    {visibleColumns.map((col) =>
                                        renderCell(col, capKey, capLabel, undefined, hasExists),
                                    )}
                                </tr>
                            );
                        })}
                </React.Fragment>
            );
        });
    };

    // ── Derive disabled state for row-2 toggles (mutual exclusion UI) ─────
    const isToggleDisabled = (toggle: ToggleConfig): boolean =>
        (toggle.effects?.mutuallyExclusiveWith ?? []).some((k) => Boolean(setting[k]));

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <>
            {proSetting && (
                <span className="admin-pro-tag">
                    <i className="adminfont-pro-tag" /> Pro
                </span>
            )}

            {/* Row 1: header toggles */}
            {row1Toggles.length > 0 && (
                <div className="inline-toggle-bar-row">
                    {row1Toggles.map((t) => (
                        <InlineToggleBar
                            key={t.key}
                            config={t}
                            enabled={Boolean(setting[t.key])}
                            onChange={(val) => handleToggleChange(t, val)}
                        />
                    ))}
                </div>
            )}

            {/* Row 2: column toggles — only shown when table is visible */}
            {!tableHidden && row2Toggles.length > 0 && (
                <div className="inline-toggle-bar-row">
                    {row2Toggles.map((t) => (
                        <InlineToggleBar
                            key={t.key}
                            config={t}
                            enabled={Boolean(setting[t.key])}
                            disabled={isToggleDisabled(t)}
                            onChange={(val) => handleToggleChange(t, val)}
                        />
                    ))}
                </div>
            )}

            {/* Table */}
            {!tableHidden && (
                <table className="grid-table">
                    <thead>
                        <tr>
                            <th />
                            {visibleColumns.map((column) => (
                                <th key={column.key}>
                                    {column.label}
                                    {column.proSetting && !khali_dabba && (
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
            )}
        </>
    );
};

// ─── FieldComponent wrapper ───────────────────────────────────────────────────

const MultiCheckboxTable: FieldComponent = {
    render: ({
        field,
        value,
        onChange,
        canAccess,
        appLocalizer,
        modules,
        settings,
        onBlocked,
        storeTabSetting,
    }) => {
        const currentSetting: FieldSetting =
            value && typeof value === 'object' && !Array.isArray(value)
                ? (value as FieldSetting)
                : (settings as FieldSetting) ?? {};

        const handleChange = (
            subKeyOrBatch: string | BatchChanges,
            subVal?: SettingValue,
        ) => {
            if (!canAccess) return;
            if (typeof subKeyOrBatch === 'object') {
                // Batch: merge all keys atomically so mutual-exclusion toggles
                // don't overwrite each other through stale currentSetting closures.
                onChange({ ...currentSetting, ...subKeyOrBatch });
            } else {
                onChange({ ...currentSetting, [subKeyOrBatch]: subVal });
            }
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
                // New unified API
                toggles={field.toggles}
                // Legacy props — still forwarded for backward compatibility
                headerToggles={field.headerToggles}
                splitShiftToggle={field.splitShiftToggle}
                lunchBreakToggle={field.lunchBreakToggle}
            />
        );
    },

    validate: () => null,
};

export default MultiCheckboxTable;