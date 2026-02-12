import { useState, useEffect } from "react";
import { apiPost, apiGet } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

function RechargeModal({ onClose }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [upiId, setUpiId] = useState("9009702433@okbizaxis");
  const [qrCode, setQrCode] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
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
      console.error("Failed to fetch settings:", err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    showToast("UPI ID copied to clipboard!");
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshot(file);
      setPreviewUrl(URL.createObjectURL(file));
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
    if (!screenshot) {
      showToast("Please upload payment screenshot", "error");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("amount", num);
      formData.append("utr", utr);
      formData.append("upiId", upiId);
      if (screenshot) {
        formData.append("screenshot", screenshot);
      }

      await apiPost("/recharge", formData);
      showToast("Recharge request submitted. Wait for admin approval.");
      onClose();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const formatImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return `${import.meta.env.VITE_API_URL.replace("/api", "")}/${url.replace(/\\/g, "/")}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
              <div className="w-48 h-48 bg-white mx-auto mb-3 p-2 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
                {/* QR Code */}
                {qrCode ? (
                  <img src={formatImageUrl(qrCode)} alt="Payment QR" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-400 p-4">
                    <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 8h16" />
                    </svg>
                    <p className="text-[10px] text-center font-medium">Click UPI ID below to pay directly or copy</p>
                  </div>
                )}
              </div>
              <div
                onClick={copyToClipboard}
                className="group relative cursor-pointer"
              >
                <p className="text-lg font-mono font-bold text-gray-900 bg-white px-4 py-2 rounded-xl border border-gray-200 inline-block shadow-sm transition-all group-hover:border-green-500 group-hover:text-green-600 group-active:scale-95">
                  {upiId}
                </p>
                <div className="mt-2 flex items-center justify-center gap-1.5 text-gray-400 group-hover:text-green-500 transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <p className="text-[10px] font-bold uppercase tracking-wider">Tap to copy</p>
                </div>
              </div>
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

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                Payment Screenshot
              </label>
            <div className="flex flex-col items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full min-h-[128px] border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all overflow-hidden">
                  <div className="flex flex-col items-center justify-center py-4 text-center px-4 w-full">
                    {previewUrl ? (
                      <div className="relative w-full group">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="max-h-48 w-full object-contain rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <p className="text-white text-xs font-bold">Change Image</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-1 text-[11px] text-gray-500"><span className="font-bold uppercase">Upload Screenshot</span></p>
                        <p className="text-[10px] text-gray-400">Tap to browse your gallery</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100 mb-6"
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

