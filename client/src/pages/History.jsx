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
            {/* Native Style Header */}
            <div className="bg-white sticky top-0 z-40 px-4 py-5 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 active:scale-90 transition-all text-gray-900"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Passbook</h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-100 uppercase">
                        {user?.name?.charAt(0) || "U"}
                    </div>
                </div>
            </div>

            <div className="p-4">
                {/* Sleek Fintech Dashboard Card */}
                <div className="bg-indigo-600 rounded-[32px] p-6 shadow-2xl shadow-indigo-200 mb-8 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>

                    <div className="relative z-10 flex flex-col gap-6">
                        <div>
                            <p className="text-indigo-100 text-xs font-medium uppercase tracking-widest mb-1 opacity-80">Period Balance</p>
                            <h2 className="text-3xl font-extrabold text-white tracking-tight">₹{(stats.income + stats.recharge - stats.withdraw).toLocaleString('en-IN')}</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
                            <div>
                                <p className="text-indigo-100/60 text-[10px] uppercase font-bold tracking-widest mb-1">Total Inflow</p>
                                <p className="text-emerald-400 text-lg font-bold">₹{(stats.income + stats.recharge).toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <p className="text-indigo-100/60 text-[10px] uppercase font-bold tracking-widest mb-1">Total Outflow</p>
                                <p className="text-emerald-400 text-lg font-bold">₹{stats.withdraw.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subdued Filter Pills */}
                <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
                    {['all', 'recharge', 'withdraw'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${type === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {t}
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
                                            <div key={item._id} className="bg-white p-4 rounded-3xl border border-gray-100/20 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.05)] flex items-center justify-between group active:scale-[0.98] transition-all duration-300 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)]">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${config.bgColor} ${config.color} group-hover:scale-105 transition-transform`}>
                                                        {config.icon}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[15px] text-gray-900 tracking-tight leading-tight mb-1">{config.label}</p>
                                                        <p className="text-[10px] font-medium text-gray-400 flex items-center gap-1.5 uppercase">
                                                            <span>Success</span>
                                                            <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                                            <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-black text-[17px] ${config.color} tracking-tight`}>
                                                        {config.sign}₹{item.amount.toLocaleString('en-IN')}
                                                    </p>
                                                    <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-1">Confirmed</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[40px]">
                                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-2xl mb-4 grayscale opacity-40">📂</div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No activity found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default History;
