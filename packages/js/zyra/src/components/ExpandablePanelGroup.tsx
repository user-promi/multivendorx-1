import React, { useEffect, useRef, useState } from 'react';
import '../styles/web/ExpandablePanelGroup.scss';
import { getApiLink } from '../utils/apiService';
import axios from 'axios';
import { FieldComponent } from './types';
import { FIELD_REGISTRY } from './FieldRegistry';
import FormGroup from './UI/FormGroup';
import { AdminButtonUI } from './AdminButton';
import FormGroupWrapper from './UI/FormGroupWrapper';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AppLocalizer {
    nonce?: string;
    site_url?: string;
}

interface FieldOption {
    value: string | number;
    label: string;
    desc?: string;
    action?: string;
    redirect?: string;
}

interface PanelFormField {
    key: string;
    type: string;
    label: string;
    name?: string;
    desc?: string;
    options?: FieldOption[];
    beforeElement?: React.ReactNode;
    [key: string]: unknown;
}

interface ExpandablePanelMethod {
    id: string;
    icon: string;
    label: string;
    desc: string;
    connected?: boolean;
    formFields?: PanelFormField[];
    wrapperClass?: string;
    openForm?: boolean;
    isCustom?: boolean;
    disableBtn?: boolean;  // pre-defined only: show Enable/Settings instead of toggle arrow
    hideDeleteBtn?: boolean;
    countBtn?: boolean;
    iconEnable?: boolean;
    iconOptions?: string[];
}

interface AddNewTemplate {
    icon?: string;
    label?: string;
    desc?: string;
    formFields?: PanelFormField[];
    disableBtn?: boolean;
    iconEnable?: boolean;
    iconOptions?: string[];
    editableFields?: {
        title?: boolean;
        description?: boolean;
    };
}

interface ExpandablePanelGroupProps {
    name: string;
    apilink?: string;
    appLocalizer?: AppLocalizer;
    methods: ExpandablePanelMethod[];
    value: Record<string, Record<string, unknown>>;
    onChange: (data: Record<string, Record<string, unknown>>) => void;
    isWizardMode?: boolean;
    canAccess: boolean;
    addNewBtn?: boolean;
    addNewTemplate?: AddNewTemplate;
    min?: number;
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

const isCountableField = (f: PanelFormField) =>
    f.type !== 'button' && f.type !== 'notice';

const isFilled = (val: unknown): boolean => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'string') return val.trim() !== '';
    if (Array.isArray(val)) return val.length > 0;
    return true;
};

const mergeTemplateFields = (
    method: ExpandablePanelMethod,
    tplFields: PanelFormField[]
): ExpandablePanelMethod => {
    if (!tplFields.length) return method;
    const existing = new Set((method.formFields ?? []).map(f => f.key));
    return {
        ...method,
        formFields: [
            ...(method.formFields ?? []),
            ...tplFields.filter(f => !existing.has(f.key)),
        ],
    };
};

const formatPrice = (methodValue: Record<string, unknown>) => {
    const { price, unit } = methodValue;
    if (price === null || price === undefined || price === '') return null;
    return {
        price: typeof price === 'number' ? `$${price.toFixed(2)}` : `$${price}`,
        unit:  unit ? String(unit) : '',
    };
};

const canEditField = (
    method: ExpandablePanelMethod,
    field: 'title' | 'description',
    tpl?: AddNewTemplate
): boolean => {
    if (!method.isCustom) return false;
    return !tpl?.editableFields || tpl.editableFields[field] !== false;
};

// ── Component ─────────────────────────────────────────────────────────────────

