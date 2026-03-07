import React, { useEffect, useRef, useReducer, useCallback } from 'react';
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
    disableBtn?: boolean;
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

// ── State Types ───────────────────────────────────────────────────────────────

type PanelState = {
    methods: ExpandablePanelMethod[];
    activeTab: string | null;
    wizardIndex: number;
    progress: number[];
    openDropdown: string | null;
    iconDropdown: string | null;
    editId: string | null;
    editField: 'title' | 'description' | null;
    editTitle: string;
    editDesc: string;
};

type PanelAction =
    | { type: 'SET_METHODS'; methods: ExpandablePanelMethod[] }
    | { type: 'SET_ACTIVE_TAB'; id: string | null }
    | { type: 'SET_WIZARD_INDEX'; index: number }
    | { type: 'SET_PROGRESS'; progress: number[] }
    | { type: 'SET_OPEN_DROPDOWN'; id: string | null }
    | { type: 'SET_ICON_DROPDOWN'; id: string | null }
    | { type: 'START_EDIT'; id: string; field: 'title' | 'description'; title?: string; desc?: string }
    | { type: 'UPDATE_EDIT_TITLE'; title: string }
    | { type: 'UPDATE_EDIT_DESC'; desc: string }
    | { type: 'COMMIT_EDIT' }
    | { type: 'CANCEL_EDIT' }
    | { type: 'ADD_METHOD'; method: ExpandablePanelMethod }
    | { type: 'DELETE_METHOD'; id: string };

// ── Reducer ───────────────────────────────────────────────────────────────────

const panelReducer = (state: PanelState, action: PanelAction): PanelState => {
    switch (action.type) {
        case 'SET_METHODS':
            return { ...state, methods: action.methods };
        case 'SET_ACTIVE_TAB':
            return { ...state, activeTab: action.id };
        case 'SET_WIZARD_INDEX':
            return { ...state, wizardIndex: action.index };
        case 'SET_PROGRESS':
            return { ...state, progress: action.progress };
        case 'SET_OPEN_DROPDOWN':
            return { ...state, openDropdown: action.id };
        case 'SET_ICON_DROPDOWN':
            return { ...state, iconDropdown: action.id };
        case 'START_EDIT':
            return {
                ...state,
                editId: action.id,
                editField: action.field,
                editTitle: action.title || '',
                editDesc: action.desc || '',
            };
        case 'UPDATE_EDIT_TITLE':
            return { ...state, editTitle: action.title };
        case 'UPDATE_EDIT_DESC':
            return { ...state, editDesc: action.desc };
        case 'COMMIT_EDIT':
            return {
                ...state,
                editId: null,
                editField: null,
                editTitle: '',
                editDesc: '',
            };
        case 'CANCEL_EDIT':
            return {
                ...state,
                editId: null,
                editField: null,
                editTitle: '',
                editDesc: '',
            };
        case 'ADD_METHOD':
            return {
                ...state,
                methods: [...state.methods, action.method],
                activeTab: action.method.id,
            };
        case 'DELETE_METHOD':
            return {
                ...state,
                methods: state.methods.filter(m => m.id !== action.id),
                activeTab: state.activeTab === action.id ? null : state.activeTab,
            };
        default:
            return state;
    }
};

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
        unit: unit ? String(unit) : '',
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

// ── Sub-Components ────────────────────────────────────────────────────────────

