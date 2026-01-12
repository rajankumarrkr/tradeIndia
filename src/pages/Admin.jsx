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

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white shadow p-4 mb-4">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
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
                                                : "bg-red-100 text-red-700"
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
                                    <button className="bg-red-50 text-red-600 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100">
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
            await apiPost("/admin/settings", data);
            alert("Settings saved!");
        } catch (err) {
            alert("Failed to save");
        } finally {
            setLoading(false);
        }
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">QR Code (URL or Base64)</label>
                    <textarea
                        value={data.qrCodeUrl}
                        onChange={e => setData({ ...data, qrCodeUrl: e.target.value })}
                        className="w-full border rounded-lg p-2 h-24"
                        placeholder="Enter image URL or Base64 string"
                    />
                    {data.qrCodeUrl && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Preview:</p>
                            <img src={data.qrCodeUrl} alt="QR Preview" className="w-32 h-32 object-contain border" />
                        </div>
                    )}
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
