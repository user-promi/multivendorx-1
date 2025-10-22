// FormTemplates.tsx
import React from 'react';

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  fields: any[];
  buttonSetting: any;
}

interface FormTemplatesProps {
  onTemplateSelect: (template: FormTemplate) => void;
}

const FormTemplates: React.FC<FormTemplatesProps> = ({ onTemplateSelect }) => {
  const templates: FormTemplate[] = [
    {
      id: 'contact',
      name: 'Contact Form',
      description: 'Simple contact form with name, email, and message fields',
      thumbnail: 'https://via.placeholder.com/300x200/007cba/ffffff?text=Contact+Form',
      fields: [
        { id: 1, type: 'title', label: 'Contact Us', required: true },
        { id: 2, type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
        { id: 3, type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email' },
        { id: 4, type: 'textarea', label: 'Message', required: true, placeholder: 'Enter your message' },
      ],
      buttonSetting: { button_text: 'Send Message' }
    },
    {
      id: 'registration',
      name: 'Registration Form',
      description: 'User registration form with multiple field types',
      thumbnail: 'https://via.placeholder.com/300x200/28a745/ffffff?text=Registration+Form',
      fields: [
        { id: 1, type: 'title', label: 'Create Account', required: true },
        { id: 2, type: 'text', label: 'Username', required: true, placeholder: 'Choose a username' },
        { id: 3, type: 'email', label: 'Email', required: true, placeholder: 'Enter your email' },
        { id: 4, type: 'dropdown', label: 'Country', required: true, options: [
          { id: '1', label: 'United States', value: 'us' },
          { id: '2', label: 'United Kingdom', value: 'uk' },
          { id: '3', label: 'Canada', value: 'ca' }
        ]},
      ],
      buttonSetting: { button_text: 'Register' }
    }
  ];

  return (
    <div className="form-templates-wrapper">
      <div className="templates-grid">
        {templates.map(template => (
          <div
            key={template.id}
            className="template-card"
            onClick={() => onTemplateSelect(template)}
          >
            <div className="template-thumbnail">
              <img src={template.thumbnail} alt={template.name} />
            </div>
            <div className="template-content">
              <h4>{template.name}</h4>
              <p>{template.description}</p>
              <button className="admin-btn btn-purple">
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormTemplates;