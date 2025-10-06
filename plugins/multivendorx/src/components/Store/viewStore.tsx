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

interface Transaction {
  balance: string;
  locking_balance: string;
  lifetime_earning: string;
}

interface ProductCount {
  name: string;
  value: number;
}

const COLORS = ['#4CAF50', '#FF9800', '#F44336', '#2196F3'];

const ViewStore = () => {
  const [data, setData] = useState<StoreData>({});
  const [transaction, setTransaction] = useState<Transaction>({ balance: '0.00', locking_balance: '0.00', lifetime_earning: '0.00' });
  const [productCounts, setProductCounts] = useState<ProductCount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const location = useLocation();
  const viewId = new URLSearchParams(location.hash.replace(/^#/, '')).get('id');
  const headers = { 'X-WP-Nonce': appLocalizer.nonce };

  // Simplified API fetch function
  const fetchAPI = async (endpoint: string) => {
    try {
      const res = await axios.get(getApiLink(appLocalizer, endpoint), { headers });
      return res.data || {};
    } catch {
      return null;
    }
  };

  const getAverageRatingFromAPI = async (storeId: string) => {
    try {
      const { data: comments = [] } = await axios.get(`${appLocalizer.apiUrl}/wp/v2/comments`, {
        headers,
        params: { meta_key: 'store_rating_id', meta_value: storeId, comment_type: 'multivendorx_review' },
      });

      if (!comments.length) return setAverageRating(0), setTotalReviews(0);

      const ratingSum = comments.reduce((sum: number, c: any) => sum + parseFloat(c.meta?.store_rating || '0'), 0);
      setAverageRating(Math.round((ratingSum / comments.length) * 10) / 10);
      setTotalReviews(comments.length);
    } catch {
      setAverageRating(0);
      setTotalReviews(0);
    }
  };

  useEffect(() => {
    if (!viewId) return;

    const fetchData = async () => {
      const [store, products, transactions] = await Promise.all([
        fetchAPI(`store/${viewId}`),
        fetchAPI(`products/${viewId}`),
        fetchAPI(`transaction/${viewId}`),
      ]);

      if (!store || !products || !transactions) {
        setError(__('Failed to load store data', 'multivendorx'));
        return;
      }

      setData(store);
      setProductCounts([
        { name: 'Pending', value: products.pending || 0 },
        { name: 'Draft', value: products.draft || 0 },
        { name: 'Published', value: products.publish || 0 },
      ]);
      setTransaction(transactions);
    };

    fetchData();
    getAverageRatingFromAPI(viewId);
  }, [viewId]);

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <i key={i} className={i < Math.floor(rating) ? "adminlib-star" : i < rating ? "adminlib-star half" : "adminlib-star-o"}></i>
    ));

  const cards = [
    { title: 'Lifetime Earnings', value: `${appLocalizer.currency_symbol}${transaction.lifetime_earning}`, link: '#', trend: '+16.24%', color: 'text-green' },
    { title: 'Settled Payments', value: '(static)184', link: '?page=multivendorx#&tab=payouts', trend: '+16.24%', color: 'text-green' },
    { title: 'Awaiting Payout', value: `${appLocalizer.currency_symbol}${transaction.locking_balance}`, link: '?page=multivendorx#&tab=payouts', trend: '-8.54%', color: 'text-red' },
    { title: 'Requested Payout', value: '(static)3892', link: '?page=multivendorx#&tab=transactions-history', trend: '+0.00%', color: '' },
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
          { label: 'Back', onClick: () => window.location.assign('?page=multivendorx#&tab=stores'), className: 'admin-btn btn-purple' },
          { label: 'View Public Store', onClick: () => data.slug && window.open(`${appLocalizer.site_url}/store/${data.slug}/`, '_blank'), className: 'admin-btn btn-purple' },
        ] as any} 
        />

      <div className="store-view-wrapper">
        <div className="store-header row">
          <div className="column profile-section">
            <span className="avater"><img src={data.image || ''} alt={data.name || 'Store'} /></span>
            <div className="name">{data.name || 'Unnamed Store'}</div>
            <div className="des">{data.description || ''}</div>
            {data.phone && <div className="details"><i className="adminlib-form-phone"></i>{data.phone}</div>}
            {data.email && <div className="details"><i className="adminlib-mail"></i>{data.email}</div>}
            <div className="review">{renderStars(averageRating)} <span>({totalReviews} reviews)</span></div>
            {data.email && <div className="buttons"><a href={`mailto:${data.email}`} className="admin-btn btn-purple"><i className="adminlib-mail"></i> Send Mail</a></div>}
          </div>
          <div className="column store-image" style={{ backgroundImage: `url(${data.banner || ''})` }} />
        </div>

        <div className="row">
          {cards.map((card, i) => (
            <div key={i} className="column">
              <div className="cards">
                <div className="title-wrapper"><div>{card.title}</div><span className={card.color}>{card.trend}</span></div>
                <div className="card-body"><div className="value"><span>{card.value}</span><a href={card.link}>View Details</a></div><span className="icon"><i className="adminlib-rules"></i></span></div>
              </div>
            </div>
          ))}
        </div>

        <div className="row">
          <div className="column">
            <h3>Recent Activity(Static)</h3>
            <div className="activity-wrapper">{activities.map((a, i) => <div key={i} className="activity"><span className="icon"><i className={a.icon}></i></span><div className="details">{a.text}<span>2 minutes ago</span></div></div>)}</div>
          </div>

          <div className="column">
            <div className="chart-box">
              <h3>Products</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={productCounts} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                    {productCounts.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
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
