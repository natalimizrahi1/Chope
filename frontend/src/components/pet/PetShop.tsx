import { useState, useEffect } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { getTasks } from "../../lib/api";
import { Task } from "../../lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ShoppingCart, Coins, Star, ShoppingBag, Store, Target, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type ShopItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  type: "food" | "toy" | "energy" | "accessory";
  description?: string;
};

export type PurchasedItem = ShopItem & {
  quantity: number;
};

export default function PetShopInline() {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [coins, setCoins] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState<PurchasedItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<"all" | "food" | "toy" | "energy" | "accessory">("all");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const childId = user?.id;
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const loadCoins = () => {
      // Load coins from localStorage first
      const savedCoins = localStorage.getItem("currentCoins");
      if (savedCoins) {
        setCoins(parseInt(savedCoins));
      } else {
        // If no saved coins, calculate them
        const calculateCoins = async () => {
          try {
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
      }
    };

    loadCoins();

    // Set up interval to check for coin updates
    const coinCheckInterval = setInterval(() => {
      const savedCoins = localStorage.getItem("currentCoins");
      if (savedCoins) {
        const newCoins = parseInt(savedCoins);
        if (newCoins !== coins) {
          setCoins(newCoins);
        }
      }
    }, 1000); // Check every second

    // Load purchased items from localStorage
    const savedItems = localStorage.getItem("purchasedItems");
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems) as PurchasedItem[];
        setPurchasedItems(parsedItems);
      } catch (error) {
        console.error("Failed to load purchased items:", error);
      }
    }

    return () => {
      clearInterval(coinCheckInterval);
    };
  }, [token, childId, coins]);

  useEffect(() => {
    const handleTaskCompleted = () => {
      // Load coins from localStorage instead of recalculating
      const savedCoins = localStorage.getItem("currentCoins");
      if (savedCoins) {
        setCoins(parseInt(savedCoins));
      }
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

    // Listen for coin updates from other components
    const handleCoinUpdate = () => {
      const savedCoins = localStorage.getItem("currentCoins");
      if (savedCoins) setCoins(parseInt(savedCoins));
    };

    window.addEventListener("taskCompleted", handleTaskCompleted);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("coinsUpdated", handleCustomEvent);
    window.addEventListener("coinsUpdated", handleCoinUpdate);

    return () => {
      window.removeEventListener("taskCompleted", handleTaskCompleted);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("coinsUpdated", handleCustomEvent);
      window.removeEventListener("coinsUpdated", handleCoinUpdate);
    };
  }, [token, childId]);

  const items: ShopItem[] = [
    {
      id: "food1",
      name: "Delicious Sandwich",
      price: 4,
      image: "/images/shop/hats/hat1.png",
      type: "food",
      description: "Yummy sandwich to feed your pet! 🥪",
    },
    {
      id: "food2",
      name: "Fresh Apple",
      price: 3,
      image: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561857661/virtual%20pet/sandwich.png",
      type: "food",
      description: "Healthy apple for your pet! 🍎",
    },
    {
      id: "toy1",
      name: "Fun Toy Box",
      price: 6,
      image: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561857776/virtual%20pet/gamesbox.png",
      type: "toy",
      description: "Hours of fun for your pet! 🎮",
    },
    {
      id: "toy2",
      name: "Bouncy Ball",
      price: 4,
      image: "/images/shop/ball.png",
      type: "toy",
      description: "Bouncy ball for playtime! ⚽",
    },
    {
      id: "energy1",
      name: "Energy Pill",
      price: 5,
      image: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561857719/virtual%20pet/medicene.png",
      type: "energy",
      description: "Restore your pet's energy! ⚡",
    },
    {
      id: "energy2",
      name: "Magic Drink",
      price: 7,
      image: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561857689/virtual%20pet/red-smoothie.png",
      type: "energy",
      description: "Magical drink for super energy! 🧃",
    },
    {
      id: "hat1",
      name: "Cool Hat",
      price: 8,
      image: "/images/shop/hats/hat1.png",
      type: "accessory",
      description: "Make your pet look awesome! 🎩",
    },
    {
      id: "glasses1",
      name: "Sunglasses",
      price: 10,
      image: "/images/shop/accessories/sunglasses.png",
      type: "accessory",
      description: "Stylish sunglasses for your pet! 😎",
    },
    {
      id: "shirt1",
      name: "Cool T-Shirt",
      price: 12,
      image: "/images/shop/shirts/shirt1.png",
      type: "accessory",
      description: "Fashionable shirt for your pet! 👕",
    },
  ];

  const filteredItems = activeCategory === "all" ? items : items.filter(item => item.type === activeCategory);

  const selectedItemsData = selectedItems.map(id => items.find(item => item.id === id)).filter(Boolean) as ShopItem[];
  const totalCost = selectedItemsData.reduce((sum, item) => sum + item.price, 0);
  const canAfford = coins >= totalCost;

  const handleBuyNow = () => {
    if (!canAfford || selectedItems.length === 0) return;

    const newCoins = coins - totalCost;
    setCoins(newCoins);
    const currentSpent = parseInt(localStorage.getItem("spentCoins") || "0");
    localStorage.setItem("spentCoins", (currentSpent + totalCost).toString());
    localStorage.setItem("currentCoins", newCoins.toString());
    window.dispatchEvent(new CustomEvent("coinsUpdated"));
    window.dispatchEvent(new CustomEvent("coinsSpent", { detail: { amount: totalCost } }));

    // Update purchased items with quantities
    const currentPurchased = [...purchasedItems];
    selectedItemsData.forEach(item => {
      const existingIndex = currentPurchased.findIndex(p => p.id === item.id);
      if (existingIndex >= 0) {
        currentPurchased[existingIndex].quantity += 1;
      } else {
        currentPurchased.push({ ...item, quantity: 1 });
      }
    });

    setPurchasedItems(currentPurchased);
    localStorage.setItem("purchasedItems", JSON.stringify(currentPurchased));
    setSelectedItems([]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#87d4ee] via-[#f9a8d4] to-[#ffd986] relative overflow-hidden'>
      {/* Background decorations */}
      <div className='absolute inset-0 overflow-hidden'>
        <motion.div
          className='absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full'
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className='absolute top-40 right-20 w-16 h-16 bg-white/20 rounded-full'
          animate={{
            y: [0, 15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className='absolute bottom-20 left-1/4 w-24 h-24 bg-white/20 rounded-full'
          animate={{
            y: [0, -10, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Header */}
      <motion.div className='relative z-10 p-6' initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className='flex items-center justify-between'>
          {/* Title */}
          <div>
            <h1 className='text-2xl font-bold text-white drop-shadow-lg'>Pet Shop 🛍️</h1>
            <p className='text-white/90 text-sm'>Buy cool stuff for your pet!</p>
          </div>

          {/* Coins and inventory */}
          <div className='flex items-center gap-4'>
            {/* Navigation tabs */}
            <div className='bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg'>
              <div className='flex gap-2'>
                <motion.button onClick={() => navigate("/kid/dashboard")} className='flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all text-gray-600 hover:text-gray-800 text-sm' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Target className='w-4 h-4' />
                  Tasks
                </motion.button>
                <motion.button onClick={() => navigate("/kid/virtualpet")} className='flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all text-gray-600 hover:text-gray-800 text-sm' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Play className='w-4 h-4' />
                  My Pet
                </motion.button>
                <motion.button className='flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-[#ffd986] to-[#ffbacc] text-white shadow-lg text-sm' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <ShoppingBag className='w-4 h-4' />
                  Shop
                </motion.button>
              </div>
            </div>

            <motion.div className='bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg flex items-center gap-2' whileHover={{ scale: 1.05 }}>
              <Coins className='w-5 h-5 text-yellow-500' />
              <span className='font-bold text-lg text-gray-800'>{coins}</span>
            </motion.div>

            {/* Inventory */}
            <Popover>
              <PopoverTrigger asChild>
                <motion.button className='bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg hover:bg-white transition-colors relative' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Store className='w-5 h-5 text-gray-600' />
                  {purchasedItems.length > 0 && <span className='absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>{purchasedItems.reduce((sum, item) => sum + item.quantity, 0)}</span>}
                </motion.button>
              </PopoverTrigger>
              <PopoverContent className='w-80 bg-white border border-gray-200 shadow-lg'>
                <div className='p-4'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                      <Store className='h-5 w-5' />
                      My Inventory
                    </h3>
                    <span className='text-sm text-gray-500'>{purchasedItems.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                  </div>

                  {purchasedItems.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <div className='text-4xl mb-2'>📦</div>
                      <p>Your inventory is empty</p>
                      <p className='text-sm'>Buy some items to see them here!</p>
                    </div>
                  ) : (
                    <div className='space-y-3 max-h-60 overflow-y-auto'>
                      {purchasedItems.map((item, index) => (
                        <div key={`${item.id}-${index}`} className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                          <div className='w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center relative'>
                            <span className='absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow'>×{item.quantity}</span>
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
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </motion.div>

      {/* Category tabs */}
      <motion.div className='relative z-10 px-6 mb-6' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
        <div className='bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg'>
          <div className='flex gap-2 overflow-x-auto'>
            {[
              { key: "all", label: "All", icon: "🛍️" },
              { key: "food", label: "Food", icon: "🍎" },
              { key: "toy", label: "Toys", icon: "🎮" },
              { key: "energy", label: "Energy", icon: "⚡" },
              { key: "accessory", label: "Accessories", icon: "👕" },
            ].map(category => (
              <motion.button key={category.key} onClick={() => setActiveCategory(category.key as any)} className={`flex items-center gap-2 py-2 px-4 rounded-xl font-semibold transition-all whitespace-nowrap ${activeCategory === category.key ? "bg-gradient-to-r from-[#ffd986] to-[#ffbacc] text-white shadow-lg" : "text-gray-600 hover:text-gray-800"}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <span>{category.icon}</span>
                {category.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Items grid */}
      <div className='relative z-10 px-6 pb-6'>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className='bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg'>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {filteredItems.map(item => {
              const affordable = coins >= item.price;
              const isSelected = selectedItems.includes(item.id);
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => affordable && handleItemToggle(item.id)}
                  className={clsx("bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 shadow-lg transition-all cursor-pointer border-2", {
                    "opacity-50 cursor-not-allowed": !affordable,
                    "border-[#ffd986] ring-4 ring-[#ffbacc]/30": isSelected,
                    "border-transparent hover:border-[#87d4ee]": affordable && !isSelected,
                  })}
                >
                  <div className='w-full h-24 overflow-hidden rounded-xl bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] mb-3 flex items-center justify-center'>
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

                  <div className='space-y-2 text-center'>
                    <h3 className='font-bold text-gray-800 text-sm'>{item.name}</h3>
                    {item.description && <p className='text-xs text-gray-600'>{item.description}</p>}
                    <div className='flex items-center justify-center gap-1'>
                      <Coins className='w-4 h-4 text-yellow-500' />
                      <span className='text-yellow-600 font-bold text-sm'>{item.price}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className='text-center py-12'>
              <div className='text-6xl mb-4'>🛍️</div>
              <h3 className='text-xl font-bold text-gray-800 mb-2'>No items in this category</h3>
              <p className='text-gray-600'>Try selecting a different category!</p>
            </div>
          )}
        </motion.div>

        {/* Buy button */}
        {selectedItems.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='mt-6 flex justify-center'>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!canAfford}
              onClick={handleBuyNow}
              className={clsx("text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2", {
                "bg-gradient-to-r from-[#87d4ee] to-[#4ec3f7]": canAfford,
                "bg-gray-400 cursor-not-allowed": !canAfford,
              })}
            >
              <ShoppingCart className='w-5 h-5' />
              {canAfford ? `Buy Now! (${totalCost} coins)` : `Need ${totalCost - coins} more coins`}
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Success message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className='fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 text-gray-900 px-6 py-3 rounded-2xl shadow-lg z-50'>
            <div className='flex items-center gap-2'>
              <Star className='w-5 h-5 text-green-500' />
              <span className='font-semibold'>Purchase successful! 🎉</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
