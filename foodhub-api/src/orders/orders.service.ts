import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto.js';
type OrderStatus =
  'PLACED' | 'COOKING' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';
interface Order {
  id: string;
  customerName: string;
  items: string[];
  status: OrderStatus;
}
@Injectable()
export class OrdersServcie {
  private orders: Order[] = [];
  private idempotencyKeys = new Map<string, Order>();

  createOrder(dto: CreateOrderDto, key: string) {
    const existingOrder = this.idempotencyKeys.get(key);

    if (existingOrder) {
      return {
        order: existingOrder,
        isDuplicate: true,
      };
    }
    const order: Order = {
      id: String(Date.now()),
      customerName: dto.customerName,
      items: dto.items,
      status: 'PLACED',
    };
    this.orders.push(order);
    this.idempotencyKeys.set(key, order);
    return {
      order,
      isDuplicate: false,
    };
  }
  getOrder(id: string): Order {
    const order = this.orders.find((order) => order.id === id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
  updateStatus(id: string, newStatus: OrderStatus): Order {
    const order = this.getOrder(id);

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      PLACED: ['COOKING', 'CANCELLED'],
      COOKING: ['DELIVERING'],
      DELIVERING: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (!allowedTransitions[order.status].includes(newStatus)) {
      throw new ConflictException(
        `Cannot change order from ${order.status} to ${newStatus}`,
      );
    }
    order.status = newStatus;

    return order;
  }
}
