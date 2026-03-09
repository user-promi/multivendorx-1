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

export type SettingValue = string[] | Option[] | ShiftTimeValue | boolean;
export type BatchChanges  = Record<string, SettingValue>;
type FieldSetting         = Record<string, SettingValue>;

// ── Column ────────────────────────────────────────────────────────────────────

export interface Column {
    key: string;
    label: string;
    /** Defaults to 'checkbox', or 'select' when the row carries options. */
    type?: 'checkbox' | 'description' | 'select' | 'time-range';
    moduleEnabled?: string;
    proSetting?: string;
    /** Column renders only when Boolean(setting[visibleWhen]) is true. */
    visibleWhen?: string;
}

// ── Toggle ────────────────────────────────────────────────────────────────────

export interface ToggleConfig {
    key: string;
    label: string;
    icon?: string;
    /** 1 = always-visible header row, 2 = secondary row (hidden while table is hidden). */
    group?: number
    effects?: {
        /** When this toggle is OFF the table and row-2 toggles are hidden. */
        hideTable?: boolean;
        /** When this toggle is ON, the listed column keys are disabled. */
        disableColumns?: string[];
        /** Turning this toggle ON turns the listed toggle keys OFF. */
        mutuallyExclusiveWith?: string[];
    };
}

// ── Row ───────────────────────────────────────────────────────────────────────

interface Row {
    key: string;
    label: string;
    description?: string;
    options?: Option[];
    enabledKey?: string;
    inactiveMessage?: string
}

interface CapabilityGroup {
    label: string;
    desc: string;
    capability: Record<string, string>;
}

type GroupedRows = Record<string, CapabilityGroup>;

// ── Component props ───────────────────────────────────────────────────────────

