import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import AddBankModal from "../components/AddBankModal";

function Mine() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState({ balance: 0, totalRecharge: 0, totalIncome: 0 });
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showAddBank, setShowAddBank] = useState(false);

  const loadWallet = async () => {
    if (!user) return;
    try {
      const data = await apiGet(`/wallet/${user.id}`);
      setWallet(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBankAccounts = async () => {
    if (!user) return;
    try {
      const data = await apiGet(`/bank-accounts?userId=${user.id}`);
      setBankAccounts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadWallet();
    loadBankAccounts();
  }, [user]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      showToast("Logged out successfully");
      navigate("/");
    }
  };

  return (
    <div className="p-4 pb-20 max-w-md mx-auto bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-sm text-gray-600">Manage your account and view records</p>
      </div>

      {/* User ID Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
        <h2 className="text-sm font-semibold opacity-90 mb-1">User ID</h2>
        <p className="text-xl font-mono font-bold">{user?.id}</p>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4 text-center border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Balance</p>
          <p className="text-lg font-bold text-gray-900">₹{wallet.balance.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Recharge</p>
          <p className="text-lg font-bold text-gray-900">₹{wallet.totalRecharge.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Income</p>
          <p className="text-lg font-bold text-green-600">₹{wallet.totalIncome.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Options Menu */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Menu</h2>
        <div className="space-y-3">
          <Link to="/history" className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
            <span className="text-lg">📊</span>
            <span className="font-medium">Income/Transactions Record</span>
          </Link>
          <button
            onClick={() => setShowAddBank(true)}
            className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <span className="text-lg">🏦</span>
            <span className="font-medium">Add Bank Account</span>
          </button>
          <a
            href="https://t.me/tradeindia_support"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <span className="text-lg">💬</span>
            <span className="font-medium">Support (Telegram)</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <span className="text-lg">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Bank Accounts */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Bank Accounts</h2>
          <button
            onClick={() => setShowAddBank(true)}
            className="px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600 transition-colors"
          >
            + Add Bank
          </button>
        </div>

        {bankAccounts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🏦</div>
            <p className="text-gray-500">No bank account added</p>
            <p className="text-xs text-gray-400 mt-1">
              Add a bank account for withdrawals
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bankAccounts.map((b) => (
              <div
                key={b._id}
                className="border border-gray-200 rounded-xl p-4 bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {b.accountHolder}
                    </p>
                    <p className="text-sm text-gray-600">{b.bankName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      AC: {b.accountNumber}
                    </p>
                    <p className="text-xs text-gray-500">IFSC: {b.ifsc}</p>
                  </div>
                  <div className="text-green-500 text-lg">✓</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddBank && (
        <AddBankModal
          onClose={() => setShowAddBank(false)}
          onSuccess={loadBankAccounts}
        />
      )}
    </div>
  );
}

export default Mine;
