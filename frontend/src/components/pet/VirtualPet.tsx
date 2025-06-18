import { useEffect, useState, useRef } from "react";
import { Menu, X } from "lucide-react";
import garden from "../../assets/garden.png";
import { ShopItem } from "./PetShop";

const STATS = {
  MAX: 4,
  MIN: 0,
} as const;

type StatLevel = 1 | 2 | 3 | 4;

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
}

interface VirtualPetProps {
  animal: Pet;
  onFeed: () => void;
  onPlay: () => void;
  onSleep: () => void;
  onResetHunger: () => void;
  onResetHappiness: () => void;
  onResetEnergy: () => void;
  setAnimal: (pet: Pet) => void;
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

export default function VirtualPet({
  animal = {
    name: "Benny",
    type: "Cute Pet",
    level: 1,
    xp: 0,
    stats: { hunger: 3, happiness: 3, energy: 3 },
    accessories: [],
  },
  onFeed = () => {},
  onPlay = () => {},
  onSleep = () => {},
  onResetHunger,
  onResetHappiness,
  onResetEnergy,
  setAnimal,
}: VirtualPetProps) {
  const [timeAlive, setTimeAlive] = useState(0);
  const [isDead, setIsDead] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const [localHunger, setLocalHunger] = useState(animal.stats.hunger);
  const [localHappiness, setLocalHappiness] = useState(animal.stats.happiness);
  const [localEnergy, setLocalEnergy] = useState(animal.stats.energy);
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
  const isAllStatsEmpty = animal.stats.hunger <= 0 && animal.stats.happiness <= 0 && animal.stats.energy <= 0;
  const [petScale, setPetScale] = useState(() => {
    const stored = localStorage.getItem("petScale");
    return stored ? parseFloat(stored) : 0.5;
  });
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [filledCount, setFilledCount] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState<ShopItem[]>([]);

  const maxScale = 1.2;

  useEffect(() => {
    // Initialize audio elements
    const audioElements: Record<string, HTMLAudioElement> = {};
    Object.entries(SOUNDS).forEach(([key, url]) => {
      audioElements[key] = new Audio(url);
    });
    audioRefs.current = audioElements;

    // Play hello sound after 4 seconds
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
    if (animal.stats.hunger <= 0 || animal.stats.happiness <= 0 || animal.stats.energy <= 0) {
      setIsDead(true);
    }
  }, [animal.stats]);

  useEffect(() => {
    setLocalHunger(animal.stats.hunger);
    setLocalHappiness(animal.stats.happiness);
    setLocalEnergy(animal.stats.energy);
  }, [animal.stats.hunger, animal.stats.happiness, animal.stats.energy]);

  useEffect(() => {
    if (isAllStatsEmpty) {
      setPetScale(0.5);
    }
  }, [isAllStatsEmpty]);
  useEffect(() => {
    localStorage.setItem("petScale", petScale.toString());
  }, [petScale]);

  useEffect(() => {
    // Load purchased items from localStorage
    const savedItems = JSON.parse(localStorage.getItem("purchasedItems") || "[]") as ShopItem[];
    console.log("Loaded items:", savedItems); // Debug log
    setPurchasedItems(savedItems);
  }, []);

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

  const donutLevel = Math.max(1, Math.min(4, Math.ceil(animal.stats.hunger / 25))) as unknown as keyof typeof IMAGES.donut;
  const starLevel = Math.max(1, Math.min(4, Math.ceil(animal.stats.happiness / 25))) as unknown as keyof typeof IMAGES.star;
  const heartLevel = Math.max(1, Math.min(4, Math.ceil(animal.stats.energy / 25))) as unknown as keyof typeof IMAGES.heart;

  useEffect(() => {
    const maxIcons = [donutLevel === 4, starLevel === 4, heartLevel === 4].filter(Boolean).length;

    const progress = maxIcons > 0 ? (maxIcons / 3) * 100 : 0;

    setDisplayedProgress(progress);
  }, [donutLevel, starLevel, heartLevel]);

  const handleFeed = () => {
    setIsFeeding(true);
    onFeed();
    audioRefs.current.munch?.play().catch(() => {});
    setTimeout(() => setIsFeeding(false), 1000);
    setIsMenuOpen(false);
    flyToStat(feedBtnRef, donutStatRef, "donut", IMAGES.donut[donutLevel]);
    setShowAddedDonut(true);
    setTimeout(() => setShowAddedDonut(false), 700);
    setPetScale(prev => Math.min(prev + 0.1, maxScale));
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
    setPetScale(prev => Math.min(prev + 0.1, maxScale));
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
    setPetScale(prev => Math.min(prev + 0.1, maxScale));
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
    setPetScale(prev => Math.min(prev + 0.1, maxScale));
  };

  const handleRestart = () => {
    setTimeAlive(0);
    setIsDead(false);
    audioRefs.current.hello?.play().catch(() => {});
  };

  const handleResetHungerLocal = () => {
    if (onResetHunger) {
      onResetHunger();
    } else {
      setLocalHunger(0);
    }
  };

  const handleResetHappinessLocal = () => {
    if (onResetHappiness) {
      onResetHappiness();
    } else {
      setLocalHappiness(0);
    }
  };

  const handleResetEnergyLocal = () => {
    if (onResetEnergy) {
      onResetEnergy();
    } else {
      setLocalEnergy(0);
    }
  };

  const hungerPercent = Math.max(0, Math.min(100, (animal.stats.hunger / STATS.MAX) * 100));

  const handleUseItem = (item: ShopItem) => {
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
        const currentAccessories = animal.accessories || [];
        const isWearing = currentAccessories.some(acc => acc.id === item.id);

        let newAccessories;
        if (isWearing) {
          // Remove accessory
          newAccessories = currentAccessories.filter(acc => acc.id !== item.id);
        } else {
          // Add accessory
          newAccessories = [...currentAccessories, item];
        }

        // Update localStorage
        const updatedPet = {
          ...animal,
          accessories: newAccessories,
        };
        localStorage.setItem("pet", JSON.stringify(updatedPet));

        // Update state
        setAnimal(updatedPet);
        break;
    }
  };

