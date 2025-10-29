import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AdminBreadcrumbs, getApiLink } from 'zyra';
import { __ } from '@wordpress/i18n';
import "./viewStore.scss";
import "../AdminDashboard/adminDashboard.scss";

interface StoreData {
  id?: string | number;
  name?: string;
  description?: string;
  image?: string;
  banner?: string;
  phone?: string;
  email?: string;
  slug?: string;
}

interface ProductCount {
  name: string;
  value: number;
}

interface Transaction {
  total_order_amount?: string;
  settled_balance?: string;
  locking_balance?: string;
  withdraw_amount?: string;
}

type Product = {
  id: number;
  title: string;
  price: string;
};
const COLORS = ['#4CAF50', '#FF9800', '#F44336', '#2196F3'];

const ViewStore = () => {
  const [data, setData] = useState<StoreData>({});
  const [transaction, setTransaction] = useState<Transaction>({});
  const [productCounts, setProductCounts] = useState<ProductCount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const location = useLocation();
  const viewId = new URLSearchParams(location.hash.replace(/^#/, '')).get('id');
  const headers = { 'X-WP-Nonce': appLocalizer.nonce };
  const products: Product[] = [
    {
      id: 1,
      title: "Admin Net Earning",
      price: "$5,072.31",
    },
    {
      id: 1,
      title: "Store Net Earning",
      price: "$1,713.85",
    },
    {
      id: 1,
      title: "Shipping",
      price: "$75",
    },
    {
      id: 1,
      title: "Tax",
      price: "$1,713.85",
    },
    {
      id: 1,
      title: "Total",
      price: "$855552",
    },
  ];

  // 🔹 Helper for GET calls
  const fetchAPI = async (endpoint: string) => {
    try {
      const res = await axios.get(getApiLink(appLocalizer, endpoint), { headers });
      return res.data || {};
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return null;
    }
  };

  // 🔹 Fetch Store Details
  useEffect(() => {
    if (!viewId) return;

    const fetchStore = async () => {
      const store = await fetchAPI(`store/${viewId}`);
      if (store) setData(store);
      else setError(__('Failed to load store details', 'multivendorx'));
    };

    fetchStore();
  }, [viewId]);

  // 🔹 Fetch Product Counts directly from WooCommerce API
  useEffect(() => {
    if (!viewId) return;

    const fetchProductCounts = async () => {
      try {
        const statuses = ['publish', 'draft', 'pending'];

        // Map each status request to WooCommerce API
        const requests = statuses.map((status) =>
          axios.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
            headers,
            params: {
              status,
              meta_key: 'multivendorx_store_id',
              value: viewId,
              per_page: 1, // minimize data transfer
            },
          })
        );

        // Await all 3 requests in parallel
        const results = await Promise.all(requests);

        // Extract product count from headers
        const counts = results.map((res) => parseInt(res.headers['x-wp-total']) || 0);

        setProductCounts([
          { name: 'Published', value: counts[0] },
          { name: 'Draft', value: counts[1] },
          { name: 'Pending', value: counts[2] },
        ]);
      } catch (error) {
        console.error('Error fetching product counts:', error);
        setProductCounts([
          { name: 'Published', value: 0 },
          { name: 'Draft', value: 0 },
          { name: 'Pending', value: 0 },
        ]);
      }
    };

    fetchProductCounts();
  }, [viewId]);

  // 🔹 Fetch Ratings
  useEffect(() => {
    if (!viewId) return;

    const fetchRatings = async () => {
      try {
        const { data: comments = [] } = await axios.get(`${appLocalizer.apiUrl}/wp/v2/comments`, {
          headers,
          params: {
            meta_key: 'store_rating_id',
            meta_value: viewId,
            comment_type: 'multivendorx_review',
          },
        });

        if (!comments.length) {
          setAverageRating(0);
          setTotalReviews(0);
          return;
        }

        const ratingSum = comments.reduce(
          (sum: number, c: any) => sum + parseFloat(c.meta?.store_rating || '0'),
          0
        );

        setAverageRating(Math.round((ratingSum / comments.length) * 10) / 10);
        setTotalReviews(comments.length);
      } catch (error) {
        console.warn('Failed to fetch ratings', error);
        setAverageRating(0);
        setTotalReviews(0);
      }
    };

    fetchRatings();
  }, [viewId]);

  // 🔹 Fetch Transactions
  useEffect(() => {
    if (!viewId) return;

    const fetchReports = async () => {
      try {
        const res = await axios.get(getApiLink(appLocalizer, `reports/${viewId}`), { headers });
        setTransaction(res.data);
      } catch (error) {
        console.warn('Failed to fetch transaction data', error);
      }
    };

    fetchReports();
  }, [viewId]);

  // 🔹 Star Renderer
  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={
          i < Math.floor(rating)
            ? "adminlib-star"
            : i < rating
              ? "adminlib-star half"
              : "adminlib-star-o"
        }
      ></i>
    ));

  // 🔹 Cards
  const cards = [
    {
      title: 'Lifetime Earnings',
      value: `${appLocalizer.currency_symbol}${transaction?.total_order_amount ?? '0'}`,
      link: '#',
      trend: '+16.24%',
      color: 'text-green',
    },
    {
      title: 'Available Balance',
      value: `${appLocalizer.currency_symbol}${transaction?.balance ?? '0'}`,
      link: '?page=multivendorx#&tab=payouts',
      trend: '+16.24%',
      color: 'text-green',
    },
    {
      title: 'Pending Balance',
      value: `${appLocalizer.currency_symbol}${transaction?.locking_balance ?? '0'}`,
      link: '?page=multivendorx#&tab=payouts',
      trend: '-8.54%',
      color: 'text-red',
    },
    {
      title: 'Requested Payout',
      value: `${appLocalizer.currency_symbol}${transaction?.withdraw_amount ?? '0'}`,
      link: '?page=multivendorx#&tab=transactions-history',
      trend: '+0.00%',
      color: '',
    },
  ];

  const activities = [
    { icon: 'adminlib-cart', text: 'New product "Wireless Gaming Headset" added by TechWorld' },
    { icon: 'adminlib-star', text: '5-star review received for "Smartphone Case" by MobileGear' },
    { icon: 'adminlib-global-community', text: 'New vendor "Fashion Forward" completed registration' },
    { icon: 'adminlib-cart', text: 'Commission payment of $2,847 processed for ElectroHub' },
  ];

  return (
    <>
      <AdminBreadcrumbs
        activeTabIcon="adminlib-storefront"
        tabTitle={`Viewing ${data.name || ''}`}
        description={data.description || ''}
        buttons={[
          {
            label: '',
            onClick: () => window.location.assign('?page=multivendorx#&tab=stores'),
            iconClass: 'adminlib-storefront',
            className: 'admin-badge blue',
            tooltip: 'All Store'
          },
          {
            label: '',
            iconClass: 'adminlib-create',
            onClick: () =>
              window.location.href = `?page=multivendorx#&tab=stores&edit/${viewId}`,
            className: 'admin-badge yellow',
            tooltip: 'Edit'
          },
          {
            label: '',
            iconClass: 'adminlib-eye',
            onClick: () =>
              data.slug && window.open(`${appLocalizer.site_url}/store/${data.slug}/`, '_blank'),
            className: 'admin-badge green',
            tooltip: 'View Public Store'
          },
        ]}
      />

      <div className="store-view-wrapper">
        <div className='container-wrapper'>
          <div className="card-wrapper width-65">
            <div className="row">
              <div className="column">
                <div className="multivendorx-banner template3">
                  <div className="banner-img">
                    <img src={data.banner || ''} alt={data.name || 'Store'} />
                  </div>
                  <div className="details-wrapper">
                    <div className="store-details">

                      <div className="profile">
                        <img src={data.image || ''} alt={data.name || 'Store'} className="multivendorx-profile-imgcls" />
                      </div>
                      <div className="details">
                        <div className="heading">store 1fgfgfghhghghh</div>
                        <div className="container">

                          <div className="contact-details">
                            <div className="row">
                              <div className="store-email"><i className="adminlib-mail"></i> info@phoenixcoded.co</div><div className="store-phone"> <i className="adminlib-form-phone"></i>987466310.6</div>                    </div>
                            <div className="store-address"> <i className="adminlib-location"></i>Basic information Basic information Basic information</div>                </div>

                        </div>
                      </div>
                    </div>
                    <div className="store-details">

                      <div className="profile">
                        <img src={data.image || ''} alt={data.name || 'Store'} className="multivendorx-profile-imgcls" />
                      </div>
                      <div className="details">
                        <div className="heading">store 1fgfgfghhghghh</div>
                        <div className="container">

                          <div className="contact-details">
                            <div className="row">
                              <div className="store-email"><i className="adminlib-mail"></i> info@phoenixcoded.co</div><div className="store-phone"> <i className="adminlib-form-phone"></i>987466310.6</div>                    </div>
                            <div className="store-address"> <i className="adminlib-location"></i>Basic information Basic information Basic information</div>
                            <div className="store-address"> <i className="adminlib-Export-import-Stock-01"></i>Since Oct 10, 2025</div>                </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="column">
                <div className="chart-box">
                  <h3>Products</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={productCounts} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                        {productCounts.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="column">
                <h3>Top Products</h3>
                <div className="top-items">
                  <div className="items">
                    <div className="left-side">
                      <div className="icon">
                        <i className="adminlib-pro-tag admin-icon red"></i>
                      </div>
                      <div className="details">
                        <div className="item-title">Lather & Loom</div>
                        <div className="sub-text">3 orders</div>
                      </div>
                    </div>
                    <div className="right-side">
                      <div className="price">$380</div>
                    </div>
                  </div>
                  <div className="items">
                    <div className="left-side">
                      <div className="icon">
                        <i className="adminlib-pro-tag admin-icon red"></i>
                      </div>
                      <div className="details">
                        <div className="item-title">Lather & Loom</div>
                        <div className="sub-text">3 orders</div>
                      </div>
                    </div>
                    <div className="right-side">
                      <div className="price">$380</div>
                    </div>
                  </div>
                  <div className="items">
                    <div className="left-side">
                      <div className="icon">
                        <i className="adminlib-pro-tag admin-icon red"></i>
                      </div>
                      <div className="details">
                        <div className="item-title">Lather & Loom</div>
                        <div className="sub-text">3 orders</div>
                      </div>
                    </div>
                    <div className="right-side">
                      <div className="price">$380</div>
                    </div>
                  </div>
                  <div className="items">
                    <div className="left-side">
                      <div className="icon">
                        <i className="adminlib-pro-tag admin-icon red"></i>
                      </div>
                      <div className="details">
                        <div className="item-title">Lather & Loom</div>
                        <div className="sub-text">3 orders</div>
                      </div>
                    </div>
                    <div className="right-side">
                      <div className="price">$380</div>
                    </div>
                  </div>
                  <div className="items">
                    <div className="left-side">
                      <div className="icon">
                        <i className="adminlib-pro-tag admin-icon green"></i>
                      </div>
                      <div className="details">
                        <div className="item-title">Lather & Loom</div>
                        <div className="sub-text">3 orders</div>
                      </div>
                    </div>
                    <div className="right-side">
                      <div className="price">$380</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-wrapper width-35">
            <div className="row">
              <div className="column">
                <h3>Recent Activity (Static)</h3>
                <div className="activity-wrapper">
                  {activities.map((a, i) => (
                    <div key={i} className="activity">
                      <span className="icon">
                        <i className={a.icon}></i>
                      </span>
                      <div className="details">
                        {a.text}
                        <span>2 minutes ago</span>
                      </div>
                    </div>
                  ))}
                  {activities.map((a, i) => (
                    <div key={i} className="activity">
                      <span className="icon">
                        <i className={a.icon}></i>
                      </span>
                      <div className="details">
                        {a.text}
                        <span>2 minutes ago</span>
                      </div>
                    </div>
                  ))}
                  {activities.map((a, i) => (
                    <div key={i} className="activity">
                      <span className="icon">
                        <i className={a.icon}></i>
                      </span>
                      <div className="details">
                        {a.text}
                        <span>2 minutes ago</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Profile Section */}
        {/* <div className="store-header row">
          <div className="column profile-section">
            <span className="avater">
              <img src={data.image || ''} alt={data.name || 'Store'} />
            </span>
            <div className="name">{data.name || 'Unnamed Store'}</div>
            <div className="des">{data.description || ''}</div>
            {data.phone && (
              <div className="details">
                <i className="adminlib-form-phone"></i>
                {data.phone}
              </div>
            )}
            {data.email && (
              <div className="details">
                <i className="adminlib-mail"></i>
                {data.email}
              </div>
            )}
            <div className="review">
              {renderStars(averageRating)} <span>({totalReviews} reviews)</span>
            </div>
            {data.email && (
              <div className="buttons">
                <a href={`mailto:${data.email}`} className="admin-btn btn-purple">
                  <i className="adminlib-mail"></i> Send Mail
                </a>
              </div>
            )}
          </div>
          <div
            className="column store-image"
            style={{ backgroundImage: `url(${data.banner || ''})` }}
          />
        </div> */}

        {/* Activity + Chart */}
        <div className="row">
          <div className="column w-40">
            <h3>Recent Activity (Static)</h3>
            <div className="activity-wrapper">
              {activities.map((a, i) => (
                <div key={i} className="activity">
                  <span className="icon">
                    <i className={a.icon}></i>
                  </span>
                  <div className="details">
                    {a.text}
                    <span>2 minutes ago</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="column w-40">
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <i className="adminlib-pro-tag admin-icon red"></i>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <i className="adminlib-pro-tag admin-icon red"></i>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <i className="adminlib-pro-tag admin-icon red"></i>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <i className="adminlib-pro-tag admin-icon red"></i>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <i className="adminlib-pro-tag admin-icon green"></i>
                  </div>
                  <div className="details">
                    <div className="item-title">Lather & Loom</div>
                    <div className="sub-text">3 orders</div>
                  </div>
                </div>
                <div className="right-side">
                  <div className="price">$380</div>
                </div>
              </div>
            </div>
          </div>
          <div className="column profile-section">
            <span className="avater">
              <img src={data.image || ''} alt={data.name || 'Store'} />
            </span>
            <div className="name">{data.name || 'Unnamed Store'}</div>
            <div className="des">{data.description || ''}</div>
            {data.phone && (
              <div className="details">
                <i className="adminlib-form-phone"></i>
                {data.phone}
              </div>
            )}
            {data.email && (
              <div className="details">
                <i className="adminlib-mail"></i>
                {data.email}
              </div>
            )}
            {data.email && (
              <div className="details">
                <i className="adminlib-Export-import-Stock-01"></i>
                Since Oct 10, 2025
              </div>
            )}
            
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </>
  );
};

export default ViewStore;
