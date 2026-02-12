import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api";
import { useAuth } from "../context/AuthContext";

function History() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState("all");

    useEffect(() => {
        if (user) fetchHistory();
    }, [user]);

    const fetchHistory = async () => {
        try {
            const res = await apiGet(`/wallet/transactions/${user.id}`);
            setData(res || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return data.filter(item => type === 'all' ? true : item.type === type);
    }, [data, type]);

    const stats = useMemo(() => {
        const recharge = filtered.filter(i => i.type === 'recharge' && i.status === 'success')
            .reduce((acc, curr) => acc + curr.amount, 0);
        const withdraw = filtered.filter(i => i.type === 'withdraw' && i.status === 'success')
            .reduce((acc, curr) => acc + curr.amount, 0);
        const income = filtered.filter(i => ['roi', 'team_income', 'admin_add'].includes(i.type))
            .reduce((acc, curr) => acc + curr.amount, 0);
        return { recharge, withdraw, income };
    }, [filtered]);

    const groupTransactionsByDate = (transactions) => {
        const groups = {};
        transactions.forEach(tx => {
            const date = new Date(tx.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            if (!groups[date]) groups[date] = [];
            groups[date].push(tx);
        });
        return groups;
    };

    const getTransactionConfig = (item) => {
        const status = item.status || "success";
        const isPending = status === "pending";
        const isRejected = status === "rejected";

        switch (item.type) {
            case 'recharge':
                return {
                    icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 17l10-10" />
                            <path d="M7 7h10v10" />
                        </svg>
                    ),
                    label: "Recharge",
                    color: isRejected ? "text-red-500" : (isPending ? "text-amber-500" : "text-blue-500"),
                    bgColor: isRejected ? "bg-red-50" : (isPending ? "bg-amber-50" : "bg-blue-50"),
                    sign: "+",
                    statusLabel: status.charAt(0).toUpperCase() + status.slice(1),
                    statusColor: isRejected ? "text-red-600 bg-red-50 border-red-100" : (isPending ? "text-amber-600 bg-amber-50 border-amber-100" : "text-emerald-600 bg-emerald-50 border-emerald-100")
                };
            case 'withdraw':
                return {
                    icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 7l-10 10" />
                            <path d="M17 17H7V7" />
                        </svg>
                    ),
                    label: "Withdrawal",
                    color: isRejected ? "text-red-500" : (isPending ? "text-amber-500" : "text-emerald-500"),
                    bgColor: isRejected ? "bg-red-50" : (isPending ? "bg-amber-50" : "bg-emerald-50"),
                    sign: "-",
                    statusLabel: status.charAt(0).toUpperCase() + status.slice(1),
                    statusColor: isRejected ? "text-red-600 bg-red-50 border-red-100" : (isPending ? "text-amber-600 bg-amber-50 border-amber-100" : "text-emerald-600 bg-emerald-50 border-emerald-100")
                };
            case 'roi':
                return {
                    icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                            <polyline points="17 6 23 6 23 12" />
                        </svg>
                    ),
                    label: "Daily Income",
                    color: "text-emerald-500",
                    bgColor: "bg-emerald-50",
                    sign: "+",
                    statusLabel: "Credited",
                    statusColor: "text-emerald-600 bg-emerald-50 border-emerald-100"
                };
            case 'team_income':
                return {
                    icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    ),
                    label: "Team Referral",
                    color: "text-indigo-500",
                    bgColor: "bg-indigo-50",
                    sign: "+",
                    statusLabel: "Credited",
                    statusColor: "text-indigo-600 bg-indigo-50 border-indigo-100"
                };
            case 'admin_add':
                return {
                    icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                            <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                        </svg>
                    ),
                    label: "Reward",
                    color: "text-amber-500",
                    bgColor: "bg-amber-50",
                    sign: "+",
                    statusLabel: "Added",
                    statusColor: "text-amber-600 bg-amber-50 border-amber-100"
                };
            default:
                return {
                    icon: "📋",
                    label: item.type,
                    color: "text-gray-500",
                    bgColor: "bg-gray-100",
                    sign: "+",
                    statusLabel: status,
                    statusColor: "text-gray-600 bg-gray-50 border-gray-100"
                };
        }
    };

    const groupedData = useMemo(() => groupTransactionsByDate(filtered), [filtered]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 font-['Inter']">
            {/* Minimalist Glass Header */}
            <div className="bg-white/70 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-gray-50 active:scale-95 transition-all text-gray-800 border border-gray-200 shadow-sm"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-none">Activities</h1>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">Transaction History</p>
                    </div>
                </div>
            </div>

            <div className="p-4">
                {/* Modern Wallet Summary Card */}
                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-6 shadow-xl mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/20 rounded-full translate-y-12 -translate-x-12 blur-xl"></div>

                    <div className="relative z-10">
                        <p className="text-indigo-100/70 text-xs font-medium mb-1">Total Profits</p>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">₹{(stats.income + stats.recharge - stats.withdraw).toLocaleString('en-IN')}</h2>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                <p className="text-white/60 text-[10px] font-medium mb-1">Incoming</p>
                                <p className="text-white text-lg font-bold">₹{(stats.income + stats.recharge).toLocaleString('en-IN')}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                <p className="text-white/60 text-[10px] font-medium mb-1">Outgoing</p>
                                <p className="text-white text-lg font-bold">₹{stats.withdraw.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pill Filters */}
                <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide">
                    {['all', 'recharge', 'withdraw'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`px-6 py-2.5 rounded-full text-xs font-semibold capitalize transition-all whitespace-nowrap ${type === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-500 border border-gray-200 hover:border-indigo-300'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.keys(groupedData).length > 0 ? Object.entries(groupedData).map(([date, transactions]) => (
                            <div key={date}>
                                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">{date}</h3>
                                <div className="space-y-3">
                                    {transactions.map(item => {
                                        const config = getTransactionConfig(item);
                                        return (
                                            <div key={item._id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all duration-200">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bgColor} ${config.color}`}>
                                                        {config.icon}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900 mb-1">{config.label}</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight border ${config.statusColor}`}>
                                                                {config.statusLabel}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 font-medium">
                                                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold text-base ${config.color} tracking-tight`}>
                                                        {config.sign}₹{item.amount.toLocaleString('en-IN')}
                                                    </p>
                                                    {item.status === 'rejected' && (
                                                        <p className="text-[9px] text-red-400 font-medium mt-0.5">Contact Support</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <div className="text-4xl mb-3 opacity-20">📁</div>
                                <h4 className="text-sm font-bold text-gray-900">No transactions</h4>
                                <p className="text-xs text-gray-400 mt-1">Your activity history is empty</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default History;
