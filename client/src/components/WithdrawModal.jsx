import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiPost } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

function WithdrawModal({ onClose, onSuccess, bankAccounts }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [amount, setAmount] = useState("");
  const [selectedBankId, setSelectedBankId] = useState(
    bankAccounts?.[0]?._id || ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const numAmount = Number(amount || 0);
  const gst = Math.round(numAmount * 0.15);
  const receiveAmount = numAmount - gst;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || numAmount <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }
    if (!selectedBankId) {
      showToast("Please select bank account", "error");
      return;
    }

    try {
      setLoading(true);
      await apiPost("/withdraw", {
        userId: user.id,
        amount: numAmount,
        bankAccountId: selectedBankId,
      });

      showToast("Withdrawal request created, amount will be processed by admin");
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.message || "Server error", "error");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 -translate-x-10 blur-xl"></div>
          <h2 className="text-xl font-bold mb-1 relative z-10">Withdraw Funds</h2>
          <p className="text-xs opacity-90 relative z-10 text-red-50">
            Transfer money to your bank account
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/20 hover:bg-white/30 rounded-full p-1 transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-6 flex gap-3 items-start">
            <div className="min-w-[20px] text-lg">⚠️</div>
            <p className="text-xs text-red-800 leading-relaxed">
              <strong>Note:</strong> A 15% GST/Service fee will be deducted from your withdrawal amount automatically.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                Withdraw Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  placeholder="Enter amount"
                />
              </div>

              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-[10px] text-gray-500">Service Fee (15%): <span className="text-red-500">₹{isNaN(gst) ? 0 : gst}</span></span>
                <span className="text-[10px] font-bold text-gray-700">You Receive: ₹{isNaN(receiveAmount) ? 0 : receiveAmount}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                Select Bank Account
              </label>
              {bankAccounts && bankAccounts.length > 0 ? (
                <div className="relative">
                  <select
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  >
                    {bankAccounts.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.bankName} - {b.accountNumber.slice(-4)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs p-3 rounded-xl flex items-center justify-between">
                  <span>No bank account found.</span>
                  <Link to="/mine" className="font-bold underline">Add Bank</Link>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !bankAccounts || bankAccounts.length === 0}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? "Processing..." : "Confirm Withdrawal"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default WithdrawModal;
