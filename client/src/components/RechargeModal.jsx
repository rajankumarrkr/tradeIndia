import { useState, useEffect } from "react";
import { apiPost, apiGet } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

function RechargeModal({ onClose }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [upiId, setUpiId] = useState("tradeindia@upi");
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    fetchSettings();
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await apiGet("/settings");
      if (data) {
        if (data.upiId) setUpiId(data.upiId);
        if (data.qrCodeUrl) setQrCode(data.qrCodeUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast("Please login first", "error");
      return;
    }
    const num = Number(amount);
    if (!num || num < 300) {
      showToast("Minimum recharge amount is 300", "error");
      return;
    }
    if (!utr) {
      showToast("Please enter UTR number", "error");
      return;
    }
    setLoading(true);
    try {
      await apiPost("/recharge", {
        userId: user.id,
        amount: num,
        utr,
        upiId,
      });
      showToast("Recharge request submitted. Wait for admin approval.");
      onClose();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
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
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10 blur-xl"></div>
          <h2 className="text-xl font-bold mb-1 relative z-10">Add Funds</h2>
          <p className="text-xs opacity-90 relative z-10 text-green-50">
            Secure UPI Payment Gateway
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
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide text-center">Scan & Pay</p>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
              <div className="w-40 h-40 bg-white mx-auto mb-3 p-2 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
                {/* QR Code */}
                {qrCode ? (
                  <img src={qrCode} alt="Payment QR" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center text-white text-xs">
                    QR Code
                  </div>
                )}
              </div>
              <p className="text-lg font-mono font-bold text-gray-900 select-all cursor-pointer bg-white px-3 py-1 rounded border border-gray-200 inline-block shadow-sm text-sm">
                {upiId}
              </p>
              <p className="text-[10px] text-gray-400 mt-2">Tap ID to copy</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                Select Amount
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[300, 500, 1000, 2000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    className={`py-2 px-1 rounded-xl text-sm font-semibold border transition-all ${amount === amt.toString()
                      ? "border-green-500 bg-green-500 text-white shadow-md shadow-green-200"
                      : "border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter custom amount"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                Reference ID (UTR)
              </label>
              <input
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="12-digit UTR number"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:font-normal"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? "Verifying..." : "Confirm Deposit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RechargeModal;
