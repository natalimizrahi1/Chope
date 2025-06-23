import { useState, useEffect } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { getTasks } from "../../lib/api";
import { Task } from "../../lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ShoppingCart } from "lucide-react";

export type ShopItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  type: "food" | "toy" | "energy" | "accessory";
};

export default function PetShopInline() {
  const [selected, setSelected] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [coins, setCoins] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState<ShopItem[]>([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const childId = user?.id;
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const calculateCoins = async () => {
      try {
        const savedCoins = localStorage.getItem("currentCoins");
        if (savedCoins) {
          setCoins(parseInt(savedCoins));
          return;
        }

        const tasks = await getTasks(token, childId);
        const totalCoins = tasks.filter((task: Task) => task.completed).reduce((sum: number, task: Task) => sum + task.reward, 0);
        const spentCoins = parseInt(localStorage.getItem("spentCoins") || "0");
        const availableCoins = totalCoins - spentCoins;

        setCoins(availableCoins);
        localStorage.setItem("currentCoins", availableCoins.toString());
      } catch (error) {
        console.error("Failed to calculate coins:", error);
      }
    };

    if (token && childId) calculateCoins();

    // Load purchased items from localStorage
    const savedItems = localStorage.getItem("purchasedItems");
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems) as ShopItem[];
        setPurchasedItems(parsedItems);
      } catch (error) {
        console.error("Failed to load purchased items:", error);
      }
    }
  }, [token, childId]);

  useEffect(() => {
    const handleTaskCompleted = () => {
      const recalculateCoins = async () => {
        try {
          const tasks = await getTasks(token, childId);
          const totalCoins = tasks.filter((task: Task) => task.completed).reduce((sum: number, task: Task) => sum + task.reward, 0);
          const spentCoins = parseInt(localStorage.getItem("spentCoins") || "0");
          const availableCoins = totalCoins - spentCoins;
          setCoins(availableCoins);
          localStorage.setItem("currentCoins", availableCoins.toString());
        } catch (error) {
          console.error("Failed to recalculate coins:", error);
        }
      };
      if (token && childId) recalculateCoins();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "currentCoins" && e.newValue) {
        setCoins(parseInt(e.newValue));
      }
    };

    const handleCustomEvent = () => {
      const savedCoins = localStorage.getItem("currentCoins");
      if (savedCoins) setCoins(parseInt(savedCoins));
    };

    window.addEventListener("taskCompleted", handleTaskCompleted);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("coinsUpdated", handleCustomEvent);

    return () => {
      window.removeEventListener("taskCompleted", handleTaskCompleted);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("coinsUpdated", handleCustomEvent);
    };
  }, [token, childId]);

  const items: ShopItem[] = [
    {
      id: "food1",
      name: "Sandwich",
      price: 4,
      image: "/images/shop/hats/hat1.png",
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
      image: "/images/shop/hats/hat1.png",
      type: "accessory",
    },
    {
      id: "glasses1",
      name: "Sunglasses",
      price: 10,
      image: "/images/shop/accessories/sunglasses.png",
      type: "accessory",
    },
  ];

  const handlePurchase = (item: ShopItem) => {
    const currentCoins = parseInt(localStorage.getItem("currentCoins") || "0");
    if (currentCoins < item.price) return;
    const newCoins = currentCoins - item.price;
    setCoins(newCoins);
    const currentSpent = parseInt(localStorage.getItem("spentCoins") || "0");
    localStorage.setItem("spentCoins", (currentSpent + item.price).toString());
    localStorage.setItem("currentCoins", newCoins.toString());
    window.dispatchEvent(new CustomEvent("coinsUpdated"));
    const currentItems = JSON.parse(localStorage.getItem("purchasedItems") || "[]") as ShopItem[];
    const newItems = [...currentItems, item];
    localStorage.setItem("purchasedItems", JSON.stringify(newItems));
    setPurchasedItems(newItems);
    setSelected(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    window.dispatchEvent(new CustomEvent("coinsSpent", { detail: { amount: item.price } }));
  };

  return (
    <div className='relative min-h-screen bg-no-repeat bg-top bg-cover flex flex-col items-center p-6' style={{ backgroundImage: "url('/images/petshop.png')", backgroundSize: "1200px auto" }}>
      <div className='fixed top-6 right-30 z-50'>
        <div className='flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-lg border border-yellow-300 shadow-md'>
          <span className='text-yellow-600 font-bold text-lg'>🪙</span>
          <span className='text-yellow-600 font-bold text-lg'>{coins}</span>
          <span className='text-yellow-600 text-sm'>coins</span>
        </div>
      </div>

      {/* Main Content */}
      <div className='relative z-10 w-full max-w-4xl px-1 pt-20 pb-8'>
        <div className='grid grid-cols-3 gap-x-2 gap-y-3 justify-items-center max-w-md mx-auto mt-30'>
          {items.map(item => {
            const affordable = coins >= item.price;
            const isSelected = selected === item.id;
            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => affordable && setSelected(item.id)}
                className={clsx("w-[100px] h-auto rounded-xl p-2 shadow-md transition-all cursor-pointer bg-white", {
                  "opacity-50 cursor-not-allowed": !affordable,
                  "ring-4 ring-pink-300": isSelected,
                  "hover:shadow-lg": affordable,
                })}
              >
                <div className='w-full h-[60px] overflow-hidden rounded-lg bg-pink-50 mb-1.5 flex items-center justify-center'>
                  <img
                    src={item.image}
                    alt={item.name}
                    className='max-w-full max-h-full object-contain'
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/150?text=Item";
                    }}
                  />
                </div>

                <div className='space-y-0 text-center'>
                  <h3 className='text-sm font-bold text-gray-800'>{item.name}</h3>
                  <div className='text-xs text-gray-500 capitalize'>{item.type}</div>
                  <div className='text-yellow-600 text-sm font-semibold'>{item.price} ✨</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className='mt-43 flex justify-center'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!selected}
            onClick={() => {
              const item = items.find(it => it.id === selected);
              if (item) handlePurchase(item);
            }}
            className={clsx("px-6 py-3 rounded-full font-bold text-white transition-all shadow-lg", {
              "bg-pink-500 hover:bg-pink-600": selected,
              "bg-gray-300 cursor-not-allowed": !selected,
            })}
          >
            {selected ? "Buy Now" : "Select an Item"}
          </motion.button>
        </div>

        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className='fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-5 py-3 rounded-full shadow-lg'>
            Purchase successful! 🎉
          </motion.div>
        )}
      </div>

      {/* Shopping Cart Button */}
      <div className='fixed right-6 top-6'>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline' size='icon' className='w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200 hover:bg-white'>
              <ShoppingCart className='h-5 w-5' />
              {purchasedItems.length > 0 && <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>{purchasedItems.length}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80 bg-white border border-gray-200 shadow-lg'>
            <div className='p-4'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                  <ShoppingCart className='h-5 w-5' />
                  Shopping Cart
                </h3>
                <span className='text-sm text-gray-500'>{purchasedItems.length} items</span>
              </div>

              {purchasedItems.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <div className='text-4xl mb-2'>🛒</div>
                  <p>Your cart is empty</p>
                  <p className='text-sm'>Buy some items to see them here!</p>
                </div>
              ) : (
                <div className='space-y-3 max-h-60 overflow-y-auto'>
                  {purchasedItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                      <div className='w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center'>
                        <img
                          src={item.image}
                          alt={item.name}
                          className='w-8 h-8 object-contain'
                          onError={e => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://via.placeholder.com/32?text=Item";
                          }}
                        />
                      </div>
                      <div className='flex-1'>
                        <h4 className='font-semibold text-gray-800 text-sm'>{item.name}</h4>
                        <p className='text-xs text-gray-500 capitalize'>{item.type}</p>
                        <p className='text-yellow-600 font-semibold text-sm'>{item.price} 🪙</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {purchasedItems.length > 0 && (
                <div className='mt-4 pt-4 border-t border-gray-200'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='font-semibold text-gray-800'>Total Spent:</span>
                    <span className='text-yellow-600 font-bold'>{purchasedItems.reduce((sum, item) => sum + item.price, 0)} 🪙</span>
                  </div>
                  <button
                    onClick={() => {
                      // Calculate total spent on items being cleared
                      const totalSpentOnItems = purchasedItems.reduce((sum, item) => sum + item.price, 0);

                      // Restore coins
                      const currentCoins = parseInt(localStorage.getItem("currentCoins") || "0");
                      const newCoins = currentCoins + totalSpentOnItems;
                      setCoins(newCoins);
                      localStorage.setItem("currentCoins", newCoins.toString());

                      // Update spent coins in localStorage
                      const currentSpent = parseInt(localStorage.getItem("spentCoins") || "0");
                      const newSpent = currentSpent - totalSpentOnItems;
                      localStorage.setItem("spentCoins", Math.max(0, newSpent).toString());

                      // Clear cart
                      setPurchasedItems([]);
                      localStorage.setItem("purchasedItems", "[]");

                      // Dispatch event to update other components
                      window.dispatchEvent(new CustomEvent("coinsUpdated"));
                    }}
                    className='w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors'
                  >
                    Clear Cart
                  </button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
