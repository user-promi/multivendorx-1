import React, { useEffect, useRef, useState } from "react";
import "../styles/web/PaymentTabsComponent.scss";
import TextArea from "./TextArea";
import ToggleSetting from "./ToggleSetting";
import MultiCheckBox from "./MultiCheckbox";

interface PaymentFormField {
  key: string;
  type:
  | "text"
  | "password"
  | "number"
  | "checkbox"
  | "verification-methods"
  | "textarea"
  | "payment-tabs"
  | "multi-checkbox"
  | "description"
  | "setting-toggle";
  label: string;
  placeholder?: string;
  nestedFields?: any[];
  des?: string;
  addButtonLabel?: string;
  deleteButtonLabel?: string;
  class?: string;
  desc?: string;
  rowNumber?: number;
  colNumber?: number;
  options?: any;
  modal?: PaymentMethod[];
  look?: string;
  selectDeselect?: boolean;
  rightContent?: string;
  addNewBtn?: boolean;
  proSetting?: boolean;
  moduleEnabled?: string;
  dependentSetting?: string;
  dependentPlugin?: string;
}

interface PaymentMethod {
  icon: string;
  id: string;
  label: string;
  connected: boolean;
  disableBtn?: boolean;
  countBtn?: boolean;
  desc: string;
  formFields?: PaymentFormField[];
  toggleType?: "icon" | "checkbox";
  wrapperClass?: string;
  openForm?: boolean;
}

interface PaymentTabsComponentProps {
  name: string;
  proSetting?: boolean;
  proSettingChanged?: () => void;
  apilink?: string;
  appLocalizer?: Record<string, any>;
  methods: PaymentMethod[];
  value: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  buttonEnable?: boolean;
}

