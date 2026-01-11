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

  if (!user) {
    return (
      <ToastProvider>
        <Landing />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/team" element={<Team />} />
          <Route path="/mine" element={<Mine />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </ToastProvider>
  );
}

export default App;
