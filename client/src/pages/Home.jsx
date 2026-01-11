import { useEffect, useState } from "react";
import { apiGet } from "../api";
import { useAuth } from "../context/AuthContext";
import RechargeModal from "../components/RechargeModal";
import WithdrawModal from "../components/WithdrawModal";

function Home() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState({
    balance: 0,
    totalRecharge: 0,
    totalIncome: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showRecharge, setShowRecharge] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [walletData, banksData] = await Promise.all([
        apiGet(`/wallet/${user.id}`),
        apiGet(`/bank-accounts?userId=${user.id}`),
      ]);
      setWallet(walletData || { balance: 0, totalIncome: 0, totalRecharge: 0 });
      setBankAccounts(banksData || []);
    } catch (err) {
      console.error("Failed to load home data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Modern Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 rounded-b-[2.5rem] p-6 pb-24 shadow-2xl overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl translate-y-10 -translate-x-10"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/80 text-sm font-medium">Welcome back,</p>
              <h1 className="text-2xl font-bold text-white tracking-wide">
                {user?.name || "Trader"}
              </h1>
            </div>
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
              <span className="text-xl">🔔</span>
            </div>
          </div>

          {/* Wallet Balance Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg
                width="100"
                height="100"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
              </svg>
            </div>

            <p className="text-sm text-indigo-100 font-medium mb-1">
              Total Balance
            </p>
            <h2 className="text-4xl font-bold mb-6 tracking-tight">
              ₹{(wallet?.balance || 0).toLocaleString("en-IN")}
            </h2>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRecharge(true)}
                className="flex-1 bg-white text-indigo-700 py-2.5 rounded-xl font-semibold text-sm shadow-md active:scale-95 transition-all hover:bg-indigo-50"
              >
                + Deposit
              </button>
              <button
                onClick={() => setShowWithdraw(true)}
                className="flex-1 bg-indigo-500/40 border border-white/30 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-500/50 active:scale-95 transition-all backdrop-blur-sm"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-16 relative z-20">
        {/* Stats Row */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-white rounded-2xl p-4 shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
              📉
            </div>
            <p className="text-xs text-gray-500 font-medium">Total Income</p>
            <p className="text-lg font-bold text-gray-900">
              ₹{(wallet?.totalIncome || 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="flex-1 bg-white rounded-2xl p-4 shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-2">
              💎
            </div>
            <p className="text-xs text-gray-500 font-medium">Assets</p>
            <p className="text-lg font-bold text-gray-900">
              ₹{(wallet?.totalAssets || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Quick Actions / Features */}
        <h3 className="text-lg font-bold text-gray-800 mb-4 px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "Plans", icon: "🚀", color: "bg-orange-100 text-orange-600", path: "/plan" },
            { label: "Team", icon: "👥", color: "bg-blue-100 text-blue-600", path: "/team" },
            { label: "Service", icon: "🎧", color: "bg-pink-100 text-pink-600", link: "https://t.me/tradeindia_support" },
            { label: "App", icon: "📱", color: "bg-teal-100 text-teal-600", action: () => alert("App coming soon!") },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center gap-2 group cursor-pointer"
              onClick={() => {
                if (item.path) window.location.href = item.path; // Simple redirect for now, better to use useNavigate/Link if refactoring entire map
                else if (item.link) window.open(item.link, '_blank');
                else if (item.action) item.action();
              }}
            >
              <div
                className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-2xl shadow-sm group-active:scale-90 transition-transform`}
              >
                {item.icon}
              </div>
              <span className="text-xs font-medium text-gray-600">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Promotional Banners */}
        <div className="mb-6 overflow-hidden rounded-2xl shadow-lg relative h-48 group">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2000&auto=format&fit=crop"
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center p-4">
            <h2 className="text-white text-2xl font-bold mb-2 text-shadow-lg">Invest Your Amount</h2>
            <p className="text-blue-100 text-lg font-medium">Get Daily Returns Instantly</p>
            <button
              onClick={() => window.location.href = '/plan'}
              className="mt-4 bg-white text-blue-600 px-6 py-2 rounded-full font-bold shadow-lg hover:bg-blue-50 transition-colors"
            >
              Start Investing
            </button>
          </div>
        </div>
      </div>

      {showRecharge && (
        <RechargeModal
          onClose={() => setShowRecharge(false)}
          onSuccess={loadData}
        />
      )}

      {showWithdraw && (
        <WithdrawModal
          onClose={() => setShowWithdraw(false)}
          onSuccess={loadData}
          bankAccounts={bankAccounts}
        />
      )}
    </div>
  );
}

export default Home;
