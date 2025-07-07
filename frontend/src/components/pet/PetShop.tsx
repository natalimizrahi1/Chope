import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { getTasks, getChildCoins, buyItemsFromShop, getChildItems } from "../../lib/api";
import { Task, ShopItem, PurchasedItem } from "../../lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ShoppingCart, Coins, Star, ShoppingBag, Store, Target, Play, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export default function PetShop() {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [coins, setCoins] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState<PurchasedItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<"all" | "accessories" | "clothes">("all");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const childId = user?.id;
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const loadCoins = async () => {
      try {
        if (token && childId) {
          const coinsData = await getChildCoins(token, childId);
          setCoins(coinsData.coins);
          localStorage.setItem("currentCoins", coinsData.coins.toString());
        }
      } catch (error) {
        console.error("Failed to load coins:", error);
        // Fallback to localStorage
        const savedCoins = localStorage.getItem("currentCoins");
        if (savedCoins) {
          setCoins(parseInt(savedCoins));
        }
      }
    };

    const loadItems = async () => {
      try {
        if (token && childId) {
          console.log("Loading items for child:", childId);
          const itemsData = await getChildItems(token, childId);
          console.log("Items loaded from server:", itemsData);
          setPurchasedItems(itemsData.purchasedItems || []);
          console.log("Purchased items set to:", itemsData.purchasedItems || []);
        }
      } catch (error) {
        console.error("Failed to load items:", error);
      }
    };

    loadCoins();
    loadItems();

    // Set up interval to check for updates
    const updateInterval = setInterval(() => {
      loadCoins();
      loadItems();
    }, 3000);

    return () => {
      clearInterval(updateInterval);
    };
  }, [token, childId]);

  useEffect(() => {
    const handleTaskCompleted = async () => {
      // Reload coins from server
      try {
        if (token && childId) {
          const coinsData = await getChildCoins(token, childId);
          setCoins(coinsData.coins);
          localStorage.setItem("currentCoins", coinsData.coins.toString());
        }
      } catch (error) {
        console.error("Failed to reload coins:", error);
      }
    };

    const handleItemsUpdated = async () => {
      // Reload items from server
      try {
        if (token && childId) {
          const itemsData = await getChildItems(token, childId);
          setPurchasedItems(itemsData.purchasedItems || []);
        }
      } catch (error) {
        console.error("Failed to reload items:", error);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "currentCoins" && e.newValue) {
        setCoins(parseInt(e.newValue));
      }
    };

    const handleCustomEvent = async () => {
      try {
        if (token && childId) {
          const coinsData = await getChildCoins(token, childId);
          setCoins(coinsData.coins);
          localStorage.setItem("currentCoins", coinsData.coins.toString());
        }
      } catch (error) {
        console.error("Failed to reload coins:", error);
      }
    };

    // Listen for coin updates from other components
    const handleCoinUpdate = async () => {
      try {
        if (token && childId) {
          const coinsData = await getChildCoins(token, childId);
          setCoins(coinsData.coins);
          localStorage.setItem("currentCoins", coinsData.coins.toString());
        }
      } catch (error) {
        console.error("Failed to reload coins:", error);
      }
    };

    window.addEventListener("taskCompleted", handleTaskCompleted);
    window.addEventListener("itemsUpdated", handleItemsUpdated);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("coinsUpdated", handleCustomEvent);
    window.addEventListener("coinsUpdated", handleCoinUpdate);

    return () => {
      window.removeEventListener("taskCompleted", handleTaskCompleted);
      window.removeEventListener("itemsUpdated", handleItemsUpdated);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("coinsUpdated", handleCustomEvent);
      window.removeEventListener("coinsUpdated", handleCoinUpdate);
    };
  }, [token, childId]);

  const items: ShopItem[] = [
    {
      id: "accessory1",
      name: "Cool Scarf",
      price: 4,
      image: "/images/shop/accessories/accessory1.png",
      type: "accessory",
      slot: "body",

      description: "Make your pet look awesome! 🧣",
    },
    {
      id: "accessory2",
      name: "Cool Hat",
      price: 6,
      image: "/images/shop/accessories/accessory2.png",
      type: "accessory",
      slot: "hair",
      description: "Make your pet look awesome! 🎩",
    },
    {
      id: "accessory3",
      name: "Cool Cap",
      price: 4,
      image: "/images/shop/accessories/accessory3.png",
      type: "accessory",
      slot: "head",

      description: "Make your pet look awesome! 🧢",
    },
    {
      id: "accessory4",
      name: "Cool winter hat",
      price: 5,
      image: "/images/shop/accessories/accessory4.png",
      type: "accessory",
      slot: "head",

      description: "Make your pet look awesome! 🥶",
    },
    {
      id: "accessory5",
      name: "Cool bow tie",
      price: 7,
      image: "/images/shop/accessories/accessory5.png",
      type: "accessory",
      slot: "body",

      description: "Make your pet look awesome! 🤵",
    },
    {
      id: "dress",
      name: "Cool Dress",
      price: 8,
      image: "/images/shop/clothes/dress.png",
      type: "accessory",
      description: "Make your pet look awesome! 👗",
    },
    {
      id: "shirt",
      name: "Cool Shirt",
      price: 10,
      image: "/images/shop/clothes/shirt.png",
      type: "accessory",
      description: "Make your pet look awesome! 👕",
    },
    {
      id: "suit",
      name: "Cool Suit",
      price: 12,
      image: "/images/shop/clothes/suit.png",
      type: "accessory",
      description: "Make your pet look awesome! 🤵",
    },
    {
      id: "hair",
      name: "Cool Hair",
      price: 10,
      image: "/images/shop/hair/Hair1.png",
      type: "accessory",
      slot: "head",
      description: "Make your pet look awesome! 💇",
    },
    {
      id: "hair2",
      name: "Cool Hair",
      price: 10,
      image: "/images/shop/hair/hair2.png",
      type: "accessory",
      slot: "head",
      description: "Make your pet look awesome! 💇",
    },
    {
      id: "hair3",
      name: "Cool Hair",
      price: 10,
      image: "/images/shop/hair/hair3.png",
      type: "accessory",
      slot: "head",
      description: "Make your pet look awesome! 💇",
    },
    {
      id: "hair4",
      name: "Cool Hair",
      price: 10,
      image: "/images/shop/hair/hair4.png",
      type: "accessory",
      slot: "head",
      description: "Make your pet look awesome! 💇",
    },
    {
      id: "hair5",
      name: "Cool Hair",
      price: 10,
      image: "/images/shop/hair/hair5.png",
      type: "accessory",
      slot: "head",
      description: "Make your pet look awesome! 💇",
    },
  ];

  const filteredItems = activeCategory === "all" ? items : items.filter(item => item.type === activeCategory);

  const selectedItemsData = selectedItems.map(id => items.find(item => item.id === id)).filter(Boolean) as ShopItem[];
  const totalCost = selectedItemsData.reduce((sum, item) => sum + item.price, 0);
  const canAfford = coins >= totalCost;

  const handlePurchase = async () => {
    if (selectedItems.length === 0) {
      alert("Please select items to purchase!");
      return;
    }

    const totalCost = selectedItems.reduce((sum, itemId) => {
      const item = items.find(shopItem => shopItem.id === itemId);
      return sum + (item?.price || 0);
    }, 0);

    if (coins < totalCost) {
      alert("You don't have enough coins!");
      return;
    }

    try {
      // Buy items through API
      const selectedItemsData = selectedItems
        .map(itemId => {
          const item = items.find(shopItem => shopItem.id === itemId);
          return item;
        })
        .filter(Boolean);

      console.log("Sending purchase request with items:", selectedItemsData);
      const result = await buyItemsFromShop(token, childId, selectedItemsData, totalCost);
      console.log("Purchase result from server:", result);

      // Update local state
      setCoins(result.coins);
      setPurchasedItems(result.purchasedItems || []);
      localStorage.setItem("currentCoins", result.coins.toString());
      setSelectedItems([]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // Notify other components
      window.dispatchEvent(new CustomEvent("coinsUpdated"));
      window.dispatchEvent(new CustomEvent("itemsUpdated"));

      console.log("Purchase successful! New purchasedItems:", result.purchasedItems);
    } catch (error) {
      console.error("Failed to purchase items:", error);
      alert("Failed to purchase items. Please try again.");
    }
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#87d4ee] via-[#f9a8d4] to-[#ffd986] relative overflow-hidden'>
      {/* Background decorations */}
      <div className='absolute inset-0 overflow-hidden'>
        <motion.div
          className='absolute top-4 left-4 sm:top-10 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 bg-white/20 rounded-full'
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
          className='absolute top-20 right-4 sm:top-40 sm:right-20 w-10 h-10 sm:w-16 sm:h-16 bg-white/20 rounded-full'
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
          className='absolute bottom-10 left-1/4 sm:bottom-20 w-16 h-16 sm:w-24 sm:h-24 bg-white/20 rounded-full'
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
      <motion.div className='relative z-10 p-4 sm:p-6' initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0'>
          {/* Title */}
          <div>
            <h1 className='text-lg sm:text-xl md:text-2xl font-bold text-white drop-shadow-lg'>Pet Shop 🛍️</h1>
            <p className='text-white/90 text-xs sm:text-sm'>Buy cool stuff for your pet!</p>
          </div>

          {/* Coins and inventory */}
          <div className='flex items-center gap-2 sm:gap-4'>
            {/* Navigation tabs */}
            <div className='bg-white/90 backdrop-blur-sm rounded-2xl p-1 sm:p-2 shadow-lg'>
              <div className='flex gap-1 sm:gap-2'>
                <motion.button onClick={() => navigate("/kid/dashboard")} className='flex items-center justify-center gap-1 sm:gap-2 py-1 sm:py-2 px-2 sm:px-3 rounded-xl font-semibold transition-all text-gray-600 hover:text-gray-800 text-xs sm:text-sm' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Target className='w-3 h-3 sm:w-4 sm:h-4' />
                  <span className='hidden sm:inline'>Tasks</span>
                </motion.button>
                <motion.button onClick={() => navigate("/kid/virtualpet")} className='flex items-center justify-center gap-1 sm:gap-2 py-1 sm:py-2 px-2 sm:px-3 rounded-xl font-semibold transition-all text-gray-600 hover:text-gray-800 text-xs sm:text-sm' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Play className='w-3 h-3 sm:w-4 sm:h-4' />
                  <span className='hidden sm:inline'>My Pet</span>
                </motion.button>
                <motion.button className='flex items-center justify-center gap-1 sm:gap-2 py-1 sm:py-2 px-2 sm:px-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-[#ffd986] to-[#ffbacc] text-white shadow-lg text-xs sm:text-sm' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <ShoppingBag className='w-3 h-3 sm:w-4 sm:h-4' />
                  <span className='hidden sm:inline'>Shop</span>
                </motion.button>
              </div>
            </div>

            <motion.div className='bg-white/90 backdrop-blur-sm rounded-2xl px-2 sm:px-4 py-1 sm:py-2 shadow-lg flex items-center gap-1 sm:gap-2' whileHover={{ scale: 1.05 }}>
              <Coins className='w-4 h-4 sm:w-5 sm:h-5 text-yellow-500' />
              <span className='font-bold text-sm sm:text-lg text-gray-800'>{coins}</span>
            </motion.div>

            {/* Inventory */}
            <Popover>
              <PopoverTrigger asChild>
                <motion.button className='bg-white/90 backdrop-blur-sm rounded-2xl p-2 sm:p-3 shadow-lg hover:bg-white transition-colors relative' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Store className='w-4 h-4 sm:w-5 sm:h-5 text-gray-600' />
                  {purchasedItems.length > 0 && <span className='absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs'>{purchasedItems.reduce((sum, item) => sum + item.quantity, 0)}</span>}
                </motion.button>
              </PopoverTrigger>
              <PopoverContent className='w-72 sm:w-80 bg-white border border-gray-200 shadow-lg'>
                <div className='p-3 sm:p-4'>
                  <div className='flex items-center justify-between mb-3 sm:mb-4'>
                    <h3 className='text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2'>
                      <Store className='h-4 w-4 sm:h-5 sm:w-5' />
                      My Inventory
                    </h3>
                    <span className='text-xs sm:text-sm text-gray-500'>{purchasedItems.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                  </div>

                  {purchasedItems.length === 0 ? (
                    <div className='text-center py-6 sm:py-8 text-gray-500'>
                      <div className='text-3xl sm:text-4xl mb-2'>📦</div>
                      <p className='text-sm sm:text-base'>Your inventory is empty</p>
                      <p className='text-xs sm:text-sm'>Buy some items to see them here!</p>
                    </div>
                  ) : (
                    <div className='space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto'>
                      {purchasedItems.map((item, index) => (
                        <div key={`${item.id}-${index}`} className='flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg'>
                          <div className='w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-lg flex items-center justify-center relative'>
                            <span className='absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow'>×{item.quantity}</span>
                            <img
                              src={item.image}
                              alt={item.name}
                              className='w-6 h-6 sm:w-8 sm:h-8 object-contain'
                              onError={e => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://via.placeholder.com/32?text=Item";
                              }}
                            />
                          </div>
                          <div className='flex-1'>
                            <h4 className='font-semibold text-gray-800 text-xs sm:text-sm'>{item.name}</h4>
                            <p className='text-xs text-gray-500 capitalize'>{item.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <motion.button onClick={handleLogout} className='bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg hover:bg-white transition-colors' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <LogOut className='w-4 h-4 sm:w-5 sm:h-5 text-gray-600' />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Category tabs */}
      <motion.div className='relative z-10 px-4 sm:px-6 mb-4 sm:mb-6' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
        <div className='bg-white/90 backdrop-blur-sm rounded-2xl p-1 sm:p-2 shadow-lg'>
          <div className='flex gap-1 sm:gap-2 overflow-x-auto'>
            {[
              { key: "accessories", label: "Accessories", icon: "🎩" },
              { key: "clothes", label: "Clothes", icon: "👕" },
              { key: "all", label: "All", icon: "🛍️" },
            ].map(category => (
              <motion.button key={category.key} onClick={() => setActiveCategory(category.key as any)} className={`flex items-center gap-1 sm:gap-2 py-1 sm:py-2 px-2 sm:px-4 rounded-xl font-semibold transition-all whitespace-nowrap text-xs sm:text-sm ${activeCategory === category.key ? "bg-gradient-to-r from-[#ffd986] to-[#ffbacc] text-white shadow-lg" : "text-gray-600 hover:text-gray-800"}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <span>{category.icon}</span>
                {category.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Items grid */}
      <div className='relative z-10 px-4 sm:px-6 pb-4 sm:pb-6'>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className='bg-white/90 backdrop-blur-sm rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'>
            {filteredItems.map(item => {
              const affordable = coins >= item.price;
              const isSelected = selectedItems.includes(item.id);
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => affordable && handleItemToggle(item.id)}
                  className={clsx("bg-gradient-to-br from-white to-gray-50 rounded-2xl p-3 sm:p-4 shadow-lg transition-all cursor-pointer border-2", {
                    "opacity-50 cursor-not-allowed": !affordable,
                    "border-[#ffd986] ring-4 ring-[#ffbacc]/30": isSelected,
                    "border-transparent hover:border-[#87d4ee]": affordable && !isSelected,
                  })}>
                  <div className='w-full h-20 sm:h-24 overflow-hidden rounded-xl bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] mb-2 sm:mb-3 flex items-center justify-center'>
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

                  <div className='space-y-1 sm:space-y-2 text-center'>
                    <h3 className='font-bold text-gray-800 text-xs sm:text-sm'>{item.name}</h3>
                    {item.description && <p className='text-xs text-gray-600'>{item.description}</p>}
                    <div className='flex items-center justify-center gap-1'>
                      <Coins className='w-3 h-3 sm:w-4 sm:h-4 text-yellow-500' />
                      <span className='text-yellow-600 font-bold text-xs sm:text-sm'>{item.price}</span>
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
              onClick={handlePurchase}
              className={clsx("text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2", {
                "bg-gradient-to-r from-[#87d4ee] to-[#4ec3f7]": canAfford,
                "bg-gray-400 cursor-not-allowed": !canAfford,
              })}>
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
