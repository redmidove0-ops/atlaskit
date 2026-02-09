export type DocItem = {
  name: string;
  qty: number;
  price: number;
};

export type SampleDoc = {
  id: string;
  number: string;
  date: string; // YYYY-MM-DD
  customerName: string;
  customerAddress: string;
  currency: 'EUR' | 'USD' | 'DZD';
  items: DocItem[];
};

export const sampleDocs: SampleDoc[] = [
  {
    id: '1',
    number: 'INV-0001',
    date: '2026-02-08',
    customerName: 'Client Exemple',
    customerAddress: 'Mascara, Algeria',
    currency: 'EUR',
    items: [
      {name: 'AtlasKit Pro License', qty: 1, price: 199},
      {name: 'PDF Templates Pack', qty: 1, price: 49}
    ]
  },
  {
    id: '2',
    number: 'INV-0002',
    date: '2026-02-08',
    customerName: 'شركة مثال',
    customerAddress: 'معسكر، الجزائر',
    currency: 'DZD',
    items: [
      {name: 'ترخيص AtlasKit', qty: 1, price: 149},
      {name: 'قالب فاتورة عربي', qty: 2, price: 19}
    ]
  }
];

export function getDocById(id: string) {
  return sampleDocs.find((d) => d.id === id) ?? null;
}

export function calcTotal(items: DocItem[]) {
  return items.reduce((sum, it) => sum + it.qty * it.price, 0);
}
