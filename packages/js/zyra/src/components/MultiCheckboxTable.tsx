import React, { useState } from 'react';
import '../styles/web/MultiCheckboxTable.scss';
import { FieldComponent } from './types';
import { SelectInputUI } from './SelectInput';
import { PopupUI } from './Popup';
import { BasicInputUI } from './BasicInput';
import { FIELD_REGISTRY } from './FieldRegistry';

interface Option { value: string | number; label: string; }
export interface ShiftTimeValue { start: string; end: string; }
export type SettingValue = string[] | Option[] | ShiftTimeValue | boolean;
export type BatchChanges = Record<string, SettingValue>;
type FieldSetting = Record<string, SettingValue>;

export interface Column {
    key: string; label: string; type?: string; options?: Option[]; moduleEnabled?: string;
    proSetting?: string; visibleWhen?: string; maxVisibleItems?: number; onOverflowClick?: () => void;
    className?: string; wrapperClass?: string; placeholder?: string; isClearable?: boolean;
}

export interface ToggleConfig {
    key: string; label: string; icon?: string; group?: number;
    effects?: { hideTable?: boolean; disableColumns?: string[]; mutuallyExclusiveWith?: string[]; };
}

interface Row { key: string; label: string; description?: string; options?: Option[]; enabledKey?: string; inactiveMessage?: string; }
interface CapabilityGroup { label: string; desc: string; capability: Record<string, string>; }
type GroupedRows = Record<string, CapabilityGroup>;

export interface MultiCheckboxTableUIProps {
    rows: Row[] | GroupedRows; columns: Column[]; toggles?: ToggleConfig[]; setting: FieldSetting;
    onChange: (subKeyOrBatch: string | BatchChanges, value?: SettingValue) => void;
    proSetting?: boolean; modules: string[]; storeTabSetting: Record<string, string[]>;
    khali_dabba: boolean; onBlocked?: (type: 'pro' | 'module', payload?: string) => void;
}

const InlineToggleBar: React.FC<{ config: ToggleConfig; enabled: boolean; disabled?: boolean; onChange: (val: boolean) => void; }> = 
({ config, enabled, disabled = false, onChange }) => (
    <div className={`inline-toggle-bar${enabled ? ' inline-toggle-bar--active' : ''}${disabled ? ' inline-toggle-bar--disabled' : ''}`}>
        {config.icon && <i className={`adminfont-${config.icon}`} />}
        <span className="inline-toggle-bar__label">{config.label}</span>
        <div className="toggle-checkbox inline-toggle-bar__toggle">
            <input type="checkbox" id={`inline-toggle-${config.key}`} checked={enabled} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
            <label htmlFor={`inline-toggle-${config.key}`} className="checkbox-label" />
        </div>
    </div>
);

interface TableCellProps {
    type: string; fieldKey: string; rowKey: string; column: Column; rowLabel: string;
    rowOptions?: Option[]; value: SettingValue; disabled?: boolean;
    onChange: (key: string, value: SettingValue) => void; modules: string[];
    appLocalizer: any; onBlocked?: (type: 'pro' | 'module', payload?: string) => void;
}

export const TableCell: React.FC<TableCellProps> = ({ type, fieldKey, column, rowLabel, rowOptions, value, disabled, onChange, modules, appLocalizer, onBlocked }) => {
    const comp = FIELD_REGISTRY[type];
    if (!comp) return <td key={fieldKey}>—</td>;
    
    const options = (column.options ?? rowOptions ?? []).map(opt => ({ value: String(opt.value), label: opt.label ?? String(opt.value) }));
    const field = { key: fieldKey, type, label: column.label ?? rowLabel, options, maxVisibleItems: column.maxVisibleItems ?? 2, onOverflowClick: column.onOverflowClick, className: column.className, wrapperClass: column.wrapperClass, placeholder: column.placeholder, isClearable: column.isClearable };

    return (
        <td key={fieldKey}>
            <comp.render field={field} value={value} modules={modules} appLocalizer={appLocalizer} onBlocked={onBlocked} canAccess={!disabled} onChange={(val: SettingValue) => onChange(fieldKey, val)} />
        </td>
    );
};

