// AddBankModal.jsx
import { useState } from "react";
import { apiPost } from "../api";
import { useAuth } from "../context/AuthContext";

function AddBankModal({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    branch: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.accountHolder ||
      !form.bankName ||
      !form.accountNumber ||
      !form.ifsc
    ) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);
      await apiPost("/bank-accounts", {
        userId: user.id,
        ...form,
      });
      alert("Bank account added");
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to add bank account");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/40"
        onClick={loading ? undefined : onClose}
      />
      <div className="relative z-50 bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-5">
        <h2 className="text-lg font-semibold mb-1">Add bank account</h2>
        <p className="text-xs text-gray-500 mb-4">
          Withdrawals will be sent to this bank account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Account holder name
            </label>
            <input
              name="accountHolder"
              value={form.accountHolder}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="As per bank records"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Bank name
            </label>
            <input
              name="bankName"
              value={form.bankName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. SBI, HDFC"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Account number
            </label>
            <input
              name="accountNumber"
              value={form.accountNumber}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter account number"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              IFSC code
            </label>
            <input
              name="ifsc"
              value={form.ifsc}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. SBIN0001234"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Branch (optional)
            </label>
            <input
              name="branch"
              value={form.branch}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Branch name"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBankModal;
