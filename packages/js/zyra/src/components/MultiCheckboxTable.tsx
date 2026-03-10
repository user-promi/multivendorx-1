// External dependencies
import React, { useState } from 'react';

// Internal dependencies
import '../styles/web/MultiCheckboxTable.scss';
import { FieldComponent } from './types';
import { FIELD_REGISTRY } from './FieldRegistry';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Option {
    value: string | number;
    label: string;
}

export interface ShiftTimeValue {
    start: string;
    end: string;
}

export type SettingValue = string[] | Option[] | ShiftTimeValue | boolean;
export type BatchChanges = Record<string, SettingValue>;
type FieldSetting = Record<string, SettingValue>;

// ── Column ────────────────────────────────────────────────────────────────────

export interface Column {
    key: string;
    label: string;
    type?: string;
    moduleEnabled?: string;
    proSetting?: string;
    visibleWhen?: string;
}

// ── Toggle ────────────────────────────────────────────────────────────────────

export interface ToggleConfig {
    key: string;
    label: string;
    icon?: string;
    group?: number;
    effects?: {
        hideTable?: boolean;
        disableColumns?: string[];
        mutuallyExclusiveWith?: string[];
    };
}

// ── Row ───────────────────────────────────────────────────────────────────────

interface Row {
    key: string;
    label: string;
    description?: string;
    enabledKey?: string;
    inactiveMessage?: string;
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

// ─── InlineToggleBar ──────────────────────────────────────────────────────────

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

interface TableCellProps {
    type: string
    fieldKey: string
    rowKey: string
    column: Column
    rowLabel: string
    value: SettingValue
    disabled?: boolean
    onChange: (key: string, value: SettingValue) => void
    modules: string[]
    appLocalizer: any
    onBlocked?: (type: 'pro' | 'module', payload?: string) => void
}

export const TableCell: React.FC<TableCellProps> = ({
    type,
    fieldKey,
    rowKey,
    column,
    rowLabel,
    value,
    disabled,
    onChange,
    modules,
    appLocalizer,
    onBlocked
}) => {
    const comp = FIELD_REGISTRY[type];

    if (!comp) {
        return <td key={fieldKey}>—</td>;
    }

    const Render = comp.render;

    // Pass EVERYTHING through - no hardcoded props
    const fieldConfig = {
        key: fieldKey,
        type: type,
        label: column.label ?? rowLabel,
        ...column,           // All column props pass through
        rowKey: rowKey,       // Row context
        rowLabel: rowLabel,
        disabled: disabled,
    };

    return (
        <td key={fieldKey}>
            <Render
                field={fieldConfig}
                value={value}
                modules={modules}
                appLocalizer={appLocalizer}
                onBlocked={onBlocked}
                canAccess={!disabled}
                onChange={(newValue: any) => {onChange(fieldKey, newValue)}}
            />
        </td>
    );
};

export const MultiCheckboxTableUI: React.FC<MultiCheckboxTableUIProps> = ({
    rows, columns, toggles = [], setting, onChange,
    storeTabSetting, proSetting, modules, onBlocked, khali_dabba,
}) => {
    const [openGroup, setOpenGroup] = useState<string | null>(() => {
        if (!Array.isArray(rows) && Object.keys(rows).length > 0) return Object.keys(rows)[0];
        return null;
    });

    const toggleGroups = toggles.reduce((groups, toggle) => {
        const group = toggle.group ?? 1;
        if (!groups[group]) groups[group] = [];
        groups[group].push(toggle);
        return groups;
    }, {} as Record<number, ToggleConfig[]>);

    const tableHidden = toggles.some((t) => t.effects?.hideTable && !Boolean(setting[t.key]));

    const disabledColumnKeys = new Set<string>(
        toggles.flatMap((t) => (Boolean(setting[t.key]) ? (t.effects?.disableColumns ?? []) : [])),
    );

    const visibleColumns = columns.filter((col) =>
        col.visibleWhen ? Boolean(setting[col.visibleWhen]) : true,
    );

    const handleToggleChange = (toggle: ToggleConfig, val: boolean) => {
        const batch: BatchChanges = { [toggle.key]: val };
        if (val) toggle.effects?.mutuallyExclusiveWith?.forEach((k) => { batch[k] = false; });
        onChange(batch);
    };


    // Layout only: resolve cellKey / type / disabled, then hand off to <TableCell>
    const renderCell = (
        column: Column,
        rowKey: string,
        rowLabel: string,
        rowOptions: Option[] | undefined,
        isRowActive: boolean,
    ) => {

        const fieldKey = `${column.key}_${rowKey}`
        const disabled = !isRowActive || disabledColumnKeys.has(column.key)

        const type =
            column.type ??
            (rowOptions?.length ? 'select' : 'checkbox')

        return (
            <TableCell
                type={type}
                fieldKey={fieldKey}
                rowKey={rowKey}
                column={column}
                rowLabel={rowLabel}
                rowOptions={rowOptions}
                value={setting[fieldKey]}
                disabled={disabled}
                onChange={onChange}
                modules={modules}
                appLocalizer={appLocalizer}
                onBlocked={onBlocked}
            />
        )
    };

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
                                <div className="default-checkbox table-checkbox">
                                    <input
                                        type="checkbox"
                                        id={`row-toggle_${row.key}`}
                                        checked={isRowActive}
                                        onChange={(e) => handleRowToggle(e.target.checked)}
                                    />
                                    <label htmlFor={`row-toggle_${row.key}`} className="checkbox-label" />
                                </div>
                                <span>{row.label}</span>
                            </div>
                        ) : row.label}
                    </td>
                    {!isRowActive ? (
                        <td colSpan={visibleColumns.length}>
                            <span className="row-inactive-message">{row.inactiveMessage ?? 'Inactive'}</span>
                        </td>
                    ) : (
                        visibleColumns.map((col) =>
                            renderCell(col, row.key, row.label, row.options, true, row.description),
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
                ? subKeyOrBatch
                : { [subKeyOrBatch]: subVal };
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