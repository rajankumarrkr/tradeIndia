import { useEffect } from "react";

function LogoutModal({ onClose, onConfirm }) {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden transform transition-all scale-100">
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                        🚪
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Logout?</h2>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                        Are you sure you want to sign out? You will need to login again to access your account.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onConfirm}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-red-200 active:scale-95"
                        >
                            Log Out
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3.5 rounded-2xl transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LogoutModal;
