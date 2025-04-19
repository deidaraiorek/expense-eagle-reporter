
import { useState, useEffect } from "react";
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
  RefreshCw,
  FileText
} from "lucide-react";
import { getReceipts, users, generateReceiptCSV, downloadCSV } from "../utils/mockData";
import { useToast } from "@/components/ui/use-toast";
import { formatDate, startOfMonth, endOfMonth, subDays, parseISO } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports = () => {
  const { toast } = useToast();
  // Initialize with date range that includes 2024 receipts
  const [dateRange, setDateRange] = useState<{ from: Date, to: Date }>({
    from: new Date(2024, 0, 1), // January 1, 2024
    to: new Date()
  });
  const [employee, setEmployee] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [groupBy, setGroupBy] = useState<string>("category");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [filteredReceipts, setFilteredReceipts] = useState(getReceipts());
  
  const filterReceipts = () => {
    console.log("Filtering receipts with:", {
      dateRange,
      employee,
      category
    });
    
    const receipts = getReceipts();
    console.log("Total receipts before filtering:", receipts.length);
    
    const filtered = receipts.filter(receipt => {
      // Parse the receipt date correctly
      const receiptDate = new Date(receipt.date);
      
      // Date range check
      const dateInRange = receiptDate >= dateRange.from && receiptDate <= dateRange.to;
      
      // Employee check
      const employeeMatches = employee === "all" || receipt.userId === employee;
      
      // Category check
      const categoryMatches = category === "all" || receipt.category === category;
      
      // Log individual receipt filtering for debugging
      console.log(`Receipt ${receipt.id}:`, { 
        date: receipt.date, 
        receiptDateObj: receiptDate.toISOString(),
        fromDate: dateRange.from.toISOString(),
        toDate: dateRange.to.toISOString(),
        dateInRange,
        userId: receipt.userId, 
        employeeMatches,
        category: receipt.category, 
        categoryMatches
      });
      
      return dateInRange && employeeMatches && categoryMatches;
    });
    
    console.log("Filtered receipts:", filtered.length);
    return filtered;
  };
  
  // Calculate report totals based on filtered receipts
  const totalAmount = filteredReceipts.reduce((sum, receipt) => sum + receipt.total, 0);
  const totalReceipts = filteredReceipts.length;
  const approvedAmount = filteredReceipts
    .filter(r => r.status === "approved")
    .reduce((sum, receipt) => sum + receipt.total, 0);
  const pendingAmount = filteredReceipts
    .filter(r => r.status === "pending")
    .reduce((sum, receipt) => sum + receipt.total, 0);
  
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
    
    return [];
  };
  
  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    const filtered = filterReceipts();
    setFilteredReceipts(filtered);
    
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
      
      toast({
        title: "Report Generated",
        description: `Generated report with ${filtered.length} receipts for the selected period.`,
      });
    }, 800);
  };
  
  const handleExportReport = (format: string) => {
    const currentReceipts = filteredReceipts.length > 0 ? filteredReceipts : filterReceipts();
    
    if (format === 'csv') {
      const csvData = generateReceiptCSV(currentReceipts);
      const fileName = `expense-report-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`;
      downloadCSV(csvData, fileName);
      
      toast({
        title: "CSV Export Successful",
        description: "Your CSV report has been downloaded.",
      });
    } else if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Export Failed",
          description: "Please allow popups to download the PDF report.",
          variant: "destructive"
        });
        return;
      }
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Expense Report - ${formatDate(new Date(), 'yyyy-MM-dd')}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background-color: #f2f2f2; }
              .summary { margin-bottom: 20px; }
              .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
              @media print {
                .no-print { display: none; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>Expense Report</h1>
            <div class="summary">
              <p><strong>Date Range:</strong> ${formatDate(dateRange.from, 'LLL dd, y')} - ${formatDate(dateRange.to, 'LLL dd, y')}</p>
              <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
              <p><strong>Total Receipts:</strong> ${currentReceipts.length}</p>
              <p><strong>Approved Amount:</strong> $${approvedAmount.toFixed(2)}</p>
              <p><strong>Pending Amount:</strong> $${pendingAmount.toFixed(2)}</p>
            </div>
            
            <h2>Expense Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Store</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${currentReceipts.map(receipt => {
                  const employee = users.find(u => u.id === receipt.userId);
                  return `<tr>
                    <td>${new Date(receipt.date).toLocaleDateString()}</td>
                    <td>${employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}</td>
                    <td>${receipt.store}</td>
                    <td>${receipt.category}</td>
                    <td>${receipt.status}</td>
                    <td>$${receipt.total.toFixed(2)}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="no-print" style="text-align: center; margin-top: 20px;">
              <button onclick="window.print();return false;" style="padding: 10px 20px; background: #4F46E5; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Print PDF
              </button>
              <button onclick="window.close();return false;" style="padding: 10px 20px; background: #6B7280; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
                Close
              </button>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      toast({
        title: "PDF Export Ready",
        description: "Your PDF report has been prepared and is ready to print or save.",
      });
    } else if (format === 'excel') {
      toast({
        title: "Excel Export",
        description: "Excel export functionality will be available in a future update.",
      });
    }
  };

  const chartData = generateChartData();
  
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
      case "year2024":
        setDateRange({
          from: new Date(2024, 0, 1), // January 1, 2024
          to: new Date(2024, 11, 31) // December 31, 2024
        });
        break;
      default:
        break;
    }
  };

  // Load initial data when component mounts
  useEffect(() => {
    handleGenerateReport();
  }, []);

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
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportReport("csv")}>
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportReport("excel")}>
                <Download className="h-4 w-4 mr-2" />
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
                          {formatDate(dateRange.from, "LLL dd, y")} -{" "}
                          {formatDate(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        formatDate(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 border-b">
                    <div className="flex flex-wrap gap-2">
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDatePreset("year2024")}
                      >
                        Year 2024
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