export const MultiCheckboxTableUI: React.FC<MultiCheckboxTableUIProps> = ({ rows, columns, toggles = [], setting, onChange, storeTabSetting, proSetting, modules, onBlocked, khali_dabba }) => {
    const [openGroup, setOpenGroup] = useState<string | null>(() => !Array.isArray(rows) && Object.keys(rows).length > 0 ? Object.keys(rows)[0] : null);
    
    const toggleGroups = toggles.reduce((groups, t) => { const g = t.group ?? 1; groups[g] = groups[g] || []; groups[g].push(t); return groups; }, {} as Record<number, ToggleConfig[]>);
    const tableHidden = toggles.some((t) => t.effects?.hideTable && !Boolean(setting[t.key]));
    const disabledCols = new Set(toggles.flatMap((t) => Boolean(setting[t.key]) ? (t.effects?.disableColumns ?? []) : []));
    const visibleCols = columns.filter((col) => col.visibleWhen ? Boolean(setting[col.visibleWhen]) : true);

    const handleToggle = (t: ToggleConfig, val: boolean) => {
        const batch: BatchChanges = { [t.key]: val };
        if (val) t.effects?.mutuallyExclusiveWith?.forEach((k) => { batch[k] = false; });
        onChange(batch);
    };

    const renderCell = (col: Column, rowKey: string, rowLabel: string, rowOptions?: Option[], active = true) => {
        const fieldKey = `${col.key}_${rowKey}`;
        return <TableCell type={col.type ?? (rowOptions?.length ? 'select' : 'checkbox')} fieldKey={fieldKey} rowKey={rowKey} column={col} rowLabel={rowLabel} rowOptions={rowOptions} value={setting[fieldKey]} disabled={!active || disabledCols.has(col.key)} onChange={onChange} modules={modules} appLocalizer={appLocalizer} onBlocked={onBlocked} />;
    };

    const renderFlatRows = (flatRows: Row[]) => flatRows.map((row) => {
        const active = row.enabledKey ? (setting[row.enabledKey] as string[] | undefined)?.includes(row.key) ?? false : true;
        const toggleRow = (checked: boolean) => { const curr = (setting[row.enabledKey!] as string[]) ?? []; onChange(row.enabledKey!, checked ? [...curr, row.key] : curr.filter((k) => k !== row.key)); };
        return (
            <tr key={row.key} className={row.enabledKey && !active ? 'row-disabled' : ''}>
                <td>{row.enabledKey ? <div className="row-label-toggle"><div className="default-checkbox table-checkbox"><input type="checkbox" id={`row-toggle_${row.key}`} checked={active} onChange={(e) => toggleRow(e.target.checked)} /><label htmlFor={`row-toggle_${row.key}`} className="checkbox-label" /></div><span>{row.label}</span></div> : row.label}</td>
                {!active ? <td colSpan={visibleCols.length}><span className="row-inactive-message">{row.inactiveMessage ?? 'Inactive'}</span></td> : visibleCols.map((col) => renderCell(col, row.key, row.label, row.options, true))}
            </tr>
        );
    });

    const renderGroupedRows = (grouped: GroupedRows) => {
        const totalCols = visibleCols.length + 1;
        return Object.entries(grouped).map(([key, g]) => (
            <React.Fragment key={key}>
                <tr className="toggle-header-row"><td colSpan={totalCols}><div className="toggle-header" onClick={() => setOpenGroup(openGroup === key ? null : key)}><div className="header-title">{g.label}<i className={`adminfont-${openGroup === key ? 'keyboard-arrow-down' : 'pagination-right-arrow'}`} /></div></div></td></tr>
                {openGroup === key && Object.entries(g.capability).map(([capKey, capLabel]) => {
                    const exists = Object.values(storeTabSetting).some((arr) => arr?.includes(capKey));
                    return <tr key={capKey}><td>{capLabel}</td>{visibleCols.map((col) => renderCell(col, capKey, capLabel, undefined, exists))}</tr>;
                })}
            </React.Fragment>
        ));
    };

    return (
        <>
            {proSetting && <span className="admin-pro-tag"><i className="adminfont-pro-tag" /> Pro</span>}
            {Object.entries(toggleGroups).map(([g, ts]) => (
                <div className="inline-toggle-bar-row" key={g}>
                    {ts.map((t) => <InlineToggleBar key={t.key} config={t} enabled={Boolean(setting[t.key])} disabled={(t.effects?.mutuallyExclusiveWith ?? []).some((k) => Boolean(setting[k]))} onChange={(val) => handleToggle(t, val)} />)}
                </div>
            ))}
            {!tableHidden && (
                <table className="grid-table">
                    <thead><tr><th />{visibleCols.map((c) => <th key={c.key}>{c.label}{c.proSetting && !khali_dabba && <span className="admin-pro-tag"><i className="adminfont-pro-tag" /> Pro</span>}</th>)}</tr></thead>
                    <tbody>{Array.isArray(rows) ? renderFlatRows(rows as Row[]) : renderGroupedRows(rows as GroupedRows)}</tbody>
                </table>
            )}
        </>
    );
};

const MultiCheckboxTable: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer, modules, settings, onBlocked, storeTabSetting }) => {
        const current = value && typeof value === 'object' && !Array.isArray(value) ? value as FieldSetting : (settings as FieldSetting) ?? {};
        const handleChange = (k: string | BatchChanges, v?: SettingValue) => {
            if (!canAccess) return;
            const patch = typeof k === 'object' ? k : { [k]: v };
            onChange({ ...current, ...patch });
        };
        return <MultiCheckboxTableUI khali_dabba={appLocalizer?.khali_dabba ?? false} rows={field.rows ?? []} columns={field.columns ?? []} toggles={field.toggles} setting={current} storeTabSetting={storeTabSetting ?? {}} proSetting={field.proSetting ?? false} modules={modules ?? []} onBlocked={onBlocked} onChange={handleChange} />;
    },
    validate: () => null,
};

export default MultiCheckboxTable;