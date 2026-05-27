import { supabase } from '@/lib/supabase/client';
import { rowToOrder, rowToOrderItem } from '@/lib/supabase/mappers';
import type { OrderItemRow, OrderRow } from '@/lib/supabase/types';
import type { Order, OrderItem, OrderStatus } from '@/types';

type PaymentMethod = 'tabby' | 'tamara' | 'card' | 'cod';

export type PlaceOrderInput = Omit<Order, 'id' | 'createdAt' | 'status'> & {
  paymentMethod?: PaymentMethod;
  shipping?: number;
};

export async function listOrders(): Promise<Order[]> {
  const client = supabase();
  const { data: orderData, error: orderErr } = await client
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (orderErr) throw orderErr;
  const orderRows = (orderData ?? []) as OrderRow[];
  if (orderRows.length === 0) return [];

  const { data: itemData, error: itemErr } = await client
    .from('order_items')
    .select('*')
    .in('order_id', orderRows.map((o) => o.id));
  if (itemErr) throw itemErr;

  const itemsByOrder = new Map<string, OrderItem[]>();
  ((itemData ?? []) as OrderItemRow[]).forEach((r) => {
    const list = itemsByOrder.get(r.order_id) ?? [];
    list.push(rowToOrderItem(r));
    itemsByOrder.set(r.order_id, list);
  });

  return orderRows.map((r) => rowToOrder(r, itemsByOrder.get(r.id) ?? []));
}

export async function getOrder(id: string): Promise<Order | null> {
  const client = supabase();
  const { data: orderData, error: orderErr } = await client
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (orderErr) throw orderErr;
  if (!orderData) return null;
  const { data: itemData, error: itemErr } = await client
    .from('order_items')
    .select('*')
    .eq('order_id', id);
  if (itemErr) throw itemErr;
  return rowToOrder(
    orderData as OrderRow,
    ((itemData ?? []) as OrderItemRow[]).map(rowToOrderItem)
  );
}

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const client = supabase();

  const { data: orderRow, error: orderErr } = await client
    .from('orders')
    .insert({
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      subtotal: input.subtotal,
      discount_total: input.discountTotal,
      shipping: input.shipping ?? 0,
      total: input.total,
      status: 'pending',
      payment_method: input.paymentMethod ?? null,
    })
    .select('*')
    .single();
  if (orderErr) throw orderErr;

  const orderId = (orderRow as OrderRow).id;
  const itemRows = input.items.map((i) => ({
    order_id: orderId,
    product_id: i.productId,
    title: i.title,
    quantity: i.quantity,
    unit_price: i.unitPrice,
    total_price: i.totalPrice,
    selected_size: i.selectedSize ?? null,
    selected_color: i.selectedColor ?? null,
  }));
  if (itemRows.length > 0) {
    const { error: itemErr } = await client.from('order_items').insert(itemRows);
    if (itemErr) throw itemErr;
  }

  return rowToOrder(orderRow as OrderRow, input.items);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase().from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}
