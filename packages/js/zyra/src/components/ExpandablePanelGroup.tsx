import React, { useEffect, useRef, useState, ReactNode } from 'react';
import '../styles/web/ExpandablePanelGroup.scss';
import { getApiLink } from '../utils/apiService';
import axios from 'axios';
import { FieldComponent } from './types';
import { FIELD_REGISTRY } from './FieldRegistry';
import FormGroup from './UI/FormGroup';
import { AdminButtonUI } from './AdminButton';
import FormGroupWrapper from './UI/FormGroupWrapper';

// ── Interfaces ────────────────────────────────────────────────────────────────

interface AppLocalizer {
    nonce?: string;        // Required by handleSaveSetupWizard
    khali_dabba?: boolean;
    site_url?: string;
}

interface FieldOption {
    value: string | number;
    label: string;
    desc?: string;
    check?: boolean;
    action?: string;
    url?: string;
    redirect?: string;
}

interface PanelFormField {
    key: string;
    type:
        | 'text'
        | 'checkbox'
        | 'setting-toggle'
        | 'clickable-list'
        | 'notice'
        | 'multi-select'
        | 'button'
        | 'nested';
    label: string;
    placeholder?: string;
    des?: string;
    class?: string;
    desc?: string;
    rowNumber?: number;
    colNumber?: number;
    options?: FieldOption[];
    modal?: ExpandablePanelMethod[];
    look?: string;
    selectDeselect?: boolean;
    rightContent?: string;
    proSetting?: boolean;
    moduleEnabled?: string;
    dependentSetting?: string;
    dependentPlugin?: string;
    title?: string;
    link?: string;
    check?: boolean;
    hideCheckbox?: boolean;
    edit?: boolean;
    iconEnable?: boolean;
    iconOptions?: string[];
    beforeElement?: string | ReactNode;
}

interface ExpandablePanelMethod {
    icon: string;
    id: string;
    label: string;
    connected: boolean;
    disableBtn?: boolean;    // Show enable/disable + settings button instead of the toggle arrow
    hideDeleteBtn?: boolean; // Hide delete button and show "Not Deletable" error text
    countBtn?: boolean;
    desc: string;
    formFields?: PanelFormField[];
    wrapperClass?: string;
    openForm?: boolean;
    single?: boolean;
    rowClass?: string;
    edit?: boolean;
    isCustom?: boolean;      // User-created item — shows edit/delete controls
    required?: boolean;
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
        icon?: boolean;
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
    /** Minimum number of custom panels that must remain (cannot delete below this count). */
    min?: number;
}

// ── Pure helpers (defined outside component to avoid re-creation) ─────────────

/** Fields that count toward wizard progress (excludes UI-only types). */
const isCountableField = (f: PanelFormField) =>
    f.type !== 'button' && f.type !== 'notice';

/**
 * Merge template formFields into a method without overwriting existing keys.
 * Used both for the initial state and in the value-sync effect.
 */
const mergeTemplateFormFields = (
    method: ExpandablePanelMethod,
    templateFields: PanelFormField[]
): ExpandablePanelMethod => {
    const methodFields = method.formFields ?? [];
    const existingKeys = new Set(methodFields.map((f) => f.key));
    return {
        ...method,
        formFields: [
            ...methodFields,
            ...templateFields.filter((f) => !existingKeys.has(f.key)),
        ],
    };
};

// ── Component ─────────────────────────────────────────────────────────────────

