// EmailTemplateSystem.tsx
import React, { useState } from 'react';
import yaml from 'js-yaml';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  yamlConfig: string;
}

interface EmailTemplateSystemProps {
  formFields: any[];
  onTemplateSelect: (template: EmailTemplate) => void;
}

const EmailTemplateSystem: React.FC<EmailTemplateSystemProps> = ({
  formFields,
  onTemplateSelect
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const defaultTemplates: EmailTemplate[] = [
    {
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome to our service, {{name}}!',
      body: `Dear {{name}},

Thank you for registering with us. Here are your details:

Name: {{name}}
Email: {{email}}

Best regards,
Team`,
      variables: ['name', 'email'],
      yamlConfig: `template:
  name: "Welcome Email"
  type: "registration"
  variables:
    - name
    - email
  settings:
    reply_to: "{{email}}"
    cc: "admin@example.com"`
    },
    {
      id: 'notification',
      name: 'Admin Notification',
      subject: 'New registration: {{name}}',
      body: `New user registration:

Name: {{name}}
Email: {{email}}
Business: {{business_type}}

Please review the application.`,
      variables: ['name', 'email', 'business_type'],
      yamlConfig: `template:
  name: "Admin Notification"
  type: "admin_notification"
  variables:
    - name
    - email
    - business_type
  settings:
    to: "admin@example.com"
    priority: "high"`
    }
  ];

  const parseYamlConfig = (yamlString: string) => {
    try {
      return yaml.load(yamlString);
    } catch (error) {
      console.error('YAML parsing error:', error);
      return null;
    }
  };

  const generateYamlFromTemplate = (template: Omit<EmailTemplate, 'yamlConfig'>) => {
    const yamlConfig = {
      template: {
        name: template.name,
        type: 'custom',
        variables: template.variables,
        settings: {
          subject: template.subject,
          from: 'noreply@example.com',
          reply_to: '{{email}}'
        }
      }
    };
    return yaml.dump(yamlConfig);
  };

  const AvailableVariables = () => (
    <div className="available-variables">
      <h4>Available Variables:</h4>
      <div className="variable-list">
        {formFields.map(field => (
          <span
            key={field.name}
            className="variable-tag"
            onClick={() => {
              // Add variable to cursor position in editor
              const variable = `{{${field.name}}}`;
              // Implementation depends on your text editor component
            }}
          >
            {`{{${field.name}}}`}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="email-template-system">
      <div className="template-header">
        <h3>Email Templates</h3>
        <button
          className="admin-btn btn-primary"
          onClick={() => setShowEditor(true)}
        >
          Create Template
        </button>
      </div>

      <div className="template-grid">
        {defaultTemplates.map(template => (
          <div
            key={template.id}
            className="template-card"
            onClick={() => onTemplateSelect(template)}
          >
            <h4>{template.name}</h4>
            <p>{template.subject}</p>
            <div className="template-variables">
              {template.variables.map(variable => (
                <span key={variable} className="variable-badge">
                  {variable}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showEditor && (
        <EmailTemplateEditor
          template={editingTemplate}
          onSave={(template) => {
            setTemplates(prev => [...prev, template]);
            setShowEditor(false);
            setEditingTemplate(null);
          }}
          onClose={() => {
            setShowEditor(false);
            setEditingTemplate(null);
          }}
          availableVariables={formFields.map(f => f.name)}
        />
      )}
    </div>
  );
};

// Email Template Editor Component
const EmailTemplateEditor: React.FC<{
  template?: EmailTemplate | null;
  onSave: (template: EmailTemplate) => void;
  onClose: () => void;
  availableVariables: string[];
}> = ({ template, onSave, onClose, availableVariables }) => {
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [body, setBody] = useState(template?.body || '');
  const [yamlConfig, setYamlConfig] = useState(template?.yamlConfig || '');

  const handleSave = () => {
    const newTemplate: EmailTemplate = {
      id: template?.id || Date.now().toString(),
      name,
      subject,
      body,
      variables: availableVariables, // Extract from body content
      yamlConfig: yamlConfig || generateYamlFromTemplate({
        id: template?.id || Date.now().toString(),
        name,
        subject,
        body,
        variables: availableVariables
      })
    };
    onSave(newTemplate);
  };

  return (
    <div className="email-template-editor-modal">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>{template ? 'Edit Template' : 'Create Template'}</h3>
          <button onClick={onClose} className="close-button">
            <i className="admin-font adminlib-close"></i>
          </button>
        </div>

        <div className="editor-content">
          <div className="editor-sidebar">
            <AvailableVariables />
          </div>

          <div className="editor-main">
            <div className="form-group">
              <label>Template Name</label>
              <input
                type="text"
                className="basic-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                className="basic-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject with {{variables}}"
              />
            </div>

            <div className="form-group">
              <label>Email Body</label>
              <textarea
                className="basic-textarea"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                placeholder="Email body content with {{variables}}"
              />
            </div>

            <div className="form-group">
              <label>YAML Configuration</label>
              <textarea
                className="basic-textarea monospace"
                value={yamlConfig}
                onChange={(e) => setYamlConfig(e.target.value)}
                rows={8}
                placeholder="YAML configuration..."
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="admin-btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="admin-btn btn-primary" onClick={handleSave}>
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateSystem;