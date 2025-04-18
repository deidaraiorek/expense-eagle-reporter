
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ReviewReceipts from "./pages/ReviewReceipts";
import ReceiptForm from "./pages/ReceiptForm";
import ApproveReceipts from "./pages/ApproveReceipts";
import Reports from "./pages/Reports";
import DepartmentMembers from "./pages/DepartmentMembers";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/receipts" element={<ReviewReceipts />} />
                  <Route path="/receipts/new" element={<ReceiptForm />} />
                  <Route path="/approve-receipts" element={<ApproveReceipts />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/department-members" element={<DepartmentMembers />} />
                  <Route path="/user-management" element={<UserManagement />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
