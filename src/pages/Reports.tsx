
import { useState } from "react";
import { receipts } from "../utils/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { Download, Calendar as CalendarIcon, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Helper to format date range for display
const formatDateRange = (from: Date | undefined, to: Date | undefined) => {
  if (!from) return "All time";
  if (!to) return `Since ${format(from, "MMM d, yyyy")}`;
  return `${format(from, "MMM d, yyyy")} - ${format(to, "MMM d, yyyy")}`;
};

const Reports = () => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("expense");
  const [timeframe, setTimeframe] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Calculate date range based on timeframe selection
  const getFilteredReceipts = () => {
    let filtered = [...receipts];
    
    // Apply date filter
    if (timeframe === "custom" && dateRange.from) {
      const fromDate = new Date(dateRange.from);
      const toDate = dateRange.to ? new Date(dateRange.to) : new Date();
      
      filtered = filtered.filter(receipt => {
        const receiptDate = new Date(receipt.date);
        return receiptDate >= fromDate && receiptDate <= toDate;
      });
    } else if (timeframe === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      filtered = filtered.filter(receipt => {
        return new Date(receipt.date) >= oneMonthAgo;
      });
    } else if (timeframe === "quarter") {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      filtered = filtered.filter(receipt => {
        return new Date(receipt.date) >= threeMonthsAgo;
      });
    } else if (timeframe === "year") {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      filtered = filtered.filter(receipt => {
        return new Date(receipt.date) >= oneYearAgo;
      });
    }
    
    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(receipt => receipt.category === categoryFilter);
    }
    
    return filtered;
  };
  
  const filteredReceipts = getFilteredReceipts();

  // Prepare data for charts
  const generateChartData = () => {
    if (reportType === "expense") {
      // Group expenses by category
      const categoryMap = new Map();
      
      filteredReceipts.forEach(receipt => {
        const category = receipt.category;
        const currentTotal = categoryMap.get(category) || 0;
        categoryMap.set(category, currentTotal + receipt.total);
      });
      
      return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
    } else if (reportType === "time") {
      // Group expenses by month
      const monthMap = new Map();
      
      filteredReceipts.forEach(receipt => {
        const date = new Date(receipt.date);
        const monthYear = format(date, "MMM yyyy");
        const currentTotal = monthMap.get(monthYear) || 0;
        monthMap.set(monthYear, currentTotal + receipt.total);
      });
      
      return Array.from(monthMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => {
          const dateA = new Date(a.name);
          const dateB = new Date(b.name);
          return dateA.getTime() - dateB.getTime();
        });
    }
    
    return [];
  };
  
  const chartData = generateChartData();

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Calculate total expenses
  const totalExpenses = filteredReceipts.reduce((sum, receipt) => sum + receipt.total, 0);
  
  // Calculate approved and pending amounts
  const approvedExpenses = filteredReceipts
    .filter(receipt => receipt.status === "approved")
    .reduce((sum, receipt) => sum + receipt.total, 0);
  
  const pendingExpenses = filteredReceipts
    .filter(receipt => receipt.status === "pending")
    .reduce((sum, receipt) => sum + receipt.total, 0);

  const handleDownloadReport = () => {
    // This would generate and download a report in a real application
    toast({
      title: "Report Downloaded",
      description: "Your expense report has been downloaded.",
    });
  };

  const uniqueCategories = [...new Set(receipts.map(receipt => receipt.category))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        
        <Button 
          variant="outline" 
          onClick={handleDownloadReport}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDateRange(dateRange.from, dateRange.to)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${approvedExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((approvedExpenses / totalExpenses) * 100 || 0).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((pendingExpenses / totalExpenses) * 100 || 0).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Report Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expenses by Category</SelectItem>
                  <SelectItem value="time">Expenses over Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {timeframe === "custom" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={setDateRange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {reportType === "expense" ? "Expenses by Category" : "Expenses over Time"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {reportType === "expense" ? (
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                      />
                      <Legend />
                    </PieChart>
                  ) : (
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                      />
                      <Legend />
                      <Bar dataKey="value" name="Expenses" fill="#4f46e5" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12">
                <div className="rounded-full bg-gray-100 p-3 mb-4">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium">No data available</h3>
                <p className="text-sm text-gray-500 mt-1">
                  There are no receipts matching your filter criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReceipts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Store/Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>{new Date(receipt.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {receipt.userId === "2" ? "Jane Smith" : 
                       receipt.userId === "3" ? "Mike Johnson" : "Unknown"}
                    </TableCell>
                    <TableCell>{receipt.store}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{receipt.category}</span>
                        <span className="text-xs text-muted-foreground">{receipt.subcategory}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${receipt.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          receipt.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {receipt.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">${receipt.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell colSpan={5}>Total</TableCell>
                  <TableCell className="text-right">${totalExpenses.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">No receipts found for the selected criteria.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
