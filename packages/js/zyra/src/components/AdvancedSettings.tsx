import React from 'react';
import ConditionalLogicBuilder from './ConditionalLogicBuilder';
import FormAnalytics from './FormAnalytics';
import EmailTemplateSystem from './EmailTemplateSystem';

interface AdvancedSettingsProps {
    activeTab: string;
    onTabChange: (tab: 'templates' | 'logic' | 'analytics') => void;
    formFields: any[];
    conditionalLogic: any[];
    onConditionalLogicChange: (logic: any[]) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
    activeTab,
    onTabChange,
    formFields,
    conditionalLogic,
    onConditionalLogicChange
}) => {
    return (
        <div className="advanced-settings">
            <div className="advanced-tabs">
                <button
                    className={`tab ${activeTab === 'logic' ? 'active' : ''}`}
                    onClick={() => onTabChange('logic')}
                >
                    Conditional Logic
                </button>
                <button
                    className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => onTabChange('analytics')}
                >
                    Analytics
                </button>
                <button
                    className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
                    onClick={() => onTabChange('templates')}
                >
                    Email Templates
                </button>
            </div>

            <div className="advanced-content">
                {activeTab === 'logic' && (
                    <ConditionalLogicBuilder
                        formFields={formFields}
                        logic={conditionalLogic}
                        onChange={onConditionalLogicChange}
                    />
                )}

                {activeTab === 'analytics' && (
                    <FormAnalytics formFields={formFields} />
                )}

                {activeTab === 'templates' && (
                    <EmailTemplateSystem
                        formFields={formFields}
                        onTemplateSelect={() => {}}
                    />
                )}
            </div>
        </div>
    );
};

export default AdvancedSettings;