export const ORDERS_STORAGE_KEY = "admin_orders";

const LEGACY_ORDER_KEYS = ["generated_orders"] as const;

export interface StoredOrder {
  id: string;
  amount_cents: number;
  shipping_cost_cents: number | null;
  status: string;
  created_at: string;
  buyer_name: string | null;
  buyer_document: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  gateway: string;
  items_description: string | null;
  pix_code: string | null;
  buyer_address: string | null;
  buyer_address_number: string | null;
  buyer_complement: string | null;
  buyer_neighborhood: string | null;
  buyer_city: string | null;
  buyer_state: string | null;
  buyer_cep: string | null;
  buyer_ip: string | null;
  buyer_ip_city: string | null;
  shipping_method: string | null;
}

type UnknownOrder = Record<string, any>;

const readRawOrders = (key: string): UnknownOrder[] => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const toAmountCents = (order: UnknownOrder) => {
  if (typeof order.amount_cents === "number") return order.amount_cents;
  if (typeof order.amount === "number") {
    return order.amount > 1000 ? order.amount : Math.round(order.amount * 100);
  }
  if (typeof order.total === "number") return Math.round(order.total * 100);
  return 0;
};

export const normalizeStoredOrder = (order: UnknownOrder): StoredOrder => {
  const customer = order.customer ?? {};
  const items = Array.isArray(order.items) ? order.items : [];
  const normalizedStatus = order.status === "waiting_payment" ? "pending" : order.status ?? "pending";

  return {
    id: order.id ?? order.transaction_hash ?? crypto.randomUUID(),
    amount_cents: toAmountCents(order),
    shipping_cost_cents: typeof order.shipping_cost_cents === "number" ? order.shipping_cost_cents : null,
    status: normalizedStatus,
    created_at: order.created_at ?? order.date ?? new Date().toISOString(),
    buyer_name: order.buyer_name ?? customer.nome ?? customer.name ?? null,
    buyer_document: order.buyer_document ?? customer.cpf ?? customer.document ?? null,
    buyer_email: order.buyer_email ?? customer.email ?? null,
    buyer_phone: order.buyer_phone ?? customer.telefone ?? customer.phone ?? null,
    gateway: order.gateway ?? "ironpay",
    items_description:
      order.items_description ??
      (items.length > 0
        ? items
            .map((item: UnknownOrder) => `${item.quantity ?? 1}x ${item.name ?? item.title ?? "Item"}`)
            .join(", ")
        : null),
    pix_code: order.pix_code ?? order.pix_copy_paste ?? null,
    buyer_address: order.buyer_address ?? customer.rua ?? customer.street ?? null,
    buyer_address_number: order.buyer_address_number ?? customer.numero ?? null,
    buyer_complement: order.buyer_complement ?? customer.complemento ?? null,
    buyer_neighborhood: order.buyer_neighborhood ?? customer.bairro ?? null,
    buyer_city: order.buyer_city ?? customer.cidade ?? customer.city ?? null,
    buyer_state: order.buyer_state ?? customer.estado ?? customer.state ?? null,
    buyer_cep: order.buyer_cep ?? customer.cep ?? customer.zip_code ?? null,
    buyer_ip: order.buyer_ip ?? null,
    buyer_ip_city: order.buyer_ip_city ?? null,
    shipping_method: order.shipping_method ?? "pix",
  };
};

export const readOrdersFromStorage = (): StoredOrder[] => {
  const merged = [
    ...readRawOrders(ORDERS_STORAGE_KEY),
    ...LEGACY_ORDER_KEYS.flatMap(readRawOrders),
  ].map(normalizeStoredOrder);

  const unique = new Map<string, StoredOrder>();
  merged.forEach((order) => unique.set(order.id, order));

  const orders = Array.from(unique.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // noop
  }

  return orders;
};

export const saveOrderToStorage = (order: UnknownOrder) => {
  const normalized = normalizeStoredOrder(order);
  const orders = readOrdersFromStorage().filter((item) => item.id !== normalized.id);
  const nextOrders = [normalized, ...orders];
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(nextOrders));
  return normalized;
};

export const clearStoredOrders = () => {
  localStorage.removeItem(ORDERS_STORAGE_KEY);
  LEGACY_ORDER_KEYS.forEach((key) => localStorage.removeItem(key));
};