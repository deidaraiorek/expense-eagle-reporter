
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, User, ChartBar, Building } from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Link to="/dashboard" />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Expense Manager
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-8">
            Simplify your expense tracking and approval process. Track receipts, manage approvals, and generate reports all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              <Link to="/register">Create Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader className="pb-2 pt-6">
              <div className="mx-auto rounded-full p-3 w-14 h-14 flex items-center justify-center bg-indigo-100">
                <Receipt className="h-7 w-7 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-2">Track Expenses</CardTitle>
              <p className="text-gray-600">
                Easily submit and track all of your business expenses in one place.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2 pt-6">
              <div className="mx-auto rounded-full p-3 w-14 h-14 flex items-center justify-center bg-indigo-100">
                <User className="h-7 w-7 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-2">Approval Process</CardTitle>
              <p className="text-gray-600">
                Streamlined approval workflow for managers and supervisors.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2 pt-6">
              <div className="mx-auto rounded-full p-3 w-14 h-14 flex items-center justify-center bg-indigo-100">
                <ChartBar className="h-7 w-7 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-2">Detailed Reports</CardTitle>
              <p className="text-gray-600">
                Generate comprehensive expense reports for better financial insights.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2 pt-6">
              <div className="mx-auto rounded-full p-3 w-14 h-14 flex items-center justify-center bg-indigo-100">
                <Building className="h-7 w-7 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-2">Department Management</CardTitle>
              <p className="text-gray-600">
                Organize and manage expenses by department or team structure.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-indigo-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to simplify your expense management?</h2>
          <p className="text-lg text-gray-600 mb-6">
            Join thousands of companies that use Expense Manager to streamline their expense processes.
          </p>
          <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700">
            <Link to="/register">Get Started Today</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
