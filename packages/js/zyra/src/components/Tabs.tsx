/**
 * External dependencies
 */
import { LinkProps } from 'react-router-dom';
import { useState, useEffect, ReactNode } from 'react';

/**
 * Internal dependencies
 */
import '../styles/web/Tabs.scss';
import AdminForm from './AdminForm';
import AdminHeader from './AdminHeader';
import AdminBreadcrumbs from './AdminBreadcrumbs';

// ------------------ Types ------------------
type TabContent = {
  id: string;
  name: string;
  desc?: string;
  icon?: string;
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
  appLocalizer: any;
  brandImg: string;
  smallbrandImg: string;
  Link: React.ElementType<LinkProps>;
  settingName?: string;
};

// ------------------ Utils ------------------

/**
 * Traverse tabData tree depth-first and run a callback on each node.
 * - Stops traversal when callback returns a truthy value.
 * - Useful for searching tabs or building breadcrumb paths.
 */
const traverseTabData = <T,>(
  data: TabData[],
  callback: (item: TabData, path: BreadcrumbItem[], stack: TabData[][]) => T | null,
  initialPath: BreadcrumbItem[] = [],
  initialStack: TabData[][] = [data]
): T | null => {
  const stack: { items: TabData[]; path: BreadcrumbItem[]; stack: TabData[][] }[] = [
    { items: data, path: initialPath, stack: initialStack },
  ];

  while (stack.length) {
    const { items, path, stack: currentStack } = stack.pop()!;
    for (const item of items) {
      const result = callback(item, path, currentStack);
      if (result) return result;

      if (item.type === 'folder') {
        stack.push({
          items: item.content as TabData[],
          path: [...path, { name: item.name ?? '', id: item.name ?? '', type: 'folder' }],
          stack: [...currentStack, item.content as TabData[]],
        });
      }
    }
  }
  return null;
};

