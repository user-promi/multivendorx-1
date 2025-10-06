import { Link, useLocation } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import "./viewStore.scss";
import "../AdminDashboard/adminDashboard.scss";
import { AdminBreadcrumbs, getApiLink } from 'zyra';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

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

interface Transaction {
  balance: string;
  locking_balance: string;
  lifetime_earning: string;
}

interface ProductCount {
  name: string;
  value: number;
}

const ViewStore = () => {
  const [data, setData] = useState<StoreData>({});
  const [transaction, setTransaction] = useState<Transaction>();
  const [productCounts, setProductCounts] = useState<ProductCount[]>([]);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const hash = location.hash.replace(/^#/, '');
  const params = new URLSearchParams(hash);
  const viewId = params.get('id');


  const getAverageRatingFromAPI = async (storeId: string) => {
    const apiUrl = `${appLocalizer.apiUrl}/wp/v2/comments`;
  
    try {
      const response = await axios.get(apiUrl, {
        headers: { "X-WP-Nonce": appLocalizer.nonce },
        params: {
          meta_key: 'store_rating_id',
          meta_value: storeId,
          comment_type: 'multivendorx_review',
          per_page: 100, // fetch up to 100 comments; adjust if needed
        },
      });
  
      const comments = response.data;
      if (!comments.length) return { averageRating: 0, totalReviews: 0 };
  
      // Calculate average
      const totalReviews = comments.length;
      const ratingSum = comments.reduce((sum: number, comment: any) => {
        const rating = parseFloat(comment.meta?.store_rating || 0);
        return sum + rating;
      }, 0);
  
      return {
        averageRating: Math.round((ratingSum / totalReviews) * 10) / 10,
        totalReviews,
      };
    } catch (error) {
      console.error("Error fetching rating:", error);
      return { averageRating: 0, totalReviews: 0 };
    }
  };

  useEffect(() => {
    if (!viewId) return;

    const headers = { 'X-WP-Nonce': appLocalizer.nonce };

    const fetchData = async () => {
      try {
        // Fetch store info
        const storeRes = await axios.get(getApiLink(appLocalizer, `store/${viewId}`), { headers });
        setData(storeRes.data || {});

        // Fetch product counts
        const productRes = await axios.get(getApiLink(appLocalizer, `products/${viewId}`), { headers });
        const p = productRes.data || {};
        setProductCounts([
          { name: 'Pending', value: p.pending || 0 },
          { name: 'Draft', value: p.draft || 0 },
          { name: 'Published', value: p.publish || 0 },
        ]);

        // Fetch transaction data
        const transactionRes = await axios.get(getApiLink(appLocalizer, `transaction/${viewId}`), { headers });
        setTransaction(transactionRes.data || { balance: '0.00', locking_balance: '0.00',lifetime_earning:'0.00' });
      } catch (err) {
        setError(__('Failed to load store data', 'multivendorx'));
      }
    };

    fetchData();
    getAverageRatingFromAPI(viewId);
  }, [viewId]);

  const COLORS = ['#4CAF50', '#FF9800', '#F44336', '#2196F3'];
  return (
    <>
      <AdminBreadcrumbs
        activeTabIcon="adminlib-storefront"
        tabTitle={`Viewing ${data.name || ''}`}
        description={data.description || ''}
        buttons={[
          {
            label: 'Back',
            onClick: () => window.location.assign('?page=multivendorx#&tab=stores'),
            className: 'admin-btn btn-purple',
          },
          {
            label: 'View Public Store',
            onClick: () => {
              if (data.slug)
                window.open(`${appLocalizer.site_url}/store/${data.slug}/`, '_blank');
            },
            className: 'admin-btn btn-purple',
          },
        ] as any} renderBreadcrumb={undefined} renderMenuItems={undefined} goPremiumLink={undefined} customContent={undefined}      />

      <div className="store-view-wrapper">
        <div className="store-header row">
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
              {[...Array(4)].map((_, i) => (
                <i key={i} className="adminlib-star"></i>
              ))}
            </div>
            <div className="buttons">
              {data.email && (
                <a href={`mailto:${data.email}`} className="admin-btn btn-purple">
                  <i className="adminlib-mail"></i> Send Mail
                </a>
              )}
            </div>
          </div>

          <div
            className="column store-image"
            style={{ backgroundImage: `url(${data.banner || ''})` }}
          />
        </div>

        {/* Cards Row */}
        <div className="row">
          {[
            { title: 'Lifetime Earnings', value: `${appLocalizer.currency_symbol}${transaction?.lifetime_earning || '0.00'}`, link: '#', trend: '+16.24%', color: 'text-green' },
            { title: 'Settled Payments', value: '(static)184', link: '?page=multivendorx#&tab=payouts', trend: '+16.24%', color: 'text-green' },
            { title: 'Awaiting Payout', value: `${appLocalizer.currency_symbol}${transaction?.locking_balance || '0.00'}`, link: '?page=multivendorx#&tab=payouts', trend: '-8.54%', color: 'text-red' },
            { title: 'Requested Payout', value: '(static)3892', link: '?page=multivendorx#&tab=transactions-history', trend: '+0.00%', color: '' },
          ].map((card, index) => (
            <div key={index} className="column">
              <div className="cards">
                <div className="title-wrapper">
                  <div>{card.title}</div>
                  <span className={card.color}>{card.trend}</span>
                </div>
                <div className="card-body">
                  <div className="value">
                    <span>{card.value}</span>
                    <a href={card.link}>View Details</a>
                  </div>
                  <span className="icon">
                    <i className="adminlib-rules"></i>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row">
          <div className="column">
            <h3>Recent Activity</h3>
            <div className="activity-wrapper">
              {[
                { icon: 'adminlib-cart', text: 'New product "Wireless Gaming Headset" added by TechWorld' },
                { icon: 'adminlib-star', text: '5-star review received for "Smartphone Case" by MobileGear' },
                { icon: 'adminlib-global-community', text: 'New vendor "Fashion Forward" completed registration' },
                { icon: 'adminlib-cart', text: 'Commission payment of $2,847 processed for ElectroHub' },
              ].map((activity, idx) => (
                <div key={idx} className="activity">
                  <span className="icon"><i className={activity.icon}></i></span>
                  <div className="details">
                    {activity.text}
                    <span>2 minutes ago</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="column">
            <div className="chart-box">
              <h3>Products</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={productCounts}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    {productCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </>
  );
};

export default ViewStore;
