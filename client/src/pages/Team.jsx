import { useState, useEffect } from "react";
import { apiGet } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

function Team() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [teamData, setTeamData] = useState({ teamSize: 0, teamIncome: 0 });
  const referralCode = user?.referralCode || "XXXX1234";
  const referralLink = `https://tradeindia.com/register?ref=${referralCode}`;

  useEffect(() => {
    const loadTeamData = async () => {
      if (!user) return;
      try {
        const data = await apiGet(`/team/${user.id}`);
        setTeamData(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadTeamData();
  }, [user]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      showToast("Successfully Copied!");
    } catch {
      showToast("Unable to copy link", "error");
    }
  };

  return (
    <div className="p-4 pb-20 max-w-md mx-auto bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Team</h1>
        <p className="text-sm text-gray-600">
          Share your referral link and earn 10% commission on team recharges.
        </p>
      </div>

      {/* Referral Card */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 mb-6 text-white">
        <h2 className="text-lg font-bold mb-3">Referral Code</h2>
        <p className="text-2xl font-mono font-bold mb-4 bg-white/20 p-3 rounded-lg">
          {referralCode}
        </p>

        <h3 className="text-sm font-semibold mb-2">Referral Link</h3>
        <div className="bg-white/10 rounded-lg p-3 mb-4">
          <p className="text-xs break-all">{referralLink}</p>
        </div>

        <button
          onClick={handleCopy}
          className="w-full bg-white text-purple-600 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-50 transition-colors"
        >
          📋 Copy Link
        </button>
      </div>

      {/* Team Stats */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Team Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Team Size</p>
            <p className="text-2xl font-bold text-blue-600">{teamData.teamSize}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Team Income</p>
            <p className="text-2xl font-bold text-green-600">₹{teamData.teamIncome.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            💡 When your referred users recharge, you earn 10% of their recharge amount as team income.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Team;
