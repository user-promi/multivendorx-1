import { AdminBreadcrumbs } from 'zyra';
import StoreSupport from './storeSupport';
import WithdrawalRequests from './withdrawalRequests';
import RefundRequest from './refundRequest';
import AbuseReports from './abuseReports';
import StoreReviews from './storeReviews ';

const WorkBoard = () => {
    const workboardStats = [
        {
          id: 'reviews',
          label: 'Pending Reviews',
          count: 12,
        },
        {
          id: 'support',
          label: 'Open Support Tickets',
          count: 5,
        },
        {
          id: 'withdrawals',
          label: 'Withdrawal Requests',
          count: 8,
        },
        {
          id: 'refunds',
          label: 'Refund Requests',
          count: 3,
        },
        {
          id: 'abuse',
          label: 'Abuse Reports',
          count: 2,
        },
    ];

    const withdrawalExtraStats = [
        { id: 'reverse', label: 'Reverse Withdrawal', value: '₹0.00' },
        { id: 'collected', label: 'Total Collected', value: '₹25,440.00' },
        { id: 'remaining', label: 'Remaining Balance', value: '₹12,850.00' },
        { id: 'transactions', label: 'Total Transactions', value: '156' },
    ];
      
    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="icon"
                parentTabName="Workboard Dashboard"
            />

            {/* Workboard Stats */}
            <div>
                {workboardStats.map(stat => (
                    <div key={stat.id}>
                        <span>{stat.count}</span>
                        <span>{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Sections */}
            <div>
                <div>
                    <i className="icon-store-reviews"></i>
                    <h2>Store Reviews</h2>
                </div>
                <StoreReviews />
            </div>

            <div>
                <div>
                    <i className="icon-store-support"></i>
                    <h2>Store Support</h2>
                </div>
                <StoreSupport />
            </div>

            <div>
                <div>
                    <i className="icon-withdrawal-requests"></i>
                    <h2>Withdrawal Requests</h2>
                </div>

                {/* Extra stats specific to Withdrawal Requests */}
                <div>
                    {withdrawalExtraStats.map(stat => (
                        <div key={stat.id}>
                            <span>{stat.value}</span>
                            <span>{stat.label}</span>
                        </div>
                    ))}
                </div>

                <WithdrawalRequests />
            </div>

            <div>
                <div>
                    <i className="icon-refund-requests"></i>
                    <h2>Refund Requests</h2>
                </div>
                <RefundRequest />
            </div>

            <div>
                <div>
                    <i className="icon-abuse-reports"></i>
                    <h2>Abuse Reports</h2>
                </div>
                <AbuseReports />
            </div>
        </>
    );
};

export default WorkBoard;
