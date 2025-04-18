
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "employee" | "supervisor";
  department: string;
}

export interface Receipt {
  id: string;
  userId: string;
  date: string;
  store: string;
  total: number;
  category: string;
  subcategory: string;
  items: Array<{ name: string; price: number; quantity: number; }>;
  status: "pending" | "approved" | "rejected";
  image: string;
  flagged?: boolean;
  notes?: string;
}

export interface Department {
  id: string;
  name: string;
  supervisorId: string;
  employeeIds: string[];
}
