import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

function Admin() {
    const [users, setUsers] = useState([]);
    const [pendingTx, setPendingTx] = useState([]);
    const [activeTab, setActiveTab] = useState("users");
    const navigate = useNavigate();
    const { user } = useAuth(); // Get user from a simulated auth hook

    useEffect(() => {
        if (!user || !user?.isAdmin) {
            navigate("/admin-login");
            return;
        }
        loadUsers();
        loadTransactions();
    }, [user, navigate]);

    const loadUsers = async () => { // Renamed from fetchUsers
        try {
            const data = await apiGet("/admin/users");
            setUsers(data);
        } catch (err) {
            console.error(err);
            alert("Failed to load users: " + err.message);
        }
    };

    const toggleBlock = async (userId) => {
        try {
            await apiPost(`/admin/users/${userId}/toggle-block`, {});
            setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
        } catch (err) {
            alert("Failed to toggle block");
        }
    };

    const loadTransactions = async () => { // Renamed from fetchPendingTx
        try {
            const data = await apiGet("/admin/pending-transactions");
            setPendingTx(data || []);
        } catch (err) {
            console.error(err);
            alert("Failed to load transactions: " + err.message);
        }
    };

    const handleApproveRecharge = async (id) => {
        try {
            if (!confirm("Approve this recharge?")) return;
            await apiPost(`/admin/approve-recharge/${id}`, {});
            alert("Approved");
            loadTransactions(); // Changed from fetchPendingTx
        } catch (err) {
            alert(err.message);
        }
    };

    const handleApproveWithdrawal = async (id) => {
        try {
            if (!confirm("Approve this withdrawal?")) return;
            await apiPost(`/admin/approve-withdrawal/${id}`, {});
            alert("Approved");
            loadTransactions();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRejectRecharge = async (id) => {
        try {
            if (!confirm("Reject this recharge?")) return;
            await apiPost(`/admin/reject-recharge/${id}`, {});
            alert("Rejected");
            loadTransactions();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRejectWithdrawal = async (id) => {
        try {
            if (!confirm("Reject this withdrawal? Amount will be refunded.")) return;
            await apiPost(`/admin/reject-withdrawal/${id}`, {});
            alert("Rejected and Refunded");
            loadTransactions();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleTriggerROI = async () => {
        try {
            if (!confirm("This will credit daily income to all active investments for today. Proceed?")) return;
            const res = await apiPost("/admin/trigger-roi", {});
            alert(`Success: ${res.creditedInvestments} investments credited.`);
        } catch (err) {
            alert("ROI Trigger failed: " + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white shadow p-4 mb-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <button
                    onClick={handleTriggerROI}
                    className="bg-orange-500 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-orange-600 shadow-sm transition"
                >
                    🚀 Trigger Daily ROI
                </button>
            </div>

            <div className="px-4">
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab("users")}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === "users"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-600 border"
                            }`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab("tx")}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === "tx"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-600 border"
                            }`}
                    >
                        Pending Transactions
                    </button>
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === "settings"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-600 border"
                            }`}
                    >
                        Settings
                    </button>
                    <button
                        onClick={() => setActiveTab("plans")}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === "plans"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-600 border"
                            }`}
                    >
                        Plans
                    </button>
                </div>

                {activeTab === "users" && (
                    <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600 font-bold">
                                <tr>
                                    <th className="p-3">User Details</th>
                                    <th className="p-3">Password (Hash)</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr
                                        key={u._id}
                                        className="border-b last:border-0 hover:bg-gray-50"
                                    >
                                        <td className="p-3">
                                            <p className="font-medium">{u.name}</p>
                                            <p className="text-xs text-gray-500">{u.mobile}</p>
                                            <p className="text-[10px] text-gray-400">ID: {u._id}</p>
                                        </td>
                                        <td className="p-3 max-w-[100px] truncate text-xs text-gray-500" title={u.password}>
                                            {u.password ? u.password.substring(0, 10) + "..." : "N/A"}
                                        </td>
                                        <td className="p-3">
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${u.isBlocked
                                                    ? "bg-red-100 text-red-600"
                                                    : "bg-green-100 text-green-600"
                                                    }`}
                                            >
                                                {u.isBlocked ? "Blocked" : "Active"}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <button
                                                onClick={async () => {
                                                    if (!confirm(`Are you sure you want to ${u.isBlocked ? 'unblock' : 'block'} this user?`)) return;
                                                    await apiPost(`/admin/users/${u._id}/block`, {}); // Make sure route matches router
                                                    loadUsers();
                                                }}
                                                className={`text-xs px-3 py-1.5 rounded text-white font-medium ${u.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                                            >
                                                {u.isBlocked ? 'Unblock' : 'Block'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === "tx" && (
                    <div className="space-y-3">
                        {pendingTx.length === 0 && (
                            <p className="text-gray-500 text-center py-4">
                                No pending transactions
                            </p>
                        )}
                        {pendingTx.map((tx) => (
                            <div
                                key={tx._id}
                                className="bg-white rounded-lg shadow p-4 border border-gray-100"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span
                                            className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${tx.type === "recharge"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-emerald-100 text-emerald-700"
                                                }`}
                                        >
                                            {tx.type}
                                        </span>
                                        <p className="font-bold text-gray-900 mt-1">₹{tx.amount}</p>
                                        <p className="text-xs text-gray-500">
                                            User:{" "}
                                            {typeof tx.user === "object" && tx.user !== null
                                                ? `${tx.user.name} (${tx.user.mobile})`
                                                : tx.user || "Unknown User"}
                                        </p>
                                        {tx.meta?.utr && (
                                            <p className="text-xs text-blue-600">UTR: {tx.meta.utr}</p>
                                        )}
                                        {tx.meta?.screenshot && (
                                            <div className="mt-3">
                                                <p className="text-xs text-gray-500 mb-1 font-bold">Payment Screenshot:</p>
                                                <a
                                                    href={`${import.meta.env.VITE_API_URL.replace("/api", "")}/${tx.meta.screenshot.replace(/\\/g, '/')}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block border rounded-lg overflow-hidden hover:opacity-90 transition shadow-sm max-w-[200px]"
                                                >
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL.replace("/api", "")}/${tx.meta.screenshot.replace(/\\/g, '/')}`}
                                                        alt="Screenshot"
                                                        className="w-full h-auto object-cover"
                                                    />
                                                    <p className="bg-gray-100 text-[10px] text-center py-1 text-gray-600">Click to enlarge</p>
                                                </a>
                                            </div>
                                        )}
                                        {tx.type === "withdraw" && tx.meta?.bankDetails && (
                                            <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 text-[10px] space-y-0.5">
                                                <p className="font-bold text-gray-700">Bank Details:</p>
                                                <p><span className="text-gray-500">Holder:</span> {tx.meta.bankDetails.accountHolder}</p>
                                                <p><span className="text-gray-500">Bank:</span> {tx.meta.bankDetails.bankName}</p>
                                                <p><span className="text-gray-500">A/C No:</span> {tx.meta.bankDetails.accountNumber}</p>
                                                <p><span className="text-gray-500">IFSC:</span> {tx.meta.bankDetails.ifsc}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    <button
                                        onClick={() =>
                                            tx.type === "recharge"
                                                ? handleApproveRecharge(tx._id)
                                                : handleApproveWithdrawal(tx._id)
                                        }
                                        className="bg-green-500 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-green-600"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() =>
                                            tx.type === "recharge"
                                                ? handleRejectRecharge(tx._id)
                                                : handleRejectWithdrawal(tx._id)
                                        }
                                        className="bg-red-50 text-red-600 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "settings" && <SettingsTab />}
                {activeTab === "plans" && <PlansTab />}
            </div>
        </div>
    );
}

function PlansTab() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        investAmount: "",
        dailyIncome: "",
        durationDays: 99,
        totalIncome: ""
    });

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const data = await apiGet("/plans");
            setPlans(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingPlan) {
                await apiPut(`/admin/plans/${editingPlan._id}`, formData);
                alert("Plan updated!");
            } else {
                await apiPost("/admin/plans", formData);
                alert("Plan created!");
            }
            setEditingPlan(null);
            setFormData({ name: "", investAmount: "", dailyIncome: "", durationDays: 99, totalIncome: "" });
            loadPlans();
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            investAmount: plan.investAmount,
            dailyIncome: plan.dailyIncome,
            durationDays: plan.durationDays,
            totalIncome: plan.totalIncome
        });
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this plan?")) return;
        try {
            await apiDelete(`/admin/plans/${id}`);
            alert("Plan deleted!");
            loadPlans();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4">{editingPlan ? "Edit Plan" : "Add New Plan"}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border rounded-lg p-2 mt-1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Investment Amount</label>
                        <input
                            type="number"
                            required
                            value={formData.investAmount}
                            onChange={e => setFormData({ ...formData, investAmount: e.target.value })}
                            className="w-full border rounded-lg p-2 mt-1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Daily Income</label>
                        <input
                            type="number"
                            required
                            value={formData.dailyIncome}
                            onChange={e => setFormData({ ...formData, dailyIncome: e.target.value })}
                            className="w-full border rounded-lg p-2 mt-1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Duration (Days)</label>
                        <input
                            type="number"
                            required
                            value={formData.durationDays}
                            onChange={e => setFormData({ ...formData, durationDays: e.target.value })}
                            className="w-full border rounded-lg p-2 mt-1"
                        />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Processing..." : (editingPlan ? "Update Plan" : "Add Plan")}
                        </button>
                        {editingPlan && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingPlan(null);
                                    setFormData({ name: "", investAmount: "", dailyIncome: "", durationDays: 99, totalIncome: "" });
                                }}
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 font-bold">
                        <tr>
                            <th className="p-3">Plan Name</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Daily</th>
                            <th className="p-3">Days</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plans.map((p) => (
                            <tr key={p._id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium">{p.name}</td>
                                <td className="p-3">₹{p.investAmount}</td>
                                <td className="p-3">₹{p.dailyIncome}</td>
                                <td className="p-3">{p.durationDays}</td>
                                <td className="p-3 text-right space-x-2">
                                    <button
                                        onClick={() => handleEdit(p)}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p._id)}
                                        className="text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SettingsTab() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({ upiId: "", qrCodeUrl: "" });
    const [qrFile, setQrFile] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await apiGet("/admin/settings");
            if (res) setData(res);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // First save text settings
            await apiPost("/admin/settings", { upiId: data.upiId });

            // Then save QR if file selected
            if (qrFile) {
                const formData = new FormData();
                formData.append("qrCode", qrFile);
                const res = await apiPost("/admin/settings/qr", formData);
                setData(prev => ({ ...prev, qrCodeUrl: res.qrCodeUrl }));
                setQrFile(null);
            }

            alert("Settings saved!");
            loadSettings();
        } catch (err) {
            alert("Failed to save: " + err.message);
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
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Payment Settings</h2>
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                    <input
                        type="text"
                        value={data.upiId}
                        onChange={e => setData({ ...data, upiId: e.target.value })}
                        className="w-full border rounded-lg p-2"
                        placeholder="example@upi"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">QR Code</label>
                    <div className="mt-1 flex items-center gap-4">
                        {data.qrCodeUrl && (
                            <img
                                src={formatImageUrl(data.qrCodeUrl)}
                                alt="Current QR"
                                className="w-20 h-20 object-contain border rounded p-1"
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => setQrFile(e.target.files[0])}
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Settings"}
                </button>
            </form>
        </div>
    );
}


export default Admin;
