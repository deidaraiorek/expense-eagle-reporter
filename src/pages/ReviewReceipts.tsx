
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getReceipts } from "../utils/mockData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Filter, Download, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const ReviewReceipts = () => {
  const { user } = useAuth();
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [receipts, setReceipts] = useState<any[]>([]);
  
  // Fetch receipts when component mounts or when a receipt might have been updated
  useEffect(() => {
    // Get all receipts from mock data
    const allReceipts = getReceipts();
    setReceipts(allReceipts);
  }, []);
  
  // Get user's receipts
  const userReceipts = receipts.filter(receipt => 
    receipt.userId === user?.id
  );
  
  // Filter by status and search term
  const filteredReceipts = userReceipts.filter(receipt => {
    // Status filter
    const statusMatch = statusFilter === "all" || receipt.status === statusFilter;
    
    // Search term filter
    const searchMatch = 
      receipt.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  const handleViewReceipt = (receipt: any) => {
    setSelectedReceipt(receipt);
    setShowReceiptDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Receipts</h1>
        <Button asChild>
          <Link to="/receipts/new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Receipt
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search receipts..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter by status</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Receipts</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceipts.length > 0 ? (
                filteredReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>{new Date(receipt.date).toLocaleDateString()}</TableCell>
                    <TableCell>{receipt.store}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{receipt.category}</span>
                        <span className="text-xs text-muted-foreground">{receipt.subcategory}</span>
                      </div>
                    </TableCell>
                    <TableCell>${receipt.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        receipt.status === "approved" ? "default" : 
                        receipt.status === "rejected" ? "destructive" : 
                        "outline"
                      }>
                        {receipt.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleViewReceipt(receipt)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <p className="text-lg font-medium mb-2">No receipts found</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchTerm || statusFilter !== "all" 
                          ? "Try adjusting your filters" 
                          : "You haven't submitted any receipts yet"}
                      </p>
                      {!searchTerm && statusFilter === "all" && (
                        <Button variant="outline" asChild>
                          <Link to="/receipts/new">Submit New Receipt</Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {/* Receipt Detail Dialog */}
      {selectedReceipt && (
        <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Receipt Details</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedReceipt.image}
                  alt="Receipt"
                  className="w-full h-auto rounded-md border"
                />
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center justify-between">
                    {selectedReceipt.store}
                    <Badge variant={
                      selectedReceipt.status === "approved" ? "default" : 
                      selectedReceipt.status === "rejected" ? "destructive" : 
                      "outline"
                    }>
                      {selectedReceipt.status}
                    </Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedReceipt.date).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2">
                  <div>
                    <span className="text-sm font-medium">Category:</span>
                  </div>
                  <div>
                    <span className="text-sm">{selectedReceipt.category} / {selectedReceipt.subcategory}</span>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Total:</span>
                  </div>
                  <div>
                    <span className="text-sm">${selectedReceipt.total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Items</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedReceipt.items.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {selectedReceipt.notes && (
                  <div>
                    <h4 className="text-sm font-medium">Notes:</h4>
                    <p className="text-sm text-muted-foreground">{selectedReceipt.notes}</p>
                  </div>
                )}
                
                {selectedReceipt.status === "rejected" && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-red-800">Rejection Reason:</h4>
                    <p className="text-sm text-red-800">{selectedReceipt.notes || "No reason provided"}</p>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Receipt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ReviewReceipts;