export interface MultiCheckboxTableUIProps {
    rows: Row[] | GroupedRows;
    columns: Column[];
    toggles?: ToggleConfig[];
    setting: FieldSetting;
    onChange: (subKeyOrBatch: string | BatchChanges, value?: SettingValue) => void;
    proSetting?: boolean;
    modules: string[];
    storeTabSetting: Record<string, string[]>;
    khali_dabba: boolean;
    onBlocked?: (type: 'pro' | 'module', payload?: string) => void;
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

// ─── Sub-components ───────────────────────────────────────────────────────────

const TableCheckbox: React.FC<{
    id: string;
    checked: boolean;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
}> = ({ id, checked, disabled = false, onChange }) => (
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

const InlineToggleBar: React.FC<{
    config: ToggleConfig;
    enabled: boolean;
    disabled?: boolean;
    onChange: (val: boolean) => void;
}> = ({ config, enabled, disabled = false, onChange }) => (
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

const TableCellSelect: React.FC<{
    settingKey: string;
    rowLabel: string;
    rowOptions: Option[];
    currentValue: Option[];
    onChange: (key: string, value: Option[]) => void;
    isBlocked: () => boolean;
    disabled?: boolean;
}> = ({ settingKey, rowLabel, rowOptions, currentValue, onChange, isBlocked, disabled = false }) => {
    const [popupOpen, setPopupOpen] = useState(false);

    const optionStrings   = rowOptions.map((o) => ({ value: String(o.value), label: o.label }));
    const selectedStrings = currentValue.map((v) => String(v.value));

    const handleChange = (raw: string | string[]) => {
        if (isBlocked()) return;
        const selected = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const resolved: Option[] = selected.map(
            (s) => rowOptions.find((o) => String(o.value) === s) ?? { value: s, label: s },
        );
        onChange(settingKey, resolved);
    };

    const sharedProps = {
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
            <SelectInputUI {...sharedProps} maxVisibleItems={2} onOverflowClick={() => setPopupOpen(true)} />
            <PopupUI
                position="lightbox"
                open={popupOpen}
                onClose={() => setPopupOpen(false)}
                showBackdrop
                width={28}
                header={{ title: rowLabel, showCloseButton: true }}
            >
                <SelectInputUI {...sharedProps} />
            </PopupUI>
        </>
    );
};

const TableCellTimeRange: React.FC<{
    settingKey: string;
    value: ShiftTimeValue;
    onChange: (key: string, value: ShiftTimeValue) => void;
    isBlocked: () => boolean;
    disabled?: boolean;
}> = ({ settingKey, value, onChange, isBlocked, disabled = false }) => {
    const handleChange = (field: keyof ShiftTimeValue, newVal: string) => {
        if (isBlocked() || disabled) return;
        onChange(settingKey, { ...value, [field]: newVal });
    };

    return (
        <div className={`shift-time-cell${disabled ? ' shift-time-cell--disabled' : ''}`}>
            <BasicInputUI type="time" value={value.start} disabled={disabled} onChange={(v) => handleChange('start', v)} />
            <span className="shift-time-cell__sep">–</span>
            <BasicInputUI type="time" value={value.end}   disabled={disabled} onChange={(v) => handleChange('end',   v)} />
        </div>
    );
};

// ─── MultiCheckboxTableUI ─────────────────────────────────────────────────────

export const MultiCheckboxTableUI: React.FC<MultiCheckboxTableUIProps> = ({
    rows,
    columns,
    toggles = [],
    setting,
    onChange,
    storeTabSetting,
    proSetting,
    modules,
    onBlocked,
    khali_dabba,
}) => {
    const [openGroup, setOpenGroup] = useState<string | null>(() => {
        if (!Array.isArray(rows) && Object.keys(rows).length > 0) return Object.keys(rows)[0];
        return null;
    });

    // ── Derived toggle state ───────────────────────────────────────────────

    const toggleGroups = toggles.reduce((groups, toggle) => {
        const group = toggle.group ?? 1
        if (!groups[group]) groups[group] = []
        groups[group].push(toggle)
        return groups
    }, {} as Record<number, ToggleConfig[]>)

    const tableHidden = toggles.some((t) => t.effects?.hideTable && !Boolean(setting[t.key]));

    const disabledColumnKeys = new Set<string>(
        toggles.flatMap((t) => Boolean(setting[t.key]) ? (t.effects?.disableColumns ?? []) : []),
    );

    // ── Visible columns ────────────────────────────────────────────────────

    const visibleColumns = columns.filter((col) =>
        col.visibleWhen ? Boolean(setting[col.visibleWhen]) : true,
    );

    // ── Toggle handler — batches all mutual-exclusion keys in one update ───

    const handleToggleChange = (toggle: ToggleConfig, val: boolean) => {
        const batch: BatchChanges = { [toggle.key]: val };
        if (val) toggle.effects?.mutuallyExclusiveWith?.forEach((k) => { batch[k] = false; });
        onChange(batch);
    };

    // ── Block checker ──────────────────────────────────────────────────────

    const makeIsBlocked = (column: Column) => (): boolean => {
        if (column.proSetting && !khali_dabba)                           { onBlocked?.('pro');                          return true; }
        if (column.moduleEnabled && !modules.includes(column.moduleEnabled)) { onBlocked?.('module', column.moduleEnabled); return true; }
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
        const isBlocked     = makeIsBlocked(column);
        const isColDisabled = disabledColumnKeys.has(column.key);
        const cellKey       = `${column.key}_${rowKey}`;
        const effectiveType = column.type ?? (rowOptions?.length ? 'select' : 'checkbox');

        if (effectiveType === 'description') {
            const row = Array.isArray(rows) ? (rows as Row[]).find((r) => r.key === rowKey) : undefined;
            return <td key={`desc_${rowKey}`}>{row?.description ?? '—'}</td>;
        }

        if (effectiveType === 'time-range') {
            return (
                <td key={cellKey} className="shift-td">
                    <TableCellTimeRange
                        settingKey={cellKey}
                        value={normalizeShiftTime(setting[cellKey])}
                        onChange={(key, val) => { if (!isBlocked()) onChange(key, val); }}
                        isBlocked={isBlocked}
                        disabled={isColDisabled}
                    />
                </td>
            );
        }

        if (effectiveType === 'select') {
            const rawVal    = setting[cellKey];
            const cellValue = Array.isArray(rawVal)
                ? (rawVal as any[]).filter((v) => v && typeof v === 'object' && 'value' in v) as Option[]
                : [];
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
            );
        }

        // Default: checkbox
        const colValues = setting[column.key];
        const isChecked = Array.isArray(colValues) && (colValues as string[]).includes(rowKey);

        return (
            <td key={`${column.key}_${rowKey}`}>
                <TableCheckbox
                    id={`chk_${column.key}_${rowKey}`}
                    checked={isChecked}
                    disabled={!isRowActive || isColDisabled}
                    onChange={(checked) => {
                        if (isBlocked()) return;
                        const current = Array.isArray(colValues) ? (colValues as string[]) : [];
                        onChange(column.key, checked ? [...current, rowKey] : current.filter((k) => k !== rowKey));
                    }}
                />
            </td>
        );
    };

    // ── Row renderers ──────────────────────────────────────────────────────

    const renderFlatRows = (flatRows: Row[]) =>
        flatRows.map((row) => {
            const isRowActive = row.enabledKey
                ? (setting[row.enabledKey] as string[] | undefined)?.includes(row.key) ?? false
                : true;

            const handleRowToggle = (checked: boolean) => {
                const current = (setting[row.enabledKey!] as string[]) ?? [];
                onChange(row.enabledKey!, checked ? [...current, row.key] : current.filter((k) => k !== row.key));
            };

            return (
                <tr key={row.key} className={row.enabledKey && !isRowActive ? 'row-disabled' : ''}>
                    <td>
                        {row.enabledKey ? (
                            <div className="row-label-toggle">
                                <TableCheckbox id={`row-toggle_${row.key}`} checked={isRowActive} onChange={handleRowToggle} />
                                <span>{row.label}</span>
                            </div>
                        ) : row.label}
                    </td>
                    {!isRowActive ? (
                        <td colSpan={visibleColumns.length}>
                            <span className="row-inactive-message">
                                {row.inactiveMessage ?? "Inactive"}
                            </span>
                        </td>
                    ) : (
                        visibleColumns.map((col) =>
                            renderCell(col, row.key, row.label, row.options, true),
                        )
                    )}
                </tr>
            );
        });

    const renderGroupedRows = (groupedRows: GroupedRows) => {
        const totalCols = visibleColumns.length + 1;
        return Object.entries(groupedRows).map(([groupKey, group]) => {
            const isOpen = openGroup === groupKey;
            return (
                <React.Fragment key={groupKey}>
                    <tr className="toggle-header-row">
                        <td colSpan={totalCols}>
                            <div className="toggle-header" onClick={() => setOpenGroup(isOpen ? null : groupKey)}>
                                <div className="header-title">
                                    {group.label}
                                    <i className={`adminfont-${isOpen ? 'keyboard-arrow-down' : 'pagination-right-arrow'}`} />
                                </div>
                            </div>
                        </td>
                    </tr>
                    {isOpen && Object.entries(group.capability).map(([capKey, capLabel]) => {
                        const hasExists = Object.values(storeTabSetting).some((arr) => arr?.includes(capKey));
                        return (
                            <tr key={capKey}>
                                <td>{capLabel}</td>
                                {visibleColumns.map((col) => renderCell(col, capKey, capLabel, undefined, hasExists))}
                            </tr>
                        );
                    })}
                </React.Fragment>
            );
        });
    };

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <>
            {proSetting && (
                <span className="admin-pro-tag"><i className="adminfont-pro-tag" /> Pro</span>
            )}

            {Object.entries(toggleGroups).map(([group, groupToggles]) => (
            <div className="inline-toggle-bar-row" key={group}>
                {groupToggles.map((t) => (
                    <InlineToggleBar
                        key={t.key}
                        config={t}
                        enabled={Boolean(setting[t.key])}
                        disabled={(t.effects?.mutuallyExclusiveWith ?? []).some((k) => Boolean(setting[k]))}
                        onChange={(val) => handleToggleChange(t, val)}
                    />
                ))}
            </div>
            ))}

            {!tableHidden && (
                <table className="grid-table">
                    <thead>
                        <tr>
                            <th />
                            {visibleColumns.map((column) => (
                                <th key={column.key}>
                                    {column.label}
                                    {column.proSetting && !khali_dabba && (
                                        <span className="admin-pro-tag"><i className="adminfont-pro-tag" /> Pro</span>
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
    render: ({ field, value, onChange, canAccess, appLocalizer, modules, settings, onBlocked, storeTabSetting }) => {
        const currentSetting: FieldSetting =
            value && typeof value === 'object' && !Array.isArray(value)
                ? (value as FieldSetting)
                : (settings as FieldSetting) ?? {};

        const handleChange = (subKeyOrBatch: string | BatchChanges, subVal?: SettingValue) => {
            if (!canAccess) return;
            const patch = typeof subKeyOrBatch === 'object'
                ? subKeyOrBatch                          // batch: merge all keys atomically
                : { [subKeyOrBatch]: subVal };           // single key
            onChange({ ...currentSetting, ...patch });
        };

        return (
            <MultiCheckboxTableUI
                khali_dabba={appLocalizer?.khali_dabba ?? false}
                rows={field.rows ?? []}
                columns={field.columns ?? []}
                toggles={field.toggles}
                setting={currentSetting}
                storeTabSetting={storeTabSetting ?? {}}
                proSetting={field.proSetting ?? false}
                modules={modules ?? []}
                onBlocked={onBlocked}
                onChange={handleChange}
            />
        );
    },

    validate: () => null,
};

export default MultiCheckboxTable;