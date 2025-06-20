import { useState, useEffect } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { getTasks } from "../../lib/api";
import { Task } from "../../lib/types";

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

  // Get user data
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const childId = user?.id;
  const token = localStorage.getItem("token") || "";

  // Calculate coins from completed tasks
  useEffect(() => {
    const calculateCoins = async () => {
      try {
        const tasks = await getTasks(token, childId);
        const totalCoins = tasks.filter((task: Task) => task.completed).reduce((sum: number, task: Task) => sum + task.reward, 0);

        // Load spent coins from localStorage
        const spentCoins = parseInt(localStorage.getItem("spentCoins") || "0");
        const availableCoins = totalCoins - spentCoins;

        setCoins(availableCoins);
      } catch (error) {
        console.error("Failed to calculate coins:", error);
      }
    };

    if (token && childId) {
      calculateCoins();
    }
  }, [token, childId]);

  // Listen for task completion events to update coins
  useEffect(() => {
    const handleTaskCompleted = () => {
      const recalculateCoins = async () => {
        try {
          const tasks = await getTasks(token, childId);
          const totalCoins = tasks.filter((task: Task) => task.completed).reduce((sum: number, task: Task) => sum + task.reward, 0);

          // Load spent coins from localStorage
          const spentCoins = parseInt(localStorage.getItem("spentCoins") || "0");
          const availableCoins = totalCoins - spentCoins;

          setCoins(availableCoins);
        } catch (error) {
          console.error("Failed to recalculate coins:", error);
        }
      };

      if (token && childId) {
        recalculateCoins();
      }
    };

    window.addEventListener("taskCompleted", handleTaskCompleted);

    return () => {
      window.removeEventListener("taskCompleted", handleTaskCompleted);
    };
  }, [token, childId]);

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

  const handlePurchase = (item: ShopItem) => {
    if (coins >= item.price) {
      // Deduct coins locally
      const newCoins = coins - item.price;
      setCoins(newCoins);

      // Save spent coins to localStorage
      const currentSpent = parseInt(localStorage.getItem("spentCoins") || "0");
      localStorage.setItem("spentCoins", (currentSpent + item.price).toString());

      // Dispatch custom storage event for same-tab updates
      window.dispatchEvent(new CustomEvent("storageUpdated"));

      // Save to localStorage and update state
      const currentItems = JSON.parse(localStorage.getItem("purchasedItems") || "[]") as ShopItem[];
      const newItems = [...currentItems, item];
      localStorage.setItem("purchasedItems", JSON.stringify(newItems));
      setPurchasedItems(newItems);
      setSelected(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // Dispatch event to update coins in other components
      window.dispatchEvent(new CustomEvent("coinsSpent", { detail: { amount: item.price } }));
      console.log("🛒 PetShop - coinsSpent event dispatched, amount:", item.price);
    }
  };

  return (
    <div className='mt-8 px-4'>
      {/* coins */}
      <div className='flex justify-end items-center gap-2 mb-4'>
        <div className='flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-lg border border-yellow-300'>
          <span className='text-yellow-600 font-bold text-lg'>🪙</span>
          <span className='text-yellow-600 font-bold text-lg'>{coins}</span>
          <span className='text-yellow-600 text-sm'>coins</span>
        </div>
      </div>

      {/* items */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
        {items.map(item => {
          const affordable = coins >= item.price;
          const isSelected = selected === item.id;
          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => affordable && setSelected(item.id)}
              className={clsx("rounded-xl p-3 shadow-md transition-all cursor-pointer bg-white", {
                "opacity-50 cursor-not-allowed": !affordable,
                "ring-4 ring-pink-300": isSelected,
                "hover:shadow-lg": affordable,
              })}
            >
              <div className='aspect-square overflow-hidden rounded-lg bg-pink-50 mb-2 flex items-center justify-center'>
                <img
                  src={item.image}
                  alt={item.name}
                  className='w-20 h-20 object-contain'
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/150?text=Item";
                  }}
                />
              </div>
              <div className='space-y-1 text-center'>
                <h3 className='text-md font-bold text-gray-800'>{item.name}</h3>
                <div className='text-sm text-gray-500 capitalize'>{item.type}</div>
                <div className='text-yellow-600 font-semibold'>{item.price} ✨</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* buy button */}
      <div className='mt-6 flex justify-center'>
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

      {/* success message */}
      {showSuccess && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className='fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-5 py-3 rounded-full shadow-lg'>
          Purchase successful! 🎉
        </motion.div>
      )}
    </div>
  );
}
