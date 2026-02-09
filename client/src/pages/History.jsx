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
        switch (item.type) {
            case 'recharge':
                return {
                    icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M5 12l7 7 7-7" />
                        </svg>
                    ),
                    label: "Add Money",
                    color: "text-blue-500",
                    bgColor: "bg-blue-50",
                    sign: "+"
                };
            case 'withdraw':
                return {
                    icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22V2M5 12l7-7 7 7" />
                        </svg>
                    ),
                    label: "Withdrawal",
                    color: "text-emerald-500",
                    bgColor: "bg-emerald-50",
                    sign: "-"
                };
            case 'roi':
                return {
                    icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                            <polyline points="17 6 23 6 23 12" />
                        </svg>
                    ),
                    label: "Daily Returns",
                    color: "text-emerald-500",
                    bgColor: "bg-emerald-50",
                    sign: "+"
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
                    label: "Team Commission",
                    color: "text-indigo-500",
                    bgColor: "bg-indigo-50",
                    sign: "+"
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
                    label: "Bonus Reward",
                    color: "text-amber-500",
                    bgColor: "bg-amber-50",
                    sign: "+"
                };
            default:
                return {
                    icon: "📋",
                    label: item.type,
                    color: "text-gray-500",
                    bgColor: "bg-gray-100",
                    sign: ""
                };
        }
    };

    const groupedData = useMemo(() => groupTransactionsByDate(filtered), [filtered]);

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-['Poppins']">
            {/* Premium Sticky Header */}
            <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-40 px-6 py-5 flex items-center justify-between border-b border-gray-100/50">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gray-50 hover:bg-gray-100 active:scale-90 transition-all text-gray-900 border border-gray-100 shadow-sm"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">Passbook</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-xl shadow-indigo-200 uppercase transform hover:rotate-6 transition-transform">
                        {user?.name?.charAt(0) || "U"}
                    </div>
                </div>
            </div>

            <div className="p-4">
                {/* Floating Credit Card Dashboard */}
                <div className="bg-slate-900 rounded-[40px] p-8 shadow-2xl mb-10 relative overflow-hidden ring-1 ring-white/10 group">
                    {/* Animated Blur Blobs */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/40 rounded-full blur-[80px] group-hover:bg-indigo-500/60 transition-colors duration-1000"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-600/30 rounded-full blur-[80px] group-hover:bg-purple-500/50 transition-colors duration-1000"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px]"></div>

                    <div className="relative z-10 flex flex-col gap-10">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Net Performance</p>
                                </div>
                                <h2 className="text-4xl font-black text-white tracking-tighter">₹{(stats.income + stats.recharge - stats.withdraw).toLocaleString('en-IN')}</h2>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="opacity-40">
                                    <path d="M21 12V7H5a2 2-0 010-4h14v4" />
                                    <path d="M3 5v14a2 2 security 0 002 2h16v-5" />
                                    <path d="M18 12a2 2 0 000 4h4v-4h-4z" />
                                </svg>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 hover:bg-white/10 transition-colors">
                                <p className="text-white/40 text-[9px] uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Total Inflow
                                </p>
                                <p className="text-emerald-400 text-xl font-black tracking-tight">₹{(stats.income + stats.recharge).toLocaleString('en-IN')}</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 hover:bg-white/10 transition-colors">
                                <p className="text-white/40 text-[9px] uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                    Total Outflow
                                </p>
                                <p className="text-rose-400 text-xl font-black tracking-tight">₹{stats.withdraw.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modern Segmented Filters */}
                <div className="flex bg-gray-100/50 p-1.5 rounded-[24px] mb-10 border border-gray-100">
                    {['all', 'recharge', 'withdraw'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`flex-1 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 relative ${type === t ? 'bg-white text-indigo-600 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.05)] translate-y-[-1px]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {t}
                            {type === t && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.8)]"></div>}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 pointer-events-none">
                        <div className="w-12 h-12 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="mt-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Retrieving logs...</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {Object.keys(groupedData).length > 0 ? Object.entries(groupedData).map(([date, transactions]) => (
                            <div key={date}>
                                <div className="flex items-center gap-3 mb-5 px-1">
                                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">{date}</h3>
                                    <div className="flex-1 h-px bg-gray-200/50"></div>
                                </div>
                                <div className="space-y-4">
                                    {transactions.map(item => {
                                        const config = getTransactionConfig(item);
                                        return (
                                            <div key={item._id} className="bg-white p-5 rounded-[32px] border border-gray-100/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] flex items-center justify-between group active:scale-[0.97] transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.06)] hover:border-indigo-100 relative overflow-hidden">
                                                <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50/30 rounded-full blur-3xl -translate-y-16 translate-x-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                                <div className="flex items-center gap-5 relative z-10">
                                                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-[inset_0_-4px_10px_rgba(255,255,255,0.4)] ${config.bgColor} ${config.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                                        {config.icon}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-[16px] text-gray-900 tracking-tight leading-tight mb-1.5">{config.label}</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100/50">Success</span>
                                                            <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right relative z-10">
                                                    <p className={`font-black text-[18px] ${config.color} tracking-tight tabular-nums`}>
                                                        {config.sign}₹{item.amount.toLocaleString('en-IN')}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-1 group-hover:text-indigo-300 transition-colors">Verified</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-gray-100 rounded-[48px] shadow-sm">
                                <div className="w-20 h-20 bg-gray-50 rounded-[28px] shadow-inner flex items-center justify-center text-3xl mb-6 grayscale opacity-30 transform -rotate-12 group-hover:rotate-0 transition-transform duration-700">📁</div>
                                <h4 className="text-sm font-black text-gray-900 mb-1">No Activity Found</h4>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Your records will appear here</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default History;