const PaymentTabsComponent: React.FC<PaymentTabsComponentProps> = ({
  methods,
  value,
  onChange,
  appLocalizer,
}) => {
  const [activeTabs, setActiveTabs] = useState<string[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [modelOpen, setModelOpen] = useState(false);

  const handleInputChange = (
    methodKey: string,
    fieldKey: string,
    fieldValue: any
  ) => {
    onChange({
      ...value,
      [methodKey]: {
        ...value[methodKey],
        [fieldKey]: fieldValue,
      },
    });
  };

  const toggleEnable = (methodId: string, enable: boolean, icon?: string) => {
    handleInputChange(methodId, "enable", enable);
    if (!enable) {
      setActiveTabs((prev) => prev.filter((id) => id !== methodId));
    }
  };

  const toggleActiveTab = (methodId: string) => {
    setActiveTabs((prev) =>
      prev.includes(methodId)
        ? prev.filter((id) => id !== methodId) // close
        : [...prev, methodId] // open
    );
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isProSetting = (val: boolean) => val;
  const hasAccess = () => true;
  const handlMultiSelectDeselectChange = (key: string, opts: any[]) => {
    console.log("Multi select/deselect triggered:", key, opts);
  };

  const renderField = (methodId: string, field: PaymentFormField) => {
    const fieldValue = value[methodId]?.[field.key];

    switch (field.type) {
      case "payment-tabs":
        return (
          <PaymentTabsComponent
            name={field.key}
            methods={field.modal || []}
            value={fieldValue || {}}
            onChange={(val) => handleInputChange(methodId, field.key, val)}
          />
        );

      case "setting-toggle":
        return (
          <ToggleSetting
            key={field.key}
            description={field.desc}
            options={
              Array.isArray(field.options)
                ? field.options.map((opt) => ({
                  ...opt,
                  value: String(opt.value),
                }))
                : []
            }
            value={fieldValue || ""}
            onChange={(val) => handleInputChange(methodId, field.key, val)}
          />
        );

      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={!!fieldValue}
            onChange={(e) =>
              handleInputChange(methodId, field.key, e.target.checked)
            }
          />
        );

      case "textarea":
        return (
          <TextArea
            wrapperClass="setting-from-textarea"
            inputClass={`${field.class || ""} textarea-input`}
            descClass="settings-metabox-description"
            description={field.desc || ""}
            key={field.key}
            id={field.key}
            name={field.key}
            placeholder={field.placeholder}
            rowNumber={field.rowNumber}
            colNumber={field.colNumber}
            value={fieldValue || ""}
            proSetting={false}
          />
        );
      case "multi-checkbox":
        let normalizedValue: string[] = [];

        if (Array.isArray(fieldValue)) {
          normalizedValue = fieldValue.filter((v) => v && v.trim() !== "");
        } else if (typeof fieldValue === "string" && fieldValue.trim() !== "") {
          normalizedValue = [fieldValue];
        }

        return (
          <MultiCheckBox
            khali_dabba={appLocalizer?.khali_dabba ?? false}
            wrapperClass={
              field.look === "toggle"
                ? "toggle-btn"
                : field.selectDeselect === true
                  ? "checkbox-list-side-by-side"
                  : "simple-checkbox"
            }
            descClass="settings-metabox-description"
            description={field.desc}
            selectDeselectClass="admin-btn btn-purple select-deselect-trigger"
            inputWrapperClass="toggle-checkbox-header"
            inputInnerWrapperClass={
              field.look === "toggle" ? "toggle-checkbox" : "default-checkbox"
            }
            inputClass={field.class}
            tour={undefined}
            hintOuterClass="settings-metabox-description"
            hintInnerClass="hover-tooltip"
            idPrefix="toggle-switch"
            selectDeselect={field.selectDeselect}
            selectDeselectValue="Select / Deselect All"
            rightContentClass="settings-metabox-description"
            options={
              Array.isArray(field.options)
                ? field.options.map((opt) => ({
                  ...opt,
                  value: String(opt.value),
                }))
                : []
            }
            value={normalizedValue}
            proSetting={isProSetting(field.proSetting ?? false)}
            onMultiSelectDeselectChange={() =>
              handlMultiSelectDeselectChange(
                field.key,
                Array.isArray(field.options)
                  ? field.options.map((opt) => ({
                    ...opt,
                    value: String(opt.value),
                  }))
                  : []
              )
            }
            proChanged={() => setModelOpen(true)}
          />
        );
      case "description":
        return (
          <>
            {field.des && (
              <p
                className="payment-description"
                dangerouslySetInnerHTML={{ __html: field.des }}
              ></p>
            )}
          </>
        );
      default:
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            value={fieldValue || ""}
            className="basic-input"
            onChange={(e) =>
              handleInputChange(methodId, field.key, e.target.value)
            }
          />
        );
    }
  };

  return (
    <div className="payment-tabs-component">
      {methods.map((method) => {
        const isEnabled = value?.[method.id]?.enable ?? false;
        const isActive = activeTabs.includes(method.id);
        const isMenuOpen = openMenu === method.id;

        return (
          <div
            key={method.id}
            className={`payment-method-card ${method.disableBtn && !isEnabled ? "disable" : ""} ${method.openForm ? "open-form" : ""} `}
          >
            {/* Header */}
            <div className="payment-method">
              {!method.openForm && (
                <div className="toggle-icon">
                  <i
                    className={`adminlib-${isEnabled && isActive ? "keyboard-arrow-down" : "pagination-right-arrow"}`}
                    onClick={() => toggleActiveTab(method.id)}
                  />
                </div>
              )}

              <div
                className="details"
                onClick={() => toggleActiveTab(method.id)}
              >
                <div className="details-wrapper">
                  <div className="payment-method-icon">
                    <i className={method.icon}></i>
                  </div>
                  <div className="payment-method-info">
                    <div className="title-wrapper">
                      <span className="title">{method.label}</span>

                      {method.disableBtn ? (
                        <>
                          <div
                            className={`admin-badge ${isEnabled ? "green" : "red"
                              }`}
                          >
                            {isEnabled ? "Active" : "Inactive"}
                          </div>
                        </>
                      ) : null}

                      {method.countBtn && (
                        <div className="admin-badge red">1/3</div>
                      )}


                    </div>
                    <div className="method-desc">
                      <p dangerouslySetInnerHTML={{ __html: method.desc }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="right-section" ref={menuRef}>
                {method.disableBtn ? (
                  <ul>
                    {isEnabled ? (
                      <>
                        <li
                          onClick={() => toggleActiveTab(method.id)}
                        >
                          <i className="adminlib-setting"></i>
                          <span>Settings</span>
                        </li>
                        <li
                          onClick={() =>
                            toggleEnable(method.id, false, method.icon)
                          }
                        >
                          <i className="disable-icon adminlib-eye-blocked"></i>
                          <span>Disable</span>
                        </li>
                      </>
                    ) : (
                      <li
                        onClick={() =>
                          toggleEnable(method.id, true, method.icon)
                        }
                      >
                        <i className="eye-icon adminlib-eye"></i>
                        <span>Enable</span>
                      </li>
                    )}
                  </ul>
                ) : method.countBtn ? (
                  <div className="admin-badge red">1/3</div>
                ) : null}

              </div>
            </div>

            {method.formFields && method.formFields.length > 0 && (
              <div
                className={`${method.wrapperClass || ""} payment-method-form ${isEnabled && (isActive || method.openForm) ? "open" : ""}`}
              >
                {method.formFields.map((field) => (
                  <div key={field.key} className="form-group">
                    {field.label && <label>{field.label}</label>}
                    <div className="input-content">
                      {renderField(method.id, field)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PaymentTabsComponent;
