import { useEffect, useState, useRef } from "react";
import { Play, Coins, Store, Target, ShoppingBag } from "lucide-react";
import garden from "../../assets/garden.png";
import { ShopItem } from "./PetShop";
import { Dispatch, SetStateAction } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { getTasks, getChildCoins } from "../../lib/api";
import { Task } from "../../lib/types";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const STATS = {
  MAX: 4,
  MIN: 0,
} as const;

const IMAGES = {
  bar: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561857600/virtual%20pet/item-box.png",
  donut: {
    4: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561725898/virtual%20pet/h1.png",
    3: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561725898/virtual%20pet/h2.png",
    2: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561725898/virtual%20pet/h3.png",
    1: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561725898/virtual%20pet/h4.png",
  } as const,
  star: {
    4: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561725934/virtual%20pet/s1.png",
    3: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561725934/virtual%20pet/s2.png",
    2: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561725934/virtual%20pet/s3.png",
    1: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561725934/virtual%20pet/s4.png",
  } as const,
  heart: {
    4: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561725918/virtual%20pet/l1.png",
    3: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561725919/virtual%20pet/l2.png",
    2: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561725919/virtual%20pet/l3.png",
    1: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561725919/virtual%20pet/l4.png",
  } as const,
  games: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561857776/virtual%20pet/gamesbox.png",
  pill: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561857719/virtual%20pet/medicene.png",
  drink: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561857689/virtual%20pet/red-smoothie.png",
  food: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561857661/virtual%20pet/sandwich.png",
  benny: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561677299/virtual%20pet/Sheet.png",
} as const;

const SOUNDS = {
  munch: "https://res.cloudinary.com/dytmcam8b/video/upload/v1562342736/sounds/zapsplat_human_eat_biscuit_mouth_closed_28532.mp3",
  slurp: "https://res.cloudinary.com/dytmcam8b/video/upload/v1562342736/sounds/zapsplat_human_drink_from_glass_slurp_single_21665.mp3",
  laugh: "https://res.cloudinary.com/dytmcam8b/video/upload/v1562343433/sounds/zapsplat_human_male_middle_aged_laugh_slightly_sinister_003_32379.mp3",
  pill: "https://res.cloudinary.com/dytmcam8b/video/upload/v1562343433/sounds/noisecreations_SFX-NCFREE02_Synth-Swell.mp3",
  groan: "https://res.cloudinary.com/dytmcam8b/video/upload/v1562344222/sounds/zapsplat_human_breath_last_dying_003_15986.mp3",
  hello: "https://res.cloudinary.com/dytmcam8b/video/upload/v1562343433/sounds/zapsplat_human_male_middle_aged_says_hello_002_15455.mp3",
} as const;

export type Stat = {
  hunger: number;
  happiness: number;
  energy: number;
};

export type Accessory = {
  id: string;
  name: string;
  image: string;
  type: "hat" | "shirt";
};

export interface Pet {
  name: string;
  type: string;
  level: number;
  xp: number;
  stats: {
    hunger: number;
    happiness: number;
    energy: number;
  };
  accessories: ShopItem[];
  scale?: number;
}

interface VirtualPetProps {
  animal?: Pet;
  onFeed?: () => void;
  onPlay?: () => void;
  onSleep?: () => void;
  onResetHunger?: () => void;
  onResetHappiness?: () => void;
  onResetEnergy?: () => void;
  setAnimal?: Dispatch<SetStateAction<Pet>>;
}

function Benny() {
  return (
    <div
      style={{
        width: 329,
        height: 447,
        background: "url(https://res.cloudinary.com/dytmcam8b/image/upload/v1561677299/virtual%20pet/Sheet.png) 0 0",
        zIndex: 2000,
        animation: "moveX 1.5s steps(10) infinite",
      }}
    />
  );
}

