import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { billService } from '../services/billService';
import { Bill } from '../types';

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          await refreshUser();
          const billsResponse = await billService.getUserBills(user._id);
          if (billsResponse.success) {
            setRecentBills(billsResponse.data.slice(0, 5));
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user, refreshUser]);

  if (!user) {
    return null;
  }

  const balance = user.balance || 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-semibold mb-2">Your Balance</h2>
          <p className="text-4xl font-bold">Rs. {balance.toLocaleString()}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/transfer"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">💸</div>
            <h3 className="font-semibold text-gray-800">Transfer</h3>
            <p className="text-sm text-gray-600">Send money</p>
          </Link>

          <Link
            to="/bills"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">🧾</div>
            <h3 className="font-semibold text-gray-800">Pay Bills</h3>
            <p className="text-sm text-gray-600">Utility bills</p>
          </Link>

          <Link
            to="/load"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">📱</div>
            <h3 className="font-semibold text-gray-800">Mobile Load</h3>
            <p className="text-sm text-gray-600">Top up mobile</p>
          </Link>

          <Link
            to="/bank-accounts"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">🏦</div>
            <h3 className="font-semibold text-gray-800">Bank Accounts</h3>
            <p className="text-sm text-gray-600">Manage accounts</p>
          </Link>
        </div>

        {/* Recent Bills */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Bills</h2>
            <Link
              to="/bills"
              className="text-primary-600 hover:underline text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : recentBills.length === 0 ? (
            <p className="text-gray-500">No recent bills</p>
          ) : (
            <div className="space-y-3">
              {recentBills.map((bill) => (
                <div
                  key={bill._id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">{bill.category}</p>
                    <p className="text-sm text-gray-600">{bill.companyName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      Rs. {bill.amount.toLocaleString()}
                    </p>
                    <p
                      className={`text-sm ${
                        bill.status === 'Paid'
                          ? 'text-green-600'
                          : bill.status === 'Failed'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {bill.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium text-gray-800">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-800">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium text-gray-800">{user.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CNIC</p>
              <p className="font-medium text-gray-800">{user.cnic}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

