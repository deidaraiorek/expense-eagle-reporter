
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  BarChart as BarChartIcon, 
  Download, 
  Filter, 
  CalendarIcon, 
  MoreHorizontal,
  RefreshCw
} from "lucide-react";
import { getReceipts, users, generateReceiptCSV, downloadCSV } from "../utils/mockData";
import { useToast } from "@/components/ui/use-toast";
import { format, startOfMonth, endOfMonth, subDays } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports = () => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{ from: Date, to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [employee, setEmployee] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [groupBy, setGroupBy] = useState<string>("category");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [filteredReceipts, setFilteredReceipts] = useState(getReceipts());
  
  // Filter receipts based on the selected criteria
  const filterReceipts = () => {
    const receipts = getReceipts();
    return receipts.filter(receipt => {
      const receiptDate = new Date(receipt.date);
      const dateInRange = receiptDate >= dateRange.from && receiptDate <= dateRange.to;
      const employeeMatches = employee === "all" || receipt.userId === employee;
      const categoryMatches = category === "all" || receipt.category === category;
      
      return dateInRange && employeeMatches && categoryMatches;
    });
  };
  
  // Calculate totals
  const totalAmount = filteredReceipts.reduce((sum, receipt) => sum + receipt.total, 0);
  const totalReceipts = filteredReceipts.length;
  const approvedAmount = filteredReceipts
    .filter(r => r.status === "approved")
    .reduce((sum, receipt) => sum + receipt.total, 0);
  const pendingAmount = filteredReceipts
    .filter(r => r.status === "pending")
    .reduce((sum, receipt) => sum + receipt.total, 0);
  
  // Generate chart data based on groupBy selection
  const generateChartData = () => {
    if (groupBy === "category") {
      const categoryData: Record<string, number> = {};
      
      filteredReceipts.forEach(receipt => {
        if (!categoryData[receipt.category]) {
          categoryData[receipt.category] = 0;
        }
        categoryData[receipt.category] += receipt.total;
      });
      
      return Object.entries(categoryData).map(([name, value]) => ({ 
        name, 
        value: parseFloat(value.toFixed(2)) 
      }));
    }
    
    if (groupBy === "employee") {
      const employeeData: Record<string, number> = {};
      
      filteredReceipts.forEach(receipt => {
        const employeeName = users.find(u => u.id === receipt.userId)?.firstName || receipt.userId;
        if (!employeeData[employeeName]) {
          employeeData[employeeName] = 0;
        }
        employeeData[employeeName] += receipt.total;
      });
      
      return Object.entries(employeeData).map(([name, value]) => ({ 
        name, 
        value: parseFloat(value.toFixed(2)) 
      }));
    }
    
    // Default to category
    return [];
  };
  
  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    // Get the latest data and apply filters
    const filtered = filterReceipts();
    setFilteredReceipts(filtered);
    
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
      
      toast({
        title: "Report Generated",
        description: "Your expense report has been generated successfully.",
      });
    }, 1000);
  };
  
  const handleExportReport = (format: string) => {
    if (format === 'csv') {
      const csvData = generateReceiptCSV(filteredReceipts);
      downloadCSV(csvData, `expense-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    } else {
      toast({
        title: `Exporting as ${format.toUpperCase()}`,
        description: "Your report will be downloaded shortly.",
      });
    }
  };

  const chartData = generateChartData();
  
  // Handle preset date ranges
  const handleDatePreset = (preset: string) => {
    const today = new Date();
    
    switch (preset) {
      case "thisMonth":
        setDateRange({
          from: startOfMonth(today),
          to: endOfMonth(today)
        });
        break;
      case "last30":
        setDateRange({
          from: subDays(today, 30),
          to: today
        });
        break;
      case "last90":
        setDateRange({
          from: subDays(today, 90),
          to: today
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Expense Reports</h1>
        
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportReport("pdf")}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportReport("csv")}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportReport("excel")}>
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {filteredReceipts.length} receipts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${approvedAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Approved expenses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalReceipts > 0 ? (totalAmount / totalReceipts).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Per receipt
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                      <span>Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 border-b">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDatePreset("thisMonth")}
                      >
                        This Month
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDatePreset("last30")}
                      >
                        Last 30 Days
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDatePreset("last90")}
                      >
                        Last 90 Days
                      </Button>
                    </div>
                  </div>
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee</label>
              <Select value={employee} onValueChange={setEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Array.from(new Set(getReceipts().map(r => r.category))).map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Group By</label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Group By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleGenerateReport} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> 
                  Generating...
                </>
              ) : (
                <>
                  <Filter className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {reportGenerated && (
        <Tabs defaultValue="chart">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown by {groupBy === "category" ? "Category" : "Employee"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 70,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                      />
                      <Bar dataKey="value" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Expense Report</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReceipts.map((receipt) => {
                      const employee = users.find(u => u.id === receipt.userId);
                      return (
                        <TableRow key={receipt.id}>
                          <TableCell>{new Date(receipt.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}
                          </TableCell>
                          <TableCell>{receipt.store}</TableCell>
                          <TableCell>{receipt.category}</TableCell>
                          <TableCell>
                            <div className="capitalize">{receipt.status}</div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${receipt.total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredReceipts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No receipts found with the selected filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Reports;