export const ExpandablePanelGroupUI: React.FC<ExpandablePanelGroupProps> = ({
    methods: initialMethods,
    value,
    onChange,
    appLocalizer,
    apilink,
    isWizardMode = false,
    canAccess,
    addNewBtn,
    addNewTemplate,
    min,
}) => {
    const tplFields = addNewTemplate?.formFields ?? [];

    // ── State ─────────────────────────────────────────────────────────────────
    const [methods,      setMethods]      = useState<ExpandablePanelMethod[]>(() =>
        initialMethods.map(m => m.isCustom ? mergeTemplateFields(m, tplFields) : m)
    );
    const [activeTab,    setActiveTab]    = useState<string | null>(null);
    const [wizardIndex,  setWizardIndex]  = useState(0);
    const [progress,     setProgress]     = useState<number[]>([]);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [iconDropdown, setIconDropdown] = useState<string | null>(null);

    // Inline editing
    const [editId,    setEditId]    = useState<string | null>(null);
    const [editField, setEditField] = useState<'title' | 'description' | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc,  setEditDesc]  = useState('');

    // ── Refs ──────────────────────────────────────────────────────────────────
    const titleRef   = useRef<HTMLInputElement>(null);
    const descRef    = useRef<HTMLTextAreaElement>(null);
    const iconPicker = useRef<HTMLDivElement>(null);

    // ── Core handler ──────────────────────────────────────────────────────────

    const handleChange = (methodId: string, key: string, val: unknown) => {
        if (key === 'wizardButtons') return;
        onChange({
            ...value,
            [methodId]: { ...(value[methodId] ?? {}), [key]: val },
        });
    };

    // ── Inline editing ────────────────────────────────────────────────────────

    const startEdit = (methodId: string, field: 'title' | 'description') => {
        const methodValue = value[methodId] ?? {};
        const m  = methods.find(x => x.id === methodId);
        setEditId(methodId);
        setEditField(field);
        if (field === 'title') {
            setEditTitle((methodValue.title as string) || m?.label || '');
        } else {
            setEditDesc((methodValue.description as string) || m?.desc || '');
        }
    };

    const commitEdit = () => {
        if (editId && editField === 'title' && editTitle.trim())
            handleChange(editId, 'title', editTitle.trim());
        if (editId && editField === 'description')
            handleChange(editId, 'description', editDesc);
        setEditId(null);
        setEditField(null);
        setEditTitle('');
        setEditDesc('');
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditField(null);
        setEditTitle('');
        setEditDesc('');
    };

    // ── CRUD ──────────────────────────────────────────────────────────────────

    const canDelete = () =>
        min === undefined || methods.filter(m => m.isCustom).length > min;

    const handleAddNew = () => {
        if (!canAccess || !addNewTemplate) return;

        const id =
            (addNewTemplate.label ?? 'item').trim().toLowerCase().replace(/\s+/g, '_') +
            Math.floor(Math.random() * 10000);

        const newMethod: ExpandablePanelMethod = {
            id,
            icon:        addNewTemplate.icon        ?? '',
            label:       addNewTemplate.label       ?? 'New Item',
            desc:        addNewTemplate.desc        ?? '',
            iconEnable:  addNewTemplate.iconEnable  ?? false,
            iconOptions: addNewTemplate.iconOptions ?? [],
            connected:   false,
            isCustom:    true,
            disableBtn: addNewTemplate.disableBtn ?? false,
            formFields:  addNewTemplate.formFields?.map(f => ({ ...f })) ?? [],
        };

        setMethods(prev => [...prev, mergeTemplateFields(newMethod, tplFields)]);

        const init: Record<string, unknown> = {
            isCustom:    true,
            title:       newMethod.label,
            description: newMethod.desc,
            label:       newMethod.label,
            desc:        newMethod.desc,
        };
        if (addNewTemplate.icon) init.icon = addNewTemplate.icon;
        newMethod.formFields?.forEach(f => { init[f.key] = ''; });

        onChange({ ...value, [id]: init });
        setActiveTab(id);
    };

    const handleDelete = (methodId: string) => {
        if (!canDelete()) return;
        setMethods(prev => prev.filter(m => m.id !== methodId));
        const next = { ...value };
        delete next[methodId];
        onChange(next);
        if (activeTab === methodId) setActiveTab(null);
    };

    // ── Wizard ────────────────────────────────────────────────────────────────

    const saveWizard = () => {
        if (!apilink || !appLocalizer?.nonce) return;
        axios({
            url:     getApiLink(appLocalizer, apilink),
            method:  'POST',
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data:    { setupWizard: true, value },
        }).catch(console.error);
    };

    // ── Field renderer ────────────────────────────────────────────────────────

    const renderField = (methodId: string, field: PanelFormField): JSX.Element | null => {
        const comp = FIELD_REGISTRY[field.type];
        if (!comp) return null;

        const Render    = comp.render;
        const fieldVal  = value[methodId]?.[field.key];
        const onChangeF = (val: unknown) => handleChange(methodId, field.key, val);

        if (field.type === 'button' && isWizardMode && Array.isArray(field.options)) {
            const isFirst = wizardIndex === 0;
            const isLast  = wizardIndex === methods.length - 1;

            const buttonOptions = field.options.map(btn => {
                switch (btn.action) {
                    case 'back': return {
                        ...btn, text: btn.label, color: 'red',
                        onClick: () => {
                            if (isFirst) return;
                            const i = wizardIndex - 1;
                            setWizardIndex(i);
                            setActiveTab(methods[i].id);
                        },
                    };
                    case 'next': return {
                        ...btn, text: btn.label, color: 'purple',
                        onClick: () => {
                            saveWizard();
                            if (!isLast) {
                                const i = wizardIndex + 1;
                                setWizardIndex(i);
                                setActiveTab(methods[i].id);
                            } else if (btn.redirect) {
                                window.open(btn.redirect, '_self');
                            }
                        },
                    };
                    case 'skip': return {
                        ...btn, text: btn.label, color: 'blue',
                        onClick: () => window.open(appLocalizer?.site_url, '_self'),
                    };
                    default: return btn;
                }
            });

            return (
                <Render
                    field={{ ...field, options: buttonOptions }}
                    value={fieldVal}
                    onChange={onChangeF}
                    canAccess={canAccess}
                    appLocalizer={appLocalizer}
                />
            );
        }

        return (
            <Render
                field={field}
                value={fieldVal}
                onChange={onChangeF}
                canAccess={canAccess}
                appLocalizer={appLocalizer}
            />
        );
    };

    // ── Effects ───────────────────────────────────────────────────────────────

    // Focus the active edit input
    useEffect(() => {
        if (editField === 'title') { titleRef.current?.focus(); titleRef.current?.select(); }
        if (editField === 'description') { descRef.current?.focus(); descRef.current?.select(); }
    }, [editId, editField]);

    // Keyboard shortcuts while editing
    useEffect(() => {
        if (!editId) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { cancelEdit(); return; }
            // Enter commits title; Ctrl+Enter commits description
            if (e.key === 'Enter' && (editField === 'title' || e.ctrlKey)) commitEdit();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [editId, editField, editTitle, editDesc]);

    // Click outside commits the edit
    useEffect(() => {
        if (!editId) return;
        const handler = (e: MouseEvent) => {
            const t = e.target as Node;
            if (!titleRef.current?.contains(t) && !descRef.current?.contains(t)) commitEdit();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [editId, editField, editTitle, editDesc]);

    // Close 3-dot dropdown on outside click
    useEffect(() => {
        if (!openDropdown) return;
        const close = () => setOpenDropdown(null);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [openDropdown]);

    // Close icon picker on outside click or Escape
    useEffect(() => {
        if (!iconDropdown) return;
        const onMouse = (e: MouseEvent) => {
            if (iconPicker.current && !iconPicker.current.contains(e.target as Node))
                setIconDropdown(null);
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIconDropdown(null); };
        document.addEventListener('mousedown', onMouse);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onMouse);
            document.removeEventListener('keydown', onKey);
        };
    }, [iconDropdown]);

    // Wizard: recalculate field-fill progress
    useEffect(() => {
        if (!isWizardMode) return;
        setProgress(methods.map(m => {
            const methodValue = value[m.id] ?? {};
            return (m.formFields?.filter(isCountableField) ?? [])
                .filter(f => isFilled(methodValue[f.key])).length;
        }));
    }, [value, methods, isWizardMode]);

    // Sync methods state with persisted value (restores config-only props)
    useEffect(() => {
        const methodsFromValue = new Map(
            Object.entries(value).map(([id, m]) => [id, { id, ...(m as ExpandablePanelMethod) }])
        );

        setMethods(prev => {
            const methodMap = new Map(prev.map(m => [m.id, m]));

            methodsFromValue.forEach((persistedMethod, id) => {
                const existingMethod = methodMap.get(id);
                methodMap.set(id, {
                    ...existingMethod,
                    ...persistedMethod,
                    // These props live in config, not in saved value — restore them
                    disableBtn: persistedMethod.disableBtn ?? existingMethod?.disableBtn ?? (persistedMethod.isCustom ? addNewTemplate?.disableBtn ?? false : false),
                    iconEnable:  persistedMethod.iconEnable  ?? existingMethod?.iconEnable  ?? (persistedMethod.isCustom ? addNewTemplate?.iconEnable  : false),
                    iconOptions: persistedMethod.iconOptions ?? existingMethod?.iconOptions ?? (persistedMethod.isCustom ? addNewTemplate?.iconOptions : []),
                });
            });

            return Array.from(methodMap.values()).map(m =>
                m.isCustom ? mergeTemplateFields(m, tplFields) : m
            );
        });
    }, [value, addNewTemplate]);

    // ── Render ────────────────────────────────────────────────────────────────

    // Wizard mode: only show steps up to current index
    const visible = isWizardMode ? methods.slice(0, wizardIndex + 1) : methods;

    return (
        <>
            <div className="expandable-panel-group">
                {visible.map((method, idx) => {
                    const methodValue      = value[method.id] ?? {};
                    const isOn    = method.isCustom ? methodValue.enable !== false : Boolean(methodValue.enable);
                    const isOpen  = activeTab === method.id;
                    const hasFields    = Boolean(method.formFields?.length);
                    const icon    = (methodValue.icon as string) || method.icon;
                    const price   = formatPrice(methodValue);
                    const title   = (methodValue.title       as string) || method.label;
                    const desc    = (methodValue.description as string) || method.desc;
                    const editing = editId === method.id;
                    const cntFlds = method.formFields?.filter(isCountableField) ?? [];

                    return (
                        <div
                            key={method.id}
                            className={[
                                'expandable-item',
                                method.disableBtn && !isOn ? 'disable' : '',
                                method.openForm ? 'open' : '',
                            ].filter(Boolean).join(' ')}
                        >
                            {/* ── Header ──────────────────────────────────── */}
                            <div className="expandable-header">

                                {hasFields && (
                                    <div className="toggle-icon">
                                        <i
                                            className={`adminfont-${isOpen ? 'keyboard-arrow-down' : 'pagination-right-arrow'}`}
                                            onClick={() => canAccess && setActiveTab(isOpen ? null : method.id)}
                                        />
                                    </div>
                                )}

                                <div
                                    className="details"
                                    onClick={() => canAccess && setActiveTab(isOpen ? null : method.id)}
                                >
                                    <div className="details-wrapper">

                                        {/* Icon picker */}
                                        {icon && (
                                            <div
                                                className="expandable-header-icon"
                                                ref={iconDropdown === method.id ? iconPicker : null}
                                                onClick={e => {
                                                    if (!method.iconEnable || !canAccess) return;
                                                    e.stopPropagation();
                                                    setIconDropdown(p => p === method.id ? null : method.id);
                                                }}
                                            >
                                                <i className={`adminfont-${icon} icon`} />
                                                {method.iconEnable && iconDropdown !== method.id && (
                                                    <i className="adminfont-edit edit-icon" />
                                                )}
                                                {method.iconEnable && iconDropdown === method.id && (
                                                    <div
                                                        className="icon-options-list"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        {(method.iconOptions ?? addNewTemplate?.iconOptions ?? []).map(cls => (
                                                            <button
                                                                key={cls} type="button"
                                                                className={`icon-option ${icon === cls ? 'selected' : ''}`}
                                                                onClick={() => { handleChange(method.id, 'icon', cls); setIconDropdown(null); }}
                                                                title={cls}
                                                            >
                                                                <i className={`adminfont-${cls}`} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="expandable-header-info">

                                            {/* Title (inline-editable for custom) */}
                                            <div className="title-wrapper">
                                                <span className="title">
                                                    {editing && editField === 'title' && canEditField(method, 'title', addNewTemplate) ? (
                                                        <input
                                                            ref={titleRef} type="text"
                                                            className="inline-edit-input title-edit"
                                                            value={editTitle}
                                                            onChange={e => setEditTitle(e.target.value)}
                                                            onKeyDown={e => e.key === 'Enter' && commitEdit()}
                                                            onClick={e => e.stopPropagation()}
                                                        />
                                                    ) : (
                                                        <span
                                                            className={`title ${canEditField(method, 'title', addNewTemplate) ? 'editable-title' : ''}`}
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                if (canEditField(method, 'title', addNewTemplate))
                                                                    startEdit(method.id, 'title');
                                                            }}
                                                            title={canEditField(method, 'title', addNewTemplate) ? 'Click to edit' : undefined}
                                                        >
                                                            {title}
                                                            {canEditField(method, 'title', addNewTemplate) && (
                                                                <i className="adminfont-edit inline-edit-icon" />
                                                            )}
                                                        </span>
                                                    )}

                                                    {/* Active/Inactive badge — predefined disableBtn methods only */}
                                                    {method.disableBtn && !method.isCustom && (
                                                        <div className="panel-badges">
                                                            <div className={`admin-badge ${isOn ? 'green' : 'red'}`}>
                                                                {isOn ? 'Active' : 'Inactive'}
                                                            </div>
                                                        </div>
                                                    )}
                                                </span>
                                            </div>

                                            {/* Description (inline-editable for custom) */}
                                            <div className="panel-description">
                                                {editing && editField === 'description' && canEditField(method, 'description', addNewTemplate) ? (
                                                    <textarea
                                                        ref={descRef}
                                                        className="description-edit"
                                                        value={editDesc}
                                                        onChange={e => setEditDesc(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && e.ctrlKey && commitEdit()}
                                                        onClick={e => e.stopPropagation()}
                                                        rows={3}
                                                    />
                                                ) : (
                                                    <p
                                                        className={canEditField(method, 'description', addNewTemplate) ? 'editable-description' : undefined}
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            if (canEditField(method, 'description', addNewTemplate))
                                                                startEdit(method.id, 'description');
                                                        }}
                                                        title={canEditField(method, 'description', addNewTemplate) ? 'Click to edit' : undefined}
                                                    >
                                                        <span dangerouslySetInnerHTML={{ __html: desc }} />
                                                        {canEditField(method, 'description', addNewTemplate) && (
                                                            <i className="adminfont-edit inline-edit-icon" />
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Right section ────────────────────────── */}
                                <div className="right-section">
                                    {price && (
                                        <span className="price-field">
                                            {price.price}
                                            {price.unit && <span className="desc">{price.unit}</span>}
                                        </span>
                                    )}

                                    <ul className="settings-btn">

                                        {/* Delete — custom only, respects minimum count */}
                                        {method.isCustom && !method.hideDeleteBtn && canDelete() && (
                                            <AdminButtonUI buttons={[{
                                                icon: 'delete', text: 'Delete', color: 'red-color',
                                                onClick: () => handleDelete(method.id),
                                            }]} />
                                        )}

                                        {/*
                                         * PREDEFINED (disableBtn, non-custom):
                                         *   Disabled → Enable button
                                         *   Enabled  → Settings button
                                         *
                                         * CUSTOM (isCustom):
                                         *   Enabled  → Hide button
                                         *   Hidden   → Show button
                                         *
                                         * These two branches are mutually exclusive by design.
                                         * A method is either predefined OR custom, never both.
                                         */}

                                        {method.disableBtn && !method.isCustom && (
                                            isOn ? (
                                                hasFields && (
                                                    <AdminButtonUI buttons={[{
                                                        icon: 'setting', text: 'Settings', color: 'purple',
                                                        onClick: () => canAccess && setActiveTab(isOpen ? null : method.id),
                                                    }]} />
                                                )
                                            ) : (
                                                <li onClick={() => canAccess && handleChange(method.id, 'enable', true)}>
                                                    <span className="admin-btn btn-purple-bg">
                                                        <i className="adminfont-eye" /> Enable
                                                    </span>
                                                </li>
                                            )
                                        )}

                                        {method.isCustom && method.disableBtn && (
                                            isOn ? (
                                                <AdminButtonUI buttons={[{
                                                    icon: 'eye-blocked',
                                                    text: 'Hide',
                                                    color: 'purple',
                                                    onClick: () => canAccess && handleChange(method.id, 'enable', false),
                                                }]} />
                                            ) : (
                                                <li onClick={() => canAccess && handleChange(method.id, 'enable', true)}>
                                                    <span className="admin-btn btn-purple-bg">
                                                        <i className="adminfont-eye" /> Show
                                                    </span>
                                                </li>
                                            )
                                        )}

                                        {/* Progress counter (non-disableBtn methods only) */}
                                        {!method.disableBtn && method.countBtn && cntFlds.length > 0 && (
                                            <div className="admin-badge red">
                                                {progress[idx] || 0}/{cntFlds.length}
                                            </div>
                                        )}
                                    </ul>

                                    {/* 3-dot dropdown — non-custom, enabled methods */}
                                    {!method.isCustom && isOn && (
                                        <div className="icon-wrapper">
                                            <i
                                                className="admin-icon adminfont-more-vertical"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    setOpenDropdown(p => p === method.id ? null : method.id);
                                                }}
                                            />
                                            {openDropdown === method.id && (
                                                <div className="dropdown" onClick={e => e.stopPropagation()}>
                                                    <div className="dropdown-body">
                                                        <ul>
                                                            {method.disableBtn && hasFields && (
                                                                <li onClick={() => {
                                                                    canAccess && setActiveTab(isOpen ? null : method.id);
                                                                    setOpenDropdown(null);
                                                                }}>
                                                                    <span className="item">
                                                                        <i className="adminfont-setting" /> Settings
                                                                    </span>
                                                                </li>
                                                            )}
                                                            <li className="delete" onClick={() => {
                                                                canAccess && handleChange(method.id, 'enable', false);
                                                                setOpenDropdown(null);
                                                            }}>
                                                                <div className="item">
                                                                    <i className="adminfont-eye-blocked" /> Disable
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Form body ────────────────────────────────── */}
                            {hasFields && (method.openForm || (isOpen && (isOn || method.isCustom))) && (
                                <div className={`${method.wrapperClass ?? ''} expandable-panel open`.trim()}>
                                    <FormGroupWrapper>
                                        {method.formFields!.map(field => {
                                            if (isWizardMode && field.key === 'wizardButtons') return null;
                                            return (
                                                <FormGroup
                                                    row key={field.key}
                                                    label={field.type !== 'notice' ? field.label : undefined}
                                                    desc={field.desc}
                                                    htmlFor={field.name}
                                                >
                                                    {field.beforeElement && renderField(method.id, field.beforeElement as PanelFormField)}
                                                    {renderField(method.id, field)}
                                                </FormGroup>
                                            );
                                        })}
                                    </FormGroupWrapper>
                                </div>
                            )}
                        </div>
                    );
                })}

                {addNewBtn && (
                    <AdminButtonUI buttons={[{
                        icon: 'plus', text: 'Add New', color: 'purple',
                        onClick: handleAddNew,
                    }]} />
                )}
            </div>

            {/* Wizard navigation buttons (rendered outside the panel list) */}
            {isWizardMode && (() => {
                const step = methods[wizardIndex];
                const btn  = step?.formFields?.find(f => f.key === 'wizardButtons');
                return btn ? renderField(step.id, btn) : null;
            })()}
        </>
    );
};

// ── FieldComponent wrapper ────────────────────────────────────────────────────

const ExpandablePanelGroup: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer }) => (
        <ExpandablePanelGroupUI
            key={field.key}
            name={field.key}
            apilink={String(field.apiLink)}
            appLocalizer={appLocalizer}
            methods={field.modal ?? []}
            addNewBtn={field.addNewBtn}
            addNewTemplate={field.addNewTemplate}
            min={field.min}
            value={value || {}}
            onChange={val => { if (!canAccess) return; onChange(val); }}
            canAccess={canAccess}
        />
    ),
    validate: () => null,
};

export default ExpandablePanelGroup;