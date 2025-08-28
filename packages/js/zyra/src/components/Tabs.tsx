import { useState, useEffect, ReactNode } from 'react';
import { LinkProps } from 'react-router-dom';
import '../styles/web/Tabs.scss';
import AdminBreadcrumbs from './AdminBreadcrumbs';
import AdminFooter, { SupportLink } from './AdminFooter';

type TabContent = {
  id: string;
  name: string;
  desc?: string;
  icon?: string;
  link?: string;
  proDependent?: boolean;
};

type TabData = {
  name?: string;
  type: 'file' | 'folder';
  content: TabContent | TabData[];
};

type BreadcrumbItem = { name: string; id: string; type: string };

type TabsProps = {
  tabData: TabData[];
  currentTab: string;
  getForm: (tabId: string) => ReactNode;
  prepareUrl: (tabId: string) => string;
  HeaderSection?: () => JSX.Element;
  BannerSection?: () => JSX.Element;
  supprot: SupportLink[];
  Link: React.ElementType<LinkProps>;
  settingName?: string;
};

const Tabs: React.FC<TabsProps> = ({
  tabData,
  currentTab,
  getForm,
  prepareUrl,
  HeaderSection,
  BannerSection,
  supprot,
  Link,
  settingName = '',
}) => {
  const [activeTab, setActiveTab] = useState(currentTab);
  const [menuStack, setMenuStack] = useState<TabData[][]>([tabData]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { name: settingName, id: 'all-settings', type: 'root' },
  ]);
  const [noticeHTML, setNoticeHTML] = useState('');

  // Find the first file in a list of tabs
  const findFirstFile = (items: TabData[]): TabContent | null => {
    for (const item of items) {
      if (item.type === 'file') return item.content as TabContent;
      if (item.type === 'folder') {
        const found = findFirstFile(item.content as TabData[]);
        if (found) return found;
      }
    }
    return null;
  };

  // Find the path and menu stack for a tab
  const findTabPath = (tabId: string): { path: BreadcrumbItem[]; stack: TabData[][] } | null => {
    function search(items: TabData[], currentPath: BreadcrumbItem[], currentStack: TabData[][]) {
      for (const item of items) {
        if (item.type === 'file' && (item.content as TabContent).id === tabId) {
          return {
            path: [...currentPath, { name: (item.content as TabContent).name, id: tabId, type: 'file' }],
            stack: [...currentStack],
          };
        }
        if (item.type === 'folder') {
          const result:any = search(
            item.content as TabData[],
            [...currentPath, { name: item.name || '', id: item.name || '', type: 'folder' }],
            [...currentStack, item.content as TabData[]]
          );
          if (result) return result;
        }
      }
      return null;
    }
    return search(tabData, [], [tabData]);
  };

  // Switch to a new tab
  const switchTab = (tabId: string) => {
    setActiveTab(tabId);
    window.history.pushState(null, '', prepareUrl(tabId));
    const tabInfo = findTabPath(tabId);
    if (tabInfo) {
      setMenuStack(tabInfo.stack);
      setBreadcrumbs([{ name: settingName, id: 'all-settings', type: 'root' }, ...tabInfo.path]);
    } else {
      setMenuStack([tabData]);
      setBreadcrumbs([{ name: settingName, id: 'all-settings', type: 'root' }]);
      setActiveTab('');
      window.history.pushState(null, '', prepareUrl(''));
    }
  };

  // Open a folder and go to its first file
  const openFolder = (folderItems: TabData[]) => {
    if (!folderItems.length) return;
    setMenuStack((prev) => [...prev, folderItems]);
    const firstFile = findFirstFile(folderItems);
    if (firstFile) switchTab(firstFile.id);
  };

  // Reset to the main menu
  const resetMenu = () => {
    setMenuStack([tabData]);
    setBreadcrumbs([{ name: settingName, id: 'all-settings', type: 'root' }]);
    const firstFile = findFirstFile(tabData);
    if (firstFile) switchTab(firstFile.id);
    else {
      setActiveTab('');
      window.history.pushState(null, '', prepareUrl(''));
    }
  };

  // Navigate to a breadcrumb
  const navigateToCrumb = (index: number) => {
    const crumb = breadcrumbs[index];
    if (!crumb) return;
    if (crumb.type === 'root') return resetMenu();
    if (crumb.type === 'file') return switchTab(crumb.id);

    let currentItems = tabData;
    for (let i = 1; i <= index; i++) {
      const folder = currentItems.find((item) => item.type === 'folder' && item.name === breadcrumbs[i].id);
      if (folder) currentItems = folder.content as TabData[];
    }
    setMenuStack((prev) => [...prev.slice(0, index), currentItems]);
    const firstFile = findFirstFile(currentItems);
    if (firstFile) switchTab(firstFile.id);
  };

  // Render breadcrumb links
  const renderBreadcrumbs = () =>
    breadcrumbs.map((crumb, index) => (
      <span key={index}>
        {index > 0 && ' / '}
        <Link
          to={crumb.type === 'file' ? prepareUrl(crumb.id) : '#'}
          onClick={(e) => {
            e.preventDefault();
            navigateToCrumb(index);
          }}
        >
          {crumb.name}
        </Link>
      </span>
    ));

  // Get the icon for the active tab
  const getTabIcon = () => {
    function findIcon(items: TabData[]): string | undefined {
      for (const item of items) {
        if (item.type === 'file' && (item.content as TabContent).id === activeTab) {
          return (item.content as TabContent).icon;
        }
        if (item.type === 'folder') {
          const icon = findIcon(item.content as TabData[]);
          if (icon) return icon;
        }
      }
    }
    return findIcon(tabData);
  };

  // Check if a folder contains the active tab
  const isFolderActive = (items: TabData[]): boolean => {
    for (const item of items) {
      if (item.type === 'file' && (item.content as TabContent).id === activeTab) return true;
      if (item.type === 'folder' && isFolderActive(item.content as TabData[])) return true;
    }
    return false;
  };

  // Render a single menu item
  const renderItem = (item: TabData, index: number) => {
    if (item.type === 'file') {
      const tab = item.content as TabContent;
      if (!tab.id || !tab.name) return null;
      return (
        <div
          key={tab.id}
          className={`menu-item ${activeTab === tab.id ? 'active-current-tab' : ''}`}
          onClick={() => switchTab(tab.id)}
        >
          <Link to={prepareUrl(tab.id)}>
            <p className="menu-name">{tab.name}</p>
          </Link>
        </div>
      );
    }
    if (item.type === 'folder') {
      const folderItems = item.content as TabData[];
      if (!folderItems.length) return null;
      const firstFile = findFirstFile(folderItems);
      const folderUrl = firstFile ? prepareUrl(firstFile.id) : '#';
      const isActive = menuStack[menuStack.length - 1] === folderItems || isFolderActive(folderItems);

      return (
        <Link
          key={`folder-${item.name || ''}-${index}`}
          to={folderUrl}
          className={`menu-item ${isActive ? 'active-current-tab' : ''}`}
          onClick={(e) => {
            if (firstFile && e.button === 0 && !e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              openFolder(folderItems);
            }
          }}
        >
          <p className="menu-name">{item.name}</p>
        </Link>
      );
    }
    return null;
  };

  // Render all menu items
  const renderItems = (items: TabData[]) => items.map(renderItem);

  // Get description for the active tab
  const getDescription = () => {
    function findDescription(items: TabData[]): ReactNode {
      for (const item of items) {
        if (item.type === 'file' && (item.content as TabContent).id === activeTab) {
          const tab = item.content as TabContent;
          if (tab.id === 'support') return null;
          return (
            <div className="divider-section" key={tab.id}>
              <div className="title">{tab.name}</div>
              {tab.desc && <div className="desc">{tab.desc}</div>}
            </div>
          );
        }
        if (item.type === 'folder') {
          const desc = findDescription(item.content as TabData[]);
          if (desc) return desc;
        }
      }
      return null;
    }
    return findDescription(tabData);
  };

  // Set up initial tab and handle notices
  useEffect(() => {
    const notice = document.querySelector('#screen-meta + .wrap .notice, #wpbody-content .notice');
    if (notice) {
      setNoticeHTML(notice.outerHTML);
      notice.remove();
    }

    if (currentTab) switchTab(currentTab);
    else {
      const firstFile = findFirstFile(tabData);
      if (firstFile) switchTab(firstFile.id);
    }
  }, [currentTab, tabData]);

  const currentMenu = menuStack[menuStack.length - 1];
  const parentTab = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2]?.name : '';
  const tabIcon = getTabIcon();

  return (
    <>
      <AdminBreadcrumbs
        activeTabIcon={tabIcon}
        parentTabName={parentTab}
        renderBreadcrumb={renderBreadcrumbs}
        renderMenuItems={renderItems}
        tabData={tabData}
        goPremium={true}
      />
      {noticeHTML && <div className="wp-admin-notice" dangerouslySetInnerHTML={{ __html: noticeHTML }} />}
      <div className="general-wrapper">
        {HeaderSection && <HeaderSection />}
        {BannerSection && <BannerSection />}
        <div className="middle-child-container">
          {menuStack.length > 1 && (
            <div id="current-tab-lists" className="current-tab-lists">
              <div className="current-tab-lists-container">{renderItems(currentMenu)}</div>
            </div>
          )}
          <div className="tab-content">
            {getDescription()}
            {getForm(activeTab)}
          </div>
        </div>
      </div>
    </>
  );
};

export default Tabs;