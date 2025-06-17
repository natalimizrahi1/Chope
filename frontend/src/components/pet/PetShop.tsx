import { useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { ShoppingCart, Coins, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type ShopItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  type: "food" | "toy" | "energy" | "accessory";
};

interface ShopProps {
  coins: number;
  onBuy: (item: ShopItem) => void;
}

export default function PetShop({ coins, onBuy }: ShopProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const items: ShopItem[] = [
    {
      id: "food1",
      name: "Sandwich",
      price: 4,
      image: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561857661/virtual%20pet/sandwich.png",
      type: "food",
    },
    {
      id: "toy1",
      name: "Toy Box",
      price: 2,
      image: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561857776/virtual%20pet/gamesbox.png",
      type: "toy",
    },
    {
      id: "energy1",
      name: "Energy Pill",
      price: 5,
      image: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561857719/virtual%20pet/medicene.png",
      type: "energy",
    },
    {
      id: "hat1",
      name: "Cool Hat",
      price: 8,
      image: "https://www.urbanbrush.net/web/wp-content/uploads/edd/2018/02/web-20180210105828821949.png",
      type: "accessory",
    },
    {
      id: "glasses1",
      name: "Sunglasses",
      price: 10,
      image: "https://www.clickshop.co.il/3844-large_default/%D7%9E%D7%A9%D7%A7%D7%A4%D7%99-%D7%AA%D7%9C%D7%AA-%D7%9E%D7%99%D7%9E%D7%93-%D7%90%D7%93%D7%95%D7%9D-%D7%9B%D7%97%D7%95%D7%9C-%D7%A2%D7%9D-%D7%9E%D7%A1%D7%92%D7%A8%D7%AA-%D7%A7%D7%A9%D7%99%D7%97%D7%94.jpg",
      type: "accessory",
    },
  ];

  const handleBuy = (item: ShopItem) => {
    onBuy(item);
    setSelected(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8'>
      <div className='max-w-screen-lg mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-4'>
            <button onClick={() => navigate("/kid/dashboard")} className='p-2 hover:bg-white rounded-full transition-colors'>
              <ArrowLeft className='w-6 h-6 text-gray-600' />
            </button>
            <h2 className='text-3xl font-bold text-gray-800 flex items-center gap-2'>
              <ShoppingCart className='w-8 h-8 text-purple-600' />
              Pet Shop
            </h2>
          </div>
          <div className='flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md'>
            <Coins className='w-5 h-5 text-yellow-500' />
            <span className='font-bold text-gray-700'>{coins} coins</span>
          </div>
        </div>

        {/* Items Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          {items.map(item => {
            const affordable = coins >= item.price;
            const isSelected = selected === item.id;
            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => affordable && setSelected(item.id)}
                className={clsx("bg-white rounded-xl p-4 shadow-md transition-all duration-200", {
                  "opacity-50 cursor-not-allowed": !affordable,
                  "ring-4 ring-purple-400": isSelected,
                  "hover:shadow-lg": affordable,
                })}
              >
                <div className='aspect-square overflow-hidden rounded-lg bg-gray-50 mb-4 flex items-center justify-center'>
                  <img
                    src={item.image}
                    alt={item.name}
                    className='w-24 h-24 object-contain'
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/150?text=Item";
                    }}
                  />
                </div>
                <div className='space-y-2'>
                  <h3 className='text-lg font-semibold text-gray-800'>{item.name}</h3>
                  <div className='flex items-center justify-between'>
                    <span className='text-yellow-600 font-bold flex items-center gap-1'>
                      <Coins className='w-4 h-4' />
                      {item.price}
                    </span>
                    <span
                      className={clsx("text-sm capitalize", {
                        "text-purple-500": item.type === "accessory",
                        "text-gray-500": item.type !== "accessory",
                      })}
                    >
                      {item.type}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Buy Button */}
        <div className='mt-8 flex justify-center'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!selected}
            onClick={() => {
              const item = items.find(it => it.id === selected)!;
              handleBuy(item);
            }}
            className={clsx("px-8 py-3 rounded-full font-semibold text-white shadow-lg transition-all duration-200", {
              "bg-purple-600 hover:bg-purple-700": selected,
              "bg-gray-400 cursor-not-allowed": !selected,
            })}
          >
            {selected ? "Buy Now" : "Select an Item"}
          </motion.button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className='fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg'>
            Purchase successful! 🎉
          </motion.div>
        )}
      </div>
    </div>
  );
}
