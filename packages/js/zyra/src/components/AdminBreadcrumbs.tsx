import React from 'react';

interface AdminBreadcrumbsProps {
    activeTabIcon?: string;
    parentTabName?: string;
    renderBreadcrumb?: () => React.ReactNode;
    renderMenuItems?: (items: any[]) => React.ReactNode;
    tabData?: any[];
}

const AdminBreadcrumbs: React.FC<AdminBreadcrumbsProps> = ({
    activeTabIcon,
    parentTabName,
    renderBreadcrumb,
    renderMenuItems,
    tabData
}) => {
    return (
        <div className="admin-breadcrumbs">
            <div className="breadcrumbs-title">
                {activeTabIcon && <i className={activeTabIcon}></i>}
                {parentTabName}
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
