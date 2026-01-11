import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiPost } from "../api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";

function Landing() {
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        mobile: "",
        password: "",
        confirmPassword: "",
        name: "",
        referralCode: ""
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = isLogin ? "/auth/login" : "/auth/register";
            const payload = isLogin
                ? { mobile: formData.mobile, password: formData.password }
                : formData;

            const res = await apiPost(endpoint, payload);

            if (res.user) {
                // authController returns user object but not token currently.
                // We will rely on user object for session.
                login(res.user);
                showToast(isLogin ? "Login successful!" : "Registered successfully!");
                navigate("/");
            }
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center p-6 text-white font-['Poppins']">

            {/* Hero Content */}
            <div className="text-center mb-10 max-w-lg">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                    TradeIndia
                </h1>
                <p className="text-lg md:text-xl text-blue-100 mb-6 font-light">
                    Invest money and grow your amount with smart daily returns.
                </p>
                <div className="flex gap-4 justify-center">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">100%</p>
                        <p className="text-xs text-gray-400">Secure</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-400">24/7</p>
                        <p className="text-xs text-gray-400">Support</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-400">Daily</p>
                        <p className="text-xs text-gray-400">Income</p>
                    </div>
                </div>
            </div>

            {/* Auth Card */}
            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="flex gap-4 mb-6 p-1 bg-black/20 rounded-xl">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-blue-600 shadow-lg text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-blue-600 shadow-lg text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <input
                            type="tel"
                            placeholder="Mobile Number"
                            value={formData.mobile}
                            onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>
                    {!isLogin && (
                        <div>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                                required
                            />
                        </div>
                    )}
                    {!isLogin && (
                        <div>
                            <input
                                type="text"
                                placeholder="Referral Code (Optional)"
                                value={formData.referralCode}
                                onChange={e => setFormData({ ...formData, referralCode: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-600/30 transition-all transform hover:scale-[1.02] disabled:opacity-50 mt-4"
                    >
                        {loading ? "Please wait..." : (isLogin ? "Access Account" : "Create Account")}
                    </button>
                </form>
            </div>

        </div>
    );
}

export default Landing;