interface PanelHeaderProps {
    method: ExpandablePanelMethod;
    methodValue: Record<string, unknown>;
    isOpen: boolean;
    isOn: boolean;
    hasFields: boolean;
    icon: string;
    title: string;
    desc: string;
    editing: boolean;
    editField: 'title' | 'description' | null;
    editTitle: string;
    editDesc: string;
    iconDropdown: string | null;
    canAccess: boolean;
    addNewTemplate?: AddNewTemplate;
    titleRef: React.RefObject<HTMLInputElement>;
    descRef: React.RefObject<HTMLTextAreaElement>;
    iconPicker: React.RefObject<HTMLDivElement>;
    onToggleTab: (id: string | null) => void;
    onSetIconDropdown: (id: string | null) => void;
    onStartEdit: (id: string, field: 'title' | 'description', title?: string, desc?: string) => void;
    onUpdateEditTitle: (title: string) => void;
    onUpdateEditDesc: (desc: string) => void;
    onCommitEdit: () => void;
    onHandleChange: (methodId: string, key: string, val: unknown) => void;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({
    method,
    methodValue,
    isOpen,
    isOn,
    hasFields,
    icon,
    title,
    desc,
    editing,
    editField,
    editTitle,
    editDesc,
    iconDropdown,
    canAccess,
    addNewTemplate,
    titleRef,
    descRef,
    iconPicker,
    onToggleTab,
    onSetIconDropdown,
    onStartEdit,
    onUpdateEditTitle,
    onUpdateEditDesc,
    onCommitEdit,
    onHandleChange,
}) => {
    return (
        <div className="expandable-header">
            {hasFields && (
                <div className="toggle-icon">
                    <i
                        className={`adminfont-${isOpen ? 'keyboard-arrow-down' : 'pagination-right-arrow'}`}
                        onClick={() => canAccess && onToggleTab(isOpen ? null : method.id)}
                    />
                </div>
            )}

            <div
                className="details"
                onClick={() => canAccess && onToggleTab(isOpen ? null : method.id)}
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
                                onSetIconDropdown(iconDropdown === method.id ? null : method.id);
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
                                            onClick={() => { onHandleChange(method.id, 'icon', cls); onSetIconDropdown(null); }}
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
                                        onChange={e => onUpdateEditTitle(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && onCommitEdit()}
                                        onClick={e => e.stopPropagation()}
                                    />
                                ) : (
                                    <span
                                        className={`title ${canEditField(method, 'title', addNewTemplate) ? 'editable-title' : ''}`}
                                        onClick={e => {
                                            e.stopPropagation();
                                            if (canEditField(method, 'title', addNewTemplate)) {
                                                const methodVal = methodValue;
                                                onStartEdit(
                                                    method.id,
                                                    'title',
                                                    (methodVal.title as string) || method.label || '',
                                                    undefined
                                                );
                                            }
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
                                    onChange={e => onUpdateEditDesc(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && e.ctrlKey && onCommitEdit()}
                                    onClick={e => e.stopPropagation()}
                                    rows={3}
                                />
                            ) : (
                                <p
                                    className={canEditField(method, 'description', addNewTemplate) ? 'editable-description' : undefined}
                                    onClick={e => {
                                        e.stopPropagation();
                                        if (canEditField(method, 'description', addNewTemplate)) {
                                            const methodVal = methodValue;
                                            onStartEdit(
                                                method.id,
                                                'description',
                                                undefined,
                                                (methodVal.description as string) || method.desc || ''
                                            );
                                        }
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
        </div>
    );
};

interface PanelControlsProps {
    method: ExpandablePanelMethod;
    methodValue: Record<string, unknown>;
    isOn: boolean;
    isOpen: boolean;
    hasFields: boolean;
    price: { price: string; unit: string } | null;
    cntFlds: PanelFormField[];
    progress: number[];
    idx: number;
    openDropdown: string | null;
    canAccess: boolean;
    addNewTemplate?: AddNewTemplate;
    onSetActiveTab: (id: string | null) => void;
    onSetOpenDropdown: (id: string | null) => void;
    onHandleChange: (methodId: string, key: string, val: unknown) => void;
    onHandleDelete: (methodId: string) => void;
    onCanDelete: () => boolean;
}

const PanelControls: React.FC<PanelControlsProps> = ({
    method,
    isOn,
    isOpen,
    hasFields,
    price,
    cntFlds,
    progress,
    idx,
    openDropdown,
    canAccess,
    addNewTemplate,
    onSetActiveTab,
    onSetOpenDropdown,
    onHandleChange,
    onHandleDelete,
    onCanDelete,
}) => {
    return (
        <div className="right-section">
            {price && (
                <span className="price-field">
                    {price.price}
                    {price.unit && <span className="desc">{price.unit}</span>}
                </span>
            )}

            <ul className="settings-btn">
                {/* Delete — custom only, respects minimum count */}
                {method.isCustom && !method.hideDeleteBtn && onCanDelete() && (
                    <AdminButtonUI buttons={[{
                        icon: 'delete', text: 'Delete', color: 'red-color',
                        onClick: () => onHandleDelete(method.id),
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
                                onClick: () => canAccess && onSetActiveTab(isOpen ? null : method.id),
                            }]} />
                        )
                    ) : (
                        <li onClick={() => canAccess && onHandleChange(method.id, 'enable', true)}>
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
                            onClick: () => canAccess && onHandleChange(method.id, 'enable', false),
                        }]} />
                    ) : (
                        <li onClick={() => canAccess && onHandleChange(method.id, 'enable', true)}>
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
                            onSetOpenDropdown(openDropdown === method.id ? null : method.id);
                        }}
                    />
                    {openDropdown === method.id && (
                        <div className="dropdown" onClick={e => e.stopPropagation()}>
                            <div className="dropdown-body">
                                <ul>
                                    {method.disableBtn && hasFields && (
                                        <li onClick={() => {
                                            canAccess && onSetActiveTab(isOpen ? null : method.id);
                                            onSetOpenDropdown(null);
                                        }}>
                                            <span className="item">
                                                <i className="adminfont-setting" /> Settings
                                            </span>
                                        </li>
                                    )}
                                    <li className="delete" onClick={() => {
                                        canAccess && onHandleChange(method.id, 'enable', false);
                                        onSetOpenDropdown(null);
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
    );
};

interface PanelBodyProps {
    method: ExpandablePanelMethod;
    methodId: string;
    isOpen: boolean;
    isOn: boolean;
    isWizardMode: boolean;
    canAccess: boolean;
    appLocalizer?: AppLocalizer;
    value: Record<string, Record<string, unknown>>;
    onHandleChange: (methodId: string, key: string, val: unknown) => void;
    renderField: (methodId: string, field: PanelFormField) => JSX.Element | null;
}

const PanelBody: React.FC<PanelBodyProps> = ({
    method,
    methodId,
    isOpen,
    isOn,
    isWizardMode,
    canAccess,
    appLocalizer,
    value,
    onHandleChange,
    renderField,
}) => {
    const hasFields = Boolean(method.formFields?.length);
    
    if (!hasFields) return null;
    if (!(method.openForm || (isOpen && (isOn || method.isCustom)))) return null;

    return (
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
                            {field.beforeElement && renderField(methodId, field.beforeElement as PanelFormField)}
                            {renderField(methodId, field)}
                        </FormGroup>
                    );
                })}
            </FormGroupWrapper>
        </div>
    );
};

interface PanelItemProps {
    method: ExpandablePanelMethod;
    idx: number;
    value: Record<string, Record<string, unknown>>;
    isWizardMode: boolean;
    canAccess: boolean;
    appLocalizer?: AppLocalizer;
    addNewTemplate?: AddNewTemplate;
    state: PanelState;
    dispatch: React.Dispatch<PanelAction>;
    onHandleChange: (methodId: string, key: string, val: unknown) => void;
    onHandleDelete: (methodId: string) => void;
    onCanDelete: () => boolean;
    renderField: (methodId: string, field: PanelFormField) => JSX.Element | null;
    titleRef: React.RefObject<HTMLInputElement>;
    descRef: React.RefObject<HTMLTextAreaElement>;
    iconPicker: React.RefObject<HTMLDivElement>;
}

const PanelItem: React.FC<PanelItemProps> = ({
    method,
    idx,
    value,
    isWizardMode,
    canAccess,
    appLocalizer,
    addNewTemplate,
    state,
    dispatch,
    onHandleChange,
    onHandleDelete,
    onCanDelete,
    renderField,
    titleRef,
    descRef,
    iconPicker,
}) => {
    // Cache methodValue once - KEY OPTIMIZATION
    const methodValue = value[method.id] ?? {};
    
    const isOn = method.isCustom ? methodValue.enable !== false : Boolean(methodValue.enable);
    const isOpen = state.activeTab === method.id;
    const hasFields = Boolean(method.formFields?.length);
    const icon = (methodValue.icon as string) || method.icon;
    const price = formatPrice(methodValue);
    const title = (methodValue.title as string) || method.label;
    const desc = (methodValue.description as string) || method.desc;
    const editing = state.editId === method.id;
    const cntFlds = method.formFields?.filter(isCountableField) ?? [];

    return (
        <div
            className={[
                'expandable-item',
                method.disableBtn && !isOn ? 'disable' : '',
                method.openForm ? 'open' : '',
            ].filter(Boolean).join(' ')}
        >
            <PanelHeader
                method={method}
                methodValue={methodValue}
                isOpen={isOpen}
                isOn={isOn}
                hasFields={hasFields}
                icon={icon}
                title={title}
                desc={desc}
                editing={editing}
                editField={state.editField}
                editTitle={state.editTitle}
                editDesc={state.editDesc}
                iconDropdown={state.iconDropdown}
                canAccess={canAccess}
                addNewTemplate={addNewTemplate}
                titleRef={titleRef}
                descRef={descRef}
                iconPicker={iconPicker}
                onToggleTab={(id) => dispatch({ type: 'SET_ACTIVE_TAB', id })}
                onSetIconDropdown={(id) => dispatch({ type: 'SET_ICON_DROPDOWN', id })}
                onStartEdit={(id, field, title, desc) => {
                    const methodVal = value[id] ?? {};
                    const m = state.methods.find(x => x.id === id);
                    dispatch({
                        type: 'START_EDIT',
                        id,
                        field,
                        title: title !== undefined ? title : (methodVal.title as string) || m?.label || '',
                        desc: desc !== undefined ? desc : (methodVal.description as string) || m?.desc || '',
                    });
                }}
                onUpdateEditTitle={(title) => dispatch({ type: 'UPDATE_EDIT_TITLE', title })}
                onUpdateEditDesc={(desc) => dispatch({ type: 'UPDATE_EDIT_DESC', desc })}
                onCommitEdit={() => {
                    if (state.editId && state.editField === 'title' && state.editTitle.trim())
                        onHandleChange(state.editId, 'title', state.editTitle.trim());
                    if (state.editId && state.editField === 'description')
                        onHandleChange(state.editId, 'description', state.editDesc);
                    dispatch({ type: 'COMMIT_EDIT' });
                }}
                onHandleChange={onHandleChange}
            />

            <PanelControls
                method={method}
                methodValue={methodValue}
                isOn={isOn}
                isOpen={isOpen}
                hasFields={hasFields}
                price={price}
                cntFlds={cntFlds}
                progress={state.progress}
                idx={idx}
                openDropdown={state.openDropdown}
                canAccess={canAccess}
                addNewTemplate={addNewTemplate}
                onSetActiveTab={(id) => dispatch({ type: 'SET_ACTIVE_TAB', id })}
                onSetOpenDropdown={(id) => dispatch({ type: 'SET_OPEN_DROPDOWN', id })}
                onHandleChange={onHandleChange}
                onHandleDelete={onHandleDelete}
                onCanDelete={onCanDelete}
            />

            <PanelBody
                method={method}
                methodId={method.id}
                isOpen={isOpen}
                isOn={isOn}
                isWizardMode={isWizardMode}
                canAccess={canAccess}
                appLocalizer={appLocalizer}
                value={value}
                onHandleChange={onHandleChange}
                renderField={renderField}
            />
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────

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

    // ── useReducer ────────────────────────────────────────────────────────────
    const [state, dispatch] = useReducer(panelReducer, {
        methods: initialMethods.map(m => m.isCustom ? mergeTemplateFields(m, tplFields) : m),
        activeTab: null,
        wizardIndex: 0,
        progress: [],
        openDropdown: null,
        iconDropdown: null,
        editId: null,
        editField: null,
        editTitle: '',
        editDesc: '',
    });

    // ── Refs ──────────────────────────────────────────────────────────────────
    const titleRef = useRef<HTMLInputElement>(null);
    const descRef = useRef<HTMLTextAreaElement>(null);
    const iconPicker = useRef<HTMLDivElement>(null);

    // ── Core handler (memoized) ───────────────────────────────────────────────
    const handleChange = useCallback((methodId: string, key: string, val: unknown) => {
        if (key === 'wizardButtons') return;
        onChange({
            ...value,
            [methodId]: { ...(value[methodId] ?? {}), [key]: val },
        });
    }, [onChange, value]);

    // ── CRUD helpers ──────────────────────────────────────────────────────────
    const canDelete = useCallback(() => 
        min === undefined || state.methods.filter(m => m.isCustom).length > min,
    [min, state.methods]);

    const handleAddNew = useCallback(() => {
        if (!canAccess || !addNewTemplate) return;

        const id = (addNewTemplate.label ?? 'item').trim().toLowerCase().replace(/\s+/g, '_') +
            Math.floor(Math.random() * 10000);

        const newMethod: ExpandablePanelMethod = {
            id,
            icon: addNewTemplate.icon ?? '',
            label: addNewTemplate.label ?? 'New Item',
            desc: addNewTemplate.desc ?? '',
            iconEnable: addNewTemplate.iconEnable ?? false,
            iconOptions: addNewTemplate.iconOptions ?? [],
            connected: false,
            isCustom: true,
            disableBtn: addNewTemplate.disableBtn ?? false,
            formFields: addNewTemplate.formFields?.map(f => ({ ...f })) ?? [],
        };

        const mergedMethod = mergeTemplateFields(newMethod, tplFields);
        dispatch({ type: 'ADD_METHOD', method: mergedMethod });

        const init: Record<string, unknown> = {
            isCustom: true,
            title: newMethod.label,
            description: newMethod.desc,
            label: newMethod.label,
            desc: newMethod.desc,
        };
        if (addNewTemplate.icon) init.icon = addNewTemplate.icon;
        newMethod.formFields?.forEach(f => { init[f.key] = ''; });

        onChange({ ...value, [id]: init });
    }, [canAccess, addNewTemplate, tplFields, onChange, value]);

    const handleDelete = useCallback((methodId: string) => {
        if (!canDelete()) return;
        dispatch({ type: 'DELETE_METHOD', id: methodId });
        const next = { ...value };
        delete next[methodId];
        onChange(next);
    }, [canDelete, onChange, value]);

    // ── Wizard ────────────────────────────────────────────────────────────────
    const saveWizard = useCallback(() => {
        if (!apilink || !appLocalizer?.nonce) return;
        axios({
            url: getApiLink(appLocalizer, apilink),
            method: 'POST',
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: { setupWizard: true, value },
        }).catch(console.error);
    }, [apilink, appLocalizer, value]);

    // ── Field renderer ────────────────────────────────────────────────────────
    const renderField = useCallback((methodId: string, field: PanelFormField): JSX.Element | null => {
        const comp = FIELD_REGISTRY[field.type];
        if (!comp) return null;

        const Render = comp.render;
        const fieldVal = value[methodId]?.[field.key];
        const onChangeF = (val: unknown) => handleChange(methodId, field.key, val);

        if (field.type === 'button' && isWizardMode && Array.isArray(field.options)) {
            const isFirst = state.wizardIndex === 0;
            const isLast = state.wizardIndex === state.methods.length - 1;

            const buttonOptions = field.options.map(btn => {
                switch (btn.action) {
                    case 'back': return {
                        ...btn, text: btn.label, color: 'red',
                        onClick: () => {
                            if (isFirst) return;
                            const i = state.wizardIndex - 1;
                            dispatch({ type: 'SET_WIZARD_INDEX', index: i });
                            dispatch({ type: 'SET_ACTIVE_TAB', id: state.methods[i].id });
                        },
                    };
                    case 'next': return {
                        ...btn, text: btn.label, color: 'purple',
                        onClick: () => {
                            saveWizard();
                            if (!isLast) {
                                const i = state.wizardIndex + 1;
                                dispatch({ type: 'SET_WIZARD_INDEX', index: i });
                                dispatch({ type: 'SET_ACTIVE_TAB', id: state.methods[i].id });
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
    }, [value, handleChange, isWizardMode, state.wizardIndex, state.methods, canAccess, appLocalizer, saveWizard]);

    // ── Effects ───────────────────────────────────────────────────────────────

    // Focus the active edit input
    useEffect(() => {
        if (state.editField === 'title') { titleRef.current?.focus(); titleRef.current?.select(); }
        if (state.editField === 'description') { descRef.current?.focus(); descRef.current?.select(); }
    }, [state.editId, state.editField]);

    // Keyboard shortcuts while editing
    useEffect(() => {
        if (!state.editId) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                dispatch({ type: 'CANCEL_EDIT' });
                return;
            }
            if (e.key === 'Enter' && (state.editField === 'title' || e.ctrlKey)) {
                if (state.editId && state.editField === 'title' && state.editTitle.trim())
                    handleChange(state.editId, 'title', state.editTitle.trim());
                if (state.editId && state.editField === 'description')
                    handleChange(state.editId, 'description', state.editDesc);
                dispatch({ type: 'COMMIT_EDIT' });
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [state.editId, state.editField, state.editTitle, state.editDesc, handleChange]);

    // Click outside commits the edit
    useEffect(() => {
        if (!state.editId) return;
        const handler = (e: MouseEvent) => {
            const t = e.target as Node;
            if (!titleRef.current?.contains(t) && !descRef.current?.contains(t)) {
                if (state.editId && state.editField === 'title' && state.editTitle.trim())
                    handleChange(state.editId, 'title', state.editTitle.trim());
                if (state.editId && state.editField === 'description')
                    handleChange(state.editId, 'description', state.editDesc);
                dispatch({ type: 'COMMIT_EDIT' });
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [state.editId, state.editField, state.editTitle, state.editDesc, handleChange]);

    // Close 3-dot dropdown on outside click
    useEffect(() => {
        if (!state.openDropdown) return;
        const close = () => dispatch({ type: 'SET_OPEN_DROPDOWN', id: null });
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [state.openDropdown]);

    // Close icon picker on outside click or Escape
    useEffect(() => {
        if (!state.iconDropdown) return;
        const onMouse = (e: MouseEvent) => {
            if (iconPicker.current && !iconPicker.current.contains(e.target as Node))
                dispatch({ type: 'SET_ICON_DROPDOWN', id: null });
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dispatch({ type: 'SET_ICON_DROPDOWN', id: null }); };
        document.addEventListener('mousedown', onMouse);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onMouse);
            document.removeEventListener('keydown', onKey);
        };
    }, [state.iconDropdown]);

    // Wizard: recalculate field-fill progress
    useEffect(() => {
        if (!isWizardMode) return;
        const newProgress = state.methods.map(m => {
            const methodValue = value[m.id] ?? {};
            return (m.formFields?.filter(isCountableField) ?? [])
                .filter(f => isFilled(methodValue[f.key])).length;
        });
        dispatch({ type: 'SET_PROGRESS', progress: newProgress });
    }, [value, state.methods, isWizardMode]);

    // Sync methods state with persisted value (restores config-only props)
    useEffect(() => {
        const methodsFromValue = new Map(
            Object.entries(value).map(([id, m]) => [id, { id, ...(m as ExpandablePanelMethod) }])
        );

        const updatedMethods = (() => {
            const methodMap = new Map(state.methods.map(m => [m.id, m]));

            methodsFromValue.forEach((persistedMethod, id) => {
                const existingMethod = methodMap.get(id);
                methodMap.set(id, {
                    ...existingMethod,
                    ...persistedMethod,
                    disableBtn: persistedMethod.disableBtn ?? existingMethod?.disableBtn ?? (persistedMethod.isCustom ? addNewTemplate?.disableBtn ?? false : false),
                    iconEnable: persistedMethod.iconEnable ?? existingMethod?.iconEnable ?? (persistedMethod.isCustom ? addNewTemplate?.iconEnable : false),
                    iconOptions: persistedMethod.iconOptions ?? existingMethod?.iconOptions ?? (persistedMethod.isCustom ? addNewTemplate?.iconOptions : []),
                });
            });

            return Array.from(methodMap.values()).map(m =>
                m.isCustom ? mergeTemplateFields(m, tplFields) : m
            );
        })();

        if (JSON.stringify(updatedMethods) !== JSON.stringify(state.methods)) {
            dispatch({ type: 'SET_METHODS', methods: updatedMethods });
        }
    }, [value, addNewTemplate, tplFields]);

    // ── Render ────────────────────────────────────────────────────────────────

    // Wizard mode: only show steps up to current index
    const visible = isWizardMode ? state.methods.slice(0, state.wizardIndex + 1) : state.methods;

    return (
        <>
            <div className="expandable-panel-group">
                {visible.map((method, idx) => (
                    <PanelItem
                        key={method.id}
                        method={method}
                        idx={idx}
                        value={value}
                        isWizardMode={isWizardMode}
                        canAccess={canAccess}
                        appLocalizer={appLocalizer}
                        addNewTemplate={addNewTemplate}
                        state={state}
                        dispatch={dispatch}
                        onHandleChange={handleChange}
                        onHandleDelete={handleDelete}
                        onCanDelete={canDelete}
                        renderField={renderField}
                        titleRef={titleRef}
                        descRef={descRef}
                        iconPicker={iconPicker}
                    />
                ))}

                {addNewBtn && (
                    <AdminButtonUI buttons={[{
                        icon: 'plus', text: 'Add New', color: 'purple',
                        onClick: handleAddNew,
                    }]} />
                )}
            </div>

            {/* Wizard navigation buttons (rendered outside the panel list) */}
            {isWizardMode && (() => {
                const step = state.methods[state.wizardIndex];
                const btn = step?.formFields?.find(f => f.key === 'wizardButtons');
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