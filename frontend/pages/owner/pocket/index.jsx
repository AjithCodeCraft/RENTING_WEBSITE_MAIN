import React, { useState, useEffect } from 'react';
import OwnerHeader from '../OwnerHeader';
import { Calendar, IndianRupee, List, ChevronDown, Wallet } from 'lucide-react';
import Cookies from 'js-cookie';
import axios from 'axios';

const Pocket = () => {
  const [balance, setBalance] = useState(0);
  const [showStatement, setShowStatement] = useState(false);
  const [withdrawals, setWithdrawals] = useState([
    { id: 1, date: '2025-04-15', amount: 1200.00, commission: 24.00, type: 'Manual', status: 'Completed' },
    { id: 2, date: '2025-04-08', amount: 950.50, commission: 19.01, type: 'Automatic (Monday)', status: 'Completed' },
    { id: 3, date: '2025-04-01', amount: 1350.25, commission: 27.01, type: 'Automatic (Monday)', status: 'Completed' },
    { id: 4, date: '2025-03-25', amount: 850.00, commission: 17.00, type: 'Manual', status: 'Completed' },
  ]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [nextMondayDate, setNextMondayDate] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    // Fetch user profile to get UPI ID
    const fetchUserProfile = async () => {
      try {
        const token = Cookies.get('access_token_owner');
        const response = await axios.get('http://127.0.0.1:8000/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUpiId(response.data.upi_id || '');
        setLoadingProfile(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoadingProfile(false);
      }
    };

    // Fetch the total completed payments from the API and store in cookies if not already set
    const fetchAndSetBalance = async () => {
      const storedBalance = Cookies.get('balance');
      if (storedBalance) {
        setBalance(parseFloat(storedBalance));
      } else {
        try {
          const token = Cookies.get('access_token_owner');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/completed/total/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          const totalAmount = data.completed_total_amount;
          setBalance(totalAmount);
          Cookies.set('balance', totalAmount, { expires: 7 });
        } catch (error) {
          console.error('Failed to fetch balance:', error);
          setBalance(0);
        }
      }
    };

    fetchUserProfile();
    fetchAndSetBalance();

    // Calculate next Monday for automatic withdrawal
    const calculateNextMonday = () => {
      const today = new Date();
      const daysUntilMonday = (1 + 7 - today.getDay()) % 7;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      return nextMonday.toISOString().split('T')[0];
    };

    setNextMondayDate(calculateNextMonday());
  }, []);

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    const commission = amount * 0.12;
    const totalDeduction = amount + commission;

    if (!withdrawAmount || amount <= 0 || totalDeduction > balance) {
      return;
    }

    const newWithdrawal = {
      id: withdrawals.length + 1,
      date: new Date().toISOString().split('T')[0],
      amount: amount,
      commission: commission,
      type: 'Manual',
      status: 'Processing'
    };

    setWithdrawals([newWithdrawal, ...withdrawals]);
    const newBalance = balance - totalDeduction;
    setBalance(newBalance);
    Cookies.set('balance', newBalance, { expires: 7 });
    setWithdrawAmount('');
  };

  const commission = parseFloat(withdrawAmount) * 0.12;
  const withdrawableAmount = parseFloat(withdrawAmount) - commission;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <OwnerHeader />
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg p-6">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800">My Pocket</h1>

          {/* Balance Card */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 mb-1">Available Balance</p>
                <h2 className="text-3xl font-bold" style={{ color: '#17A345' }}>
                  ₹{typeof balance === 'number' ? balance.toFixed(2) : '0.00'}
                </h2>
              </div>
              <div className="bg-green-50 rounded-full p-3" style={{ backgroundColor: 'rgba(23, 163, 69, 0.1)' }}>
                <IndianRupee className="w-8 h-8" style={{ color: '#17A345' }} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-gray-500 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <p>Next automatic withdrawal: <span className="font-medium">{nextMondayDate}</span></p>
            </div>
          </div>

          {/* Manual Withdrawal Section */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium mb-4 text-gray-700">Withdraw Funds</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-grow">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="pl-10 block w-full rounded-md border border-gray-200 shadow-sm p-2 focus:ring-0 focus:border-gray-300"
                  />
                </div>
              </div>
              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) + commission > balance}
                className="py-2 px-4 rounded-md font-medium text-white flex items-center justify-center"
                style={{ backgroundColor: parseFloat(withdrawAmount) > 0 && parseFloat(withdrawAmount) + commission <= balance ? '#17A345' : '#9CA3AF' }}
              >
                Withdraw Now
              </button>
            </div>
            
            {/* UPI ID Information */}
            {withdrawAmount && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <Wallet className="w-5 h-5 mt-0.5 mr-2 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-700">
                      Amount will be credited to your UPI ID:
                    </p>
                    <p className="font-medium text-blue-600">
                      {upiId || 'No UPI ID registered. Please update your profile.'}
                    </p>
                    {!upiId && (
                      <p className="text-xs text-red-500 mt-1">
                        You need to set a UPI ID to receive payments
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {parseFloat(withdrawAmount) + commission > balance && (
              <p className="text-red-500 mt-2 text-sm">Insufficient balance for this withdrawal.</p>
            )}
            {withdrawAmount && (
              <div>
                <p className="mt-2 text-sm text-red-500">
                  Commission: -₹{commission.toFixed(2)}
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  Withdrawable Amount: ₹{withdrawableAmount.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Pocket Statement Button */}
          <button
            onClick={() => setShowStatement(!showStatement)}
            className="flex items-center justify-between w-full bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-md mr-3" style={{ backgroundColor: 'rgba(23, 163, 69, 0.1)' }}>
                <List className="h-5 w-5" style={{ color: '#17A345' }} />
              </div>
              <span className="font-medium text-gray-700">Pocket Statement</span>
            </div>
            <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${showStatement ? 'rotate-180' : ''}`} />
          </button>

          {/* Pocket Statement Table */}
          {showStatement && (
            <div className="mt-4 border border-gray-100 rounded-lg overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{withdrawal.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#17A345' }}>₹{withdrawal.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#FF0000' }}>-₹{withdrawal.commission.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{withdrawal.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          withdrawal.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          withdrawal.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {withdrawal.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Pocket;