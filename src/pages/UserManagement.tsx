import { useState } from "react";
import { User } from "../types";
import { users as mockUsers, mockRegister } from "../utils/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus } from "lucide-react";

interface EditUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: "employee" | "supervisor";
  department: string;
  password?: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<EditUserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    role: "employee",
    department: "",
    password: ""
  });
  const [editFormData, setEditFormData] = useState<EditUserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    role: "employee",
    department: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateAccount = () => {
    try {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill in all required fields."
        });
        return;
      }

      // Check if a user with this email already exists
      const emailExists = users.some(user => user.email === formData.email);
      if (emailExists) {
        toast({
          variant: "destructive",
          title: "Email Already Exists",
          description: "An account with this email already exists."
        });
        return;
      }

      const result = mockRegister({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: "employee",
        department: formData.department
      });

      // Use the ID from the result to avoid duplicate key issues
      setShowCreateDialog(false);
      
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        role: "employee",
        department: "",
        password: ""
      });

      toast({
        title: "Account Created",
        description: `Account for ${formData.firstName} ${formData.lastName} has been created successfully.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create account. Please try again."
      });
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department,
    });
    setShowEditDialog(true);
  };

  const handleUpdateUser = (formData: EditUserFormData) => {
    const updatedUsers = users.map(user => 
      user.id === selectedUser?.id 
        ? { ...user, ...formData } 
        : user
    );
    setUsers(updatedUsers);
    setShowEditDialog(false);
    toast({
      title: "User updated",
      description: "User information has been successfully updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Create Employee Account
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Employee Account</DialogTitle>
            <DialogDescription>
              Enter details to create a new employee account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <div>
                <label htmlFor="firstName" className="text-right text-sm">
                  First Name *
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="text-right text-sm">
                  Last Name *
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="text-sm">
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="text-sm">
                Password *
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <label htmlFor="department" className="text-sm">
                Department
              </label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateAccount}>
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="editFirstName" className="text-right">
                First Name
              </label>
              <Input
                id="editFirstName"
                name="firstName"
                value={editFormData.firstName}
                onChange={handleEditChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="editLastName" className="text-right">
                Last Name
              </label>
              <Input
                id="editLastName"
                name="lastName"
                value={editFormData.lastName}
                onChange={handleEditChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="editEmail" className="text-right">
                Email
              </label>
              <Input
                id="editEmail"
                name="email"
                type="email"
                value={editFormData.email}
                onChange={handleEditChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="editRole" className="text-right">
                Role
              </label>
              <select
                id="editRole"
                name="role"
                value={editFormData.role}
                onChange={handleEditChange}
                className="col-span-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value="employee">Employee</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="editDepartment" className="text-right">
                Department
              </label>
              <Input
                id="editDepartment"
                name="department"
                value={editFormData.department}
                onChange={handleEditChange}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => handleUpdateUser(editFormData)}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;