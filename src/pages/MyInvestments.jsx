import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

function MyInvestments() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadInvestments = async () => {
        if (!user) return;
        try {
            const data = await apiGet(`/plans/user/${user.id}`);
            setInvestments(data);
        } catch (err) {
            console.error(err);
            showToast("Failed to load investments", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvestments();
    }, [user]);

    return (
        <div className="p-4 pb-20 max-w-md mx-auto bg-gray-50 min-h-screen">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">My Investments</h1>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading your investments...</p>
                </div>
            ) : investments.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="text-5xl mb-4">💰</div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">No Investments Yet</h2>
                    <p className="text-gray-500 text-sm mb-6">You haven't purchased any investment plans. Start earning daily income today!</p>
                    <button
                        onClick={() => navigate("/plan")}
                        className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition-colors"
                    >
                        Explore Plans
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {investments.map((inv) => (
                        <div key={inv._id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                            <div className={`p-4 ${inv.isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-400'} text-white`}>
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-lg">{inv.plan?.name || "Investment Plan"}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-white/20 backdrop-blur-md`}>
                                        {inv.isActive ? 'ACTIVE' : 'EXPIRED'}
                                    </span>
                                </div>
                                <p className="text-[10px] opacity-80 font-bold uppercase mt-1">
                                    Started: {new Date(inv.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="p-4">
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Invested</p>
                                        <p className="text-base font-extrabold text-gray-900">₹{inv.investAmount.toLocaleString("en-IN")}</p>
                                    </div>
                                    <div className="text-center border-x border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Daily</p>
                                        <p className="text-base font-extrabold text-blue-600">₹{inv.dailyIncome.toLocaleString("en-IN")}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Days</p>
                                        <p className="text-base font-extrabold text-gray-900">{inv.daysCompleted}/{inv.durationDays}</p>
                                    </div>
                                </div>

                                {inv.isActive && (
                                    <div>
                                        <div className="flex justify-between items-end mb-1 text-[10px] font-bold">
                                            <span className="text-gray-400">PROGRESS</span>
                                            <span className="text-blue-600">{Math.round((inv.daysCompleted / inv.durationDays) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${Math.min(100, (inv.daysCompleted / inv.durationDays) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyInvestments;
