export interface Product {
  id: string;
  salon_id: string;
  supplier_id?: string;
  name: string;
  brand?: string;
  category: string;
  sku?: string;
  ean?: string;
  variant?: string;
  sale_price_gross: number;
  purchase_price_net?: number;
  vat_rate: number;
  min_stock: number;
  current_stock: number;
  is_active: boolean;
  is_for_internal_use: boolean;
  image_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  salon_id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  payment_terms?: string;
  discount_info?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  salon_id: string;
  product_id: string;
  type: 'delivery' | 'sale' | 'correction' | 'return' | 'internal_use';
  quantity: number;
  unit_price?: number;
  total_value?: number;
  supplier_id?: string;
  invoice_number?: string;
  transaction_id?: string;
  staff_id?: string;
  expiry_date?: string;
  note?: string;
  created_at: string;
  // Joined data
  product?: Product;
  supplier?: Supplier;
}

export type ProductTab = 'catalog' | 'stock' | 'recipes' | 'deliveries' | 'orders' | 'inv-stats' | 'sales-report' | 'suppliers';

export const productCategories = [
  'Pielęgnacja twarzy',
  'Pielęgnacja ciała',
  'Włosy',
  'Paznokcie',
  'Makijaż',
  'Perfumy',
  'Akcesoria',
  'Inne'
];

export const stockMovementTypes = {
  delivery: { label: 'Dostawa', color: 'bg-green-100 text-green-800' },
  sale: { label: 'Sprzedaż', color: 'bg-blue-100 text-blue-800' },
  correction: { label: 'Korekta', color: 'bg-yellow-100 text-yellow-800' },
  return: { label: 'Zwrot', color: 'bg-orange-100 text-orange-800' },
  internal_use: { label: 'Użycie wewnętrzne', color: 'bg-purple-100 text-purple-800' }
};

// Mock data for demo
export const mockProducts: Product[] = [
  {
    id: '1',
    salon_id: 'demo',
    name: 'Krem nawilżający Premium',
    brand: 'La Prairie',
    category: 'Pielęgnacja twarzy',
    sku: 'LP-001',
    sale_price_gross: 450,
    purchase_price_net: 280,
    vat_rate: 23,
    min_stock: 5,
    current_stock: 12,
    is_active: true,
    is_for_internal_use: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    salon_id: 'demo',
    name: 'Serum witamina C',
    brand: 'Medik8',
    category: 'Pielęgnacja twarzy',
    sku: 'M8-VC',
    sale_price_gross: 280,
    purchase_price_net: 150,
    vat_rate: 23,
    min_stock: 3,
    current_stock: 2,
    is_active: true,
    is_for_internal_use: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    salon_id: 'demo',
    name: 'Olejek arganowy 100ml',
    brand: 'Moroccanoil',
    category: 'Włosy',
    sku: 'MO-ARG-100',
    sale_price_gross: 180,
    purchase_price_net: 95,
    vat_rate: 23,
    min_stock: 4,
    current_stock: 8,
    is_active: true,
    is_for_internal_use: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    salon_id: 'demo',
    name: 'Lakier hybrydowy Red Passion',
    brand: 'OPI',
    category: 'Paznokcie',
    sku: 'OPI-RP-01',
    sale_price_gross: 65,
    purchase_price_net: 35,
    vat_rate: 23,
    min_stock: 2,
    current_stock: 0,
    is_active: true,
    is_for_internal_use: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    salon_id: 'demo',
    name: 'Beauty Distribution Sp. z o.o.',
    contact_person: 'Anna Kowalska',
    email: 'zamowienia@beautydist.pl',
    phone: '+48 22 123 45 67',
    payment_terms: 'Przelew 14 dni',
    discount_info: 'Rabat 15% od zamówień powyżej 2000 PLN',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    salon_id: 'demo',
    name: 'Pro Cosmetics',
    contact_person: 'Marek Nowak',
    email: 'kontakt@procosmetics.pl',
    phone: '+48 12 987 65 43',
    payment_terms: 'Płatność przy odbiorze',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockStockMovements: StockMovement[] = [
  {
    id: '1',
    salon_id: 'demo',
    product_id: '1',
    type: 'delivery',
    quantity: 10,
    unit_price: 280,
    total_value: 2800,
    supplier_id: '1',
    invoice_number: 'FV/2024/001',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    salon_id: 'demo',
    product_id: '2',
    type: 'sale',
    quantity: -1,
    total_value: 280,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    salon_id: 'demo',
    product_id: '3',
    type: 'correction',
    quantity: -2,
    note: 'Inwentaryzacja - brak na stanie',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];
