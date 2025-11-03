import notifima from "../../assets/images/brand-icon.png";
import catalogx from "../../assets/images/catalogx.png";
import Mascot from "../../assets/images/multivendorx-mascot-scaled.png";

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
import { getApiLink, sendApiResponse, useModules } from "zyra";
import axios from "axios";

const AdminDashboard = () => {
  const { modules, insertModule, removeModule } = useModules.getState();
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

  const installOrActivatePlugin = async (slug: string, status = 'active') => {
    if (!slug || installing) {
      return; // Prevent multiple clicks
    }

    setInstalling(slug);

    try {
      const response = await axios({
        method: 'POST',
        url: `${appLocalizer.apiUrl}/wp/v2/plugins`,
        headers: {
          'X-WP-Nonce': appLocalizer.nonce,
        },
        data: {
          slug,
          status,
        },
      });

      console.log(`Plugin "${slug}" ${status} successfully:`, response.data);

      // Verify installation was successful
      await checkPluginStatus(slug);

      setSuccessMsg(`Plugin "${slug}" installed successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);

    } catch (error) {
      console.error(`Failed to ${status} plugin "${slug}":`, error.response?.data || error);
      setSuccessMsg(`Failed to install plugin "${slug}". Please try again.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
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
      title: "Diversified marketplace",
      desc: "Enable bookings, subscriptions, and auctions to boost sales and engagement.",
      iconClass: "adminlib-marketplace",
      linkText: "Explore Docs",
      href: "#",
    },
    {
      title: "Vacation mode for stores",
      desc: "Stores can pause their stores temporarily with automatic buyer notifications – no missed messages.",
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
      desc: "Automatic emails and alerts for every order, refund, and payout – everyone stays in the loop.",
      iconClass: "adminlib-notification",
      linkText: "Join Discord",
      href: "#",
    },
    {
      title: "Verified stores only",
      desc: "Screen stores with document verification and approval – build a trusted marketplace from day one.",
      iconClass: "adminlib-verification3",
      linkText: "Join Discord",
      href: "#",
    },
    {
      title: "Membership rewards & commission",
      desc: "Charge your sellers a monthly or yearly membership fee to sell on your marketplace – predictable revenue every month.",
      iconClass: "adminlib-commission",
      linkText: "Join Discord",
      href: "#",
    },
  ];

  const sections: Section[] = [
    {
      title: 'Product & store tools',
      features: [
        { name: "Multiple vendors per product (SPMV)", free: true, pro: true },
        { name: "Store policies", free: true, pro: true },
        { name: "Store reviews", free: true, pro: true },
        { name: "Follow store", free: true, pro: true },
        { name: "Privacy controls (hide details)", free: true, pro: true },
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
        { name: "Bank Transfer", free: true, pro: true },
        { name: "PayPal Payout", free: true, pro: true },
        { name: "Stripe Connect", free: true, pro: true },
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
        { name: "Enquiry", free: false, pro: true },
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
        { name: "Optimize stores/products with Yoast or Rank Math", free: false, pro: true },
        { name: "Sales, revenue, and order reports", free: false, pro: true },
        { name: "Vendor levels with different capabilities", free: false, pro: true },
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
    { id: 'store-policy', name: 'Identity verification', iconClass: 'adminlib-booking', pro: true },
    { id: 'staff-manager', name: 'Staff manager', iconClass: 'adminlib-booking', pro: true },
    { id: 'vacation', name: 'Vacation mode', iconClass: 'adminlib-report', pro: true },
    { id: 'business-hours', name: 'Business hours', iconClass: 'adminlib-analytics', pro: true },
    { id: 'store-inventory', name: 'Store inventory', iconClass: 'adminlib-analytics' , pro: true},
    { id: 'min-max-quantities', name: 'Min/Max quantities', iconClass: 'adminlib-analytics', pro: true },
    { id: 'wholesale', name: 'Wholesale', iconClass: 'adminlib-analytics' , pro: true},
    { id: 'paypal-marketplace', name: 'PayPal marketplace (Real-time Split)', iconClass: 'adminlib-analytics', pro: true },
    { id: 'stripe-marketplace', name: 'Stripe marketplace (Real-time Split)', iconClass: 'adminlib-booking', pro: true },
    { id: 'facilitator', name: 'Facilitator', iconClass: 'adminlib-booking', pro: true , pro: true},
    { id: 'notifications', name: 'Notifications', iconClass: 'adminlib-booking', pro: true },
    { id: 'invoice', name: 'Invoice & packing slip', iconClass: 'adminlib-setting', pro: true },
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

                      <a href='https://multivendorx.com/pricing/' className="admin-btn btn-purple">
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
                  <a href='https://multivendorx.com/pricing/' className="admin-btn btn-purple">
                    Upgrade now - 15-day money-back guarantee*
                    <i className="adminlib-arrow-right icon-pro-btn"></i>
                  </a>
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
                          <span className="admin-badge blue">Pro</span>
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
                          <span className="admin-badge blue">Pro</span>
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
                        <i className={res.iconClass}></i>
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
                      Free vs Pro Comparison
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
                    <svg width="324" height="170" viewBox="0 0 384 230" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover rounded-lg"><path d="M47.232 105.093L36.9408 140.114C36.9408 140.114 30.72 160.389 30.72 166.072C30.72 171.755 33.1008 184.965 33.1008 184.965L15.1296 220.754H81.792L88.8576 194.258C88.8576 194.258 105.6 179.589 106.829 173.138H72.192C72.192 173.138 72.8064 145.259 60.7488 135.198C60.7488 135.198 69.504 112.235 63.2832 102.942C57.0624 93.6495 48.4608 97.0287 47.232 105.093Z" fill="#FFC2A7"></path><path d="M71.5008 185.349C71.424 185.349 71.2704 185.349 71.1936 185.272C70.656 185.118 70.3488 184.581 70.5024 184.043C71.3472 181.125 71.1936 173.291 71.1936 173.214C71.1936 172.677 71.6544 172.139 72.192 172.139C72.7296 172.139 73.2672 172.6 73.2672 173.138C73.2672 173.445 73.4208 181.355 72.4992 184.581C72.3456 185.042 71.9616 185.349 71.5008 185.349Z" fill="#D88260"></path><path d="M76.7233 202.014C76.1089 202.014 75.7249 201.554 75.7249 200.939C75.7249 200.478 76.0321 200.094 76.4161 199.941C82.4065 198.174 88.0129 193.413 88.0897 193.413C88.4737 193.029 89.1649 193.029 89.5489 193.49C89.9329 193.874 89.9329 194.565 89.4721 194.949L89.3953 195.026C89.1649 195.256 83.4049 200.018 76.9537 201.938C76.9537 202.014 76.8001 202.014 76.7233 202.014Z" fill="#D88260"></path><path d="M35.328 193.259C34.944 193.259 34.56 193.029 34.4064 192.722C34.0992 191.954 33.8688 191.109 33.7152 190.264C33.3312 188.651 32.7936 186.27 32.256 185.502C31.9488 185.042 32.0256 184.427 32.4864 184.043C32.9472 183.736 33.5616 183.813 33.9456 184.274C33.9456 184.274 33.9456 184.274 33.9456 184.35C34.6368 185.349 35.0976 187.346 35.712 189.726C35.8656 190.494 36.1728 191.493 36.2496 191.723C36.48 192.261 36.2496 192.875 35.7888 193.106C35.6352 193.182 35.4816 193.259 35.328 193.259Z" fill="#D88260"></path><path d="M60.7488 136.274C60.3648 136.274 60.0576 136.043 59.904 135.736C58.2912 133.202 56.064 130.206 55.296 129.899C54.7584 129.746 54.4512 129.131 54.6048 128.594C54.7584 128.056 55.3729 127.749 55.9105 127.902C55.9873 127.902 55.9872 127.902 56.064 127.979C57.9072 128.67 60.9024 133.278 61.7472 134.661C62.0544 135.122 61.9008 135.813 61.44 136.12C61.2096 136.197 60.9792 136.274 60.7488 136.274Z" fill="#D88260"></path><path d="M135.245 174.213H76.416C75.8784 174.213 75.3408 173.752 75.3408 173.138C75.3408 172.523 75.8016 172.062 76.416 172.062H135.245C140.237 172.062 144.307 167.992 144.307 163V54.0208C144.307 49.0288 140.237 44.9584 135.245 44.9584H63.6672C58.6753 44.9584 54.6048 49.0288 54.6048 54.0208V97.336C54.6048 97.8736 54.144 98.3344 53.5296 98.3344C52.992 98.3344 52.5312 97.8736 52.5312 97.336V54.0208C52.5312 47.8768 57.5233 42.8848 63.6672 42.8848H135.245C141.389 42.8848 146.381 47.8768 146.381 54.0208V163C146.381 169.221 141.389 174.213 135.245 174.213Z" fill="#000111"></path><path d="M60.9025 93.4191V52.4847H82.1761C83.4049 52.4847 84.4033 53.4831 84.4033 54.7119V55.8639C84.4033 57.0927 85.4017 58.0911 86.6305 58.0911C86.6305 58.0911 86.6305 58.0911 86.7073 58.0911H114.125C115.354 58.0911 116.352 57.0927 116.352 55.8639C116.352 54.6351 117.35 53.6367 118.579 53.6367H135.629V162.386H75.9553C75.9553 162.386 73.8817 136.811 65.4337 130.437C65.4337 130.437 77.2609 102.635 60.9025 93.4191Z" fill="url(#paint0_linear_9521_92667)"></path><path d="M95.616 54.9423C97.1006 54.9423 98.304 53.7389 98.304 52.2543C98.304 50.7698 97.1006 49.5663 95.616 49.5663C94.1315 49.5663 92.928 50.7698 92.928 52.2543C92.928 53.7389 94.1315 54.9423 95.616 54.9423Z" fill="#000111"></path><path d="M102.912 53.6368C103.676 53.6368 104.294 53.0178 104.294 52.2544C104.294 51.4909 103.676 50.8719 102.912 50.8719C102.149 50.8719 101.53 51.4909 101.53 52.2544C101.53 53.0178 102.149 53.6368 102.912 53.6368Z" fill="#000111"></path><path d="M302.822 172.37H151.68C151.142 172.37 150.605 171.909 150.605 171.294C150.605 170.68 151.066 170.219 151.68 170.219H302.822C306.586 170.219 309.658 167.147 309.581 163.384C309.581 161.234 308.582 159.237 306.816 157.931L265.805 127.902C265.574 127.672 265.421 127.365 265.421 127.058V18.6928C265.421 14.0848 261.658 10.3216 256.973 10.3216H104.064C99.4559 10.3216 95.6927 14.0848 95.6927 18.6928V42.6544C95.6927 43.192 95.2319 43.7296 94.6943 43.7296C94.1567 43.7296 93.6191 43.2688 93.6191 42.7312V18.7696C93.6191 13.0096 98.3039 8.32483 104.064 8.32483H257.05C262.81 8.32483 267.494 13.0096 267.494 18.8464V126.52L308.122 156.242C312.115 159.16 312.96 164.69 310.042 168.683C308.352 170.987 305.664 172.37 302.822 172.37Z" fill="#000111"></path><path d="M266.419 128.133H145.843C145.306 128.133 144.768 127.672 144.768 127.058C144.768 126.443 145.229 125.982 145.843 125.982H266.496C267.034 125.982 267.571 126.443 267.571 127.058C267.571 127.672 267.034 128.133 266.419 128.133Z" fill="#000111"></path><path d="M256.666 118.763H146.15C145.613 118.763 145.152 118.302 145.152 117.688C145.152 117.15 145.613 116.69 146.15 116.69H255.667V19H102.298V41.7328C102.298 42.2704 101.837 42.7312 101.222 42.7312C100.685 42.7312 100.224 42.2704 100.224 41.7328V18.0016C100.224 17.464 100.685 17.0032 101.222 17.0032H256.589C257.126 17.0032 257.664 17.464 257.664 18.0016V117.765C257.741 118.302 257.28 118.763 256.666 118.763Z" fill="#000111"></path><path d="M114.509 33.7457C116.46 33.7457 118.042 32.164 118.042 30.2129C118.042 28.2617 116.46 26.6801 114.509 26.6801C112.558 26.6801 110.976 28.2617 110.976 30.2129C110.976 32.164 112.558 33.7457 114.509 33.7457Z" fill="url(#paint1_linear_9521_92667)"></path><path d="M124.416 33.7457C126.367 33.7457 127.949 32.164 127.949 30.2129C127.949 28.2617 126.367 26.6801 124.416 26.6801C122.465 26.6801 120.883 28.2617 120.883 30.2129C120.883 32.164 122.465 33.7457 124.416 33.7457Z" fill="url(#paint2_linear_9521_92667)"></path><path d="M134.4 33.7457C136.351 33.7457 137.933 32.164 137.933 30.2129C137.933 28.2617 136.351 26.6801 134.4 26.6801C132.449 26.6801 130.867 28.2617 130.867 30.2129C130.867 32.164 132.449 33.7457 134.4 33.7457Z" fill="url(#paint3_linear_9521_92667)"></path><path d="M308.352 159.851H225.101C224.717 159.851 224.41 159.621 224.179 159.314L218.112 148.792H159.514L153.216 158.853C152.986 159.16 152.678 159.314 152.371 159.314H145.152C144.614 159.314 144.077 158.853 144.077 158.238C144.077 157.624 144.538 157.163 145.152 157.163H151.757L158.054 147.179C158.208 146.872 158.592 146.718 158.899 146.718H218.65C219.034 146.718 219.341 146.949 219.571 147.256L225.638 157.778H308.275C308.813 157.701 309.35 158.162 309.427 158.699C309.504 159.237 309.043 159.774 308.506 159.851C308.429 159.928 308.429 159.928 308.352 159.851Z" fill="#000111"></path><path d="M225.101 159.314H152.294C151.757 159.314 151.219 158.853 151.219 158.238C151.219 157.624 151.68 157.163 152.294 157.163H225.101C225.638 157.163 226.176 157.624 226.176 158.238C226.176 158.853 225.638 159.314 225.101 159.314Z" fill="#000111"></path><path d="M217.574 74.0656H134.861V117.458H217.574V74.0656Z" fill="url(#paint4_linear_9521_92667)"></path><path d="M160.742 74.0656C172.322 74.0656 181.709 64.6786 181.709 53.0992C181.709 41.5198 172.322 32.1328 160.742 32.1328C149.163 32.1328 139.776 41.5198 139.776 53.0992C139.776 64.6786 149.163 74.0656 160.742 74.0656Z" fill="#FED490"></path><path d="M155.674 54.7888C151.373 54.7888 147.917 53.8672 146.995 51.1792C145.766 47.6464 148.147 43.192 153.984 37.816C156.749 35.3584 159.667 33.0544 162.739 30.9808C163.2 30.6736 163.891 30.8272 164.198 31.3648C164.506 31.8256 164.352 32.44 163.891 32.7472C159.13 35.8192 147.072 45.0352 148.992 50.488C150.528 54.9424 167.885 51.7168 179.635 47.8768C180.173 47.7232 180.787 48.0304 180.941 48.568C181.094 49.1056 180.787 49.72 180.25 49.8736C176.87 50.9488 164.429 54.7888 155.674 54.7888Z" fill="#000111"></path><path d="M170.573 72.2992C170.342 72.2992 170.189 72.2224 169.958 72.1456C169.498 71.8384 169.344 71.1472 169.728 70.6864C169.728 70.6864 171.571 67.9984 170.957 65.6944C170.496 64.4656 169.498 63.4672 168.269 63.0832C163.43 61.0096 152.294 67.2304 148.378 69.8416C147.917 70.1488 147.226 69.9952 146.918 69.5344C146.611 69.0736 146.765 68.4592 147.226 68.152C147.84 67.768 162.278 58.2448 169.114 61.24C171.187 62.1616 172.493 63.4672 172.954 65.2336C173.875 68.4592 171.571 71.8384 171.494 71.992C171.264 72.1456 170.957 72.2992 170.573 72.2992Z" fill="#000111"></path><path d="M201.293 118.302C200.755 118.302 200.294 117.842 200.218 117.304V74.8336C200.218 74.296 200.678 73.7584 201.293 73.7584C201.907 73.7584 202.368 74.2192 202.368 74.8336V117.304C202.291 117.842 201.83 118.302 201.293 118.302Z" fill="#000111"></path><path d="M91.008 110.546C81.5616 110.546 73.8816 102.866 73.8816 93.4192C73.8816 83.9728 81.5616 76.2928 91.008 76.2928C100.454 76.2928 108.134 83.9728 108.134 93.4192C108.058 102.866 100.454 110.546 91.008 110.546ZM91.008 78.3664C82.7136 78.3664 75.9552 85.048 75.9552 93.3424C75.9552 101.637 82.6368 108.395 90.9312 108.395C99.2256 108.395 105.984 101.714 105.984 93.4192C105.984 85.1248 99.3024 78.4432 91.008 78.3664Z" fill="white"></path><path d="M134.861 118.149H89.088C88.5504 118.149 88.0128 117.688 88.0128 117.15C88.0128 116.843 88.1664 116.536 88.4736 116.306L134.246 82.4368C134.707 82.1296 135.322 82.2064 135.706 82.6672C135.859 82.8208 135.936 83.0512 135.936 83.2816V117.15C135.936 117.611 135.475 118.072 134.861 118.149ZM92.2368 116.075H133.786V85.2784L92.2368 116.075Z" fill="#000111"></path><path d="M235.008 114.693C248.157 114.693 258.816 104.034 258.816 90.8848C258.816 77.736 248.157 67.0768 235.008 67.0768C221.859 67.0768 211.2 77.736 211.2 90.8848C211.2 104.034 221.859 114.693 235.008 114.693Z" fill="url(#paint5_linear_9521_92667)"></path><path d="M201.754 74.3728C201.216 74.3728 200.678 73.912 200.678 73.3744C200.678 73.2976 200.678 73.144 200.755 73.0672L213.811 26.9872C213.965 26.4496 214.502 26.1424 215.117 26.296C215.27 26.3728 215.501 26.4496 215.578 26.6032L247.296 62.0848C247.68 62.5456 247.603 63.16 247.219 63.544C247.066 63.6208 246.912 63.7744 246.758 63.7744L201.984 74.3728C201.907 74.3728 201.83 74.3728 201.754 74.3728ZM215.27 29.368L203.213 71.9152L244.608 62.1616L215.27 29.368Z" fill="#000111"></path><path d="M313.344 128.901C311.885 127.288 310.349 125.675 308.966 123.986C304.973 119.531 301.363 114.693 298.138 109.624C295.296 104.786 292.685 99.7936 290.381 94.7248C286.387 85.9696 282.701 76.1392 282.778 66.3088C288.461 67.4608 295.68 75.3711 295.68 75.3711C295.68 75.3711 295.142 61.4704 293.453 53.7135C289.997 37.2783 303.974 29.8287 309.734 37.5855C309.734 37.5855 314.573 57.7072 317.184 65.6944C319.795 73.6816 318.106 99.1024 314.88 115.845C314.035 120.146 313.574 124.523 313.344 128.901Z" fill="#D88260"></path><path d="M269.261 123.448C280.32 125.061 287.002 111.16 278.477 103.864L278.246 103.634C270.336 97.1055 256.896 90.6543 256.896 90.6543C241.306 96.0303 227.021 82.5903 236.928 76.4463C236.928 76.4463 254.746 73.9887 264.192 73.6047C270.029 73.3743 281.702 81.6687 281.702 81.6687C281.702 81.6687 275.482 69.2271 270.797 62.7759C260.89 49.2591 270.49 36.6639 279.014 41.3487C279.014 41.3487 291.686 57.7071 297.37 63.9279C303.053 70.1487 309.888 94.5711 315.878 110.622C322.867 129.285 359.808 214.763 362.266 220.83L278.784 220.37C278.784 220.37 271.334 182.277 262.272 170.68C253.21 159.083 232.934 141.496 231.936 130.821C229.939 121.298 232.934 107.166 246.912 115.845C253.594 120.222 262.579 122.373 269.261 123.448Z" fill="#FFC2A7"></path><path d="M303.053 106.936C302.592 106.936 302.208 106.629 302.054 106.168C300.979 102.789 299.443 99.6399 297.446 96.7215C294.374 92.4207 281.165 82.5135 281.011 82.4367C280.55 82.1295 280.474 81.4383 280.781 80.9775C281.088 80.5167 281.779 80.4399 282.24 80.7471C282.778 81.1311 295.91 90.8847 299.136 95.4927C301.21 98.5647 302.899 101.944 304.051 105.554C304.205 106.091 303.898 106.706 303.36 106.859C303.206 106.936 303.13 106.936 303.053 106.936Z" fill="#D88260"></path><path d="M283.776 181.048H283.699C276.019 180.357 269.107 176.056 265.037 173.522C264.038 172.83 262.963 172.216 261.888 171.678C261.35 171.448 261.12 170.834 261.35 170.296C261.581 169.758 262.195 169.528 262.733 169.758C263.885 170.373 265.037 170.987 266.189 171.755C270.413 174.366 276.71 178.36 283.93 178.974C284.467 179.051 284.928 179.589 284.851 180.126C284.698 180.664 284.314 181.048 283.776 181.048Z" fill="#D88260"></path><path d="M330.47 161.541C330.317 161.541 330.163 161.541 330.01 161.464C329.472 161.234 329.318 160.619 329.549 160.082C332.544 154.014 330.24 150.866 330.086 150.789C329.702 150.328 329.856 149.714 330.24 149.33C330.701 148.946 331.315 149.022 331.699 149.483C331.853 149.637 335.002 153.707 331.392 161.003C331.238 161.31 330.854 161.541 330.47 161.541Z" fill="#D88260"></path><path d="M375.245 221.752H8.75513C8.21753 221.752 7.67993 221.291 7.67993 220.677C7.67993 220.062 8.14073 219.602 8.75513 219.602H375.322C375.859 219.602 376.397 220.062 376.397 220.677C376.397 221.291 375.859 221.752 375.245 221.752Z" fill="#000111"></path><defs><linearGradient id="paint0_linear_9521_92667" x1="141.192" y1="1.49553" x2="75.9812" y2="162.468" gradientUnits="userSpaceOnUse"><stop stop-color="#F38374"></stop><stop offset="1" stop-color="#C64234"></stop></linearGradient><linearGradient id="paint1_linear_9521_92667" x1="107.678" y1="19.0129" x2="118.783" y2="37.13" gradientUnits="userSpaceOnUse"><stop stop-color="#F38374"></stop><stop offset="1" stop-color="#C64234"></stop></linearGradient><linearGradient id="paint2_linear_9521_92667" x1="117.602" y1="19.0163" x2="128.708" y2="37.1335" gradientUnits="userSpaceOnUse"><stop stop-color="#F38374"></stop><stop offset="1" stop-color="#C64234"></stop></linearGradient><linearGradient id="paint3_linear_9521_92667" x1="127.533" y1="19.0163" x2="138.638" y2="37.1335" gradientUnits="userSpaceOnUse"><stop stop-color="#F38374"></stop><stop offset="1" stop-color="#C64234"></stop></linearGradient><linearGradient id="paint4_linear_9521_92667" x1="204.004" y1="17.2259" x2="163.976" y2="130.521" gradientUnits="userSpaceOnUse"><stop stop-color="#0A6B5B"></stop><stop offset="0.78" stop-color="#005146"></stop><stop offset="0.91" stop-color="#005045"></stop></linearGradient><linearGradient id="paint5_linear_9521_92667" x1="254.046" y1="25.3666" x2="226.352" y2="120.491" gradientUnits="userSpaceOnUse"><stop stop-color="#F38374"></stop><stop offset="1" stop-color="#C64234"></stop></linearGradient></defs></svg>
                  </div>
                  <div className="title">Join 8,000+ successful marketplace owners</div>
                  <div className="des">Build, manage, and expand your marketplace with confidence. Loved by entrepreneurs globally.</div>
                  <ul>
                    <li><i className="adminlib-check"></i>Flexible Selling Models</li>
                    <li><i className="adminlib-check"></i>Effortless Inventory Control</li>
                    <li><i className="adminlib-check"></i>Intelligent Alert System</li>
                    <li><i className="adminlib-check"></i>Secure Seller Onboarding</li>
                    <li><i className="adminlib-check"></i>Recurring Revenue Tools</li>
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
      <div className="general-wrapper">
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
              <a href='https://multivendorx.com/pricing/' className="admin-btn btn-purple">
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
