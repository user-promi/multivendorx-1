import React, { useState, useRef, useEffect, useCallback } from 'react';
import Elements from '../Elements';
import { FormField } from '../RegistrationForm';

const selectOptions: SelectOption[] = [
  {
    icon: 'adminfont-t-letter-bold icon-form-textbox',
    value: 'text',
    label: 'Textbox',
  },
  { icon: 'adminfont-unread icon-form-email', value: 'email', label: 'Email' },
  {
    icon: 'adminfont-text icon-form-textarea',
    value: 'textarea',
    label: 'Textarea',
  },
  {
    icon: 'adminfont-checkbox icon-form-checkboxes',
    value: 'checkboxes',
    label: 'Checkboxes',
  },
  {
    icon: 'adminfont-multi-select icon-form-multi-select',
    value: 'multiselect',
    label: 'Multi Select',
  },
  { icon: 'adminfont-radio icon-form-radio', value: 'radio', label: 'Radio' },
  {
    icon: 'adminfont-dropdown-checklist icon-form-dropdown',
    value: 'dropdown',
    label: 'Dropdown',
  },
  {
    icon: 'adminfont-captcha-automatic-code icon-form-recaptcha',
    value: 'recaptcha',
    label: 'reCaptcha v3',
  },
  {
    icon: 'adminfont-submission-message icon-form-attachment',
    value: 'attachment',
    label: 'Attachment',
  },
  {
    icon: 'adminfont-form-section icon-form-section',
    value: 'section',
    label: 'Section',
  },
  {
    icon: 'adminfont-calendar icon-form-store-description',
    value: 'datepicker',
    label: 'Date Picker',
  },
  {
    icon: 'adminfont-alarm icon-form-address',
    value: 'TimePicker',
    label: 'Time Picker',
  },
  {
    icon: 'adminfont-divider icon-form-address',
    value: 'divider',
    label: 'Divider',
  },
];

// Main Page Builder Component
const EmailTemplate: React.FC = () => {
	const [imagePreview, setImagePreview] = useState<string>('');
	const [formData, setFormData] = useState<Record<string, string>>({});

  

  const activeTab = 'blocks';
  const tabs = [
    {
      id: 'blocks',
      label: 'Blocks',
      content: (
        <>
          <Elements
            label="General"
            selectOptions={selectOptions}
          />
          {/* <Elements
            label="Let’s get your store ready!"
            selectOptions={selectOptionsStore}
          /> */}
        </>
      ),
    },
  ];
  return (
    <div className="registration-from-wrapper">

      <div className="elements-wrapper">
        <div className="tab-titles">
          <div className="title">Blocks</div>
          <div className="title">Templates</div>
        </div>
        <div className="tab-contend">
          {tabs.map(
            (tab) =>
              activeTab === tab.id && (
                <div key={tab.id} className="tab-panel">
                  {tab.content}
                </div>
              )
          )}
        </div>
      </div>

      <div className="registration-form-main-section">

      </div>

      <div className="registration-edit-form-wrapper">
        <div className="registration-edit-form">

        </div>
      </div>
    </div>
  );
};

export default EmailTemplate;