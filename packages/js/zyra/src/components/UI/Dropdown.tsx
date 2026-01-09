import React, { useState, useRef, useEffect } from 'react';

interface DropdownTab {
    id: string;
    label: string;
    icon?: string;
    content: React.ReactNode;
}

interface DropdownItem {
    title: string;
    icon?: string;
    link?: string;
    targetBlank?: boolean;
    action?: () => void;
    className?: string;
}

interface DropdownProps {
    toggleIcon?: string;
    toggleContent?: React.ReactNode;
    items?: DropdownItem[];
    header?: React.ReactNode;
    footer?: React.ReactNode;
    width?: number | string;
    template?: 'default' | 'notification' | 'user' | 'action' | 'tab';
    tabs?: DropdownTab[];
    defaultActiveTab?: string;
    className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
    toggleIcon,
    toggleContent,
    items = [],
    header,
    footer,
    width = '14rem',
    template = 'default',
    tabs = [],
    defaultActiveTab,
    className = '',
}) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = useState<string | undefined>(
        defaultActiveTab || tabs[0]?.id
    );

    // Reset tab when dropdown opens
    useEffect(() => {
        if (open && template === 'tab') {
            setActiveTab(defaultActiveTab || tabs[0]?.id);
        }
    }, [open, template, tabs, defaultActiveTab]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`icon-wrapper ${className}`} ref={wrapperRef}>
            <div
                className="dropdown-toggle"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((prev) => !prev);
                }}
            >
                {toggleIcon && <i className={toggleIcon}></i>}
                {toggleContent}
            </div>

            {open && (
                <div
                    className={`dropdown dropdown-${template}`}
                    style={{ minWidth: width }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {header && <div className="dropdown-header">{header}</div>}

                    <div className="dropdown-body">
                        {template === 'tab' && tabs.length ? (
                            <div className="dropdown-tabs">
                                {/* Tabs Header */}
                                <div className="dropdown-tab-header">
                                    {tabs.map((tab) => (
                                        <div
                                            key={tab.id}
                                            className={`dropdown-tab ${activeTab === tab.id ? 'active' : ''
                                                }`}
                                            onClick={() => setActiveTab(tab.id)}
                                        >
                                            {tab.icon && <i className={tab.icon}></i>}
                                            <span>{tab.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Tabs Content */}
                                <div className="dropdown-tab-content">
                                    {tabs.map(
                                        (tab) =>
                                            activeTab === tab.id && (
                                                <div key={tab.id}>{tab.content}</div>
                                            )
                                    )}
                                </div>
                            </div>
                        ) : (
                            <ul>
                                {items.map((item, index) => (
                                    <li key={index} className={item.className}>
                                        {item.link ? (
                                            <a
                                                href={item.link}
                                                target={item.targetBlank ? '_blank' : '_self'}
                                                rel={
                                                    item.targetBlank
                                                        ? 'noopener noreferrer'
                                                        : undefined
                                                }
                                                className="item"
                                            >
                                                {item.icon && <i className={item.icon}></i>}
                                                {item.title}
                                            </a>
                                        ) : (
                                            <div
                                                className="item"
                                                onClick={() => {
                                                    item.action?.();
                                                    setOpen(false);
                                                }}
                                            >
                                                {item.icon && <i className={item.icon}></i>}
                                                {item.title}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {footer && <div className="dropdown-footer">{footer}</div>}
                </div>
            )}
        </div>
    );
};

export default Dropdown;