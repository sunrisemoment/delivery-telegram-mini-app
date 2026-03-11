export type OrderStatus = "pending" | "assigned" | "out_for_delivery" | "delivered" | "cancelled";
export type PaymentMethod = "bitcoin" | "cod";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface Driver {
  id: string;
  name: string;
  phone: string;
  telegramId?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: string;
  imageUrl?: string | null;
  isAvailable: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: string;
}

export interface Address {
  id: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  zipCode?: string | null;
}

export interface Customer {
  id: string;
  telegramId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
}

export interface CustomerSummary {
  id: string;
  telegramId: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  createdAt: string;
  ordersCount: number;
  addressesCount: number;
  totalSpent: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
  deliveryPhoto?: string | null;
  user: Customer;
  driver?: Driver | null;
  address: Address;
  items: OrderItem[];
}