export const ExpandablePanelGroupUI: React.FC<ExpandablePanelGroupProps> = ({
    methods,
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
    const [activeTabs, setActiveTabs] = useState<string[]>([]);
    const [wizardIndex, setWizardIndex] = useState(0);
    const [fieldProgress, setFieldProgress] = useState(methods.map(() => 0));
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [iconDropdownOpen, setIconDropdownOpen] = useState<string | null>(null);

    // Inline-editing state
    const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
    const [editingField, setEditingField] = useState<'title' | 'description' | null>(null);
    const [tempTitle, setTempTitle] = useState('');
    const [tempDescription, setTempDescription] = useState('');

    const iconPickerRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const descTextareaRef = useRef<HTMLTextAreaElement>(null);

    const templateFields = addNewTemplate?.formFields ?? [];

    const expandableMethods = useMemo(() => {
   const methodMap = new Map();

   methods.forEach(m => methodMap.set(m.id, m));

   Object.entries(value).forEach(([id, method]) => {
       const existing = methodMap.get(id);

       methodMap.set(id, {
           ...existing,
           ...method
       });
   });

   return Array.from(methodMap.values()).map(m =>
       m.isCustom ? mergeTemplateFormFields(m, templateFields) : m
   );

}, [methods, value, templateFields]);

    // ── Effects ───────────────────────────────────────────────────────────────

    // Focus the inline-edit input as soon as editing begins
    useEffect(() => {
        if (editingMethodId && editingField === 'title') {
            titleInputRef.current?.focus();
            titleInputRef.current?.select();
        } else if (editingMethodId && editingField === 'description') {
            descTextareaRef.current?.focus();
            descTextareaRef.current?.select();
        }
    }, [editingMethodId, editingField]);

    // Close inline edit on outside click (mousedown) or keyboard shortcut
    useEffect(() => {
        if (!editingMethodId || !editingField) return;

        const handleMouseDown = (e: MouseEvent) => {
            const target = e.target as Node;
            const insideTitle = titleInputRef.current?.contains(target);
            const insideDesc = descTextareaRef.current?.contains(target);
            if (!insideTitle && !insideDesc) saveEdit();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') cancelEdit();
            if (e.key === 'Enter' && e.ctrlKey) saveEdit();
        };

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    // saveEdit / cancelEdit read state via closure; re-register when temp values change
    }, [editingMethodId, editingField, tempTitle, tempDescription]);

    // Close the right-section dropdown on any outside click.
    // FIX: Previously used a single wrapperRef inside a .map() — only the last
    // rendered element held the ref, breaking outside-click detection for all
    // other rows. Now we listen on the document only while a dropdown is open,
    // relying on stopPropagation inside the dropdown to keep it alive.
    useEffect(() => {
        if (!openDropdownId) return;
        const close = () => setOpenDropdownId(null);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [openDropdownId]);

    // Close the icon picker on outside click or Escape
    useEffect(() => {
        if (!iconDropdownOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (iconPickerRef.current && !iconPickerRef.current.contains(e.target as Node)) {
                setIconDropdownOpen(null);
            }
        };
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIconDropdownOpen(null);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [iconDropdownOpen]);

    // Recalculate wizard field progress when value changes
    useEffect(() => {
        if (!isWizardMode || !methods?.length) return;

        const updatedProgress = methods.map((method) => {
            const countableFields = method.formFields?.filter(isCountableField) ?? [];
            return countableFields.filter((f) => isFilled(value?.[method.id]?.[f.key])).length;
        });

        setFieldProgress(updatedProgress);
    }, [methods, value, isWizardMode]);

    // ── Helpers ───────────────────────────────────────────────────────────────

    const isFilled = (val: unknown): boolean => {
        if (val === undefined || val === null) return false;
        if (typeof val === 'string') return val.trim() !== '';
        if (Array.isArray(val)) return val.length > 0;
        return true; // number | boolean
    };

    /**
     * Returns true if the given header field is inline-editable for this method.
     * Only custom items support editing; respects the optional editableFields config.
     */
    const getIsEditable = (
        method: ExpandablePanelMethod,
        field: 'title' | 'description' | 'icon'
    ): boolean => {
        if (!method.isCustom) return false;
        if (!addNewTemplate?.editableFields) return field !== 'icon';
        return addNewTemplate.editableFields[field] !== false && field !== 'icon';
    };

    const getPriceFieldValue = (methodId: string) => {
        const methodValue = value[methodId] ?? {};
        const price = methodValue.price;
        const unit  = methodValue.unit;

        if (price === undefined || price === null || price === '') return null;

        const priceDisplay = typeof price === 'number' ? `$${price.toFixed(2)}` : `$${price}`;
        return { price: priceDisplay, unit: unit ? String(unit) : '' };
    };

    // ── Min / delete helpers ──────────────────────────────────────────────────

    /**
     * Returns true when deleting this method would keep the custom count at or
     * above `min`. When `min` is undefined every custom method is deletable.
     */
    const canDeleteMethod = (): boolean => {
        if (min === undefined) return true;
        return expandableMethods.filter((m) => m.isCustom).length > min;
    };

    // ── Inline-editing functions ──────────────────────────────────────────────

    const startEditing = (methodId: string, field: 'title' | 'description') => {
        const method = expandableMethods.find((m) => m.id === methodId);
        if (!method?.isCustom) return;

        const methodValue = value[methodId] ?? {};
        setEditingMethodId(methodId);
        setEditingField(field);

        if (field === 'title') {
            setTempTitle((methodValue.title as string) || method.label || '');
        } else {
            setTempDescription((methodValue.description as string) || method.desc || '');
        }
    };

    const saveEdit = () => {
        if (editingMethodId && editingField) {
            if (editingField === 'title' && tempTitle.trim() !== '') {
                handleInputChange(editingMethodId, 'title', tempTitle.trim());
            } else if (editingField === 'description') {
                handleInputChange(editingMethodId, 'description', tempDescription);
            }
        }
        cancelEdit();
    };

    const cancelEdit = () => {
        setEditingMethodId(null);
        setEditingField(null);
        setTempTitle('');
        setTempDescription('');
    };

    // ── CRUD functions ────────────────────────────────────────────────────────

    const createNewMethod = (): ExpandablePanelMethod => {
        if (!addNewTemplate) {
            throw new Error('addNewTemplate is required when addNewBtn is true');
        }

        const id =
            (addNewTemplate.label ?? 'item').trim().toLowerCase().replace(/\s+/g, '_') +
            Math.floor(Math.random() * 10000);

        return {
            id,
            icon:        addNewTemplate.icon        || '',
            label:       addNewTemplate.label       || 'New Item',
            desc:        addNewTemplate.desc        || '',
            iconEnable:  addNewTemplate.iconEnable  || false,
            iconOptions: addNewTemplate.iconOptions || [],
            connected:   false,
            isCustom:    true,
            disableBtn:  addNewTemplate.disableBtn  || false,
            formFields:  addNewTemplate.formFields?.map((f) => ({ ...f })) ?? [],
        };
    };

    const handleAddNewMethod = () => {
        if (!canAccess) return;

        const newMethod = createNewMethod();

        const initialValues: Record<string, unknown> = {
            isCustom:    true,
            label:       newMethod.label,
            desc:        newMethod.desc,
            required:    newMethod.required ?? false,
            title:       newMethod.label,
            description: newMethod.desc,
        };

        if (newMethod.disableBtn) {
            initialValues.enable    = false;
            initialValues.disableBtn = true;
        }

        if (addNewTemplate?.icon) {
            initialValues.icon = addNewTemplate.icon;
        }

        newMethod.formFields?.forEach((field) => {
            initialValues[field.key] = '';
        });

        onChange({ ...value, [newMethod.id]: initialValues });
        setActiveTabs((prev) => [...prev, newMethod.id]);
    };

    const handleDeleteMethod = (methodId: string) => {
        // Guard: respect the minimum custom-panel count
        if (!canDeleteMethod()) return;

        const updatedValue = { ...value };
        delete updatedValue[methodId];
        onChange(updatedValue);

        setActiveTabs((prev) => prev.filter((id) => id !== methodId));
    };

    // ── Core update function ──────────────────────────────────────────────────

    const handleInputChange = (
        methodKey: string,
        fieldKey: string,
        fieldValue: string | string[] | number | boolean | undefined
    ) => {
        if (fieldKey === 'wizardButtons') return;

        const updated = {
            ...value,
            [methodKey]: {
                ...(value[methodKey] as Record<string, unknown>),
                [fieldKey]: fieldValue,
            },
        };

        if (isWizardMode) {
            const prevValue  = value?.[methodKey]?.[fieldKey];
            const wasFilled  = isFilled(prevValue);
            const nowFilled  = isFilled(fieldValue);

            if (wasFilled !== nowFilled) {
                const methodIndex = methods.findIndex((m) => m.id === methodKey);

                if (methodIndex !== -1) {
                    setFieldProgress((prev) => {
                        const next = [...prev];
                        const maxFields = methods[methodIndex]?.formFields?.filter(isCountableField).length ?? 0;

                        next[methodIndex] = Math.min(
                            Math.max(next[methodIndex] + (nowFilled ? 1 : -1), 0),
                            maxFields
                        );

                        return next;
                    });
                }
            }
        }

        onChange(updated);
    };

    // ── Toggle helpers ────────────────────────────────────────────────────────

    const toggleEnable = (methodId: string, enable: boolean) => {
        handleInputChange(methodId, 'enable', enable);
        if (enable) {
            // Close the settings panel when re-enabling so the user clicks Settings explicitly
            setActiveTabs((prev) => prev.filter((id) => id !== methodId));
        }
    };

    const toggleActiveTab = (methodId: string) => {
        if (isWizardMode) {
            setActiveTabs([methodId]);
        } else {
            setActiveTabs((prev) => (prev[0] === methodId ? [] : [methodId]));
        }
    };

    // Plain functions — no useCallback needed (dependencies are recreated each render anyway)
    const enableMethod  = (id: string) => toggleEnable(id, true);
    const disableMethod = (id: string) => toggleEnable(id, false);
    const setTabActive  = (id: string) => toggleActiveTab(id);

    // ── Wizard helpers ────────────────────────────────────────────────────────

    const handleSaveSetupWizard = () => {
        axios({
            url:     getApiLink(appLocalizer, apilink),
            method:  'POST',
            headers: { 'X-WP-Nonce': appLocalizer?.nonce },
            data:    { setupWizard: true, value },
        }).then((res) => console.log(res));
    };

    const renderWizardButtons = () => {
        const step = expandableMethods[wizardIndex];
        const buttonField = step?.formFields?.find((f) => f.key === 'wizardButtons');
        if (!buttonField) return null;
        return renderField(step.id, buttonField);
    };

    // ── Dependent-field helpers ───────────────────────────────────────────────

    const isContain = (
        key: string,
        methodId: string,
        match: string | number | boolean | null = null
    ): boolean => {
        const settingValue = value[methodId]?.[key];

        if (Array.isArray(settingValue)) {
            return match === null ? settingValue.length > 0 : settingValue.includes(match);
        }

        return match === null ? Boolean(settingValue) : settingValue === match;
    };

    const shouldRender = (dependent: any, methodId: string): boolean => {
        if (dependent.set === true  && !isContain(dependent.key, methodId)) return false;
        if (dependent.set === false &&  isContain(dependent.key, methodId)) return false;
        if (dependent.value !== undefined && !isContain(dependent.key, methodId, dependent.value)) return false;
        return true;
    };

    // ── Field renderer ────────────────────────────────────────────────────────

    const renderField = (methodId: string, field: PanelFormField): JSX.Element | null => {
        const fieldComponent = FIELD_REGISTRY[field.type];
        if (!fieldComponent) return null;

        const Render = fieldComponent.render;
        const fieldValue = value[methodId]?.[field.key];
        const handleInternalChange = (val: any) => handleInputChange(methodId, field.key, val);

        if (field.type === 'button' && isWizardMode && Array.isArray(field.options)) {
            // FIX: Previously filtered by `m.isWizardMode` (a non-existent per-method
            // property), making wizardSteps always empty and breaking wizard navigation.
            // Now we use all methods, indexed by their position.
            const wizardSteps   = methods.map((m, i) => ({ ...m, index: i }));
            const isFirstMethod = wizardIndex === 0;
            const isLastMethod  = wizardIndex === wizardSteps.length - 1;

            const resolvedButtons = field.options.map((btn) => {
                if (btn.action === 'back') {
                    return {
                        ...btn,
                        text:  btn.label,
                        color: 'red',
                        onClick: () => {
                            if (isFirstMethod) return;
                            const prev = wizardSteps[wizardIndex - 1];
                            setWizardIndex(prev.index);
                            setActiveTabs([prev.id]);
                        },
                    };
                }

                if (btn.action === 'next') {
                    return {
                        ...btn,
                        text:  btn.label,
                        color: 'purple',
                        onClick: () => {
                            handleSaveSetupWizard();
                            if (!isLastMethod) {
                                const next = wizardSteps[wizardIndex + 1];
                                setWizardIndex(next.index);
                                setActiveTabs([next.id]);
                                return;
                            }
                            if (btn.redirect) window.open(btn.redirect, '_self');
                        },
                    };
                }

                if (btn.action === 'skip') {
                    return {
                        ...btn,
                        text:  btn.label,
                        color: 'blue',
                        onClick: () => {
                            setWizardIndex(methods.length);
                            window.open(appLocalizer?.site_url, '_self');
                        },
                    };
                }

                return btn;
            });

            return (
                <Render
                    field={{ ...field, options: resolvedButtons }}
                    value={fieldValue}
                    onChange={handleInternalChange}
                    canAccess={canAccess}
                    appLocalizer={appLocalizer}
                />
            );
        }

        return (
            <Render
                field={field}
                value={fieldValue}
                onChange={handleInternalChange}
                canAccess={canAccess}
                appLocalizer={appLocalizer}
            />
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            <div className="expandable-panel-group">
                {expandableMethods.map((method, index) => {
                    if (isWizardMode && index > wizardIndex) return null;

                    const isEnabled          = Boolean(value?.[method.id]?.enable);
                    const isActive           = activeTabs.includes(method.id);
                    const headerIcon         = (value?.[method.id]?.icon as string) || method.icon;
                    const priceField         = getPriceFieldValue(method.id);
                    const currentTitle       = (value?.[method.id]?.title as string) || method.label;
                    const currentDescription = (value?.[method.id]?.description as string) || method.desc;
                    const isEditingThis      = editingMethodId === method.id;
                    const hasFields          = Boolean(method.formFields?.length);

                    return (
                        <div
                            key={method.id}
                            className={`expandable-item ${method.disableBtn && !isEnabled ? 'disable' : ''} ${method.openForm ? 'open' : ''}`}
                        >
                            {/* ── Header ─────────────────────────────────────── */}
                            <div className="expandable-header">

                                {/* Toggle arrow */}
                                {hasFields && (
                                    <div className="toggle-icon">
                                        <i
                                            className={`adminfont-${isActive ? 'keyboard-arrow-down' : 'pagination-right-arrow'}`}
                                            onClick={() => canAccess && setTabActive(method.id)}
                                        />
                                    </div>
                                )}

                                {/* Title / description */}
                                <div
                                    className="details"
                                    onClick={() => canAccess && setTabActive(method.id)}
                                >
                                    <div className="details-wrapper">

                                        {/* Icon picker */}
                                        {headerIcon && (
                                            <div
                                                className="expandable-header-icon"
                                                ref={iconDropdownOpen === method.id ? iconPickerRef : null}
                                                onClick={(e) => {
                                                    if (!method.iconEnable || !canAccess) return;
                                                    e.stopPropagation();
                                                    setIconDropdownOpen((prev) =>
                                                        prev === method.id ? null : method.id
                                                    );
                                                }}
                                            >
                                                <i className={`adminfont-${headerIcon} icon`} />
                                                {method.iconEnable && iconDropdownOpen !== method.id && (
                                                    <i className="adminfont-edit edit-icon" />
                                                )}
                                                {method.iconEnable && iconDropdownOpen === method.id && (
                                                    <div
                                                        className="icon-options-list"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {(method.iconOptions ?? addNewTemplate?.iconOptions ?? []).map((iconClass) => (
                                                            <button
                                                                key={iconClass}
                                                                className={`icon-option ${headerIcon === iconClass ? 'selected' : ''}`}
                                                                onClick={() => {
                                                                    handleInputChange(method.id, 'icon', iconClass);
                                                                    setIconDropdownOpen(null);
                                                                }}
                                                                title={iconClass}
                                                                type="button"
                                                            >
                                                                <i className={`adminfont-${iconClass}`} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="expandable-header-info">
                                            {/* Inline-editable title */}
                                            <div className="title-wrapper">
                                                <span className="title">
                                                    {isEditingThis && editingField === 'title' && getIsEditable(method, 'title') ? (
                                                        <input
                                                            ref={titleInputRef}
                                                            type="text"
                                                            className="inline-edit-input title-edit"
                                                            value={tempTitle}
                                                            onChange={(e) => setTempTitle(e.target.value)}
                                                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); }}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    ) : (
                                                        <span
                                                            className={`title ${getIsEditable(method, 'title') ? 'editable-title' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (getIsEditable(method, 'title')) startEditing(method.id, 'title');
                                                            }}
                                                            title={getIsEditable(method, 'title') ? 'Click to edit' : ''}
                                                        >
                                                            {currentTitle}
                                                            {getIsEditable(method, 'title') && (
                                                                <i className="adminfont-edit inline-edit-icon" />
                                                            )}
                                                        </span>
                                                    )}

                                                    <div className="panel-badges">
                                                        {method.disableBtn && !method.isCustom && (
                                                            <div className={`admin-badge ${isEnabled ? 'green' : 'red'}`}>
                                                                {isEnabled ? 'Active' : 'Inactive'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </span>
                                            </div>

                                            {/* Inline-editable description */}
                                            <div className="panel-description">
                                                {isEditingThis && editingField === 'description' && getIsEditable(method, 'description') ? (
                                                    <textarea
                                                        ref={descTextareaRef}
                                                        className="description-edit"
                                                        value={tempDescription}
                                                        onChange={(e) => setTempDescription(e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) saveEdit(); }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        rows={3}
                                                    />
                                                ) : (
                                                    <p
                                                        className={getIsEditable(method, 'description') ? 'editable-description' : ''}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (getIsEditable(method, 'description')) startEditing(method.id, 'description');
                                                        }}
                                                        title={getIsEditable(method, 'description') ? 'Click to edit' : ''}
                                                    >
                                                        <span dangerouslySetInnerHTML={{ __html: currentDescription }} />
                                                        {getIsEditable(method, 'description') && (
                                                            <i className="adminfont-edit inline-edit-icon" />
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="right-section">
                                    {priceField && (
                                        <span className="price-field">
                                            {priceField.price}
                                            {priceField.unit && (
                                                <span className="desc">{priceField.unit}</span>
                                            )}
                                        </span>
                                    )}

                                    <ul className="settings-btn">
                                        {/* Delete / min controls (custom panels only) */}
                                        {method.isCustom && !method.hideDeleteBtn && canDeleteMethod() && (
                                            <AdminButtonUI
                                                buttons={[{
                                                    icon: 'delete',
                                                    text: 'Delete',
                                                    color: 'red-color',
                                                    onClick: () => handleDeleteMethod(method.id),
                                                }]}
                                            />
                                        )}

                                        {/* Enable / disable / settings controls */}
                                        {method.disableBtn ? (
                                            isEnabled ? (
                                                hasFields && (
                                                    <AdminButtonUI
                                                        buttons={[{
                                                            icon:    'setting',
                                                            text:    'Settings',
                                                            color:   'purple',
                                                            onClick: () => canAccess && setTabActive(method.id),
                                                        }]}
                                                    />
                                                )
                                            ) : (
                                                <li onClick={() => canAccess && enableMethod(method.id)}>
                                                    <span className="admin-btn btn-purple-bg">
                                                        <i className="adminfont-eye" />{' '}
                                                        {method.isCustom ? 'Show' : 'Enable'}
                                                    </span>
                                                </li>
                                            )
                                        ) : (
                                            method.countBtn && (method.formFields?.length ?? 0) > 0 && (() => {
                                                const countableFields = method.formFields!.filter(isCountableField);
                                                return (
                                                    <div className="admin-badge red">
                                                        {fieldProgress[index] || 0}/{countableFields.length}
                                                    </div>
                                                );
                                            })()
                                        )}

                                        {isEnabled && method.isCustom && (
                                            <AdminButtonUI
                                                buttons={[{
                                                    icon:    'eye-blocked',
                                                    text:    'Hide',
                                                    color:   'purple',
                                                    onClick: () => canAccess && disableMethod(method.id),
                                                }]}
                                            />
                                        )}
                                    </ul>

                                    {/* Right-section dropdown (non-custom, enabled methods only) */}
                                    {isEnabled && !method.isCustom && (
                                        // FIX: Previously ref={wrapperRef} was placed inside the map loop,
                                        // causing only the last rendered element to hold the ref.
                                        // Now the dropdown closes via a document-level click listener
                                        // (added in useEffect above) + stopPropagation inside the dropdown.
                                        <div className="icon-wrapper">
                                            <i
                                                className="admin-icon adminfont-more-vertical"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenDropdownId((prev) =>
                                                        prev === method.id ? null : method.id
                                                    );
                                                }}
                                            />
                                            {openDropdownId === method.id && (
                                                <div
                                                    className="dropdown"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="dropdown-body">
                                                        <ul>
                                                            {method.disableBtn && !method.isCustom && (
                                                                isEnabled ? (
                                                                    hasFields && (
                                                                        <li onClick={() => canAccess && setTabActive(method.id)}>
                                                                            <span className="item">
                                                                                <i className="adminfont-setting" />
                                                                                Settings
                                                                            </span>
                                                                        </li>
                                                                    )
                                                                ) : (
                                                                    <li onClick={() => canAccess && enableMethod(method.id)}>
                                                                        <span className="item">
                                                                            <i className="adminfont-eye" /> Enable
                                                                        </span>
                                                                    </li>
                                                                )
                                                            )}
                                                            {isEnabled && !method.isCustom && (
                                                                <li
                                                                    className="delete"
                                                                    onClick={() => canAccess && disableMethod(method.id)}
                                                                >
                                                                    <div className="item">
                                                                        <i className="adminfont-eye-blocked" />
                                                                        Disable
                                                                    </div>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Expandable form body ────────────────────────── */}
                            {hasFields && (
                                <div
                                    className={[
                                        method.wrapperClass || '',
                                        'expandable-panel',
                                        (isActive && isEnabled) || (isActive && (method.isCustom || method.openForm)) || method.openForm
                                            ? 'open'
                                            : '',
                                    ].join(' ').trim()}
                                >
                                    <FormGroupWrapper>
                                        {method.formFields.map((field) => {
                                            if (isWizardMode && field.key === 'wizardButtons') return null;

                                            const shouldShowField = Array.isArray(field.dependent)
                                                ? field.dependent.every((dep) => shouldRender(dep, method.id))
                                                : field.dependent
                                                    ? shouldRender(field.dependent, method.id)
                                                    : true;

                                            if (!shouldShowField) return null;

                                            return (
                                                <FormGroup
                                                    row
                                                    key={field.key}
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
                    <AdminButtonUI
                        buttons={[{
                            icon:    'plus',
                            text:    'Add New',
                            color:   'purple',
                            onClick: handleAddNewMethod,
                        }]}
                    />
                )}
            </div>

            {isWizardMode && renderWizardButtons()}
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
            onChange={(val) => {
                if (!canAccess) return;
                onChange(val);
            }}
            canAccess={canAccess}
        />
    ),

    validate: () => null,
};

export default ExpandablePanelGroup;