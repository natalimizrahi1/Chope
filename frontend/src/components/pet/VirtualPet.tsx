import React, { useState, useEffect, useRef } from "react";
import { Play, Coins, Store, Target, ShoppingBag, LogOut, Menu, X } from "lucide-react";
import garden from "../../assets/garden.png";
import { Dispatch, SetStateAction } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { getTasks, getChildCoins, spendCoinsOnPetCare, getChildItems, useChildItem, removeChildItem, returnChildItem, getPetState, updatePetState, updatePetStats, updatePetAccessories } from "../../lib/api";
import { Task, ShopItem, PurchasedItem } from "../../lib/types";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
  accessories: PurchasedItem[];
  scale?: number;
}

interface VirtualPetProps {
  animal?: Pet;
  onFeed?: () => void;
  onPlay?: () => void;
  onResetHunger?: () => void;
  onResetHappiness?: () => void;
  onResetEnergy?: () => void;
  setAnimal?: Dispatch<SetStateAction<Pet>>;
}

function Benny({ isHappy = false, isSick = false }: { isHappy?: boolean; isSick?: boolean }) {
  return (
    <div
      style={{
        width: 329,
        height: 447,
        background: isHappy ? "url(/images/petanimation/happy.png) 0 0" : isSick ? "url(/images/petanimation/sick.png) 0 0" : "url(https://res.cloudinary.com/dytmcam8b/image/upload/v1561677299/virtual%20pet/Sheet.png) 0 0",
        zIndex: 2000,
        animation: isHappy || isSick ? "none" : "moveX 1.5s steps(10) infinite",
      }}
    />
  );
}

