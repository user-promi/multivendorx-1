import React, { useState } from 'react';
import './SetupWizard.scss';
import 'zyra/build/index.css';

interface Step {
    title: string;
    description?: string;
    completed: boolean;
    actionText: string;
}

interface Section {
    title: string;
    steps: Step[];
}

// Initial sections data
const sectionsData: Section[] = [
    {
        title: 'Set Up The Basics',
        steps: [
            { title: 'Set Site Title & Tagline', description: 'Give your site a name and tagline.', completed: true, actionText: 'Set Up' },
            { title: 'Review Admin Email', description: 'Ensure your admin email is correct.', completed: false, actionText: 'Review' },
            { title: 'Choose Page Links', description: 'Decide how page links appear.', completed: false, actionText: 'Set Up' },
            { title: 'Search Engine Visibility', description: 'Control search engine indexing.', completed: false, actionText: 'Review' },
        ],
    },
    {
        title: 'Design, Style & Theme',
        steps: [
            { title: 'Pick a Color Scheme', completed: false, actionText: 'Set Up' },
            { title: 'Choose Typography', completed: false, actionText: 'Set Up' },
        ],
    },
    {
        title: 'Design, Style & Theme',
        steps: [
            { title: 'Color Scheme', completed: false, actionText: 'Set Up' },
            { title: 'Choose Typography', completed: false, actionText: 'Set Up' },
        ],
    },
];

const SetupWizard: React.FC = () => {
    const [sections, setSections] = useState<Section[]>(sectionsData);
    const [expandedSection, setExpandedSection] = useState<number | null>(0);

    // Toggle section open/close
    const toggleSection = (index: number) => {
        setExpandedSection(expandedSection === index ? null : index);
    };

    // Toggle step completion
    const toggleStepCompletion = (sectionIdx: number, stepIdx: number) => {
        const newSections = [...sections];
        newSections[sectionIdx].steps[stepIdx].completed = !newSections[sectionIdx].steps[stepIdx].completed;
        setSections(newSections);
    };

    return (
        <div className="wizard-container">
            <h5>Set Up The Basics</h5>
            {sections.map((section, sIdx) => {
                const totalSteps = section.steps.length;
                const completedSteps = section.steps.filter(step => step.completed).length;

                return (
                    <div key={sIdx} className={`wizard-section ${expandedSection === sIdx ? 'expanded' : ''}`}>
                        {/* Section Header */}
                        <div className="wizard-header" onClick={() => toggleSection(sIdx)}>
                            <div className="wizard-title">
                                <span className={`adminlib-pagination-right-arrow ${expandedSection === sIdx ? 'rotate' : ''}`}></span>
                                {section.title}
                            </div>
                            <div className={`admin-badge ${completedSteps === totalSteps ? 'green' : 'blue'}`}>
                                {completedSteps === totalSteps && <i className="adminlib-check"></i>}
                                {completedSteps}/{totalSteps}
                            </div>
                        </div>

                        {/* Steps */}
                        {expandedSection === sIdx && (
                            <div className="wizard-steps">
                                {section.steps.map((step, stepIdx) => (
                                    <div key={stepIdx} className="wizard-step">
                                        <div className="step-info">
                                            <div className="default-checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="mvx-toggle-checkbox"
                                                    id={`step-checkbox-${sIdx}-${stepIdx}`}
                                                    checked={step.completed}
                                                    onChange={() => toggleStepCompletion(sIdx, stepIdx)}
                                                />
                                                <label htmlFor={`step-checkbox-${sIdx}-${stepIdx}`}></label>
                                            </div>

                                            <div className="step-text">
                                                <span className="step-title">{step.title}</span>
                                                {step.description && <span className="step-desc">{step.description}</span>}
                                            </div>
                                        </div>

                                        <button className="admin-btn btn-purple">{step.actionText} <i className="adminlib-arrow-right"></i> </button>
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

export default SetupWizard;