  return (
    <div
      className='min-h-screen w-full bg- overflow-hidden relative'
      style={{
        backgroundImage: `url(${garden})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Mobile menu button */}
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className='fixed top-4 right-4 z-50 lg:hidden bg-white/90 border-2 border-yellow-300 rounded-lg p-2 shadow-lg hover:bg-white transition-colors'>
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className='fixed inset-0 bg-black/50 z-40 lg:hidden' onClick={() => setIsMenuOpen(false)}>
          <div className='fixed top-0 right-0 h-full w-64 bg-white shadow-xl p-4 transform transition-transform'>
            <div className='mt-12 space-y-4'>
              <h3 className='text-lg font-bold text-gray-800 mb-4'>Prices</h3>
              <div className='flex items-center gap-2 p-2 bg-gray-50 rounded'>
                <img src={IMAGES.food} alt='food' className='w-8 h-8' />
                <span className='font-semibold text-gray-800'>Food</span>
                <span className='ml-auto font-bold text-yellow-600'>4 coins</span>
              </div>
              <div className='flex items-center gap-2 p-2 bg-gray-50 rounded'>
                <img src={IMAGES.games} alt='משחק' className='w-8 h-8' />
                <span className='font-semibold text-gray-800'>משחק</span>
                <span className='ml-auto font-bold text-yellow-600'>2 coins</span>
              </div>
              <div className='flex items-center gap-2 p-2 bg-gray-50 rounded'>
                <img src={IMAGES.pill} alt='תרופה' className='w-8 h-8' />
                <span className='font-semibold text-gray-800'>Energy</span>
                <span className='ml-auto font-bold text-yellow-600'>5 coins</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coins box */}
      <div
        className='hidden lg:flex fixed top-8 right-8 bg-white/90 border-2 border-yellow-300 rounded-xl shadow-lg 
                      flex-col gap-3 p-4 z-50 min-w-[180px] text-base'
      >
        <div className='flex items-center gap-2'>
          <img src={IMAGES.food} alt='food' className='w-8 h-8' />
          <span className='font-semibold text-gray-800'>Food</span>
          <span className='ml-auto font-bold text-yellow-600'>
            4 <span className='text-xs'>coins</span>
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <img src={IMAGES.games} alt='game' className='w-8 h-8' />
          <span className='font-semibold text-gray-800'>Game</span>
          <span className='ml-auto font-bold text-yellow-600'>
            2 <span className='text-xs'>coins</span>
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <img src={IMAGES.pill} alt='pill' className='w-8 h-8' />
          <span className='font-semibold text-gray-800'>Energy</span>
          <span className='ml-auto font-bold text-yellow-600'>
            5 <span className='text-xs'>coins</span>
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className='absolute top-0 left-1/2 transform -translate-x-1/2 mt-2 sm:mt-4 z-50 w-[95vw] sm:w-[80vw] md:w-[60vw] lg:w-[40vw] xl:w-[30vw]'>
        <div className='w-full bg-gray-200 rounded-full h-2 sm:h-3 md:h-4 lg:h-5 overflow-hidden shadow-inner relative'>
          <div className='bg-green-400 h-full transition-all duration-300 ease-in-out' style={{ width: `${displayedProgress}%` }} />
          <div className='absolute inset-0 flex items-center justify-center text-[2.5vw] sm:text-[2vw] md:text-[1.5vw] lg:text-[1vw] font-bold text-gray-700'>Completion: {Math.round(displayedProgress)}%</div>
        </div>
      </div>

      <div className='flex flex-col min-h-screen'>
        {/* Main board - with dynamic height */}
        <div className='flex-1 relative mx-auto my-4 max-w-[90vw] h-[calc(100vh-200px)] lg:max-w-[800px] lg:h-[calc(100vh-250px)]'>
          {/* Static stats bar */}
          <div
            className='absolute left-1/2 top-8 -translate-x-1/2 z-10 
                          bg-blue-100 border-4 border-amber-700 rounded-xl 
                          shadow-lg flex items-center gap-6 px-8 py-2 min-w-[300px]'
          >
            <div className='stat-icon-container ' ref={donutStatRef} style={{ position: "relative" }}>
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
              {animal.accessories && animal.accessories.map(accessory => <img key={accessory.id} src={accessory.image} alt={accessory.name} className='absolute top-0 left-0 w-full h-full object-contain' style={{ zIndex: 1 }} />)}
            </div>
          </div>

          {/* Add Inventory component */}
          <div
            className='hidden lg:flex fixed top-8 left-8 bg-white/90 border-2 border-yellow-300 rounded-xl shadow-lg 
                      flex-col gap-3 p-4 z-50 min-w-[180px] text-base overflow-hidden'
          >
            <h3 className='font-bold text-gray-800'>Inventory</h3>
            <div className='relative'>
              <button
                onClick={() => {
                  const container = document.getElementById("inventory-items");
                  if (container) {
                    container.scrollLeft -= 100;
                  }
                }}
                className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 rounded-full p-1 shadow-md hover:bg-yellow-100'
              >
                <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <path d='m15 18-6-6 6-6' />
                </svg>
              </button>
              <div id='inventory-items' className='flex gap-2 overflow-x-auto overflow-y-hidden scrollbar-none max-w-[180px]' style={{ scrollBehavior: "smooth" }}>
                {purchasedItems && purchasedItems.length > 0 ? (
                  purchasedItems.map(item => (
                    <button key={item.id} onClick={() => handleUseItem(item)} className='hover:scale-110 transition-transform bg-white p-2 rounded-lg shadow-sm flex-shrink-0' title={`Use ${item.name}`}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className='w-12 h-12 object-contain'
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/150?text=Item";
                        }}
                      />
                    </button>
                  ))
                ) : (
                  <p className='text-gray-500 text-sm'>No items yet</p>
                )}
              </div>
              <button
                onClick={() => {
                  const container = document.getElementById("inventory-items");
                  if (container) {
                    container.scrollLeft += 100;
                  }
                }}
                className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 rounded-full p-1 shadow-md hover:bg-yellow-100'
              >
                <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <path d='m9 18 6-6-6-6' />
                </svg>
              </button>
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

        {/* Reset buttons */}
        <div className='bg-gray-100 p-3 z-30'>
          <div className='flex flex-wrap justify-center gap-2 max-w-md mx-auto'>
            <button
              className='px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm shadow hover:bg-gray-300 
                         transition-colors touch-manipulation'
              onClick={handleResetHungerLocal}
              title='Reset Donut'
            >
              Reset Donut
            </button>
            <button
              className='px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm shadow hover:bg-gray-300 
                         transition-colors touch-manipulation'
              onClick={handleResetHappinessLocal}
              title='Reset Star'
            >
              Reset Star
            </button>
            <button
              className='px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm shadow hover:bg-gray-300 
                         transition-colors touch-manipulation'
              onClick={handleResetEnergyLocal}
              title='Reset Heart'
            >
              Reset Heart
            </button>
          </div>
        </div>
      </div>

      {/* Flying icon */}
      {flyingIcon && <img src={flyingIcon.src} style={flyingIcon.style} alt='flying icon' />}
    </div>
  );
}