export default function VirtualPet({ animal: propAnimal, onFeed = () => {}, onPlay = () => {}, onResetHunger, onResetHappiness, onResetEnergy, setAnimal: propSetAnimal }: VirtualPetProps) {
  const [isHappy, setIsHappy] = useState(false);
  const [isSick, setIsSick] = useState(false);
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load pet from database on mount - ONLY ONCE
  useEffect(() => {
    console.log("🦖 Loading pet from database - hasLoadedFromStorage:", hasLoadedFromStorage);
    if (!childId || !token) {
      console.log("🦖 No childId or token, setting hasLoadedFromStorage to true");
      setHasLoadedFromStorage(true); // Mark as loaded even if no user
      return;
    }

    const loadPetFromDatabase = async () => {
      try {
        const response = await getPetState(token);

        if (response.petState) {
          // Process accessories to ensure they have all required fields
          const validAccessories = (response.petState.accessories || [])
            .filter((acc: any) => {
              const isValid = acc && acc.id && acc.name && acc.image && acc.type;
              if (!isValid) {
                console.log("🦖 Filtering out invalid accessory:", acc);
              }
              return isValid;
            }) // Only keep valid accessories
            .map((acc: any) => ({
              ...acc,
              slot:
                (acc as any).slot ||
                (() => {
                  // Determine slot based on item ID if not set
                  if (acc.id === "accessory2" || acc.id === "accessory3" || acc.id === "accessory4") {
                    return "head";
                  } else if (acc.id === "hair" || acc.id === "hair2" || acc.id === "hair3" || acc.id === "hair4" || acc.id === "hair5") {
                    return "hair";
                  } else {
                    return "body";
                  }
                })(),
              purchasedAt: acc.purchasedAt || new Date().toISOString(),
            }));

          const petFromDatabase = {
            ...response.petState,
            accessories: validAccessories,
          };

          currentSetAnimal(petFromDatabase);
          console.log("✅ Pet loaded from database:", petFromDatabase);
        } else {
          console.log("No pet state found in database, using default");
        }
        setHasLoadedFromStorage(true); // Mark that we've loaded from storage
      } catch (error) {
        console.error("Failed to load pet from database:", error);
        setHasLoadedFromStorage(true); // Mark as loaded even on error to prevent infinite loading
      }
    };

    loadPetFromDatabase();
  }, [childId, token]);

  // Save pet to database whenever it changes - ONLY ONE PLACE TO SAVE
  useEffect(() => {
    console.log("🦖 Save effect triggered - hasLoadedFromStorage:", hasLoadedFromStorage, "currentAnimal:", !!currentAnimal, "childId:", !!childId, "token:", !!token);
    if (currentAnimal && childId && token && hasLoadedFromStorage) {
      console.log("🦖 All conditions met, saving pet state");
      const savePetToDatabase = async () => {
        try {
          // Filter out invalid accessories and ensure all required fields when saving
          const validAccessories = (currentAnimal.accessories || [])
            .filter((acc: any) => {
              const isValid = acc && acc.id && acc.name && acc.image && acc.type;
              if (!isValid) {
                console.warn("🦖 Filtering out invalid accessory:", acc);
              }
              return isValid;
            })
            .map((acc: any) => ({
              id: acc.id,
              name: acc.name,
              image: acc.image,
              type: acc.type,
              price: acc.price ?? 0,
              quantity: acc.quantity ?? 1,
              slot: (acc as any).slot || "body",
              purchasedAt: acc.purchasedAt || new Date().toISOString(),
            }));

          const petToSave = {
            ...currentAnimal,
            accessories: validAccessories,
          };

          console.log("🦖 Saving pet state to database:", petToSave);
          await updatePetState(token, petToSave);
          console.log("✅ Pet state saved successfully");
        } catch (error) {
          console.error("Failed to save pet to database:", error);
        }
      };

      savePetToDatabase();
    }
  }, [currentAnimal, childId, token, hasLoadedFromStorage]);
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
  const [showAccessoryApplied, setShowAccessoryApplied] = useState(false);
  const [petAnimation, setPetAnimation] = useState(false);

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

  // Check if pet is sick (only when ALL icon stats are at 0)
  useEffect(() => {
    const checkIfSick = () => {
      const { hunger, happiness, energy } = currentAnimal.stats;
      // Only show sick when ALL icon stats (donut, star, heart) are at 0
      const isPetSick = hunger === 0 && happiness === 0 && energy === 0;
      console.log(`🏥 Pet stats - Hunger: ${hunger}, Happiness: ${happiness}, Energy: ${energy}`);
      console.log(`🏥 Is pet sick: ${isPetSick}`);
      setIsSick(isPetSick);
    };

    checkIfSick();
  }, [currentAnimal.stats]);

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
          const itemsWithSlots = (itemsData.purchasedItems || []).map((item: any) => {
            // Add slot information based on item ID
            let slot: "head" | "body" | "eyes" | "hair" = "body";
            if (item.id === "accessory2" || item.id === "accessory3" || item.id === "accessory4") {
              slot = "head";
            } else if (item.id === "hair" || item.id === "hair2" || item.id === "hair3" || item.id === "hair4" || item.id === "hair5") {
              slot = "hair";
            } else if (item.id === "accessory1" || item.id === "accessory5") {
              slot = "body";
            }
            return {
              ...item,
              slot: slot,
            };
          });
          setPurchasedItems(itemsWithSlots);
        }
      } catch (error) {
        console.error("Failed to load items:", error);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      // No-op: removed localStorage logic for items
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
      console.log("🦖 Level up! New level:", newPet.level, "New stats:", newPet.stats);
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

        // Save stats to database
        updatePetStats(token, newPet.stats).catch(error => {
          console.error("Failed to save stats to database:", error);
        });

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
      currentSetAnimal?.(prev => {
        const newPet = {
          ...prev,
          stats: {
            ...prev.stats,
            hunger: Math.min(100, prev.stats.hunger + 15),
          },
        };

        // Save stats to database
        updatePetStats(token, newPet.stats).catch(error => {
          console.error("Failed to save stats to database:", error);
        });

        return newPet;
      });
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
      currentSetAnimal?.(prev => {
        const newPet = {
          ...prev,
          stats: {
            ...prev.stats,
            energy: Math.min(100, prev.stats.energy + 25),
          },
        };

        // Save stats to database
        updatePetStats(token, newPet.stats).catch(error => {
          console.error("Failed to save stats to database:", error);
        });

        return newPet;
      });
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

      // Show happy animation
      setIsHappy(true);
      setTimeout(() => setIsHappy(false), 2000);

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
      currentSetAnimal?.(prev => {
        const newPet = {
          ...prev,
          stats: {
            ...prev.stats,
            happiness: Math.min(100, prev.stats.happiness + 25),
          },
        };
        // Save stats to database
        updatePetStats(token, newPet.stats).catch(error => {
          console.error("Failed to save stats to database:", error);
        });
        return newPet;
      });
    } catch (error) {
      console.error("Failed to spend coins on playing:", error);
      alert("Failed to play with pet. Please try again.");
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
      currentSetAnimal?.(prev => {
        const newPet = {
          ...prev,
          stats: {
            ...prev.stats,
            happiness: Math.min(100, prev.stats.happiness + 25),
          },
        };
        // Save stats to database
        updatePetStats(token, newPet.stats).catch(error => {
          console.error("Failed to save stats to database:", error);
        });
        return newPet;
      });
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
      console.log("🎯 Using item:", item);
      console.log("🎯 Current pet accessories:", currentAnimal.accessories);

      // Use item through API
      const result = await useChildItem(token, childId, item.id);
      console.log("🎯 Item used successfully:", result);

      // Update local state with slot information
      const itemsWithSlots = result.purchasedItems.map((item: any) => {
        let slot: "head" | "body" | "eyes" | "hair" = "body";
        if (item.id === "accessory2" || item.id === "accessory3" || item.id === "accessory4") {
          slot = "head";
        } else if (item.id === "hair" || item.id === "hair2" || item.id === "hair3" || item.id === "hair4" || item.id === "hair5") {
          slot = "hair";
        } else if (item.id === "accessory1" || item.id === "accessory5") {
          slot = "body";
        }
        return {
          ...item,
          slot: slot,
        };
      });
      setPurchasedItems(itemsWithSlots);
      console.log("🎯 Updated purchased items:", itemsWithSlots);

      // Apply item effects based on type
      if ((item.type as any) === "clothes" || (item.type as any) === "accessory") {
        console.log("🎯 Processing accessory item:", item.type);
        const currentAccessories = currentAnimal.accessories || [];
        console.log("🎯 Current accessories before adding:", currentAccessories);

        // Determine slot based on item ID
        let slot: "head" | "body" | "eyes" | "hair" = "body"; // default
        if (item.id === "accessory2" || item.id === "accessory3" || item.id === "accessory4") {
          slot = "head";
        } else if (item.id === "hair" || item.id === "hair2" || item.id === "hair3" || item.id === "hair4" || item.id === "hair5") {
          slot = "hair";
        } else if (item.id === "accessory1" || item.id === "accessory5") {
          slot = "body";
        }

        const accessoryWithSlot = {
          id: item.id,
          name: item.name,
          image: item.image,
          type: item.type,
          price: item.price,
          quantity: item.quantity,
          slot: slot,
          purchasedAt: new Date().toISOString(),
        };

        console.log("🎯 Accessory with slot:", accessoryWithSlot);

        // Special handling for head accessories - replace existing head accessory
        let newAccessories;
        if (slot === "head") {
          const oldHat = currentAccessories.find(acc => (acc.slot || "body") === "head" && (acc.id === "accessory2" || acc.id === "accessory3" || acc.id === "accessory4"));
          if (oldHat && oldHat.id !== item.id) {
            // Return the old hat to inventory
            await returnChildItem(token, childId, oldHat.id);
          }
          // Remove any existing head accessories (accessory2, accessory3, accessory4)
          const filteredAccessories = currentAccessories.filter(acc => {
            const accSlot = (acc as any).slot || "body";
            if (accSlot === "head") {
              // Determine if this is a head accessory based on ID
              const isHeadAccessory = acc.id === "accessory2" || acc.id === "accessory3" || acc.id === "accessory4";
              return !isHeadAccessory;
            }
            return true;
          });
          newAccessories = [...filteredAccessories, accessoryWithSlot];
          console.log("🎯 Head accessory - filtered accessories:", filteredAccessories);
          console.log("🎯 Head accessory - new accessories:", newAccessories);
        } else if (slot === "hair") {
          // Special handling for hair accessories - replace existing hair accessory
          const oldHair = currentAccessories.find(acc => (acc.slot || "body") === "hair" && (acc.id === "hair" || acc.id === "hair1" || acc.id === "hair2" || acc.id === "hair3" || acc.id === "hair4" || acc.id === "hair5"));
          if (oldHair && oldHair.id !== item.id) {
            // Return the old hair to inventory
            await returnChildItem(token, childId, oldHair.id);
          }
          // Remove any existing hair accessories
          const filteredAccessories = currentAccessories.filter(acc => {
            const accSlot = (acc as any).slot || "body";
            if (accSlot === "hair") {
              // Determine if this is a hair accessory based on ID
              const isHairAccessory = acc.id === "hair" || acc.id === "hair1" || acc.id === "hair2" || acc.id === "hair3" || acc.id === "hair4" || acc.id === "hair5";
              return !isHairAccessory;
            }
            return true;
          });
          newAccessories = [...filteredAccessories, accessoryWithSlot];
          console.log("🎯 Hair accessory - filtered accessories:", filteredAccessories);
          console.log("🎯 Hair accessory - new accessories:", newAccessories);
        } else {
          newAccessories = [...currentAccessories, accessoryWithSlot];
          console.log("🎯 Body accessory - new accessories:", newAccessories);
        }

        // Update local state
        currentSetAnimal?.(prev => {
          console.log("🎯 Updating pet state from:", prev);

          const newPet = {
            ...prev,
            accessories: newAccessories
              .filter((acc: any) => acc && acc.id && acc.name && acc.image && acc.type)
              .map((acc: any) => ({
                ...acc,
                purchasedAt: acc.purchasedAt || new Date().toISOString(),
              })), // Only keep valid accessories
          };

          console.log("🦖 Adding accessory to pet:", accessoryWithSlot);
          console.log("🦖 New pet state:", newPet);

          // Save to database immediately and wait for completion
          updatePetState(token, newPet)
            .then(() => {
              console.log("✅ Pet state saved successfully after adding accessory");
            })
            .catch(error => {
              console.error("Failed to save pet state after adding accessory:", error);
            });

          return newPet;
        });

        // Force immediate save to ensure it's saved
        setTimeout(async () => {
          try {
            const currentPet = currentAnimal;
            const updatedPet = {
              ...currentPet,
              accessories: newAccessories
                .filter((acc: any) => acc && acc.id && acc.name && acc.image && acc.type)
                .map((acc: any) => ({
                  ...acc,
                  purchasedAt: acc.purchasedAt || new Date().toISOString(),
                })),
            };

            console.log("🦖 Force saving pet state:", updatedPet);
            await updatePetState(token, updatedPet);
            console.log("✅ Pet state force saved successfully");
          } catch (saveError) {
            console.error("Failed to force save pet state:", saveError);
          }
        }, 100);
      }

      setLastTaskTime(Date.now());
      if (childId) {
        localStorage.setItem(`lastTaskTime_${childId}`, Date.now().toString());
      }

      const message = item.type === "clothes" || item.type === "accessory" ? `Applied ${item.name} to your pet!` : `Used ${item.name}! Your pet feels better!`;

      // Show success message with better UX
      if (item.type === "clothes" || item.type === "accessory") {
        setShowAccessoryApplied(true);
        setPetAnimation(true);
        setTimeout(() => setShowAccessoryApplied(false), 3000);
        setTimeout(() => setPetAnimation(false), 1000);
      } else {
        // Show modal instead of alert
        setShowAccessoryApplied(true);
        setPetAnimation(true);
        setTimeout(() => setShowAccessoryApplied(false), 3000);
        setTimeout(() => setPetAnimation(false), 1000);
      }

      // Notify other components
      window.dispatchEvent(new CustomEvent("itemsUpdated"));

      console.log("🎯 Item use completed successfully");
    } catch (error) {
      console.error("Failed to use item:", error);
      alert("Failed to use item. Please try again.");
    }
  };

  const handleRemoveAccessory = async (accessory: PurchasedItem) => {
    try {
      console.log(`🗑️ Removing accessory:`, accessory);
      console.log(`🗑️ Current accessories before removal:`, currentAnimal.accessories);

      // Remove accessory from pet by ID instead of name to avoid conflicts
      const updatedAccessories = currentAnimal.accessories.filter(acc => acc.id !== accessory.id);
      console.log(`🗑️ Accessories after removal:`, updatedAccessories);

      // Update local state and save to database
      currentSetAnimal?.(prev => {
        const newPet = {
          ...prev,
          accessories: updatedAccessories
            .filter((acc: any) => acc && acc.id && acc.name && acc.image && acc.type)
            .map((acc: any) => ({
              id: acc.id,
              name: acc.name,
              image: acc.image,
              type: acc.type,
              price: acc.price ?? 0,
              quantity: acc.quantity ?? 1,
              slot: (acc as any).slot || "body",
              purchasedAt: acc.purchasedAt || new Date().toISOString(),
            })), // Only keep valid accessories
        };

        console.log(`🗑️ Saving pet state after removal...`);

        // Save to database immediately
        updatePetState(token, newPet)
          .then(() => {
            console.log(`🗑️ Pet state saved successfully after removal`);
          })
          .catch(error => {
            console.error("Failed to save pet state after removing accessory:", error);
          });

        return newPet;
      });

      // Return item to inventory (increase quantity)
      console.log(`🔄 Returning accessory ${accessory.name} (${accessory.id}) to inventory`);
      const result = await returnChildItem(token, childId, accessory.id);
      console.log(`✅ Item returned successfully:`, result);

      // Reload items from database with slot information
      const itemsData = await getChildItems(token, childId);
      const itemsWithSlots = (itemsData.purchasedItems || []).map((item: any) => {
        let slot: "head" | "body" | "eyes" | "hair" = "body";
        if (item.id === "accessory2" || item.id === "accessory3" || item.id === "accessory4") {
          slot = "head";
        } else if (item.id === "hair" || item.id === "hair2" || item.id === "hair3" || item.id === "hair4" || item.id === "hair5") {
          slot = "hair";
        } else if (item.id === "accessory1" || item.id === "accessory5") {
          slot = "body";
        }
        return {
          ...item,
          slot: slot,
        };
      });
      console.log(`🔄 After removal - reloaded items:`, itemsWithSlots);
      setPurchasedItems(itemsWithSlots);

      // Notify other components
      window.dispatchEvent(new CustomEvent("itemsUpdated"));
    } catch (error) {
      console.error("Failed to remove accessory:", error);
      alert("Failed to remove accessory. Please try again.");
    }
  };

  // Calculate total items count for display (only items with quantity > 0)
  const totalItemsCount = purchasedItems.filter(item => item.quantity > 0).reduce((sum, item) => sum + item.quantity, 0);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#87d4ee] via-[#f9a8d4] to-[#ffd986] flex flex-col items-center justify-start relative overflow-hidden'>
      {/* Background decorations */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <motion.div className='absolute top-4 left-4 sm:top-10 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 bg-white/20 rounded-full' animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className='absolute top-20 right-4 sm:top-40 sm:right-20 w-10 h-10 sm:w-16 sm:h-16 bg-white/20 rounded-full' animate={{ y: [0, 15, 0], scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
        <motion.div className='absolute bottom-10 left-1/4 sm:bottom-20 w-16 h-16 sm:w-24 sm:h-24 bg-white/20 rounded-full' animate={{ y: [0, -10, 0], rotate: [0, -180, -360] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
      </div>

      {/* Header */}
      <div className='w-full flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 pt-4 sm:pt-8 z-10 gap-4 sm:gap-0'>
        <div className='flex items-center gap-2 sm:gap-4'>
          <div>
            <h1 className='text-lg sm:text-xl md:text-2xl font-bold text-white drop-shadow-lg'>My Pet - {currentAnimal.name} 🐾</h1>
            <p className='text-white/90 text-xs sm:text-sm'>Take care of your virtual friend!</p>
          </div>
        </div>
        <div className='flex flex-row items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto'>
          {/* Mobile Hamburger Menu */}
          <div className='sm:hidden'>
            <motion.button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className='bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg hover:bg-white transition-colors w-10 h-10 flex items-center justify-center' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <motion.div animate={isMobileMenuOpen ? "open" : "closed"} transition={{ duration: 0.2 }}>
                {isMobileMenuOpen ? <X className='w-4 h-4 text-gray-600' /> : <Menu className='w-4 h-4 text-gray-600' />}
              </motion.div>
            </motion.button>
          </div>

          {/* Desktop Navigation tabs */}
          <div className='hidden sm:block bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg'>
            <div className='flex flex-row gap-2'>
              <motion.button onClick={() => navigate("/kid/dashboard")} className='flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all text-sm' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Target className='w-4 h-4' />
                Tasks
              </motion.button>
              <motion.button className='flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all text-sm bg-gradient-to-r from-[#ffd986] to-[#ffbacc] text-white shadow-lg h-10' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Play className='w-4 h-4' />
                My Pet
              </motion.button>
              <motion.button onClick={() => navigate("/kid/shop")} className='flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all text-sm h-10' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <ShoppingBag className='w-4 h-4' />
                Shop
              </motion.button>
            </div>
          </div>

          <motion.div className='bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2 w-16 h-10 justify-center' whileHover={{ scale: 1.05 }}>
            <Coins className='w-4 h-4 text-yellow-500' />
            <span className='font-bold text-sm text-gray-800'>{totalCoins}</span>
          </motion.div>

          {/* Inventory */}
          <Popover>
            <PopoverTrigger asChild>
              <motion.button className='bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg hover:bg-white transition-colors relative w-10 h-10 flex items-center justify-center' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Store className='w-4 h-4 text-gray-600' />
                {totalItemsCount > 0 && <span className='absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-xs'>{totalItemsCount}</span>}
              </motion.button>
            </PopoverTrigger>
            <PopoverContent className='w-72 sm:w-80 bg-white border border-gray-200 shadow-lg'>
              <div className='p-3 sm:p-4'>
                <div className='flex items-center justify-between mb-3 sm:mb-4'>
                  <h3 className='text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2'>
                    <Store className='h-4 w-4 sm:h-5 sm:w-5' />
                    My Inventory
                  </h3>
                  <span className='text-xs sm:text-sm text-gray-500'>{totalItemsCount} items</span>
                </div>

                {totalItemsCount === 0 ? (
                  <div className='text-center py-6 sm:py-8 text-gray-500'>
                    <div className='text-3xl sm:text-4xl mb-2'>📦</div>
                    <p className='text-sm sm:text-base'>Your inventory is empty</p>
                    <p className='text-xs sm:text-sm'>Buy some items to see them here!</p>
                  </div>
                ) : (
                  <div className='space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto'>
                    {purchasedItems
                      .filter(item => item.quantity > 0)
                      .map(item => (
                        <div key={item.name} className='flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg'>
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
                          <button onClick={() => handleUseItem(item)} className='bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-lg transition-colors' title={`Use ${item.name}`}>
                            Use
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <motion.button onClick={handleLogout} className='bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg hover:bg-white transition-colors w-10 h-10 flex items-center justify-center' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <LogOut className='w-4 h-4 text-gray-600' />
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='fixed inset-0 bg-black/50 z-50 sm:hidden' onClick={() => setIsMobileMenuOpen(false)}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className='absolute right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-sm shadow-2xl' onClick={e => e.stopPropagation()}>
              <div className='p-6'>
                <div className='flex items-center justify-between mb-8'>
                  <h2 className='text-xl font-bold text-gray-800'>Menu</h2>
                  <motion.button onClick={() => setIsMobileMenuOpen(false)} className='p-2 rounded-lg hover:bg-gray-100 transition-colors' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <X className='w-6 h-6 text-gray-600' />
                  </motion.button>
                </div>

                <div className='space-y-4'>
                  <motion.button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/kid/dashboard");
                    }}
                    className='flex items-center gap-3 w-full p-4 rounded-xl font-semibold text-left bg-gray-100 hover:bg-gray-200 transition-colors'
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Target className='w-5 h-5 text-gray-600' />
                    <span className='text-gray-800'>Tasks</span>
                  </motion.button>

                  <motion.button
                    className='flex items-center gap-3 w-full p-4 rounded-xl font-semibold text-left bg-gradient-to-r from-[#ffd986] to-[#ffbacc] text-white shadow-lg'
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Play className='w-5 h-5' />
                    <span>My Pet</span>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/kid/shop");
                    }}
                    className='flex items-center gap-3 w-full p-4 rounded-xl font-semibold text-left bg-gray-100 hover:bg-gray-200 transition-colors'
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ShoppingBag className='w-5 h-5 text-gray-600' />
                    <span className='text-gray-800'>Shop</span>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className='flex items-center gap-3 w-full p-4 rounded-xl font-semibold text-left bg-red-50 hover:bg-red-100 transition-colors'
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut className='w-5 h-5 text-red-600' />
                    <span className='text-red-600'>Logout</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main pet board - full width */}
      <div className='w-full flex flex-col items-center justify-center mt-2 sm:mt-6 z-10 px-2 sm:px-0'>
        <div className='bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg w-full flex flex-col items-center' style={{ minHeight: "calc(100vh - 120px)" }}>
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
          <div className='absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90vw] sm:w-[80vw] md:w-[60vw] lg:w-[40vw] xl:w-[30vw]'>
            <div className='w-full bg-gray-200 rounded-full h-2 sm:h-3 md:h-4 lg:h-5 overflow-hidden shadow-inner relative'>
              <div className='bg-green-400 h-full transition-all duration-300 ease-in-out' style={{ width: `${displayedProgress}%` }} />
              <div className='absolute inset-0 flex items-center justify-center text-[2.5vw] sm:text-[2vw] md:text-[1.5vw] lg:text-[1vw] font-bold text-gray-700'>Completion: {Math.round(displayedProgress)}%</div>
            </div>
          </div>

          {/* Level indicator */}
          <div className='absolute top-2 sm:top-4 left-2 sm:left-4 z-50 bg-white/90 border border-yellow-400 rounded-xl px-2 py-1 sm:py-2 shadow-lg'>
            <span className='text-gray-800 font-bold text-sm sm:text-lg'>Level {currentAnimal.level}</span>
          </div>

          {/* Main board - with dynamic height */}
          <div className='flex-1 relative mx-auto my-2 sm:my-4 max-w-[95vw] sm:max-w-[90vw] h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] lg:max-w-[800px] lg:h-[calc(100vh-250px)]'>
            {/* Static stats bar */}
            <div
              className='absolute left-1/2 top-4 sm:top-8 -translate-x-1/2 z-10 
                              bg-blue-100 border-2 sm:border-4 border-amber-700 rounded-xl 
                              shadow-lg flex items-center gap-3 sm:gap-6 px-4 sm:px-8 py-1 sm:py-2 min-w-[250px] sm:min-w-[300px]'
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
            <div className={`absolute left-1/2 top-16 sm:top-25 -translate-x-1/2 z-10 ${petAnimation ? "animate-bounce" : ""}`} style={{ transition: "transform 0.5s cubic-bezier(.4,2,.6,1)", transform: `scale(${petScale})` }}>
              <div className='relative'>
                <Benny isHappy={isHappy} isSick={isSick} />

                {/* Display accessories based on slot */}
                {currentAnimal.accessories &&
                  currentAnimal.accessories.map(accessory => {
                    // Get slot from the accessory or determine by ID
                    let slot = (accessory as any).slot;
                    if (!slot) {
                      // Determine slot based on item ID if not set
                      if (accessory.id === "accessory2" || accessory.id === "accessory3" || accessory.id === "accessory4") {
                        slot = "head";
                      } else if (accessory.id === "hair" || accessory.id === "hair2" || accessory.id === "hair3" || accessory.id === "hair4" || accessory.id === "hair5") {
                        slot = "hair";
                      } else {
                        slot = "body";
                      }
                    }

                    // Define positioning based on slot
                    const getSlotPosition = (slot: string) => {
                      if (accessory.id === "accessory3") {
                        return { top: "1%", left: "50%", transform: "translateX(-50%)", zIndex: 4 };
                      }

                      if (accessory.name && accessory.name.toLowerCase().includes("suit")) {
                        return { top: "60%", left: "50%", transform: "translateX(-50%)", zIndex: 1 };
                      }

                      if (accessory.id === "hair") {
                        return { top: "2%", left: "50%", transform: "translateX(-50%)", zIndex: 3 };
                      }

                      if (accessory.id === "hair2") {
                        return { top: "3%", left: "42%", transform: "translateX(-50%)", zIndex: 3 };
                      }

                      if (accessory.id === "hair3") {
                        return { top: "-8%", left: "50%", transform: "translateX(-50%)", zIndex: 3 };
                      }

                      if (accessory.id === "hair4") {
                        return { top: "-1%", left: "50%", transform: "translateX(-50%)", zIndex: 3 };
                      }

                      if (accessory.id === "hair5") {
                        return { top: "20%", left: "47%", transform: "translateX(-50%)", zIndex: 3 };
                      }

                      switch (slot) {
                        case "head":
                          return { top: "-15%", left: "50%", transform: "translateX(-50%)", zIndex: 4 };
                        case "hair":
                          return { top: "-60%", left: "50%", transform: "translateX(-50%)", zIndex: 3 };
                        case "eyes":
                          return { top: "-40%", left: "50%", transform: "translateX(-50%)", zIndex: 5 };
                        case "body":
                        default:
                          return { top: "55%", left: "50%", transform: "translateX(-50%)", zIndex: 1 };
                      }
                    };

                    const position = getSlotPosition(slot);

                    // Define size based on slot
                    const getSlotSize = (slot: string) => {
                      switch (slot) {
                        case "head":
                          return { width: "540px", height: "fit-content" };
                        case "hair":
                          return { width: "720px", height: "fit-content" };
                        case "eyes":
                          return { width: "200px", height: "fit-content" };
                        case "body":
                        default:
                          return { width: "900px", height: "fit-content" };
                      }
                    };

                    const size = getSlotSize(slot);

                    return (
                      <div
                        key={`${accessory.id}-${accessory.name}`}
                        className='absolute cursor-pointer transition-transform hover:scale-110 hover:rotate-2 accessory-float'
                        style={{
                          position: "absolute",
                          ...position,
                          transformOrigin: "center center",
                          transform: `${position.transform} scale(${accessory.id === "accessory5" ? "1.5" : accessory.name && (accessory.name.toLowerCase().includes("dress") || accessory.name.toLowerCase().includes("shirt") || accessory.name.toLowerCase().includes("suit")) ? "3.0" : "2.5"})`,
                        }}
                        onClick={() => handleRemoveAccessory(accessory)}
                        title={`Click to remove ${accessory.name} (Slot: ${slot})`}
                      >
                        <img src={accessory.image} alt={accessory.name} className='object-contain' style={size} />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Buttons row */}
          <div className='bg-transparent border-gray-200 p-0 z-0'>
            <div className='flex justify-center items-center gap-2 sm:gap-4 md:gap-8 max-w-md mx-auto px-2 sm:px-0'>
              <button ref={playBtnRef} onClick={handlePlay} disabled={totalCoins < 3} className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg transition-all transform touch-manipulation relative ${totalCoins < 3 ? "opacity-50 cursor-not-allowed" : "hover:bg-white/80 hover:scale-105"}`} title={totalCoins < 3 ? "Need 3 coins to play!" : "משחק"}>
                <img src={IMAGES.games} alt='toy box' className='w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16' />
                <span className='text-xs font-medium text-gray-700'>Game</span>
                <span className='absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow'>3</span>
              </button>

              <button ref={feedBtnRef} onClick={handleFeed} disabled={totalCoins < 5} className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg transition-all transform touch-manipulation relative ${totalCoins < 5 ? "opacity-50 cursor-not-allowed" : "hover:bg-white/80 hover:scale-105"}`} title={totalCoins < 5 ? "Need 5 coins to feed!" : "אוכל"}>
                <img src={IMAGES.food} alt='sandwich' className='w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16' />
                <span className='text-xs font-medium text-gray-700'>Food</span>
                <span className='absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow'>5</span>
              </button>

              <button onClick={handleDrink} disabled={totalCoins < 3} className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg transition-all transform touch-manipulation relative ${totalCoins < 3 ? "opacity-50 cursor-not-allowed" : "hover:bg-white/80 hover:scale-105"}`} title={totalCoins < 3 ? "Need 3 coins for drink!" : "שתייה"}>
                <img src={IMAGES.drink} alt='smoothie' className='w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16' />
                <span className='text-xs font-medium text-gray-700'>Drink</span>
                <span className='absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow'>3</span>
              </button>

              <button ref={healBtnRef} onClick={handleHeal} disabled={totalCoins < 6} className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg transition-all transform touch-manipulation relative ${totalCoins < 6 ? "opacity-50 cursor-not-allowed" : "hover:bg-white/80 hover:scale-105"}`} title={totalCoins < 6 ? "Need 6 coins for energy!" : "תרופה"}>
                <img src={IMAGES.pill} alt='pill' className='w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16' />
                <span className='text-xs font-medium text-gray-700'>Energy</span>
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
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-2xl text-center animate-scale-in max-w-sm sm:max-w-md w-full'>
            <div className='w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 sm:h-8 sm:w-8 text-green-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
              </svg>
            </div>
            <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2'>Level Up! 🎉</h2>
            <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-green-600 mb-4'>100% Complete! 🎯</h1>
            <p className='text-sm sm:text-base text-gray-600 mb-4 sm:mb-6'>Your pet has grown stronger!</p>
            <button onClick={handleNextLevel} className='bg-green-500 hover:bg-green-600 text-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base'>
              Start Next Level
            </button>
          </div>
        </div>
      )}

      {/* Accessory Applied Modal */}
      {showAccessoryApplied && (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-2xl text-center animate-scale-in max-w-sm sm:max-w-md w-full'>
            <div className='w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 sm:h-8 sm:w-8 text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
              </svg>
            </div>
            <h2 className='text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2'>Accessory Applied! 🎨</h2>
            <p className='text-sm sm:text-base text-gray-600 mb-4 sm:mb-6'>Your pet looks amazing with the new accessory!</p>
            <button onClick={() => setShowAccessoryApplied(false)} className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base'>
              Awesome!
            </button>
          </div>
        </div>
      )}
      {showTimeoutModal && (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-2xl text-center animate-scale-in max-w-sm sm:max-w-md w-full'>
            <div className='w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 sm:h-8 sm:w-8 text-red-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z' />
              </svg>
            </div>
            <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2'>Oops!</h2>
            <p className='text-sm sm:text-base text-gray-600 mb-4 sm:mb-6'>Your pet's stats dropped because you didn't complete a task in time.</p>
            <button onClick={handleDismissWarning} className='mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow text-sm sm:text-base'>
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
        
        /* Remove red background from accessory images */
        .accessory-float img {
          background: transparent !important;
          background-color: transparent !important;
        }
        
        /* Ensure accessory images don't have any background */
        .accessory-float img[src*="accessory"] {
          background: transparent !important;
          background-color: transparent !important;
        }
        
        /* Additional rules to remove any red background */
        .accessory-float img[src*="accessory"],
        .accessory-float img[src*="hair"],
        .accessory-float img[src*="clothes"] {
          background: transparent !important;
          background-color: transparent !important;
          mix-blend-mode: normal;
          filter: brightness(1) contrast(1);
        }
      `}</style>
    </div>
  );
}