export default function VirtualPet({ animal: propAnimal, onFeed = () => {}, onPlay = () => {}, onSleep = () => {}, onResetHunger, onResetHappiness, onResetEnergy, setAnimal: propSetAnimal }: VirtualPetProps) {
  // Internal state management
  const [animal, setAnimal] = useState<Pet>({
    name: "Benny",
    type: "Cute Pet",
    level: 1,
    xp: 0,
    stats: { hunger: 75, happiness: 75, energy: 75 },
    accessories: [],
  });

  // Use prop animal if provided, otherwise use internal state
  const currentAnimal = propAnimal || animal;
  const currentSetAnimal = propSetAnimal || setAnimal;

  // Load pet from localStorage on mount
  useEffect(() => {
    const savedPet = localStorage.getItem("pet");
    if (savedPet) {
      try {
        const parsedPet = JSON.parse(savedPet);
        setAnimal(parsedPet);
      } catch (error) {
        console.error("Failed to parse saved pet:", error);
      }
    }
  }, []);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const childId = user?.id;
  const token = localStorage.getItem("token") || "";
  const [timeAlive, setTimeAlive] = useState(0);
  const [isDead, setIsDead] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [timeoutMessage, setTimeoutMessage] = useState("");
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [totalCoins, setTotalCoins] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const [localHunger, setLocalHunger] = useState(currentAnimal.stats.hunger);
  const [localHappiness, setLocalHappiness] = useState(currentAnimal.stats.happiness);
  const [localEnergy, setLocalEnergy] = useState(currentAnimal.stats.energy);

  // Update local stats when animal stats change
  useEffect(() => {
    setLocalHunger(currentAnimal.stats.hunger);
    setLocalHappiness(currentAnimal.stats.happiness);
    setLocalEnergy(currentAnimal.stats.energy);
  }, [currentAnimal.stats.hunger, currentAnimal.stats.happiness, currentAnimal.stats.energy]);

  // Save animal stats to localStorage when they change
  useEffect(() => {
    localStorage.setItem("pet", JSON.stringify(currentAnimal));
  }, [currentAnimal]);

  // Load pet from localStorage on component mount
  useEffect(() => {
    const savedPet = localStorage.getItem("pet");
    if (savedPet) {
      try {
        const parsedPet = JSON.parse(savedPet);
        currentSetAnimal?.(parsedPet);
      } catch (error) {
        console.error("Failed to parse saved pet:", error);
      }
    }
  }, [currentSetAnimal]);
  const [flyingIcon, setFlyingIcon] = useState<null | {
    type: "donut" | "star" | "heart";
    src: string;
    style: React.CSSProperties;
  }>(null);
  const feedBtnRef = useRef<HTMLButtonElement | null>(null);
  const playBtnRef = useRef<HTMLButtonElement | null>(null);
  const healBtnRef = useRef<HTMLButtonElement | null>(null);
  const donutStatRef = useRef<HTMLDivElement | null>(null);
  const starStatRef = useRef<HTMLDivElement | null>(null);
  const heartStatRef = useRef<HTMLDivElement | null>(null);
  const [showAddedDonut, setShowAddedDonut] = useState(false);
  const [showAddedStar, setShowAddedStar] = useState(false);
  const [showAddedHeart, setShowAddedHeart] = useState(false);
  const addedTimeouts = useRef<{ donut?: NodeJS.Timeout; star?: NodeJS.Timeout; heart?: NodeJS.Timeout }>({});
  const isAllStatsEmpty = currentAnimal.stats.hunger <= 0 && currentAnimal.stats.happiness <= 0 && currentAnimal.stats.energy <= 0;
  const [petScale, setPetScale] = useState(currentAnimal.scale ?? 0.5);

  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [filledCount, setFilledCount] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState<ShopItem[]>([]);
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);
  const [showProgressComplete, setShowProgressComplete] = useState(false);
  const [localAnimal, setLocalAnimal] = useState(animal);

  const initialLastTaskTime = () => {
    const stored = localStorage.getItem("lastTaskTime");
    return stored ? parseInt(stored) : Date.now();
  };

  const [lastTaskTime, setLastTaskTime] = useState(initialLastTaskTime());
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);

  const checkTaskTimeout = async () => {
    try {
      const tasks = await getTasks(token, childId);
      const uncompletedTasks = tasks.filter((task: Task) => !task.completed);
      if (uncompletedTasks.length === 0) return;

      const latestTask = uncompletedTasks.reduce((latest: Task, task: Task) => (task._id > latest._id ? task : latest));

      // check if the warning has been shown
      const hasSeenWarning = localStorage.getItem("hasSeenInactivityWarning");
      if (hasSeenWarning) return;

      // mark that the warning has been shown
      localStorage.setItem("hasSeenInactivityWarning", "true");

      currentSetAnimal?.(prev => {
        const newStats = {
          hunger: Math.max(0, prev.stats.hunger - 10),
          happiness: Math.max(0, prev.stats.happiness - 10),
          energy: Math.max(0, prev.stats.energy - 10),
        };
        setLocalHunger(newStats.hunger);
        setLocalHappiness(newStats.happiness);
        setLocalEnergy(newStats.energy);
        return { ...prev, stats: newStats };
      });

      setTimeoutMessage("Your pet's stats dropped because a task wasn't completed in time!");
      setShowTimeoutModal(true);
    } catch (error) {
      console.error("❌ Failed to check task time:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      checkTaskTimeout();
    }, 30000); // every 30 seconds

    return () => clearInterval(interval); // cleanup
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const lastTimeStr = localStorage.getItem("lastTaskTime");
      const last = lastTimeStr ? parseInt(lastTimeStr) : Date.now();
      const now = Date.now();
      const diff = now - last;

      if (diff > 60000) {
        currentSetAnimal?.(prev => ({
          ...prev,
          stats: {
            hunger: Math.max(0, prev.stats.hunger - 1),
            happiness: Math.max(0, prev.stats.happiness - 1),
            energy: Math.max(0, prev.stats.energy - 1),
          },
        }));
      }
    }, 60000); // every minute

    return () => clearInterval(interval);
  }, []);

  const maxScale = 5;

  useEffect(() => {
    // Initialize audio elements
    const audioElements: Record<string, HTMLAudioElement> = {};
    Object.entries(SOUNDS).forEach(([key, url]) => {
      audioElements[key] = new Audio(url); // initialize audio elements
    });
    audioRefs.current = audioElements;

    // play hello sound after 4 seconds
    const greeting = setTimeout(() => {
      audioRefs.current.hello?.play().catch(() => {
        // Handle audio play error silently
      });
    }, 4000);

    return () => {
      clearTimeout(greeting);
    };
  }, []);

  useEffect(() => {
    if (isDead) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      audioRefs.current.groan?.play().catch(() => {});
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeAlive(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isDead]);

  useEffect(() => {
    if (currentAnimal.stats.hunger <= 0 || currentAnimal.stats.happiness <= 0 || currentAnimal.stats.energy <= 0) {
      setIsDead(true);
    }
  }, [currentAnimal.stats]);

  useEffect(() => {
    setLocalHunger(currentAnimal.stats.hunger);
    setLocalHappiness(currentAnimal.stats.happiness);
    setLocalEnergy(currentAnimal.stats.energy);
  }, [currentAnimal.stats.hunger, currentAnimal.stats.happiness, currentAnimal.stats.energy]);

  useEffect(() => {
    localStorage.setItem("petScale", petScale.toString());
  }, [petScale]);

  useEffect(() => {
    // Load purchased items from localStorage
    const savedItems = JSON.parse(localStorage.getItem("purchasedItems") || "[]") as ShopItem[];
    console.log("Loaded items:", savedItems); // Debug log
    setPurchasedItems(savedItems);
  }, []);

  // Simple coin management - load from localStorage and update on events
  useEffect(() => {
    const loadCoins = async () => {
      // Get coins directly from server
      try {
        if (token && childId) {
          const coinsData = await getChildCoins(token, childId);
          console.log("🪙 VirtualPet - coins from server:", coinsData.coins);
          setTotalCoins(coinsData.coins);
          localStorage.setItem("currentCoins", coinsData.coins.toString());
        }
      } catch (serverError) {
        console.error("Failed to get coins from server, falling back to calculation:", serverError);
        // Fallback to old calculation method
        try {
          const tasks = await getTasks(token, childId);
          const totalCoins = tasks.filter((task: Task) => task.approved).reduce((sum: number, task: Task) => sum + task.reward, 0);
          const spentCoins = parseInt(localStorage.getItem("spentCoins") || "0");
          const availableCoins = totalCoins - spentCoins;
          setTotalCoins(availableCoins);
          localStorage.setItem("currentCoins", availableCoins.toString());
          console.log("🪙 VirtualPet - Calculated coins (fallback):", availableCoins);
        } catch (error) {
          console.error("Failed to calculate coins:", error);
        }
      }
    };

    // Listen for coin updates
    const handleCoinUpdate = async () => {
      await loadCoins();
    };

    // Listen for visibility changes to refresh coins when returning to page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("VirtualPet page became visible, refreshing coins...");
        loadCoins();
      }
    };

    loadCoins();

    window.addEventListener("coinsUpdated", handleCoinUpdate);
    window.addEventListener("taskCompleted", handleCoinUpdate);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Set up interval to update coins every 5 seconds
    const interval = setInterval(() => {
      loadCoins();
    }, 5000);

    return () => {
      window.removeEventListener("coinsUpdated", handleCoinUpdate);
      window.removeEventListener("taskCompleted", handleCoinUpdate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [token, childId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimer) {
        clearInterval(inactivityTimer);
      }
    };
  }, [inactivityTimer]);

  const flyToStat = (btnRef: React.RefObject<HTMLButtonElement | null>, statRef: React.RefObject<HTMLDivElement | null>, type: "donut" | "star" | "heart", src: string) => {
    if (!btnRef.current || !statRef.current) return;
    const btnRect = btnRef.current.getBoundingClientRect();
    const statRect = statRef.current.getBoundingClientRect();
    const iconSize = 40;
    setFlyingIcon({
      type,
      src,
      style: {
        position: "fixed",
        left: btnRect.left + btnRect.width / 2 - iconSize / 2,
        top: btnRect.top + btnRect.height / 2 - iconSize / 2,
        width: iconSize,
        height: iconSize,
        zIndex: 9999,
        pointerEvents: "none",
        transition: "transform 0.7s cubic-bezier(.4,2,.6,1)",
        transform: `translate(${statRect.left + statRect.width / 2 - (btnRect.left + btnRect.width / 2)}px, ${statRect.top + statRect.height / 2 - (btnRect.top + btnRect.height / 2)}px)`,
      },
    });
    setTimeout(() => setFlyingIcon(null), 700);
  };

  const donutLevel = Math.max(1, Math.min(4, Math.ceil(localHunger / 25))) as unknown as keyof typeof IMAGES.donut;
  const starLevel = Math.max(1, Math.min(4, Math.ceil(localHappiness / 25))) as unknown as keyof typeof IMAGES.star;
  const heartLevel = Math.max(1, Math.min(4, Math.ceil(localEnergy / 25))) as unknown as keyof typeof IMAGES.heart;

  useEffect(() => {
    const maxIcons = [donutLevel === 4, starLevel === 4, heartLevel === 4].filter(Boolean).length;
    const progress = maxIcons > 0 ? (maxIcons / 3) * 100 : 0;
    setDisplayedProgress(progress);

    // When progress reaches 100%, show progress complete first
    if (progress === 100 && !showProgressComplete) {
      setShowProgressComplete(true);

      // After 1 second, show success badge
      setTimeout(() => {
        setShowSuccessBadge(true);
      }, 1000);
    }
  }, [donutLevel, starLevel, heartLevel]);

  const handleNextLevel = () => {
    const newScale = Math.min(petScale + 0.05, maxScale);
    setPetScale(newScale);

    // Reset all stats to start new level
    currentSetAnimal?.(prev => ({
      ...prev,
      level: prev.level + 1,
      scale: newScale,
      stats: {
        hunger: 0,
        happiness: 0,
        energy: 0,
      },
    }));

    // Play a success sound
    audioRefs.current.laugh?.play().catch(() => {});

    // Hide modals
    setShowSuccessBadge(false);
    setShowProgressComplete(false);

    // Reset inactivity timer
    setLastTaskTime(Date.now());
  };

  const handleFeed = () => {
    setIsFeeding(true);
    onFeed();
    audioRefs.current.munch?.play().catch(() => {});
    setTimeout(() => setIsFeeding(false), 1000);
    setIsMenuOpen(false);
    flyToStat(feedBtnRef, donutStatRef, "donut", IMAGES.donut[donutLevel]);
    setShowAddedDonut(true);
    setTimeout(() => setShowAddedDonut(false), 700);
    setLastTaskTime(Date.now());

    // Update local stats
    const newHunger = Math.min(100, localHunger + 25);
    setLocalHunger(newHunger);

    // Update animal stats
    currentSetAnimal?.(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        hunger: newHunger,
      },
    }));
  };

  const handleDrink = () => {
    setIsFeeding(true);
    onFeed();
    audioRefs.current.slurp?.play().catch(() => {});
    setTimeout(() => setIsFeeding(false), 1000);
    setIsMenuOpen(false);
    flyToStat(feedBtnRef, donutStatRef, "donut", IMAGES.donut[donutLevel]);
    setShowAddedDonut(true);
    setTimeout(() => setShowAddedDonut(false), 700);
    setLastTaskTime(Date.now());

    // Update local stats
    const newHunger = Math.min(100, localHunger + 15);
    setLocalHunger(newHunger);

    // Update animal stats
    currentSetAnimal?.(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        hunger: newHunger,
      },
    }));
  };

  const handleHeal = () => {
    setIsHealing(true);
    onSleep();
    const pillAudio = audioRefs.current.pill;
    if (pillAudio) {
      pillAudio.currentTime = 0;
      pillAudio.play().catch(() => {});
    }
    setTimeout(() => setIsHealing(false), 1000);
    setIsMenuOpen(false);
    flyToStat(healBtnRef, heartStatRef, "heart", IMAGES.heart[heartLevel]);
    setShowAddedHeart(true);
    setTimeout(() => setShowAddedHeart(false), 700);
    setLastTaskTime(Date.now());

    // Update local stats
    const newEnergy = Math.min(100, localEnergy + 25);
    setLocalEnergy(newEnergy);

    // Update animal stats
    currentSetAnimal?.(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        energy: newEnergy,
      },
    }));
  };

  const handlePlay = () => {
    setIsPlaying(true);
    onPlay();
    const laughAudio = audioRefs.current.laugh;
    if (laughAudio) {
      laughAudio.currentTime = 0;
      laughAudio.play().catch(() => {});
    }
    setTimeout(() => setIsPlaying(false), 1000);
    setIsMenuOpen(false);
    flyToStat(playBtnRef, starStatRef, "star", IMAGES.star[starLevel]);
    setShowAddedStar(true);
    setTimeout(() => setShowAddedStar(false), 700);
    setLastTaskTime(Date.now());

    // Update local stats
    const newHappiness = Math.min(100, localHappiness + 25);
    setLocalHappiness(newHappiness);

    // Update animal stats
    currentSetAnimal?.(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        happiness: newHappiness,
      },
    }));
  };
  const handleDismissWarning = () => {
    console.log("👋 Got it clicked");

    setShowTimeoutModal(false);
  };

  const handleRestart = () => {
    setTimeAlive(0);
    setIsDead(false);
    audioRefs.current.hello?.play().catch(() => {});
    setLastTaskTime(Date.now()); // Reset inactivity timer
  };

  const handleResetHungerLocal = () => {
    if (onResetHunger) {
      onResetHunger();
    } else {
      setLocalHunger(0);
    }
    setLastTaskTime(Date.now()); // Reset inactivity timer
  };

  const handleResetHappinessLocal = () => {
    if (onResetHappiness) {
      onResetHappiness();
    } else {
      setLocalHappiness(0);
    }
    setLastTaskTime(Date.now()); // Reset inactivity timer
  };

  const handleResetEnergyLocal = () => {
    if (onResetEnergy) {
      onResetEnergy();
    } else {
      setLocalEnergy(0);
    }
    setLastTaskTime(Date.now()); // Reset inactivity timer
  };

  const hungerPercent = Math.max(0, Math.min(100, (currentAnimal.stats.hunger / STATS.MAX) * 100));

  const handleUseItem = (item: ShopItem) => {
    // Remove one item from inventory first
    const itemIndex = purchasedItems.findIndex(i => i.id === item.id);
    if (itemIndex !== -1) {
      const updatedItems = [...purchasedItems];
      updatedItems.splice(itemIndex, 1);
      setPurchasedItems(updatedItems);
      localStorage.setItem("purchasedItems", JSON.stringify(updatedItems));
    }

    // Handle the item based on its type
    switch (item.type) {
      case "food":
        handleFeed();
        break;
      case "toy":
        handlePlay();
        break;
      case "energy":
        handleHeal();
        break;
      case "accessory":
        // Toggle accessory
        const currentAccessories = currentAnimal.accessories || [];
        const isWearing = currentAccessories.some(acc => acc.id === item.id);

        let newAccessories;
        if (isWearing) {
          // Remove accessory - add back to inventory
          newAccessories = currentAccessories.filter(acc => acc.id !== item.id);
          const updatedItems = [...purchasedItems, item];
          setPurchasedItems(updatedItems);
          localStorage.setItem("purchasedItems", JSON.stringify(updatedItems));
        } else {
          // Add accessory
          newAccessories = [...currentAccessories, item];
        }

        // Update localStorage
        const updatedPet = {
          ...currentAnimal,
          accessories: newAccessories,
        };
        localStorage.setItem("pet", JSON.stringify(updatedPet));

        // Update state
        currentSetAnimal?.(updatedPet);
        setLastTaskTime(Date.now()); // Reset inactivity timer
        break;
    }
  };

  const handleRemoveAccessory = (accessory: ShopItem) => {
    // Remove accessory from pet
    const updatedAccessories = currentAnimal.accessories.filter(acc => acc.id !== accessory.id);
    const updatedPet = {
      ...currentAnimal,
      accessories: updatedAccessories,
    };

    // Update localStorage
    localStorage.setItem("pet", JSON.stringify(updatedPet));
    currentSetAnimal?.(updatedPet);

    // Add item back to inventory
    const updatedItems = [...purchasedItems, accessory];
    setPurchasedItems(updatedItems);
    localStorage.setItem("purchasedItems", JSON.stringify(updatedItems));
  };

  const itemCounts: { [id: string]: number } = {};
  purchasedItems.forEach(item => {
    if (!itemCounts[item.id]) {
      itemCounts[item.id] = 1;
    } else {
      itemCounts[item.id]++;
    }
  });

  const handleRefreshCoins = async () => {
    try {
      if (token && childId) {
        const coinsData = await getChildCoins(token, childId);
        console.log("🪙 VirtualPet - manually refreshed coins:", coinsData.coins);
        setTotalCoins(coinsData.coins);
        localStorage.setItem("currentCoins", coinsData.coins.toString());
      }
    } catch (error) {
      console.error("Failed to manually refresh coins:", error);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#87d4ee] via-[#f9a8d4] to-[#ffd986] flex flex-col items-center justify-start relative overflow-hidden'>
      {/* Background decorations */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <motion.div className='absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full' animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className='absolute top-40 right-20 w-16 h-16 bg-white/20 rounded-full' animate={{ y: [0, 15, 0], scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
        <motion.div className='absolute bottom-20 left-1/4 w-24 h-24 bg-white/20 rounded-full' animate={{ y: [0, -10, 0], rotate: [0, -180, -360] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
      </div>

      {/* Header */}
      <div className='w-full flex items-center justify-between px-6 pt-8 z-10'>
        <div className='flex items-center gap-4'>
          <div>
            <h1 className='text-2xl font-bold text-white drop-shadow-lg'>My Pet - {currentAnimal.name} 🐾</h1>
            <p className='text-white/90 text-sm'>Take care of your virtual friend!</p>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          {/* Navigation tabs */}
          <div className='bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg'>
            <div className='flex gap-2'>
              <motion.button onClick={() => navigate("/kid/dashboard")} className='flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all text-gray-600 hover:text-gray-800 text-sm' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Target className='w-4 h-4' />
                Tasks
              </motion.button>
              <motion.button className='flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-[#ffd986] to-[#ffbacc] text-white shadow-lg text-sm' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Play className='w-4 h-4' />
                My Pet
              </motion.button>
              <motion.button onClick={() => navigate("/kid/shop")} className='flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all text-gray-600 hover:text-gray-800 text-sm' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <ShoppingBag className='w-4 h-4' />
                Shop
              </motion.button>
            </div>
          </div>

          <motion.div className='bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg flex items-center gap-2' whileHover={{ scale: 1.05 }}>
            <Coins className='w-5 h-5 text-yellow-500' />
            <span className='font-bold text-lg text-gray-800'>{totalCoins}</span>
          </motion.div>

          {/* Inventory */}
          <Popover>
            <PopoverTrigger asChild>
              <motion.button className='bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg hover:bg-white transition-colors relative' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Store className='w-5 h-5 text-gray-600' />
                {Object.keys(itemCounts).length > 0 && <span className='absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>{Object.values(itemCounts).reduce((sum, count) => sum + count, 0)}</span>}
              </motion.button>
            </PopoverTrigger>
            <PopoverContent className='w-80 bg-white border border-gray-200 shadow-lg'>
              <div className='p-4'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                    <Store className='h-5 w-5' />
                    My Inventory
                  </h3>
                  <span className='text-sm text-gray-500'>{Object.values(itemCounts).reduce((sum, count) => sum + count, 0)} items</span>
                </div>

                {Object.keys(itemCounts).length === 0 ? (
                  <div className='text-center py-8 text-gray-500'>
                    <div className='text-4xl mb-2'>📦</div>
                    <p>Your inventory is empty</p>
                    <p className='text-sm'>Buy some items to see them here!</p>
                  </div>
                ) : (
                  <div className='space-y-3 max-h-60 overflow-y-auto'>
                    {Object.entries(itemCounts).map(([id, count]) => {
                      const item = purchasedItems.find(i => i.id === id);
                      if (!item) return null;
                      return (
                        <div key={item.id} className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                          <div className='w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center relative'>
                            <span className='absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow'>×{count}</span>
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
                      );
                    })}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Main pet board - full width */}
      <div className='w-full flex flex-col items-center justify-center mt-6 z-10'>
        <div className='bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg w-full flex flex-col items-center' style={{ minHeight: "calc(100vh - 100px)" }}>
          {/* Garden background */}
          <div
            className='w-full h-full absolute inset-0 rounded-2xl overflow-hidden'
            style={{
              backgroundImage: `url(${garden})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Progress bar */}
          <div className='absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95vw] sm:w-[80vw] md:w-[60vw] lg:w-[40vw] xl:w-[30vw]'>
            <div className='w-full bg-gray-200 rounded-full h-2 sm:h-3 md:h-4 lg:h-5 overflow-hidden shadow-inner relative'>
              <div className='bg-green-400 h-full transition-all duration-300 ease-in-out' style={{ width: `${displayedProgress}%` }} />
              <div className='absolute inset-0 flex items-center justify-center text-[2.5vw] sm:text-[2vw] md:text-[1.5vw] lg:text-[1vw] font-bold text-gray-700'>Completion: {Math.round(displayedProgress)}%</div>
            </div>
          </div>

          {/* Level indicator */}
          <div className='absolute top-4 left-4 z-50 bg-white/90 border border-yellow-400 rounded-xl px-2 py-2 shadow-lg'>
            <span className='text-gray-800 font-bold text-lg'>Level {currentAnimal.level}</span>
          </div>

          {/* Main board - with dynamic height */}
          <div className='flex-1 relative mx-auto my-4 max-w-[90vw] h-[calc(100vh-200px)] lg:max-w-[800px] lg:h-[calc(100vh-250px)]'>
            {/* Static stats bar */}
            <div
              className='absolute left-1/2 top-8 -translate-x-1/2 z-10 
                            bg-blue-100 border-4 border-amber-700 rounded-xl 
                            shadow-lg flex items-center gap-6 px-8 py-2 min-w-[300px]'
            >
              <div className='stat-icon-container' ref={donutStatRef} style={{ position: "relative" }}>
                <img src={IMAGES.donut[donutLevel]} alt='doughnut' className='stat-icon' />
                {isFeeding && <img src={IMAGES.donut[donutLevel]} alt='doughnut fill' className='stat-icon-fill' />}
                {showAddedDonut && <img src={IMAGES.donut[donutLevel]} alt='doughnut added' className='stat-icon-added' />}
              </div>
              <div className='stat-icon-container' ref={starStatRef} style={{ position: "relative" }}>
                <img src={IMAGES.star[starLevel]} alt='star' className='stat-icon' />
                {isPlaying && <img src={IMAGES.star[starLevel]} alt='star fill' className='stat-icon-fill' />}
                {showAddedStar && <img src={IMAGES.star[starLevel]} alt='star added' className='stat-icon-added' />}
              </div>
              <div className='stat-icon-container' ref={heartStatRef} style={{ position: "relative" }}>
                <img src={IMAGES.heart[heartLevel]} alt='heart' className='stat-icon' />
                {isHealing && <img src={IMAGES.heart[heartLevel]} alt='heart fill' className='stat-icon-fill' />}
                {showAddedHeart && <img src={IMAGES.heart[heartLevel]} alt='heart added' className='stat-icon-added' />}
              </div>
            </div>

            {/* Pet in the center */}
            <div className='absolute left-1/2 top-32 -translate-x-1/2 z-10' style={{ transition: "transform 0.5s cubic-bezier(.4,2,.6,1)", transform: `scale(${petScale})` }}>
              <div className='relative'>
                <Benny />
                {/* Display accessories */}
                {currentAnimal.accessories &&
                  currentAnimal.accessories.map(accessory => (
                    <div key={accessory.id} className='absolute top-0 left-0 w-full h-full cursor-pointer' style={{ zIndex: 1 }} onClick={() => handleRemoveAccessory(accessory)} title={`Click to remove ${accessory.name}`}>
                      <img src={accessory.image} alt={accessory.name} className='w-full h-full object-contain' />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Buttons row */}
          <div className='bg-transparent border-gray-200 p-0 z-0'>
            <div className='flex justify-center items-center gap-4 sm:gap-8 max-w-md mx-auto'>
              <button ref={playBtnRef} onClick={handlePlay} className='flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/80 transition-all transform hover:scale-105 touch-manipulation' title='משחק'>
                <img src={IMAGES.games} alt='toy box' className='w-12 h-12 sm:w-16 sm:h-16' />
                <span className='text-xs sm:text-sm font-medium text-gray-700'>Game</span>
              </button>

              <button ref={feedBtnRef} onClick={handleFeed} className='flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/80 transition-all transform hover:scale-105 touch-manipulation' title='אוכל'>
                <img src={IMAGES.food} alt='sandwich' className='w-12 h-12 sm:w-16 sm:h-16' />
                <span className='text-xs sm:text-sm font-medium text-gray-700'>Food</span>
              </button>

              <button onClick={handleDrink} className='flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/80 transition-all transform hover:scale-105 touch-manipulation' title='שתייה'>
                <img src={IMAGES.drink} alt='smoothie' className='w-12 h-12 sm:w-16 sm:h-16' />
                <span className='text-xs sm:text-sm font-medium text-gray-700'>Drink</span>
              </button>

              <button ref={healBtnRef} onClick={handleHeal} className='flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/80 transition-all transform hover:scale-105 touch-manipulation' title='תרופה'>
                <img src={IMAGES.pill} alt='pill' className='w-12 h-12 sm:w-16 sm:h-16' />
                <span className='text-xs sm:text-sm font-medium text-gray-700'>Energy</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Flying icon */}
      {flyingIcon && <img src={flyingIcon.src} style={flyingIcon.style} alt='flying icon' />}

      {/* Success Modal */}
      {showSuccessBadge && (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center'>
          <div className='bg-white rounded-xl p-8 shadow-2xl text-center animate-scale-in'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8 text-green-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
              </svg>
            </div>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>Level Up! 🎉</h2>
            <h1 className='text-3xl font-bold text-green-600 mb-4'>100% Complete! 🎯</h1>
            <p className='text-gray-600 mb-6'>Your pet has grown stronger!</p>
            <button onClick={handleNextLevel} className='bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl'>
              Start Next Level
            </button>
          </div>
        </div>
      )}
      {showTimeoutModal && (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center'>
          <div className='bg-white rounded-xl p-8 shadow-2xl text-center animate-scale-in'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8 text-red-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z' />
              </svg>
            </div>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>Oops!</h2>
            <p className='text-gray-600 mb-6'>Your pet's stats dropped because you didn't complete a task in time.</p>
            <button onClick={handleDismissWarning} className='mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow'>
              Got it
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
