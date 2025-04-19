import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Clock, AlertTriangle, FileCheck, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getReceipts } from "../utils/mockData";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === "employee";
  const isSupervisor = user?.role === "supervisor";

  // Filter receipts based on the current user
  const userReceipts = getReceipts().filter(receipt => 
    isEmployee ? receipt.userId === user?.id : true
  );
  
  const pendingReceipts = userReceipts.filter(receipt => receipt.status === "pending");
  const approvedReceipts = userReceipts.filter(receipt => receipt.status === "approved");
  const rejectedReceipts = userReceipts.filter(receipt => receipt.status === "rejected");
  const flaggedReceipts = userReceipts.filter(receipt => receipt.flagged);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userReceipts.length}</div>
            <p className="text-xs text-muted-foreground">
              {isEmployee ? "Your submitted receipts" : "Department receipts"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReceipts.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedReceipts.length}</div>
            <p className="text-xs text-muted-foreground">
              Receipts approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedReceipts.length}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {isEmployee && (
                <>
                  <Link to="/receipts/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full bg-indigo-600">
                    Submit New Receipt
                  </Link>
                  <Link to="/receipts" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
                    View My Receipts
                  </Link>
                </>
              )}
              {isSupervisor && (
                <>
                  <Link to="/approve-receipts" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full bg-indigo-600">
                    Approve Receipts
                  </Link>
                  <Link to="/reports" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
                    Generate Reports
                  </Link>
                  <Link to="/department-members" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
                    View Department Members
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userReceipts.slice(0, 3).map((receipt) => (
                <div key={receipt.id} className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-indigo-600" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{receipt.store}</p>
                    <p className="text-sm text-muted-foreground">
                      ${receipt.total.toFixed(2)} - {receipt.date}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${receipt.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      receipt.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {receipt.status}
                  </div>
                </div>
              ))}
              {userReceipts.length === 0 && (
                <p className="text-sm text-muted-foreground">No receipts found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
