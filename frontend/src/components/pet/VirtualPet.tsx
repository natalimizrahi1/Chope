import React, { useState, useEffect, useRef } from "react";
import { Play, Coins, Store, Target, ShoppingBag, LogOut } from "lucide-react";
import garden from "../../assets/garden.png";
import { Dispatch, SetStateAction } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { getTasks, getChildCoins, spendCoinsOnPetCare, getChildItems, useChildItem, removeChildItem } from "../../lib/api";
import { Task, ShopItem, PurchasedItem } from "../../lib/types";
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
  sleep: "https://res.cloudinary.com/dytmcam8b/image/upload/v1561857719/virtual%20pet/sleep.png",
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
  accessories: PurchasedItem[];
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
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const childId = user?.id;
  const token = localStorage.getItem("token") || "";

  // Internal state management - ONLY ONE STATE FOR THE PET
  const [animal, setAnimal] = useState<Pet>({
    name: "Benny",
    type: "Cute Pet",
    level: 1,
    xp: 0,
    stats: { hunger: 0, happiness: 0, energy: 0 },
    accessories: [],
    scale: 0.7,
  });

  // Use prop animal if provided, otherwise use internal state
  const currentAnimal = propAnimal || animal;
  const currentSetAnimal = propSetAnimal || setAnimal;

  // Track if we've loaded from localStorage to prevent overwriting
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  // Load pet from localStorage on mount - ONLY ONCE
  useEffect(() => {
    if (!childId) return; // Don't load if no user is logged in

    const petKey = `pet_${childId}`;
    const savedPet = localStorage.getItem(petKey);
    console.log("🦖 Loading pet from localStorage:", savedPet); // Debug log

    if (savedPet) {
      try {
        const parsedPet = JSON.parse(savedPet);
        // Ensure pet always has fixed scale
        const petWithFixedScale = {
          ...parsedPet,
          scale: 0.7,
        };
        console.log("🦖 Setting pet from localStorage:", petWithFixedScale); // Debug log
        currentSetAnimal(petWithFixedScale);
        setHasLoadedFromStorage(true);
      } catch (error) {
        console.error("Failed to parse saved pet:", error);
        setHasLoadedFromStorage(true);
      }
    } else {
      console.log("🦖 No saved pet found, using default"); // Debug log
      setHasLoadedFromStorage(true);
    }
  }, [childId]); // Run when childId changes

  // Save pet to localStorage whenever it changes - ONLY ONE PLACE TO SAVE
  useEffect(() => {
    if (currentAnimal && childId && hasLoadedFromStorage) {
      const petKey = `pet_${childId}`;
      localStorage.setItem(petKey, JSON.stringify(currentAnimal));
      console.log("🦖 Saved pet to localStorage:", currentAnimal); // Debug log
    } else if (!hasLoadedFromStorage) {
      console.log("🦖 Not saving yet - still loading from storage");
    }
  }, [currentAnimal, childId, hasLoadedFromStorage]);
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

  const [flyingIcon, setFlyingIcon] = useState<null | {
    type: "donut" | "star" | "heart";
    src: string;
    style: React.CSSProperties;
  }>(null);
  const feedBtnRef = useRef<HTMLButtonElement | null>(null);
  const playBtnRef = useRef<HTMLButtonElement | null>(null);
  const healBtnRef = useRef<HTMLButtonElement | null>(null);
  const sleepBtnRef = useRef<HTMLButtonElement | null>(null);
  const donutStatRef = useRef<HTMLDivElement | null>(null);
  const starStatRef = useRef<HTMLDivElement | null>(null);
  const heartStatRef = useRef<HTMLDivElement | null>(null);
  const [showAddedDonut, setShowAddedDonut] = useState(false);
  const [showAddedStar, setShowAddedStar] = useState(false);
  const [showAddedHeart, setShowAddedHeart] = useState(false);
  const [petScale, setPetScale] = useState(0.7);

  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState<PurchasedItem[]>([]);
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);
  const [showProgressComplete, setShowProgressComplete] = useState(false);

  const initialLastTaskTime = () => {
    if (!childId) return Date.now();
    const stored = localStorage.getItem(`lastTaskTime_${childId}`);
    return stored ? parseInt(stored) : Date.now();
  };

  const [lastTaskTime, setLastTaskTime] = useState(initialLastTaskTime());
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);

  const checkTaskTimeout = async () => {
    try {
      const tasks = await getTasks(token, childId);
      const uncompletedTasks = tasks.filter((task: Task) => !task.completed);
      if (uncompletedTasks.length === 0) return;

      // check if the warning has been shown
      const hasSeenWarning = localStorage.getItem(`hasSeenInactivityWarning_${childId}`);
      if (hasSeenWarning) return;

      // mark that the warning has been shown
      localStorage.setItem(`hasSeenInactivityWarning_${childId}`, "true");

      currentSetAnimal?.(prev => {
        const newStats = {
          hunger: Math.max(0, prev.stats.hunger - 10),
          happiness: Math.max(0, prev.stats.happiness - 10),
          energy: Math.max(0, prev.stats.energy - 10),
        };
        return { ...prev, stats: newStats };
      });

      setTimeoutMessage("Your pet's stats dropped because a task wasn't completed in time!");
      setShowTimeoutModal(true);
      localStorage.setItem(`lastTaskTime_${childId}`, Date.now().toString());
    } catch (error) {
      console.error("❌ Failed to check task time:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      checkTaskTimeout();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!childId) return;

    const interval = setInterval(() => {
      const lastTimeStr = localStorage.getItem(`lastTaskTime_${childId}`);
      const last = lastTimeStr ? parseInt(lastTimeStr) : Date.now();
      const now = Date.now();
      const diff = now - last;

      if (diff > 21600000) {
        currentSetAnimal?.(prev => {
          const newStats = {
            hunger: Math.max(0, prev.stats.hunger - 1),
            happiness: Math.max(0, prev.stats.happiness - 1),
            energy: Math.max(0, prev.stats.energy - 1),
          };
          return {
            ...prev,
            stats: newStats,
          };
        });
        localStorage.setItem(`lastTaskTime_${childId}`, Date.now().toString());
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [childId]);

  // Load petScale from localStorage on mount
  useEffect(() => {
    if (!childId) return;
    const savedScale = localStorage.getItem(`petScale_${childId}`);
    if (savedScale) {
      setPetScale(parseFloat(savedScale));
    }
  }, [childId]);

  // Save petScale to localStorage when it changes
  useEffect(() => {
    if (childId) {
      localStorage.setItem(`petScale_${childId}`, petScale.toString());
    }
  }, [petScale, childId]);

  useEffect(() => {
    const audioElements: Record<string, HTMLAudioElement> = {};
    Object.entries(SOUNDS).forEach(([key, url]) => {
      audioElements[key] = new Audio(url);
    });
    audioRefs.current = audioElements;

    // play hello sound after 3 seconds
    const greeting = setTimeout(() => {
      audioRefs.current.hello?.play().catch(() => {});
    }, 3000);

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

  // Load purchased items from database
  useEffect(() => {
    const loadItems = async () => {
      try {
        if (token && childId) {
          const itemsData = await getChildItems(token, childId);
          setPurchasedItems(itemsData.purchasedItems || []);
        }
      } catch (error) {
        console.error("Failed to load items:", error);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `purchasedItems_${childId}`) {
        loadItems();
      }
    };

    // Listen for custom events from shop
    const handleItemsUpdated = () => {
      loadItems();
    };

    loadItems();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("itemsUpdated", handleItemsUpdated);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("itemsUpdated", handleItemsUpdated);
    };
  }, [token, childId]);

  // Simple coin management - load from database and update on events
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
        console.error("Failed to get coins from server:", serverError);
        // Fallback to localStorage if server fails
        const savedCoins = localStorage.getItem("currentCoins");
        if (savedCoins) {
          setTotalCoins(parseInt(savedCoins));
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

  // Use currentAnimal.stats directly - no local state needed
  const donutLevel = Math.max(1, Math.min(4, Math.ceil(currentAnimal.stats.hunger / 25))) as unknown as keyof typeof IMAGES.donut;
  const starLevel = Math.max(1, Math.min(4, Math.ceil(currentAnimal.stats.happiness / 25))) as unknown as keyof typeof IMAGES.star;
  const heartLevel = Math.max(1, Math.min(4, Math.ceil(currentAnimal.stats.energy / 25))) as unknown as keyof typeof IMAGES.heart;

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
    // Keep pet at fixed size - no growth
    setPetScale(0.7);

    // Reset all stats to start new level
    currentSetAnimal?.(prev => {
      const newPet = {
        ...prev,
        level: prev.level + 1,
        scale: 0.7,
        stats: {
          hunger: 0,
          happiness: 0,
          energy: 0,
        },
      };
      console.log("🦖 Level up! New level:", newPet.level, "New stats:", newPet.stats); // Debug log
      return newPet;
    });

    // Play a success sound
    audioRefs.current.laugh?.play().catch(() => {});

    // Hide modals
    setShowSuccessBadge(false);
    setShowProgressComplete(false);

    // Reset inactivity timer
    setLastTaskTime(Date.now());
    if (childId) {
      localStorage.setItem(`lastTaskTime_${childId}`, Date.now().toString());
    }
  };

  const handleFeed = async () => {
    if (totalCoins < 5) {
      alert("You need 5 coins to feed your pet!");
      return;
    }

    try {
      // Spend coins through API
      const result = await spendCoinsOnPetCare(token, childId, "feeding", 5);
      setTotalCoins(result.coins);
      localStorage.setItem("currentCoins", result.coins.toString());

      // Notify other components
      window.dispatchEvent(new CustomEvent("coinsUpdated"));

      setIsFeeding(true);
      onFeed();
      audioRefs.current.munch?.play().catch(() => {});
      setTimeout(() => setIsFeeding(false), 1000);
      setIsMenuOpen(false);
      flyToStat(feedBtnRef, donutStatRef, "donut", IMAGES.donut[donutLevel]);
      setShowAddedDonut(true);
      setTimeout(() => setShowAddedDonut(false), 700);
      setLastTaskTime(Date.now());
      if (childId) {
        localStorage.setItem(`lastTaskTime_${childId}`, Date.now().toString());
      }
      // Update animal stats only
      currentSetAnimal?.(prev => {
        const newPet = {
          ...prev,
          stats: {
            ...prev.stats,
            hunger: Math.min(100, prev.stats.hunger + 25),
          },
        };
        console.log("🦖 Feeding pet - new stats:", newPet.stats); // Debug log
        return newPet;
      });
    } catch (error) {
      console.error("Failed to spend coins on feeding:", error);
      alert("Failed to feed pet. Please try again.");
    }
  };

  const handleDrink = async () => {
    if (totalCoins < 3) {
      alert("You need 3 coins to give your pet a drink!");
      return;
    }

    try {
      // Spend coins through API
      const result = await spendCoinsOnPetCare(token, childId, "drinking", 3);
      setTotalCoins(result.coins);
      localStorage.setItem("currentCoins", result.coins.toString());

      // Notify other components
      window.dispatchEvent(new CustomEvent("coinsUpdated"));

      setIsFeeding(true);
      onFeed();
      audioRefs.current.slurp?.play().catch(() => {});
      setTimeout(() => setIsFeeding(false), 1000);
      setIsMenuOpen(false);
      flyToStat(feedBtnRef, donutStatRef, "donut", IMAGES.donut[donutLevel]);
      setShowAddedDonut(true);
      setTimeout(() => setShowAddedDonut(false), 700);
      setLastTaskTime(Date.now());
      if (childId) {
        localStorage.setItem(`lastTaskTime_${childId}`, Date.now().toString());
      }
      // Update animal stats only
      currentSetAnimal?.(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          hunger: Math.min(100, prev.stats.hunger + 15),
        },
      }));
    } catch (error) {
      console.error("Failed to spend coins on drinking:", error);
      alert("Failed to give pet a drink. Please try again.");
    }
  };

  const handleHeal = async () => {
    if (totalCoins < 6) {
      alert("You need 6 coins to give your pet energy!");
      return;
    }

    try {
      // Spend coins through API
      const result = await spendCoinsOnPetCare(token, childId, "healing", 6);
      setTotalCoins(result.coins);
      localStorage.setItem("currentCoins", result.coins.toString());

      // Notify other components
      window.dispatchEvent(new CustomEvent("coinsUpdated"));

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
      if (childId) {
        localStorage.setItem(`lastTaskTime_${childId}`, Date.now().toString());
      }
      // Update animal stats only
      currentSetAnimal?.(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          energy: Math.min(100, prev.stats.energy + 25),
        },
      }));
    } catch (error) {
      console.error("Failed to spend coins on healing:", error);
      alert("Failed to give pet energy. Please try again.");
    }
  };

  const handlePlay = async () => {
    if (totalCoins < 3) {
      alert("You need 3 coins to play with your pet!");
      return;
    }

    try {
      // Spend coins through API
      const result = await spendCoinsOnPetCare(token, childId, "playing", 3);
      setTotalCoins(result.coins);
      localStorage.setItem("currentCoins", result.coins.toString());

      // Notify other components
      window.dispatchEvent(new CustomEvent("coinsUpdated"));

      setIsFeeding(true);
      onPlay();
      const laughAudio = audioRefs.current.laugh;
      if (laughAudio) {
        laughAudio.currentTime = 0;
        laughAudio.play().catch(() => {});
      }
      setTimeout(() => setIsFeeding(false), 1000);
      setIsMenuOpen(false);
      flyToStat(playBtnRef, starStatRef, "star", IMAGES.star[starLevel]);
      setShowAddedStar(true);
      setTimeout(() => setShowAddedStar(false), 700);
      setLastTaskTime(Date.now());
      if (childId) {
        localStorage.setItem(`lastTaskTime_${childId}`, Date.now().toString());
      }
      // Update animal stats only
      currentSetAnimal?.(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          happiness: Math.min(100, prev.stats.happiness + 25),
        },
      }));
    } catch (error) {
      console.error("Failed to spend coins on playing:", error);
      alert("Failed to play with pet. Please try again.");
    }
  };

  const handleSleep = async () => {
    if (totalCoins < 6) {
      alert("You need 6 coins to let your pet sleep!");
      return;
    }

    try {
      // Spend coins through API
      const result = await spendCoinsOnPetCare(token, childId, "sleeping", 6);
      setTotalCoins(result.coins);
      localStorage.setItem("currentCoins", result.coins.toString());

      // Notify other components
      window.dispatchEvent(new CustomEvent("coinsUpdated"));

      setIsHealing(true);
      onSleep();
      const sleepAudio = audioRefs.current.sleep;
      if (sleepAudio) {
        sleepAudio.currentTime = 0;
        sleepAudio.play().catch(() => {});
      }
      setTimeout(() => setIsHealing(false), 1000);
      setIsMenuOpen(false);
      flyToStat(sleepBtnRef, heartStatRef, "heart", IMAGES.heart[heartLevel]);
      setShowAddedHeart(true);
      setTimeout(() => setShowAddedHeart(false), 700);
      setLastTaskTime(Date.now());
      if (childId) {
        localStorage.setItem(`lastTaskTime_${childId}`, Date.now().toString());
      }
      // Update animal stats only
      currentSetAnimal?.(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          energy: Math.min(100, prev.stats.energy + 25),
        },
      }));
    } catch (error) {
      console.error("Failed to spend coins on sleeping:", error);
      alert("Failed to let pet sleep. Please try again.");
    }
  };

  const handlePlayWithToy = async () => {
    if (totalCoins < 8) {
      alert("You need 8 coins to play with toys!");
      return;
    }

    try {
      // Spend coins through API
      const result = await spendCoinsOnPetCare(token, childId, "playing_with_toy", 8);
      setTotalCoins(result.coins);
      localStorage.setItem("currentCoins", result.coins.toString());

      // Notify other components
      window.dispatchEvent(new CustomEvent("coinsUpdated"));

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
      if (childId) {
        localStorage.setItem(`lastTaskTime_${childId}`, Date.now().toString());
      }
      // Update animal stats only
      currentSetAnimal?.(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          happiness: Math.min(100, prev.stats.happiness + 25),
        },
      }));
    } catch (error) {
      console.error("Failed to spend coins on playing with toy:", error);
      alert("Failed to play with toy. Please try again.");
    }
  };

  const handleDismissWarning = () => {
    console.log("👋 Got it clicked");
    setShowTimeoutModal(false);
  };

  const handleUseItem = async (item: PurchasedItem) => {
    try {
      // Use item through API
      const result = await useChildItem(token, childId, item.id);

      // Update local state
      setPurchasedItems(result.purchasedItems);

      // Update localStorage as backup
      if (childId) {
        localStorage.setItem(`purchasedItems_${childId}`, JSON.stringify(result.purchasedItems));
      }

      // Apply item effects based on type
      switch (item.type) {
        case "food":
          currentSetAnimal?.(prev => ({
            ...prev,
            stats: {
              ...prev.stats,
              hunger: Math.min(100, prev.stats.hunger + 30),
            },
          }));
          break;
        case "toy":
          currentSetAnimal?.(prev => ({
            ...prev,
            stats: {
              ...prev.stats,
              happiness: Math.min(100, prev.stats.happiness + 30),
            },
          }));
          break;
        case "energy":
          currentSetAnimal?.(prev => ({
            ...prev,
            stats: {
              ...prev.stats,
              energy: Math.min(100, prev.stats.energy + 30),
            },
          }));
          break;
        case "accessory":
          // Add accessory to pet
          const currentAccessories = currentAnimal.accessories || [];
          const newAccessories = [...currentAccessories, item];
          currentSetAnimal?.(prev => ({
            ...prev,
            accessories: newAccessories,
          }));
          break;
      }

      setLastTaskTime(Date.now());
      if (childId) {
        localStorage.setItem(`lastTaskTime_${childId}`, Date.now().toString());
      }

      const message = item.type === "accessory" ? `Applied ${item.name} to your pet!` : `Used ${item.name}! Your pet feels better!`;
      alert(message);

      // Notify other components
      window.dispatchEvent(new CustomEvent("itemsUpdated"));
    } catch (error) {
      console.error("Failed to use item:", error);
      alert("Failed to use item. Please try again.");
    }
  };

  const handleRemoveAccessory = async (accessory: PurchasedItem) => {
    try {
      // Remove accessory from pet
      const updatedAccessories = currentAnimal.accessories.filter(acc => acc.name !== accessory.name);
      currentSetAnimal?.(prev => ({
        ...prev,
        accessories: updatedAccessories,
      }));

      // Remove item from database
      await removeChildItem(token, childId, accessory.id);

      // Reload items from database
      const itemsData = await getChildItems(token, childId);
      setPurchasedItems(itemsData.purchasedItems || []);

      // Update localStorage as backup
      if (childId) {
        localStorage.setItem(`purchasedItems_${childId}`, JSON.stringify(itemsData.purchasedItems || []));
      }

      // Notify other components
      window.dispatchEvent(new CustomEvent("itemsUpdated"));
    } catch (error) {
      console.error("Failed to remove accessory:", error);
      alert("Failed to remove accessory. Please try again.");
    }
  };

  // Calculate total items count for display
  const totalItemsCount = purchasedItems.reduce((sum, item) => sum + item.quantity, 0);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
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
                {totalItemsCount > 0 && <span className='absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>{totalItemsCount}</span>}
              </motion.button>
            </PopoverTrigger>
            <PopoverContent className='w-80 bg-white border border-gray-200 shadow-lg'>
              <div className='p-4'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                    <Store className='h-5 w-5' />
                    My Inventory
                  </h3>
                  <span className='text-sm text-gray-500'>{totalItemsCount} items</span>
                </div>

                {totalItemsCount === 0 ? (
                  <div className='text-center py-8 text-gray-500'>
                    <div className='text-4xl mb-2'>📦</div>
                    <p>Your inventory is empty</p>
                    <p className='text-sm'>Buy some items to see them here!</p>
                  </div>
                ) : (
                  <div className='space-y-3 max-h-60 overflow-y-auto'>
                    {purchasedItems.map(item => (
                      <div key={item.name} className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
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
                        <button onClick={() => handleUseItem(item)} className='bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-lg transition-colors' title={`Use ${item.name}`}>
                          Use
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <motion.button onClick={handleLogout} className='bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg hover:bg-white transition-colors' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <LogOut className='w-5 h-5 text-gray-600' />
          </motion.button>
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
            <div className='absolute left-1/2 top-25 -translate-x-1/2 z-10' style={{ transition: "transform 0.5s cubic-bezier(.4,2,.6,1)", transform: `scale(${petScale})` }}>
              <div className='relative'>
                <Benny />
                {/* Display accessories */}
                {currentAnimal.accessories &&
                  currentAnimal.accessories.map(accessory => (
                    <div key={accessory.name} className='absolute top-0 left-0 w-full h-full cursor-pointer' style={{ zIndex: 1 }} onClick={() => handleRemoveAccessory(accessory)} title={`Click to remove ${accessory.name}`}>
                      <img src={accessory.image} alt={accessory.name} className='w-full h-full object-contain' />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Buttons row */}
          <div className='bg-transparent border-gray-200 p-0 z-0'>
            <div className='flex justify-center items-center gap-4 sm:gap-8 max-w-md mx-auto'>
              <button ref={playBtnRef} onClick={handlePlay} disabled={totalCoins < 3} className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all transform touch-manipulation relative ${totalCoins < 3 ? "opacity-50 cursor-not-allowed" : "hover:bg-white/80 hover:scale-105"}`} title={totalCoins < 3 ? "Need 3 coins to play!" : "משחק"}>
                <img src={IMAGES.games} alt='toy box' className='w-12 h-12 sm:w-16 sm:h-16' />
                <span className='text-xs sm:text-sm font-medium text-gray-700'>Game</span>
                <span className='absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow'>3</span>
              </button>

              <button ref={feedBtnRef} onClick={handleFeed} disabled={totalCoins < 5} className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all transform touch-manipulation relative ${totalCoins < 5 ? "opacity-50 cursor-not-allowed" : "hover:bg-white/80 hover:scale-105"}`} title={totalCoins < 5 ? "Need 5 coins to feed!" : "אוכל"}>
                <img src={IMAGES.food} alt='sandwich' className='w-12 h-12 sm:w-16 sm:h-16' />
                <span className='text-xs sm:text-sm font-medium text-gray-700'>Food</span>
                <span className='absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow'>5</span>
              </button>

              <button onClick={handleDrink} disabled={totalCoins < 3} className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all transform touch-manipulation relative ${totalCoins < 3 ? "opacity-50 cursor-not-allowed" : "hover:bg-white/80 hover:scale-105"}`} title={totalCoins < 3 ? "Need 3 coins for drink!" : "שתייה"}>
                <img src={IMAGES.drink} alt='smoothie' className='w-12 h-12 sm:w-16 sm:h-16' />
                <span className='text-xs sm:text-sm font-medium text-gray-700'>Drink</span>
                <span className='absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow'>3</span>
              </button>

              <button ref={sleepBtnRef} onClick={handleSleep} disabled={totalCoins < 6} className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all transform touch-manipulation relative ${totalCoins < 6 ? "opacity-50 cursor-not-allowed" : "hover:bg-white/80 hover:scale-105"}`} title={totalCoins < 6 ? "Need 6 coins to sleep!" : "שינה"}>
                <img src={IMAGES.sleep} alt='sleep' className='w-12 h-12 sm:w-16 sm:h-16' />
                <span className='text-xs sm:text-sm font-medium text-gray-700'>Sleep</span>
                <span className='absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow'>6</span>
              </button>

              <button ref={healBtnRef} onClick={handleHeal} disabled={totalCoins < 6} className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all transform touch-manipulation relative ${totalCoins < 6 ? "opacity-50 cursor-not-allowed" : "hover:bg-white/80 hover:scale-105"}`} title={totalCoins < 6 ? "Need 6 coins for energy!" : "תרופה"}>
                <img src={IMAGES.pill} alt='pill' className='w-12 h-12 sm:w-16 sm:h-16' />
                <span className='text-xs sm:text-sm font-medium text-gray-700'>Energy</span>
                <span className='absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow'>6</span>
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
