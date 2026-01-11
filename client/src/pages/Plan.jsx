import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

function Plan() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await apiGet("/plans");
        setPlans(data);
      } catch (err) {
        showToast("Failed to load plans", "error");
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  const handleBuy = async (plan) => {
    if (!user) {
      showToast("Please login first", "error");
      return;
    }
    if (buying) return;
    setBuying(true);
    try {
      const res = await apiPost("/plans/buy", {
        userId: user.id,
        planId: plan._id,
      });
      showToast(`Plan purchased! New wallet balance: ₹${res.walletBalance}`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 pb-20 max-w-md mx-auto">
        <h1 className="text-xl font-semibold mb-3">Plans</h1>
        <p className="text-sm text-gray-500">Loading plans...</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 max-w-md mx-auto bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Investment Plans</h1>
        <p className="text-sm text-gray-600">
          Select a plan and earn fixed daily returns for 99 days. Daily income
          will be auto‑credited to your wallet.
        </p>
      </div>

      <div className="space-y-4">
        {plans.map((plan, index) => (
          <div
            key={plan._id}
            className="group relative bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Premium Badge for high value plans */}
            {plan.investAmount >= 5000 && (
              <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-20 shadow-sm">
                MOST POPULAR
              </div>
            )}

            {/* Card Header with Gradient */}
            <div className={`p-4 relative overflow-hidden ${index % 2 === 0 ? 'bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500' : 'bg-gradient-to-br from-purple-600 via-pink-600 to-rose-500'}`}>
              <div className="relative z-10 text-white flex justify-between items-center">
                <h3 className="text-lg font-bold tracking-wide">{plan.name}</h3>
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded backdrop-blur-md">{plan.durationDays} Days</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4">
              <div className="flex justify-between items-end mb-4 border-b border-gray-100 pb-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Invest</p>
                  <p className="text-lg font-extrabold text-gray-900">₹{plan.investAmount.toLocaleString("en-IN")}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Daily</p>
                  <p className={`text-lg font-bold ${index % 2 === 0 ? 'text-blue-600' : 'text-pink-600'}`}>₹{plan.dailyIncome.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="flex justify-between items-center gap-3 mb-4">
                <div className="bg-gray-50 flex-1 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-400">Total Inc.</p>
                  <p className="text-sm font-bold text-gray-800">₹{plan.totalIncome.toLocaleString("en-IN")}</p>
                </div>
                <div className="bg-gray-50 flex-1 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-400">Yield</p>
                  <p className="text-sm font-bold text-green-500">
                    {((plan.totalIncome / plan.investAmount) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleBuy(plan)}
                disabled={buying}
                className={`w-full py-3 rounded-xl font-bold text-xs text-white shadow-md active:scale-95 transition-transform disabled:opacity-70
                    ${index % 2 === 0
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600'
                  }
                `}
              >
                {buying ? "..." : "INVEST NOW"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Plan;
