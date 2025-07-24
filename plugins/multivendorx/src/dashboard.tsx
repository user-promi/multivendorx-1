import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Subtab {
  subtab: string;
  label: string;
  component: React.FC;
}

interface TabDefinition {
  tab: string;
  label: string;
  component: React.FC;
  subtabs: Subtab[];
}

const capitalize = (str: string) =>
  str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const getEndpoints = (): TabDefinition[] => {
  const tabs: Record<string, TabDefinition> = {};

  // Main tabs
  const tabContext = require.context('./dashboard', true, /^\.\/[^/]+\/index\.(tsx|ts|js|jsx)$/);
  tabContext.keys().forEach((key) => {
    const [, tab] = key.match(/^\.\/([^/]+)\/index\.(tsx|ts|js|jsx)$/) || [];
    if (!tab) return;

    tabs[tab] = {
      tab,
      label: capitalize(tab),
      component: tabContext(key).default,
      subtabs: [],
    };
  });

  // Subtabs
  const subtabContext = require.context('./dashboard', true, /^\.\/[^/]+\/[^/]+\/index\.(tsx|ts|js|jsx)$/);
  subtabContext.keys().forEach((key) => {
    const [, tab, subtab] = key.match(/^\.\/([^/]+)\/([^/]+)\/index\.(tsx|ts|js|jsx)$/) || [];
    if (!tab || !subtab || !tabs[tab]) return;

    tabs[tab].subtabs.push({
      subtab,
      label: capitalize(subtab),
      component: subtabContext(key).default,
    });
  });

  return Object.values(tabs);
};

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const endpoints = useMemo(getEndpoints, []);

  const query = new URLSearchParams(location.search);
  const currentTab = query.get('tab') || endpoints[0]?.tab || '';
  const currentSubtab = query.get('subtab') || '';

  const current = endpoints.find((e) => e.tab === currentTab);
  const subtabs = current?.subtabs || [];

  const ActiveComponent =
    subtabs.length === 0
      ? current?.component
      : subtabs.find((s) => s.subtab === currentSubtab)?.component || subtabs[0]?.component;

  const updateQuery = (tab: string, subtab?: string) => {
    query.set('tab', tab);
    subtab ? query.set('subtab', subtab) : query.delete('subtab');
    navigate(`?${query.toString()}`);
  };

  if (!current) return <div>No matching tab</div>;

  return (
    <div className="vendor-dashboard">
      <ul className="dashboard-tabs">
        {endpoints.map(({ tab, label, subtabs }) => (
          <li key={tab} className={currentTab === tab ? 'current' : ''}>
            <a
              href={`?tab=${tab}`}
              onClick={(e) => {
                e.preventDefault();
                updateQuery(tab);
              }}
            >
              {label}
            </a>

            {tab === currentTab && subtabs.length > 0 && (
              <ul className="subtabs">
                {subtabs.map(({ subtab, label }) => (
                  <li key={subtab} className={currentSubtab === subtab ? 'current' : ''}>
                    <a
                      href={`?tab=${tab}&subtab=${subtab}`}
                      onClick={(e) => {
                        e.preventDefault();
                        updateQuery(tab, subtab);
                      }}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <div className="tab-content">
        {ActiveComponent ? <ActiveComponent /> : <div>No component found</div>}
      </div>
    </div>
  );
};

export default Dashboard;