// ------------------ Component ------------------
const Tabs: React.FC<TabsProps> = ({
  tabData,
  currentTab,
  getForm,
  prepareUrl,
  HeaderSection,
  BannerSection,
  appLocalizer,
  brandImg,
  smallbrandImg,
  Link,
  settingName = '',
}) => {
  const [menuCol, setMenuCol] = useState(false);
  const [activeTab, setActiveTab] = useState(currentTab);
  const [menuStack, setMenuStack] = useState<TabData[][]>([tabData]);
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([
    { name: settingName, id: 'all-settings', type: 'root' },
  ]);
  const [noticeHTML, setNoticeHTML] = useState('');

  /**
   * Find the first file (leaf node) inside given tab items.
   */
  const findFirstFile = (items: TabData[]): TabContent | null =>
    traverseTabData(items, (item) =>
      item.type === 'file' ? (item.content as TabContent) : null
    );

  /**
   * Find breadcrumb path and menu stack for a given tabId.
   */
  const findTabPath = (tabId: string) =>
    traverseTabData(tabData, (item, path, stack) => {
      if (item.type === 'file' && (item.content as TabContent).id === tabId) {
        return {
          path: [...path, { name: (item.content as TabContent).name, id: tabId, type: 'file' }],
          stack,
        };
      }
      return null;
    });

  /**
   * Set active tab:
   * - updates state
   * - pushes new URL
   * - rebuilds breadcrumb + menu stack
   */
  const setTab = (tabId: string) => {
    setActiveTab(tabId);
    window.history.pushState(null, '', prepareUrl(tabId));
    const result = findTabPath(tabId);
    if (result) {
      const isTopLevel = tabData.some(
        (item) => item.type === 'file' && (item.content as TabContent).id === tabId
      );
      setMenuStack(isTopLevel ? [tabData] : result.stack);
      setBreadcrumbPath([{ name: settingName, id: 'all-settings', type: 'root' }, ...result.path]);
    }
  };

  /**
   * Open a folder and navigate to its first file.
   */
  const openFolder = (items: TabData[]) => {
    if (!items.length) return;
    setMenuStack((prev) => [...prev, items]);
    const firstFile = findFirstFile(items);
    if (firstFile) setTab(firstFile.id);
  };

  /**
   * Reset menu + breadcrumbs to root level.
   */
  const reset = () => {
    setMenuStack([tabData]);
    setBreadcrumbPath([{ name: settingName, id: 'all-settings', type: 'root' }]);
    const firstFile = findFirstFile(tabData);
    if (firstFile) setTab(firstFile.id);
    else setActiveTab('');
  };

  /**
   * Navigate to a given breadcrumb index.
   */
  const goToCrumb = (index: number) => {
    const crumb = breadcrumbPath[index];
    if (!crumb) return;
    if (crumb.type === 'root') return reset();
    if (crumb.type === 'file') return setTab(crumb.id);

    // Traverse into folder path
    let currentData = tabData;
    for (let i = 1; i <= index; i++) {
      const folder = currentData.find(
        (item) => item.type === 'folder' && item.name === breadcrumbPath[i].id
      );
      if (folder) currentData = folder.content as TabData[];
    }
    setMenuStack((prev) => [...prev.slice(0, index), currentData]);
    const firstFile = findFirstFile(currentData);
    if (firstFile) setTab(firstFile.id);
  };

  /**
   * Render breadcrumb UI.
   */
  const renderBreadcrumbs = () =>
    breadcrumbPath.map((crumb, index) => (
      <span key={index}>
        {index > 0 && ' / '}
        <Link
          to={crumb.type === 'file' ? prepareUrl(crumb.id) : '#'}
          onClick={(e) => {
            e.preventDefault();
            goToCrumb(index);
          }}
        >
          {crumb.name}
        </Link>
      </span>
    ));

  /**
   * Get the icon of currently active tab.
   */
  const getTabIcon = (): string | undefined =>
    traverseTabData(tabData, (item) =>
      item.type === 'file' && (item.content as TabContent).id === activeTab
        ? (item.content as TabContent).icon
        : null
    ) ?? undefined;
  
  /**
   * Check if a folder contains the active tab.
   */
  const isFolderActive = (items: TabData[]) =>
    traverseTabData(items, (item) =>
      item.type === 'file' && (item.content as TabContent).id === activeTab ? true : null
    ) || false;

  /**
   * Render a single menu item (file or folder).
   */
  const renderItem = (item: TabData, index: number) => {
    if (item.type === 'file') {
      const tab = item.content as TabContent;
      if (!tab.id || !tab.name) return null;
      return (
        <div
          key={tab.id}
          className={`menu-item ${activeTab === tab.id ? 'active-current-tab' : ''}`}
          onClick={() => setTab(tab.id)}
        >
          <Link to={prepareUrl(tab.id)}>
            <p className="menu-name">{tab.name}</p>
          </Link>
        </div>
      );
    }
    if (item.type === 'folder') {
      const folderContent = item.content as TabData[];
      if (!folderContent.length) return null;
      const firstFile = findFirstFile(folderContent);
      const folderUrl = firstFile ? prepareUrl(firstFile.id) : '#';
      const isActive = menuStack[menuStack.length - 1] === folderContent || isFolderActive(folderContent);

      return (
        <Link
          key={`folder-${item.name ?? ''}-${index}`}
          to={folderUrl}
          className={`menu-item ${isActive ? 'active-current-tab' : ''}`}
          onClick={(e) => {
            if (firstFile) {
              e.preventDefault();
              openFolder(folderContent);
            }
          }}
        >
          <p className="menu-name">{menuCol ? null : item.name}</p>
        </Link>
      );
    }
    return null;
  };

  /**
   * Render multiple menu items.
   */
  const renderItems = (items: TabData[]) => items.map(renderItem);

  /**
   * Render description section for active tab.
   */
  const getDescription = () =>
    traverseTabData(tabData, (item) => {
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
      return null;
    }) || [];

  // ------------------ Effects ------------------
  useEffect(() => {
    // Capture WordPress notices and remove from DOM
    const notice = document.querySelector('#screen-meta + .wrap .notice, #wpbody-content .notice');
    if (notice) {
      setNoticeHTML(notice.outerHTML);
      notice.remove();
    }

    // Set initial tab on mount
    if (currentTab) setTab(currentTab);
    else {
      const firstFile = findFirstFile(tabData);
      if (firstFile) setTab(firstFile.id);
    }
  }, [currentTab, tabData]);

  // ------------------ Render ------------------
  const currentMenu = menuStack[menuStack.length - 1];
  const parentTab = breadcrumbPath.length > 1 ? breadcrumbPath[breadcrumbPath.length - 2]?.name : '';
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
        <div className={`${menuCol ? 'show-menu' : ''} middle-child-container`}>
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
