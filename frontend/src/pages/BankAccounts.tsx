import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { bankAccountService } from '../services/bankAccountService';
import { Bank, BankAccount } from '../types';

const BankAccounts: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState({
    bankId: '',
    accountTitle: '',
    accountNumber: '',
    iban: '',
    isDefault: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const [banksResponse, accountsResponse] = await Promise.all([
            bankAccountService.getBanks(),
            bankAccountService.getUserBankAccounts(user._id),
          ]);

          if (banksResponse.success) {
            setBanks(banksResponse.data.filter((bank: Bank) => bank.isActive));
          }

          if (accountsResponse.success) {
            setBankAccounts(accountsResponse.data);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoadingData(false);
        }
      }
    };

    fetchData();
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let response;
      if (editingAccount) {
        response = await bankAccountService.updateBankAccount(
          editingAccount._id,
          formData
        );
      } else {
        response = await bankAccountService.addBankAccount(formData);
      }

      if (response.success) {
        setSuccess(
          editingAccount
            ? 'Bank account updated successfully!'
            : 'Bank account added successfully!'
        );
        setFormData({
          bankId: '',
          accountTitle: '',
          accountNumber: '',
          iban: '',
          isDefault: false,
        });
        setShowAddForm(false);
        setEditingAccount(null);

        if (user) {
          const accountsResponse = await bankAccountService.getUserBankAccounts(
            user._id
          );
          if (accountsResponse.success) {
            setBankAccounts(accountsResponse.data);
          }
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          err.message ||
          'Operation failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      bankId: account.bankId._id,
      accountTitle: account.accountTitle,
      accountNumber: account.accountNumber,
      iban: account.iban || '',
      isDefault: account.isDefault,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (accountId: string) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) {
      return;
    }

    try {
      const response = await bankAccountService.deleteBankAccount(accountId);
      if (response.success) {
        setBankAccounts(bankAccounts.filter((acc) => acc._id !== accountId));
        setSuccess('Bank account deleted successfully!');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Delete failed'
      );
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAccount(null);
    setFormData({
      bankId: '',
      accountTitle: '',
      accountNumber: '',
      iban: '',
      isDefault: false,
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Bank Accounts</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Add Bank Account
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingAccount ? 'Edit Bank Account' : 'Add Bank Account'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Bank</label>
                <select
                  name="bankId"
                  value={formData.bankId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a bank</option>
                  {banks.map((bank) => (
                    <option key={bank._id} value={bank._id}>
                      {bank.name} ({bank.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Account Title
                </label>
                <input
                  type="text"
                  name="accountTitle"
                  value={formData.accountTitle}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter account title"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter account number"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">IBAN (Optional)</label>
                <input
                  type="text"
                  name="iban"
                  value={formData.iban}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter IBAN"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label className="ml-2 text-gray-700">Set as default account</label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingAccount ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bank Accounts List */}
        {loadingData ? (
          <p className="text-gray-500">Loading...</p>
        ) : bankAccounts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No bank accounts found. Add one to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bankAccounts.map((account) => (
              <div
                key={account._id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {account.accountTitle}
                      </h3>
                      {account.isDefault && (
                        <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Bank:</span> {account.bankId.name} (
                      {account.bankId.code})
                    </p>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Account Number:</span>{' '}
                      {account.accountNumber}
                    </p>
                    {account.iban && (
                      <p className="text-gray-600">
                        <span className="font-medium">IBAN:</span> {account.iban}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(account)}
                      className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(account._id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BankAccounts;

