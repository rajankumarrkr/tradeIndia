import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Plan from "./pages/Plan";
import Team from "./pages/Team";
import Mine from "./pages/Mine";
import History from "./pages/History";
import Landing from "./pages/Landing";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import { ToastProvider } from "./components/Toast";

function App() {
  const { user } = useAuth();

  return (
    <ToastProvider>
      <Routes>
        {/* Admin routes - accessible without login */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />

        {/* Public route - Landing page for non-logged in users */}
        {!user && <Route path="*" element={<Landing />} />}

        {/* Protected routes - only for logged in users */}
        {user && (
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/team" element={<Team />} />
            <Route path="/mine" element={<Mine />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </ToastProvider>
  );
}

export default App;
