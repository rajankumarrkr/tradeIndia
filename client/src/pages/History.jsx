import { useEffect, useState } from "react";
import { apiGet } from "../api";
import { useAuth } from "../context/AuthContext";

function History() {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState("all"); // all, recharge, withdraw

    useEffect(() => {
        if (user) fetchHistory();
    }, [user]);

    const fetchHistory = async () => {
        try {
            const res = await apiGet(`/transactions/${user.id}`);
            setData(res || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = data.filter(item => type === 'all' ? true : item.type === type);

    return (
        <div className="p-4 pb-20 font-['Poppins']">
            <h1 className="text-xl font-bold mb-4">Transaction History</h1>

            <div className="flex gap-2 mb-4">
                <button onClick={() => setType("all")} className={`px-4 py-1 rounded-full text-sm font-medium ${type === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>All</button>
                <button onClick={() => setType("recharge")} className={`px-4 py-1 rounded-full text-sm font-medium ${type === 'recharge' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Recharge</button>
                <button onClick={() => setType("withdraw")} className={`px-4 py-1 rounded-full text-sm font-medium ${type === 'withdraw' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Withdraw</button>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(item => (
                        <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${item.type === 'recharge' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {item.type === 'recharge' ? '⬇️' : '⬆️'}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 capitalize">{item.type}</p>
                                    <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${item.type === 'recharge' ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.type === 'recharge' ? '+' : '-'}₹{item.amount}
                                </p>
                                <span className={`text-[10px] px-2 py-0.5 rounded ${item.status === 'success' ? 'bg-green-100 text-green-700' :
                                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <p className="text-center text-gray-500 mt-8">No records found</p>}
                </div>
            )}
        </div>
    );
}

export default History;
