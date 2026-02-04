import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Calendar, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { user, login, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-900"
          >
            <Calendar className="w-6 h-6 text-blue-600" />
            Sydney Events
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-3">
                  {user.picture && (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700">{user.name}</span>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={login}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <User className="w-4 h-4" />
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
