import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ExpenseChatbot } from "./components/ExpenseChatbot";

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
import Index from "./pages/Index";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/receipts" element={
        <ProtectedRoute>
          <ReviewReceipts />
        </ProtectedRoute>
      } />
      
      <Route path="/receipts/new" element={
        <ProtectedRoute>
          <ReceiptForm />
        </ProtectedRoute>
      } />
      
      <Route path="/approve-receipts" element={
        <ProtectedRoute>
          <ApproveReceipts />
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      } />
      
      <Route path="/department-members" element={
        <ProtectedRoute>
          <DepartmentMembers />
        </ProtectedRoute>
      } />
      
      <Route path="/user-management" element={
        <ProtectedRoute>
          <UserManagement />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

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
                <AppRoutes />
              </main>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
