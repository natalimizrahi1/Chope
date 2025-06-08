export type InventoryItem = {
    id: string;
    name: string;
    image: string;
    type: 'hat' | 'shirt';
  };
  
  type InventoryProps = {
    items: InventoryItem[];
    onEquip: (item: InventoryItem) => void;
  };
  
  export default function Inventory({ items, onEquip }: InventoryProps) {
    return (
      <div className="p-4 bg-white rounded-xl shadow-md">
        <h3 className="text-lg font-bold mb-2">Inventory</h3>
        <div className="flex flex-wrap gap-2">
          {items.map(item => (
            <div key={item.id} className="flex flex-col items-center">
              <img src={item.image} alt={item.name} className="w-12 h-12" />
              <button onClick={() => onEquip(item)} className="text-xs underline text-blue-600">
                Equip
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
  