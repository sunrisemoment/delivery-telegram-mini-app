export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: string;
  imageUrl?: string | null;
  isAvailable: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AddressInput {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode?: string;
  isDefault: boolean;
}

export type OrderStatus = "pending" | "assigned" | "out_for_delivery" | "delivered" | "cancelled";
export type PaymentMethod = "bitcoin" | "cod";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface OrderProduct {
  id: string;
  name: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  product: OrderProduct;
}

export interface OrderAddress {
  id: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  zipCode?: string | null;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryPhoto?: string | null;
  createdAt: string;
  updatedAt: string;
  address: OrderAddress;
  items: OrderItem[];
}
