import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, Upload, Plus, Minus, Info, ScanText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { categories, addReceipt } from "../utils/mockData";
import { useAuth } from "../context/AuthContext";
import { useReceiptOCR } from "../hooks/useReceiptOCR";
import { Progress } from "@/components/ui/progress";

interface ItemForm {
  name: string;
  price: string;
  quantity: number;
}

const ReceiptForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { scanReceiptImage, isScanning, progress } = useReceiptOCR();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    store: "",
    category: "",
    subcategory: "",
    items: [{ name: "", price: "", quantity: 1 }] as ItemForm[],
    notes: "",
  });

  const availableSubcategories = formData.category ? categories[formData.category] || [] : [];

  const total = formData.items.reduce((sum, item) => {
    return sum + (parseFloat(item.price) || 0) * (item.quantity || 0);
  }, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      if (name === "category") {
        return { ...prev, [name]: value, subcategory: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: "", price: "", quantity: 1 }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) return;
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const extractedData = await scanReceiptImage(file);
      console.log("Extracted Data:", extractedData);
      setFormData(prev => ({
        ...prev,
        store: extractedData?.store || prev.store,
        date: extractedData?.date || prev.date,
        items: extractedData?.items.map(item => item.name ? { name: item.name, price: item.price, quantity: Number(item.quantity) } : null) || prev.items,
      }));
    } catch (error) {
      console.error('Failed to scan receipt:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.store || !formData.category || !formData.subcategory || !imagePreview) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields and upload a receipt image."
      });
      setIsSubmitting(false);
      return;
    }

    const invalidItems = formData.items.some(item => !item.name || !item.price);
    if (invalidItems) {
      toast({
        variant: "destructive",
        title: "Invalid items",
        description: "Please ensure all items have a name and price."
      });
      setIsSubmitting(false);
      return;
    }

    const formattedItems = formData.items.map(item => ({
      name: item.name,
      price: parseFloat(item.price),
      quantity: item.quantity
    }));

    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      const receiptData = {
        userId: user.id,
        date: formData.date,
        store: formData.store,
        total: parseFloat(total.toFixed(2)),
        category: formData.category,
        subcategory: formData.subcategory,
        items: formattedItems,
        notes: formData.notes,
        image: imagePreview || 'https://placehold.co/600x400'
      };
      
      const newReceipt = addReceipt(receiptData);
      console.log('Receipt added successfully:', newReceipt);
      
      toast({
        title: "Receipt submitted",
        description: "Your receipt has been successfully submitted for approval.",
      });
      
      setIsSubmitting(false);
      navigate("/receipts");
    } catch (error) {
      console.error('Error adding receipt:', error);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "There was an error submitting your receipt. Please try again."
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Submit Receipt</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Receipt Details</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="store">Store/Vendor</Label>
                    <Input
                      id="store"
                      name="store"
                      placeholder="Enter store name"
                      value={formData.store}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(categories).map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Select
                      value={formData.subcategory}
                      onValueChange={(value) => handleSelectChange("subcategory", value)}
                      disabled={!formData.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubcategories.map(subcategory => (
                          <SelectItem key={subcategory} value={subcategory}>
                            {subcategory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Add any additional information about this expense"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Items</h2>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline" 
                  onClick={addItem}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add Item
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="flex-grow space-y-2">
                      <Label htmlFor={`item-name-${index}`}>Item Name</Label>
                      <Input
                        id={`item-name-${index}`}
                        placeholder="Item description"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, "name", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="w-24 space-y-2">
                      <Label htmlFor={`item-price-${index}`}>Price</Label>
                      <Input
                        id={`item-price-${index}`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, "price", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="w-20 space-y-2">
                      <Label htmlFor={`item-qty-${index}`}>Qty</Label>
                      <Input
                        id={`item-qty-${index}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length === 1}
                      className="mb-0.5"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex justify-between pt-4 border-t font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Receipt Image</h2>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                  {imagePreview ? (
                    <div className="space-y-4 w-full">
                      <img 
                        src={imagePreview} 
                        alt="Receipt preview" 
                        className="max-h-60 mx-auto object-contain"
                      />
                      <div className="space-y-2">
                        {isScanning && (
                          <>
                            <div className="text-sm text-center text-gray-500">
                              Scanning receipt...
                            </div>
                            <Progress value={progress} className="w-full" />
                          </>
                        )}
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full flex items-center justify-center gap-2"
                          onClick={() => document.getElementById('receipt-image')?.click()}
                        >
                          <ScanText className="h-4 w-4" />
                          Change Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 rounded-full bg-gray-100 mb-4">
                        <Receipt className="h-8 w-8 text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-500 mb-2">Upload your receipt image</p>
                      <Button 
                        type="button" 
                        variant="secondary"
                        className="flex items-center gap-2"
                        onClick={() => document.getElementById('receipt-image')?.click()}
                      >
                        <ScanText className="h-4 w-4" /> 
                        Select & Scan Image
                      </Button>
                    </>
                  )}
                  <input
                    id="receipt-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    Upload a clear image of your receipt. The system will attempt to
                    automatically extract information like store name, date, and total.
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-gray-50">
              <h2 className="text-xl font-semibold mb-4">Submission</h2>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Once submitted, your receipt will be reviewed by your department's supervisor.
                  You'll be notified when your receipt is approved or if there are any questions.
                </p>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? "Submitting..." : "Submit Receipt"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReceiptForm;
