
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle } from "lucide-react";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const supervisorLinks = [
    { to: "/approve-receipts", label: "Approve Receipts" },
    { to: "/reports", label: "Reports" },
    { to: "/department-members", label: "Department Members" },
    { to: "/user-management", label: "User Management" },
  ];

  const employeeLinks = [
    { to: "/receipts", label: "My Receipts" },
    { to: "/receipts/new", label: "New Receipt" },
  ];

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              EERIS
            </Link>
            {isAuthenticated && (
              <div className="hidden md:flex space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-indigo-600"
                >
                  Dashboard
                </Link>
                {user?.role === "supervisor"
                  ? supervisorLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="text-gray-600 hover:text-indigo-600"
                      >
                        {link.label}
                      </Link>
                    ))
                  : employeeLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="text-gray-600 hover:text-indigo-600"
                      >
                        {link.label}
                      </Link>
                    ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <UserCircle className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="px-2 py-1.5 text-xs text-gray-500">
                    {user?.email}
                  </div>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => logout()}
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-indigo-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-gray-600 hover:text-indigo-600"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
