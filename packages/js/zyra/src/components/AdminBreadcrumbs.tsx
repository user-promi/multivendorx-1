import React from 'react';

interface ButtonConfig {
    label?: string;
    onClick?: () => void;
    iconClass?: string;
    className?: string;
}

interface AdminBreadcrumbsProps {
    activeTabIcon?: string;
    parentTabName?: string;
    renderBreadcrumb?: () => React.ReactNode;
    renderMenuItems?: (items: any[]) => React.ReactNode;
    tabData?: any[];
    buttons?: (ButtonConfig | React.ReactNode)[]; // Can be config objects or React elements
}

const AdminBreadcrumbs: React.FC<AdminBreadcrumbsProps> = ({
    activeTabIcon,
    parentTabName,
    renderBreadcrumb,
    renderMenuItems,
    tabData,
    buttons
}) => {
    return (
        <div className="admin-breadcrumbs">
            <div className="breadcrumbs-title">
                {activeTabIcon && <i className={activeTabIcon}></i>}
                {parentTabName}

                {/* Render dynamic buttons */}
                {Array.isArray(buttons) &&
                    buttons.map((btn, index) => {
                        // If user passed JSX directly
                        if (React.isValidElement(btn)) {
                            return <React.Fragment key={index}>{btn}</React.Fragment>;
                        }

                        // If user passed config object
                        const { label, onClick, iconClass, className } = btn as ButtonConfig;
                        return (
                            <button
                                key={index}
                                className={`breadcrumb-btn ${className || ''}`}
                                onClick={onClick}
                            >
                                {iconClass && <i className={iconClass}></i>}
                                {label}
                            </button>
                        );
                    })}
            </div>

            {renderBreadcrumb && (
                <p className="breadcrumbs-menu">{renderBreadcrumb()}</p>
            )}

            <div id="top-level-tab-lists" className="current-tab-lists">
                <div className="current-tab-lists-container">
                    {renderMenuItems && tabData && renderMenuItems(tabData)}
                    <a href="#" className="menu-item pro-btn">
                        Go Premium<i className="adminlib-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminBreadcrumbs;
