import notifima from "../../assets/images/brand-icon.png";
import catalogx from "../../assets/images/catalogx.png";
import Mascot from "../../assets/images/multivendorx-mascot-scaled.png";
import freePro from "../../assets/images/dashboard-1.png";

interface Section {
  title: string;
  features: Feature[];
}
interface Module {
  id: string;
  name: string;
  iconClass: string;
  pro?: boolean;
  hasToggle?: boolean;
}
interface Feature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
}


import "./adminDashboard.scss";
import "../dashboard.scss";
import { useEffect, useState } from 'react';
import { getApiLink, ProPopup, sendApiResponse, useModules } from "zyra";
import axios from "axios";
import { Dialog } from "@mui/material";

const AdminDashboard = () => {
  const { modules, insertModule, removeModule } = useModules();
  const [installing, setInstalling] = useState<string>('');
  const [pluginStatus, setPluginStatus] = useState<{ [key: string]: boolean }>({});
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Check plugin installation status on component mount
  useEffect(() => {
    checkPluginStatus('woocommerce-catalog-enquiry');
    checkPluginStatus('woocommerce-product-stock-alert');
  }, []);

  // Function to check if plugin is installed and active
  const checkPluginStatus = async (slug: string) => {
    try {
      const response = await axios({
        method: 'GET',
        url: `${appLocalizer.apiUrl}/wp/v2/plugins`,
        headers: {
          'X-WP-Nonce': appLocalizer.nonce,
        },
      });

      // Check if our plugin exists and is active
      const plugins = response.data;
      const pluginExists = plugins.some((plugin: any) =>
        plugin.plugin.includes(slug) && plugin.status === 'active'
      );

      setPluginStatus(prev => ({
        ...prev,
        [slug]: pluginExists
      }));

    } catch (error) {
      console.error(`Failed to check plugin status "${slug}":`, error);
      setPluginStatus(prev => ({
        ...prev,
        [slug]: false
      }));
    }
  };

  const installOrActivatePlugin = async (slug: string) => {
    if (!slug || installing) return; // prevent multiple clicks
    setInstalling(slug);
  
    try {
      // Step 1: Get current plugins
      const { data: plugins } = await axios.get(`${appLocalizer.apiUrl}/wp/v2/plugins`, {
        headers: { 'X-WP-Nonce': appLocalizer.nonce },
      });
  
      // Step 2: Find if plugin exists
      const existingPlugin = plugins.find((plugin: any) => plugin.plugin.includes(slug));
      const pluginFilePath = existingPlugin?.plugin || `${slug}/${slug}.php`;
  
      // Step 3: Determine action
      let apiUrl = `${appLocalizer.apiUrl}/wp/v2/plugins`;
      let requestData: any = { status: 'active' }; // default request for activation
  
      if (!existingPlugin) {
        // Plugin not installed → install & activate
        requestData.slug = slug;
      } else if (existingPlugin.status === 'active') {
        setSuccessMsg(`Plugin "${slug}" is already active.`);
        await checkPluginStatus(slug);
        return;
      } else {
        // Plugin installed but inactive → just activate
        const encodedFile = encodeURIComponent(pluginFilePath);
        apiUrl += `/${encodedFile}`;
      }
  
      // Step 4: Call API
      await axios.post(apiUrl, requestData, {
        headers: { 'X-WP-Nonce': appLocalizer.nonce },
      });
  
      // Step 5: Refresh status
      await checkPluginStatus(slug);
  
      setSuccessMsg(`Plugin "${slug}" ${existingPlugin ? 'activated' : 'installed & activated'} successfully!`);
    } catch (error) {
      console.error(error);
      setSuccessMsg(`Failed to install/activate plugin "${slug}".`);
    } finally {
      setTimeout(() => setSuccessMsg(''), 3000);
      setInstalling('');
    }
  };
  

  const handleOnChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    moduleId: string
  ) => {
    const action = event.target.checked ? 'activate' : 'deactivate';
    try {
      if (action === 'activate') {
        insertModule?.(moduleId);
      } else {
        removeModule?.(moduleId);
      }
      localStorage.setItem(`force_multivendorx_context_reload`, 'true');
      await sendApiResponse(appLocalizer, getApiLink(appLocalizer, 'modules'), {
        id: moduleId,
        action,
      });
      setSuccessMsg(`Module ${action}d`);
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (error) {
      setSuccessMsg(`Error: Failed to ${action} module`);
      setTimeout(() => setSuccessMsg(''), 2000);
    }
  };

  const resources = [
    {
      title: "Documentation",
      desc: "Step-by-step guides to set up and manage your marketplace.",
      iconClass: "adminlib-book",
      linkText: "Explore Docs",
      href: "https://multivendorx.com/docs/knowledgebase/",
    },
    {
      title: "Expert consultation",
      desc: "Get tailored advice from our marketplace specialists.",
      iconClass: "adminlib-preview",
      linkText: "Book Consultation",
      href: "https://multivendorx.com/custom-development/",
    },
    {
      title: "Developer community",
      desc: "Connect with our team and fellow builders on Discord.",
      iconClass: "adminlib-global-community",
      linkText: "Join Discord",
      href: "https://discord.com/channels/1376811097134469191/1376811102020829258",
    },
    {
      title: "Facebook group",
      desc: "Share experiences and tips with other marketplace owners.",
      iconClass: "adminlib-user-circle",
      linkText: "Join Group",
      href: "https://www.facebook.com/groups/226246620006065/",
    },
  ];
  const featuresList = [
    {
      title: "Membership rewards & commission",
      desc: "Charge your sellers a monthly or yearly membership fee to sell on your marketplace - predictable revenue every month.",
      iconClass: "adminlib-commission",
      linkText: "Join Discord",
      href: "#",
    },
    {
      title: "Verified stores only",
      desc: "Screen stores with document verification and approval - build a trusted marketplace from day one.",
      iconClass: "adminlib-verification3",
      linkText: "Join Discord",
      href: "#",
    },
    {
      title: "Diversified marketplace",
      desc: "Enable bookings, subscriptions, and auctions to boost sales and engagement.",
      iconClass: "adminlib-marketplace",
      linkText: "Explore Docs",
      href: "#",
    },
    {
      title: "Vacation mode for stores",
      desc: "Stores can pause their stores temporarily with automatic buyer notifications - no missed messages.",
      iconClass: "adminlib-vacation",
      linkText: "Explore Docs",
      href: "#",
    },
    {
      title: "Never run out of stock",
      desc: "Real-time inventory tracking with automatic low-stock alerts keeps sellers prepared and buyers happy.",
      iconClass: "adminlib-global-community",
      linkText: "Book Consultation",
      href: "#",
    },
    {
      title: "Autopilot notifications",
      desc: "Automatic emails and alerts for every order, refund, and payout - everyone stays in the loop.",
      iconClass: "adminlib-notification",
      linkText: "Join Discord",
      href: "#",
    }
  ];

  const sections: Section[] = [
    {
      title: 'Product & store tools',
      features: [
        { name: "Multiple vendors per product (SPMV)", free: true, pro: true },
        { name: "Store policies", free: true, pro: true },
        { name: "Store reviews", free: true, pro: true },
        { name: "Follow store", free: true, pro: true },
        { name: "Privacy controls to show/hide store details)", free: true, pro: true },
        { name: "Confirm vendor identity with documents", free: false, pro: true },
        { name: "Bulk upload/download product via CSV", free: false, pro: true },
        { name: "Display store opening/closing times", free: false, pro: true },
        { name: "Store can temporarily close shop with customer notice", free: false, pro: true },
        { name: "Assign assistants to your store and control what they can access", free: false, pro: true },
      ],
    },
    {
      title: ' Get paid without hassle',
      features: [
        { name: "Bank transfer", free: true, pro: true },
        { name: "PayPal payout", free: true, pro: true },
        { name: "Stripe connect", free: true, pro: true },
        { name: "Razorpay", free: true, pro: true },
        { name: "Real-time split payments", free: false, pro: true },
      ],
    },
    {
      title: ' Deliver seamless shopping experiences',
      features: [
        { name: "Product Q&A", free: true, pro: true },
        { name: "Marketplace refunds", free: true, pro: true },
        { name: "Announcements", free: true, pro: true },
        { name: "Product abuse report", free: true, pro: true },
        { name: "Invoices & packing slips", free: false, pro: true },
        { name: "Live chat", free: false, pro: true },
        { name: "Customer support", free: false, pro: true },
        { name: "Product enquiry", free: false, pro: true },
      ],
    },
    {
      title: ' Ship the way you want',
      features: [
        { name: "Zone-based shipping", free: true, pro: true },
        { name: "Distance-based shipping", free: true, pro: true },
        { name: "Country restrictions", free: true, pro: true },
        { name: "Weight-based shipping", free: true, pro: true },
        { name: "Per-product shipping", free: false, pro: true },
      ],
    },
    {
      title: ' Sell in different ways',
      features: [
        { name: "Optimize store & product SEO with Yoast or Rank Math", free: false, pro: true },
        { name: "Sales, revenue, and order reports", free: false, pro: true },
        { name: "Store with different capabilities as per subsctiption plan", free: false, pro: true },
        { name: "Paid product promotions", free: false, pro: true },
        { name: "Special pricing & bulk rules for groups", free: false, pro: true },
        { name: "Low-stock alerts, waitlists, inventory management", free: false, pro: true },
      ],
    },
    {
      title: 'Automate rules and commissions',
      features: [
        { name: "Payment gateway fees", free: true, pro: true },
        { name: "Min/Max quantities", free: true, pro: true },
        { name: "Facilitator fees", free: false, pro: true },
        { name: "Marketplace fees", free: false, pro: true },
      ],
    },
  ];

  const renderCell = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <i className="check-icon adminlib-check"></i>
      ) : (
        <i className="close-icon adminlib-close"></i>
      );
    }
    return value; // text like "Basic" or "Advanced"
  };

  const Modules: Module[] = [
    { id: 'spmv', name: 'Single product multiple vendor', iconClass: 'adminlib-spmv', pro: false },
    { id: 'staff-manager', name: 'Staff manager', iconClass: 'adminlib-staff-manager', pro: true },
    { id: 'vacation', name: 'Vacation mode', iconClass: 'adminlib-vacation', pro: true },
    { id: 'business-hours', name: 'Business hours', iconClass: 'adminlib-business-hours', pro: true },
    { id: 'store-inventory', name: 'Store inventory', iconClass: 'adminlib-store-inventory', pro: true },
    { id: 'min-max-quantities', name: 'Min/Max quantities', iconClass: 'adminlib-min-max', pro: false },
    { id: 'wholesale', name: 'Wholesale', iconClass: 'adminlib-wholesale', pro: true },
    { id: 'paypal-marketplace', name: 'PayPal marketplace', iconClass: 'adminlib-paypal-marketplace', pro: true },
    { id: 'stripe-marketplace', name: 'Stripe marketplace', iconClass: 'adminlib-stripe-marketplace', pro: true },
    { id: 'facilitator', name: 'Facilitator', iconClass: 'adminlib-facilitator', pro: true },
    { id: 'notifications', name: 'Notifications', iconClass: 'adminlib-notifications', pro: true },
    { id: 'invoice', name: 'Invoice & packing slip', iconClass: 'adminlib-invoice', pro: true },
  ];

  const [activeTab, setActiveTab] = useState("dashboard");
  let tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "adminlib-module",
      content:
        <>
          <div className="card-wrapper w-65">
            <div className="row">
              <div className="column">
                <div className="pro-banner-wrapper">
                  <div className="content">
                    <div className="heading">Welcome to MultiVendorX</div>
                    <div className="description">Expand your WooCommerce store by creating a marketplace for multiple stores. Manage, grow, and scale seamlessly.</div>

                    <div className="button-wrapper">

                      <a href='https://multivendorx.com/pricing/' target="blank" className="admin-btn btn-purple">
                        <i className="adminlib-pro-tag"></i>
                        Upgrade Now
                        <i className="adminlib-arrow-right icon-pro-btn"></i>
                      </a>
                      <div
                        className="admin-btn"
                        onClick={() => (window.location.href = '?page=multivendorx#&tab=setup')}
                      >
                        Launch Setup Wizard
                        <i className="adminlib-import"></i>
                      </div>

                    </div>
                  </div>
                  <div className="image">
                    <img src={Mascot} alt="" />
                  </div>
                </div>

              </div>

            </div>

            <div className="row">
              <div className="column">
                <div className="card-header">
                  <div className="left">
                    <div className="title">
                      Build a professional marketplace
                      <span className="admin-badge blue">
                        Starting at $299/year
                      </span>
                    </div>
                    <div className="des">
                      Unlock advanced features and premium modules to create a marketplace that stands out.
                    </div>
                  </div>
                </div>
                <div className="features-wrapper">
                  {featuresList.map((res, index) => (
                    <div className="feature" key={index}>
                      <i className={res.iconClass}></i>
                      <div className="content">
                        <h3>{res.title}</h3>
                        <p>{res.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pro-banner">
                  <div className="text">
                    Join 8,000+ successful marketplace owners
                  </div>
                  <div className="des">Create, manage, and grow your marketplace with confidence. Trusted by thousands of entrepreneurs worldwide.</div>
                  <a href='https://multivendorx.com/pricing/' target="blank" className="admin-btn btn-purple">
                    <i className="adminlib-pro-tag"></i>
                    Upgrade now
                    <i className="adminlib-arrow-right icon-pro-btn"></i>
                  </a>
                  <div className="des">15-day money-back guarantee</div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="column">
                <div className="card-header">
                  <div className="left">
                    <div className="title">
                      Modules
                    </div>
                  </div>
                  <div className="right">
                    <div
                      className="admin-btn btn-purple"
                      onClick={() => window.location.href = `?page=multivendorx#&tab=modules`}
                    ><i className="adminlib-eye"></i>
                      View All
                    </div>
                  </div>
                </div>
                <div className="mini-module">
                  {Modules.map((module) => (
                    <div className="module-list-item" key={module.id}>
                      <div className="module-header">
                        <i className={`font ${module.iconClass}`}></i>

                        {/*Updated condition (keeps your original structure) */}
                        {(!module.pro || appLocalizer.khali_dabba) ? (
                          <div className="toggle-checkbox" data-tour={`id-showcase-tour`}>
                            <input
                              type="checkbox"
                              className="woo-toggle-checkbox"
                              id={`toggle-switch-${module.id}`}
                              checked={modules.includes(module.id)}
                              onChange={(e) => handleOnChange(e, module.id)}
                            />
                            <label
                              htmlFor={`toggle-switch-${module.id}`}
                              className="toggle-switch-is_hide_cart_checkout"
                            ></label>
                          </div>
                        ) : (
                          <span className="admin-pro-tag">
                            <i className="adminlib-pro-tag"></i>Pro
                          </span>
                        )}
                      </div>

                      <div className="module-name">{module.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card-wrapper w-35">
            <div className="row">
              <div className="column">
                <div className="card-header">
                  <div className="left">
                    <div className="title">
                      Extend your website
                    </div>
                  </div>
                </div>
                <div className="cards-wrapper plugin">

                  {/* Show PRO versions if free plugins are installed, otherwise show free versions */}
                  {pluginStatus['woocommerce-catalog-enquiry'] ? (
                    // CatalogX PRO
                    <div className="cards">
                      <div className="header">
                        <img src={catalogx} alt="" />
                        <div className="tag">
                          <span className="admin-badge red"><i className="adminlib-pro-tag"></i> Pro</span>
                          <a href="https://multivendorx.com/pricing/" target="_blank">
                            Get Pro
                          </a>
                        </div>
                      </div>
                      <h3>CatalogX Pro</h3>
                      <p>Advanced product catalog with enhanced enquiry features and premium templates</p>
                    </div>
                  ) : (
                    // CatalogX Free
                    <div className="cards">
                      <div className="header">
                        <img src={catalogx} alt="" />
                        <div className="tag">
                          <span className="admin-badge green">Free</span>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (!installing) {
                                installOrActivatePlugin('woocommerce-catalog-enquiry', 'active');
                              }
                            }}
                            style={{
                              pointerEvents: installing ? 'none' : 'auto',
                              opacity: installing === 'woocommerce-catalog-enquiry' ? 0.6 : 1
                            }}
                          >
                            {installing === 'woocommerce-catalog-enquiry' ? 'Installing...' : 'Install'}
                          </a>
                        </div>
                      </div>
                      <h3>CatalogX</h3>
                      <p>Turn your store into a product catalog with enquiry-based sales</p>
                    </div>
                  )}

                  {pluginStatus['woocommerce-product-stock-alert'] ? (
                    // Notifima PRO
                    <div className="cards">
                      <div className="header">
                        <img src={notifima} alt="" />
                        <div className="tag">
                          <span className="admin-badge red"><i className="adminlib-pro-tag"></i> Pro</span>
                          <a href="https://multivendorx.com/pricing/" target="_blank">
                            Get Pro
                          </a>
                        </div>
                      </div>
                      <h3>Notifima Pro</h3>
                      <p>Advanced stock alerts, wishlist features, and premium notification system</p>
                    </div>
                  ) : (
                    // Notifima Free
                    <div className="cards">
                      <div className="header">
                        <img src={notifima} alt="" />
                        <div className="tag">
                          <span className="admin-badge green">Free</span>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (!installing) {
                                installOrActivatePlugin('woocommerce-product-stock-alert', 'active');
                              }
                            }}
                            style={{
                              pointerEvents: installing ? 'none' : 'auto',
                              opacity: installing === 'woocommerce-product-stock-alert' ? 0.6 : 1
                            }}
                          >
                            {installing === 'woocommerce-product-stock-alert' ? 'Installing...' : 'Install'}
                          </a>
                        </div>
                      </div>
                      <h3>Notifima</h3>
                      <p>Advanced stock alerts and wishlist features for WooCommerce</p>
                    </div>
                  )}

                </div>
              </div>
            </div>

            <div className="row">
              <div className="column">
                <div className="cards-wrapper quick-link">
                  {resources.map((res, index) => (
                    <div className="cards" key={index}>
                      <div className="header">
                        <i className={`icon ${res.iconClass}`}></i>
                        <a href={res.href} target="blank">
                          {res.linkText}
                          <i className="adminlib-external"></i>
                        </a>
                      </div>
                      <h3>{res.title}</h3>
                      <p>{res.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
    },
    {
      id: "free-vs-pro",
      label: "Free vs Pro",
      icon: "adminlib-pros-and-cons",
      content:
        <>
          <div className="card-wrapper w-65">
            <div className="row">
              <div className="column">
                <div className="card-header">
                  <div className="left">
                    <div className="title">
                      Free vs Pro comparison
                    </div>
                    <div className="des">See what you get with MultiVendorX Pro</div>
                  </div>
                  <div className="right">
                    <a href="https://multivendorx.com/pricing/" className="admin-btn btn-purple">
                      {/* <i className="adminlib-pro-tag"></i> */}
                      Get Pro Access Today!
                      <i className="adminlib-arrow-right icon-pro-btn"></i>
                    </a>
                  </div>
                </div>
                <div id="free-vs-pro" className="free-vs-pro">
                  {/* <table>
                    <thead>
                      <tr>
                        <td>Feature</td>
                        <td>Free</td>
                        <td>Pro</td>
                      </tr>
                    </thead>
                    <tbody>
                      {features.map((feature, i) => (
                        <tr key={i}>
                          <td>{feature.name}</td>
                          <td>{renderCell(feature.free)}</td>
                          <td>{renderCell(feature.pro)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table> */}

                  {sections.map((section, idx) => (
                    <table>
                      <thead>
                        <tr>
                          <td>{section.title}</td>
                          <td>Free</td>
                          <td>Pro</td>
                        </tr>
                      </thead>
                      <tbody>
                        {section.features.map((feature, i) => (
                          <tr key={i}>
                            <td>{feature.name}</td>
                            <td>{renderCell(feature.free)}</td>
                            <td>{renderCell(feature.pro)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ))}
                </div>


              </div>
            </div>
          </div>
          <div className="card-wrapper w-35">
            <div className="row">
              <div className="column">
                <div className="right-pro-banner">
                  <div className="image-wrapper">
                    <img src={freePro} alt="" />
                  </div>
                  <div className="title">Join 8,000+ successful marketplace owners</div>
                  <div className="des">Build, manage, and expand your marketplace with confidence. Loved by entrepreneurs globally.</div>
                  <ul>
                    <li><i className="adminlib-check"></i>Flexible selling models</li>
                    <li><i className="adminlib-check"></i>Effortless inventory control</li>
                    <li><i className="adminlib-check"></i>Intelligent alert system</li>
                    <li><i className="adminlib-check"></i>Secure seller onboarding</li>
                    <li><i className="adminlib-check"></i>Recurring revenue tools</li>
                  </ul>

                  <div className="button-wrapper">

                    <a href='https://multivendorx.com/pricing/' className="admin-btn btn-purple">
                      <i className="adminlib-pro-tag"></i>
                      Upgrade Now
                      <i className="adminlib-arrow-right icon-pro-btn"></i>
                    </a>
                    <div onClick={() => window.location.href = `?page=multivendorx#&tab=setup`} className="admin-btn">
                      Launch Setup Wizard
                      <i className="adminlib-import"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
    },
  ];

  tabs = appLocalizer.khali_dabba
    ? tabs.filter(tab => tab.id !== 'free-vs-pro')
    : tabs;

  return (
    <>
      {/* <Dialog
        className="admin-module-popup"
        open={modelOpen}
        onClose={() => setModelOpen(false)}
      >
        <button
          className="admin-font adminlib-cross"
          onClick={() => setModelOpen(false)}
          aria-label="Close dialog"
        ></button>
        <ProPopup
          proUrl={proPopupContent.proUrl}
          title={proPopupContent.title}
          messages={proPopupContent.messages}
        />
      </Dialog> */}
      <div className="general-wrapper admin-dashboard">
        <div className="row">
          <div className="column admin-tab">
            <div className="tab-titles ">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`title ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <p><i className={tab.icon}></i>{tab.label}</p>
                </div>
              ))}
            </div>
            <div className="right">
              <a href='https://multivendorx.com/pricing/' target="black" className="admin-btn btn-purple">
                <i className="adminlib-pro-tag"></i>
                Upgrade Now
                <i className="adminlib-arrow-right icon-pro-btn"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="container-wrapper">
          {tabs.map(
            (tab) =>
              activeTab === tab.id && (
                <>
                  {tab.content}
                </>
              )
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
