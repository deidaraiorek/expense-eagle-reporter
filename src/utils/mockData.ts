
import { v4 as uuidv4 } from 'uuid';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'employee' | 'supervisor';
  department: string;
};

export type Receipt = {
  id: string;
  userId: string;
  date: string;
  store: string;
  total: number;
  category: string;
  subcategory: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  image: string;
  flagged?: boolean;
  notes?: string;
};

export type Department = {
  id: string;
  name: string;
  supervisorId: string;
  employeeIds: string[];
};

// Mock Users
export const users: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'supervisor',
    department: 'Engineering',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    role: 'employee',
    department: 'Engineering',
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike@example.com',
    role: 'employee',
    department: 'Engineering',
  },
];

// Mock Departments
export const departments: Department[] = [
  {
    id: '1',
    name: 'Engineering',
    supervisorId: '1',
    employeeIds: ['2', '3'],
  },
];

// Mock Categories
export const categories = {
  Travel: ['Airfare', 'Hotel', 'Car Rental', 'Meals', 'Other'],
  Office: ['Supplies', 'Equipment', 'Software', 'Other'],
  Training: ['Conference', 'Course', 'Books', 'Other'],
  Entertainment: ['Client', 'Team', 'Other'],
  Transportation: ['Taxi', 'Parking', 'Gas', 'Other'],
};

// Mock Receipts
export const receipts: Receipt[] = [
  {
    id: '1',
    userId: '2',
    date: '2024-04-15',
    store: 'Office Depot',
    total: 156.78,
    category: 'Office',
    subcategory: 'Supplies',
    items: [
      { name: 'Printer Paper', price: 45.99, quantity: 2 },
      { name: 'Ink Cartridge', price: 64.80, quantity: 1 },
    ],
    status: 'pending',
    image: 'https://placehold.co/600x400',
  },
  {
    id: '2',
    userId: '2',
    date: '2024-04-14',
    store: 'Delta Airlines',
    total: 450.00,
    category: 'Travel',
    subcategory: 'Airfare',
    items: [
      { name: 'Flight Ticket', price: 450.00, quantity: 1 },
    ],
    status: 'approved',
    image: 'https://placehold.co/600x400',
  },
];

// Mock auth functions
export const mockLogin = (email: string, password: string) => {
  const user = users.find(u => u.email === email);
  if (user && password === 'password') {
    return { user, token: 'mock-jwt-token' };
  }
  throw new Error('Invalid credentials');
};

export const mockRegister = (userData: Partial<User>) => {
  const newUser = {
    id: uuidv4(),
    ...userData,
    role: 'employee' as const,
    department: 'Engineering',
  };
  users.push(newUser as User);
  return { user: newUser, token: 'mock-jwt-token' };
};
