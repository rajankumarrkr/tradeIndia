import { Link, useLocation } from "react-router-dom";

function MainLayout({ children }) {
  const location = useLocation();
  const current = location.pathname;

  const navItems = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/plan", label: "Invest", icon: "📈" },
    { path: "/team", label: "Team", icon: "👥" },
    { path: "/mine", label: "Profile", icon: "👤" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-24">
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto bg-white min-h-screen shadow-2xl overflow-hidden relative">
        {children}
      </main>

      {/* Full Width Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center py-2 px-2">
          {navItems.map((item) => {
            const active = current === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center p-2 group w-full"
              >
                <div className={`transition-all duration-300 ${active ? '-translate-y-1' : ''}`}>
                  <span className={`text-2xl mb-1 filter transition-colors duration-300 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {item.icon}
                  </span>
                </div>

                <span className={`text-[10px] font-medium tracking-wide transition-colors duration-300 ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                  {item.label}
                </span>

                {active && (
                  <span className="absolute bottom-0 w-1/2 h-1 bg-blue-600 rounded-t-full"></span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default MainLayout;
