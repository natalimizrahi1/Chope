import { Button } from '../ui/button';

export type ShopItem = {
  id: string;
  name: string;
  price: number;
  type: 'food' | 'toy' | 'hat' | 'shirt';
  effect?: { hunger?: number; happiness?: number; energy?: number };
  image: string;
};

type PetShopProps = {
  items: ShopItem[];
  coins: number;
  onBuy: (item: ShopItem) => void;
};

export default function PetShop({ items, coins, onBuy }: PetShopProps) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h3 className="text-lg font-bold mb-2">Pet Shop</h3>
      <div className="grid grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.id} className="flex flex-col items-center border rounded-lg p-2">
            <img src={item.image} alt={item.name} className="w-16 h-16" />
            <p className="text-sm font-semibold">{item.name}</p>
            <p className="text-xs text-gray-600">{item.price} coins</p>
            <Button onClick={() => onBuy(item)} disabled={coins < item.price} className="mt-1 text-xs">
              Buy
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
