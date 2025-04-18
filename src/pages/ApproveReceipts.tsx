
import { useState } from "react";
import { receipts as mockReceipts } from "../utils/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, AlertTriangle, Flag, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ApproveReceipts = () => {
  const { toast } = useToast();
  const [receipts, setReceipts] = useState(mockReceipts);
  const [selectedReceipt, setSelectedReceipt] = useState<typeof mockReceipts[0] | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  
  // Only show receipts that need supervisor approval
  const pendingReceipts = receipts.filter(r => r.status === "pending");
  const approvedReceipts = receipts.filter(r => r.status === "approved");
  const rejectedReceipts = receipts.filter(r => r.status === "rejected");
  
  // Filter receipts based on status
  const filteredReceipts = statusFilter === "all" 
    ? receipts 
    : receipts.filter(r => r.status === statusFilter);

  const handleViewReceipt = (receipt: typeof mockReceipts[0]) => {
    setSelectedReceipt(receipt);
    setShowReceiptDialog(true);
    setFeedback("");
  };

  const handleApprove = () => {
    if (!selectedReceipt) return;
    
    // Update receipt status (this would be an API call in a real app)
    const updatedReceipts = receipts.map(receipt => 
      receipt.id === selectedReceipt.id 
        ? { ...receipt, status: "approved" } 
        : receipt
    );
    
    setReceipts(updatedReceipts);
    setShowReceiptDialog(false);
    
    toast({
      title: "Receipt Approved",
      description: `Receipt from ${selectedReceipt.store} has been approved.`,
    });
  };

  const handleReject = () => {
    if (!selectedReceipt || !feedback.trim()) {
      toast({
        variant: "destructive",
        title: "Feedback Required",
        description: "Please provide feedback explaining why the receipt was rejected.",
      });
      return;
    }
    
    // Update receipt status (this would be an API call in a real app)
    const updatedReceipts = receipts.map(receipt => 
      receipt.id === selectedReceipt.id 
        ? { ...receipt, status: "rejected", notes: feedback } 
        : receipt
    );
    
    setReceipts(updatedReceipts);
    setShowReceiptDialog(false);
    
    toast({
      title: "Receipt Rejected",
      description: `Receipt from ${selectedReceipt.store} has been rejected.`,
    });
  };

  const handleFlag = () => {
    if (!selectedReceipt) return;
    
    // Toggle flag status
    const updatedReceipts = receipts.map(receipt => 
      receipt.id === selectedReceipt.id 
        ? { ...receipt, flagged: !receipt.flagged } 
        : receipt
    );
    
    setReceipts(updatedReceipts);
    setSelectedReceipt(prev => prev ? { ...prev, flagged: !prev.flagged } : null);
    
    toast({
      title: updatedReceipts.find(r => r.id === selectedReceipt.id)?.flagged 
        ? "Receipt Flagged" 
        : "Flag Removed",
      description: `Receipt from ${selectedReceipt.store} has been ${
        updatedReceipts.find(r => r.id === selectedReceipt.id)?.flagged 
          ? "flagged for further review" 
          : "unflagged"
      }.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Approve Receipts</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Receipts</SelectItem>
                <SelectItem value="pending">Pending ({pendingReceipts.length})</SelectItem>
                <SelectItem value="approved">Approved ({approvedReceipts.length})</SelectItem>
                <SelectItem value="rejected">Rejected ({rejectedReceipts.length})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {filteredReceipts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell>${receipt.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          receipt.status === "approved" ? "success" : 
                          receipt.status === "rejected" ? "destructive" : 
                          "outline"
                        }>
                          {receipt.status}
                        </Badge>
                        {receipt.flagged && (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
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
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <Check className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">No receipts found</h3>
              <p className="text-sm text-gray-500 mt-1">
                {statusFilter === "pending" 
                  ? "There are no pending receipts to review." 
                  : `No receipts with ${statusFilter} status.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Receipt Detail Dialog */}
      {selectedReceipt && (
        <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Review Receipt</DialogTitle>
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
                      selectedReceipt.status === "approved" ? "success" : 
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
                    <span className="text-sm font-medium">Employee:</span>
                  </div>
                  <div>
                    <span className="text-sm">
                      {selectedReceipt.userId === "2" ? "Jane Smith" : 
                       selectedReceipt.userId === "3" ? "Mike Johnson" : "Unknown"}
                    </span>
                  </div>
                  
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
                      {selectedReceipt.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {selectedReceipt.status === "pending" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Feedback/Comments</label>
                    <Textarea
                      placeholder="Add comments about this receipt"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              {selectedReceipt.status === "pending" ? (
                <div className="flex w-full justify-between">
                  <Button
                    variant="outline"
                    onClick={handleFlag}
                    className={`flex items-center gap-2 ${selectedReceipt.flagged ? 'text-amber-600' : ''}`}
                  >
                    <Flag className="h-4 w-4" />
                    {selectedReceipt.flagged ? 'Remove Flag' : 'Flag Receipt'}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={handleReject} className="flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button variant="default" onClick={handleApprove} className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex w-full justify-end">
                  <Button variant="outline" onClick={() => setShowReceiptDialog(false)}>
                    Close
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ApproveReceipts;
