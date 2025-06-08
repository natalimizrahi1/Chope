import { useEffect, useState, useRef } from 'react';
import { Button } from '../ui/button';

const STATS = {
  MAX: 4,
  MIN: 0
} as const;

type StatLevel = 1 | 2 | 3 | 4;

const IMAGES = {
  background: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561670551/virtual%20pet/little-board.png',
  bar: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561857600/virtual%20pet/item-box.png',
  donut: {
    4: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561725898/virtual%20pet/h1.png',
    3: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561725898/virtual%20pet/h2.png',
    2: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561725898/virtual%20pet/h3.png',
    1: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561725898/virtual%20pet/h4.png'
  } as const,
  star: {
    4: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561725934/virtual%20pet/s1.png',
    3: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561725934/virtual%20pet/s2.png',
    2: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561725934/virtual%20pet/s3.png',
    1: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561725934/virtual%20pet/s4.png'
  } as const,
  heart: {
    4: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561725918/virtual%20pet/l1.png',
    3: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561725919/virtual%20pet/l2.png',
    2: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561725919/virtual%20pet/l3.png',
    1: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561725919/virtual%20pet/l4.png'
  } as const,
  games: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561857776/virtual%20pet/gamesbox.png',
  pill: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561857719/virtual%20pet/medicene.png',
  drink: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561857689/virtual%20pet/red-smoothie.png',
  food: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561857661/virtual%20pet/sandwich.png',
  benny: 'https://res.cloudinary.com/dytmcam8b/image/upload/v1561677299/virtual%20pet/Sheet.png'
} as const;

const SOUNDS = {
  munch: 'https://res.cloudinary.com/dytmcam8b/video/upload/v1562342736/sounds/zapsplat_human_eat_biscuit_mouth_closed_28532.mp3',
  slurp: 'https://res.cloudinary.com/dytmcam8b/video/upload/v1562342736/sounds/zapsplat_human_drink_from_glass_slurp_single_21665.mp3',
  laugh: 'https://res.cloudinary.com/dytmcam8b/video/upload/v1562343433/sounds/zapsplat_human_male_middle_aged_laugh_slightly_sinister_003_32379.mp3',
  pill: 'https://res.cloudinary.com/dytmcam8b/video/upload/v1562343433/sounds/noisecreations_SFX-NCFREE02_Synth-Swell.mp3',
  groan: 'https://res.cloudinary.com/dytmcam8b/video/upload/v1562344222/sounds/zapsplat_human_breath_last_dying_003_15986.mp3',
  hello: 'https://res.cloudinary.com/dytmcam8b/video/upload/v1562343433/sounds/zapsplat_human_male_middle_aged_says_hello_002_15455.mp3'
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
  type: 'hat' | 'shirt';
};

interface VirtualPetProps {
  animal: {
    name: string;
    type: string;
    level: number;
    xp: number;
    stats: Stat;
    accessories: Accessory[];
  };
  onFeed: () => void;
  onPlay: () => void;
  onSleep: () => void;
}

function Benny() {
  return (
    <div
      className="benny"
      style={{
        width: 329,
        height: 447,
        background: 'url(https://res.cloudinary.com/dytmcam8b/image/upload/v1561677299/virtual%20pet/Sheet.png) 0 0',
        zIndex: 2000,
        animation: 'moveX 1.5s steps(10) infinite',
      }}
    />
  );
}

export default function VirtualPet({ animal, onFeed, onPlay, onSleep }: VirtualPetProps) {
  const [timeAlive, setTimeAlive] = useState(0);
  const [isDead, setIsDead] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Initialize audio elements
    const audioElements: Record<string, HTMLAudioElement> = {};
    Object.entries(SOUNDS).forEach(([key, url]) => {
      audioElements[key] = new Audio(url);
    });
    audioRefs.current = audioElements;

    // Play hello sound after 4 seconds
    const greeting = setTimeout(() => {
      audioRefs.current.hello?.play();
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
      audioRefs.current.groan?.play();
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

  const handleFeed = () => {
    onFeed();
    audioRefs.current.munch?.play();
  };

  const handleDrink = () => {
    onFeed();
    audioRefs.current.slurp?.play();
  };

  const handleHeal = () => {
    onSleep();
    audioRefs.current.pill?.play();
  };

  const handlePlay = () => {
    onPlay();
    audioRefs.current.laugh?.play();
  };

  const handleRestart = () => {
    setTimeAlive(0);
    setIsDead(false);
    audioRefs.current.hello?.play();
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="relative w-[800px] h-[520px]">
        {/* הלוח */}
        <img
          src={IMAGES.background}
          alt="background board"
          className="absolute inset-0 w-full h-full z-0"
          style={{ objectFit: 'fill' }}
        />

        {/* סרגל סטטיסטיקות */}
        <div className="absolute left-1/2 top-8 -translate-x-1/2 z-10 bg-blue-100 border-4 border-[#7c4a03] rounded-xl shadow-lg flex items-center gap-8 px-10 py-2" style={{ minWidth: 320 }}>
          <img src={IMAGES.donut[Math.ceil(animal.stats.hunger / 25) as keyof typeof IMAGES.donut]} alt="doughnut" className="w-12" />
          <img src={IMAGES.star[Math.ceil(animal.stats.happiness / 25) as keyof typeof IMAGES.star]} alt="star" className="w-12" />
          <img src={IMAGES.heart[Math.ceil(animal.stats.energy / 25) as keyof typeof IMAGES.heart]} alt="heart" className="w-10" />
        </div>

        {/* דמות החיה במרכז */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-50 z-10">
          <Benny />
        </div>

        {/* כפתורים בפינות */}
        <button onClick={handlePlay} className="absolute left-16 top-24 w-24 z-20 hover:scale-110 transition-transform">
          <img src={IMAGES.games} alt="toy box" />
        </button>
        <button onClick={handleHeal} className="absolute left-32 bottom-20 w-20 z-20 hover:scale-110 transition-transform">
          <img src={IMAGES.pill} alt="pill" />
        </button>
        <button onClick={handleFeed} className="absolute right-24 top-24 w-24 z-20 hover:scale-110 transition-transform">
          <img src={IMAGES.food} alt="sandwich" />
        </button>
        <button onClick={handleDrink} className="absolute right-32 bottom-20 w-20 z-20 hover:scale-110 transition-transform">
          <img src={IMAGES.drink} alt="smoothie" />
        </button>
      </div>
    </div>
  );
}
