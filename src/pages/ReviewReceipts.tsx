
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { receipts } from "../utils/mockData";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, ExternalLink, Check, AlertTriangle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ReviewReceipts = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentReceipt, setCurrentReceipt] = useState<typeof receipts[0] | null>(null);

  // Get user's receipts only
  const userReceipts = receipts.filter(receipt => receipt.userId === user?.id);

  // Apply filters
  const filteredReceipts = userReceipts.filter(receipt => {
    const matchesSearch = receipt.store.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         receipt.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || receipt.status === statusFilter;
    const matchesCategory = categoryFilter === "" || receipt.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set(userReceipts.map(receipt => receipt.category))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Receipts</h1>
        <Link to="/receipts/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Receipt
          </Button>
        </Link>
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
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>{statusFilter || "Filter by status"}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter by category</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredReceipts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReceipts.map((receipt) => (
            <Card key={receipt.id} className="overflow-hidden">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${receipt.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      receipt.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {receipt.status}
                  </span>
                </div>
                <img
                  src={receipt.image}
                  alt={`Receipt from ${receipt.store}`}
                  className="w-full h-40 object-cover"
                />
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle>{receipt.store}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(receipt.date).toLocaleDateString()}
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Category</span>
                    <span className="text-sm">{receipt.category}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total</span>
                    <span className="text-sm">${receipt.total.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Items</span>
                    <span className="text-sm">{receipt.items.length}</span>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => setCurrentReceipt(receipt)}
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogTitle>Receipt Details</DialogTitle>
                      {currentReceipt && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <img
                              src={currentReceipt.image}
                              alt={`Receipt from ${currentReceipt.store}`}
                              className="w-full h-auto rounded-md"
                            />
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-semibold">{currentReceipt.store}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(currentReceipt.date).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="font-medium">Status</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                  ${currentReceipt.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                    currentReceipt.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                    'bg-yellow-100 text-yellow-800'}`}>
                                  {currentReceipt.status}
                                </span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="font-medium">Category</span>
                                <span>{currentReceipt.category}</span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="font-medium">Subcategory</span>
                                <span>{currentReceipt.subcategory}</span>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Items</h4>
                              <div className="border rounded-md divide-y">
                                {currentReceipt.items.map((item, index) => (
                                  <div key={index} className="flex justify-between p-2">
                                    <div>
                                      <span>{item.name}</span>
                                      <span className="text-sm text-muted-foreground ml-2">
                                        x{item.quantity}
                                      </span>
                                    </div>
                                    <span>${item.price.toFixed(2)}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between p-2 font-bold">
                                  <span>Total</span>
                                  <span>${currentReceipt.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-100 p-3 mb-4">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">No receipts found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {userReceipts.length === 0 
              ? "You haven't submitted any receipts yet." 
              : "No receipts match your search criteria."}
          </p>
          {userReceipts.length === 0 && (
            <Link to="/receipts/new" className="mt-4">
              <Button>Submit Your First Receipt</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewReceipts;
