import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Circle, Globe, Cloud, CheckCircle, Users, Shield, Award, HelpCircle, Mail, MapPin, ChevronDown, ChevronUp, Phone, Heart, Target, Zap, Quote, ChevronLeft, ChevronRight } from "lucide-react";
// import { motion, useInView } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
// import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import AnimalMotionCircle from "./AnimalMotionCircle";
import PerfectAppContent from "./PerfectAppContent";
import { motion } from "framer-motion";

const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

type JumpInCardProps = React.HTMLAttributes<HTMLDivElement> & { delay?: number; children?: React.ReactNode };
function JumpInCard({ delay = 0, children, className = "", ...props }: JumpInCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new window.IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={className + (inView ? " animate-jump-in opacity-100 visible" : " opacity-0 invisible")} style={{ animationDelay: `${delay}s` }} {...props}>
      {children}
    </div>
  );
}

type FlipDownSectionProps = React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode };
function FlipDownSection({ children, className = "", ...props }: FlipDownSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new window.IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={className + (inView ? " animate-flip-down" : "")} {...props}>
      {children}
    </div>
  );
}

export default function WelcomePage() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const faqData = [
    {
      question: "How does Chope work?",
      answer: "Parents create tasks for their children through the app. When kids complete these tasks in real life, they earn points to feed and care for their virtual pet. The pet grows happier and stronger as more tasks are completed, creating a fun incentive system.",
      borderColor: "#93c5fd",
    },
    {
      question: "What age group is Chope designed for?",
      answer: "Chope is perfect for children ages 4-12. The tasks and interface are designed to be age-appropriate, and parents can customize difficulty levels based on their child's abilities and maturity.",
      borderColor: "#f9a8d4",
    },
    {
      question: "Is Chope safe for children?",
      answer: "Absolutely! Chope has no social features, chat functions, or external links. Children can only interact with family members added by parents. All data is encrypted and we never share personal information with third parties.",
      borderColor: "#facc15",
    },
    {
      question: "Can I customize the tasks for my child?",
      answer: "Yes! Parents have complete control over task creation and can customize everything from difficulty level to point values. You can create tasks that match your family's routine and your child's abilities.",
      borderColor: "#6ee7b7",
    },
    {
      question: "How do I track my child's progress?",
      answer: "The parent dashboard shows real-time progress, completed tasks, and your child's virtual pet status. You'll receive notifications when tasks are completed and can celebrate achievements together.",
      borderColor: "#93c5fd",
    },
    {
      question: "What happens if my child doesn't complete their tasks?",
      answer: "The virtual pet won't be harmed, but it won't grow as quickly or unlock new features. This creates natural motivation without causing distress. Parents can adjust expectations and provide additional support as needed.",
      borderColor: "#f9a8d4",
    },
    {
      question: "Is there a cost to use Chope?",
      answer: "Chope offers a free tier with basic features. Premium plans include advanced customization, multiple pets, detailed analytics, and family sharing features. We believe every family should have access to our core functionality.",
      borderColor: "#facc15",
    },
    {
      question: "Can multiple children use the same account?",
      answer: "Yes! Family accounts support multiple children, each with their own tasks, progress tracking, and virtual pets. Parents can manage everything from one dashboard while keeping each child's experience personalized.",
      borderColor: "#6ee7b7",
    },
  ];

  const testimonials = [
    {
      text: "Chope completely changed how my son approaches chores. He sees them as part of his pet care – and he actually enjoys it!",
      name: "Sarah Cohen",
      role: "Mom of 1 Boy",
      color: "bg-[#fbbdcb]",
      image: "/images/testimonials/parent1.svg",
    },
    {
      text: "I used to nag constantly. Now my daughter finishes tasks on her own just to earn food for Benny the Dino!",
      name: "Leah Green",
      role: "Mom of a Girl",
      color: "bg-[#8cd4f3]",
      image: "/images/testimonials/parent2.svg",
    },
    {
      text: "Our family has less tension and more cooperation – all thanks to a virtual pet. Genius!",
      name: "David Levi",
      role: "Dad of 2",
      color: "bg-[#fbdb84]",
      image: "/images/testimonials/parent3.svg",
    },
    {
      text: "The progress tracking is fantastic. I love seeing my kids hit their goals and their pets getting stronger. It's a win-win!",
      name: "Jessica Weiss",
      role: "Mom of 2",
      color: "bg-[#fbbdcb]",
      image: "/images/testimonials/parent4.svg",
    },
    {
      text: "My kids are finally excited about helping out. They race to finish their tasks so they can be the first to feed their pet.",
      name: "Mark Adler",
      role: "Dad of 3",
      color: "bg-[#8cd4f3]",
      image: "/images/testimonials/parent5.svg",
    },
    {
      text: "Chope is the perfect tool for teaching responsibility in a fun way. It's been a game-changer for our family routine.",
      name: "Rachel Stern",
      role: "Mom of a Boy",
      color: "bg-[#fbdb84]",
      image: "/images/testimonials/parent6.svg",
    },
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const testimonialRefs = useRef<(HTMLDivElement | null)[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scrollToTestimonial = (index: number) => {
    testimonialRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
    setCurrentTestimonial(index);
  };

  const handleNav = (direction: "prev" | "next") => {
    const newIndex = direction === "next" ? (currentTestimonial + 1) % testimonials.length : (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    scrollToTestimonial(newIndex);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (carouselRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  function FAQCard({ question, answer, borderColor }: { question: string; answer: string; borderColor: string }) {
    const cardContentStyle = "absolute w-full h-full [backface-visibility:hidden] rounded-xl bg-white p-6 shadow-md flex flex-col justify-center items-center text-center";
    const borderStyle = {
      border: `2px dashed ${borderColor}`,
      top: "8px",
      left: "8px",
      right: "8px",
      bottom: "8px",
    };

    return (
      <div className='group [perspective:1200px] w-full min-h-[200px] h-full'>
        <div className='relative w-full h-full min-h-[200px] transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]'>
          {/* Front Side */}
          <div className={cardContentStyle}>
            <span className='pointer-events-none absolute inset-0 rounded-xl' style={borderStyle} />
            <h3 className='font-bold text-lg text-[#23326a]'>{question}</h3>
          </div>

          {/* Back Side */}
          <div className={`${cardContentStyle} [transform:rotateY(180deg)]`}>
            <span className='pointer-events-none absolute inset-0 rounded-xl' style={borderStyle} />
            <p className='text-sm text-gray-600'>{answer}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-transparent text-white min-h-screen font-sans relative overflow-hidden'>
      {/* Decorative Elements */}
      {/* <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <Star className='absolute text-pink-300 w-10 h-6 top-100 left-10 animate-pulse' fill='currentColor' />
        <Star className='absolute text-yellow-300 w-4 h-4 top-24 right-24 animate-pulse' fill='currentColor' />
        <Star className='absolute text-pink-300 w-5 h-5 bottom-24 left-20 animate-pulse' fill='currentColor' />
        <Star className='absolute text-yellow-300 w-4 h-4 bottom-16 right-32 animate-pulse' fill='currentColor' />

        <div className='absolute w-16 h-16 bg-gradient-to-br from-[oklch(71.4%_0.203_305.504)] to-[oklch(82.7%_0.119_306.383)] rounded-full top-48 left-20 animate-bounce' style={{ animationDelay: "1s", animationDuration: "3s" }}></div>
        <div className='absolute w-12 h-12 bg-gradient-to-br from-[oklch(71.4%_0.203_305.504)] to-[oklch(82.7%_0.119_306.383)] rounded-full top-80 left-48 animate-bounce' style={{ animationDelay: "2s", animationDuration: "4s" }}></div>
        <div className='absolute w-14 h-14 bg-gradient-to-br from-[oklch(71.4%_0.203_305.504)] to-[oklch(82.7%_0.119_306.383)] rounded-full top-140 right-[15%] animate-bounce' style={{ animationDelay: "0.5s", animationDuration: "3.5s" }}></div>
        <div className='absolute w-20 h-20 bg-gradient-to-br from-[oklch(71.4%_0.203_305.504)] to-[oklch(82.7%_0.119_306.383)] rounded-full bottom-32 right-16 animate-bounce' style={{ animationDelay: "1.5s", animationDuration: "2.5s" }}></div>

        <div className='absolute bottom-16 left-0 w-32 h-16 bg-gradient-to-r from-[oklch(62.7%_0.265_303.9)/30] to-[oklch(62.7%_0.265_303.9)/30] rounded-full blur-sm'></div>
        <div className='absolute bottom-12 right-0 w-40 h-20 bg-gradient-to-l from-[oklch(62.7%_0.265_303.9)/30] to-[oklch(62.7%_0.265_303.9)/30] rounded-full blur-sm'></div>
      </div> */}

      {/* Header Bar */}
      <nav className='bg-white shadow-md relative z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-20'>
            {/* Logo */}
            <div className='flex-shrink-0 flex items-center'>
              {/* <img className='h-10 w-auto' src='/logo-dino.svg' alt='Little Dino Logo' /> */}
              <span className='ml-2 text-lg font-extrabold text-[#102358]'>
                Little <span className='text-[#60a5fa]'>Dino</span>
              </span>
            </div>

            {/* Menu */}
            <div className='hidden md:flex space-x-6'>
              <button onClick={() => scrollToSection("home")} className={`text-sm font-bold px-3 py-1 rounded-md ${activeSection === "home" ? "bg-[#ffd986] text-[#ffffff]" : "text-[#102358] hover:bg-[#ffd986]"}`}>
                Home
              </button>
              <button onClick={() => scrollToSection("core-values")} className='text-sm font-bold text-[#102358] hover:bg-[#ffd986] hover:text-[#ffffff] px-3 py-1 rounded-md'>
                Our Core Values
              </button>
              <button onClick={() => scrollToSection("about")} className='text-sm font-bold text-[#102358] hover:bg-[#ffd986] hover:text-[#ffffff] px-3 py-1 rounded-md'>
                About
              </button>
              <button onClick={() => scrollToSection("faq")} className='text-sm font-bold text-[#102358] hover:bg-[#ffd986] hover:text-[#ffffff] px-3 py-1 rounded-md'>
                FAQ
              </button>
            </div>

            {/* Action Buttons */}
            <div className='hidden md:flex gap-4'>
              <Button className='bg-[#ffd986] text-white hover:bg-yellow-400 px-5 outline-2 outline-offset-2 outline-dashed outline-[#ffd986] rounded-full text-sm font-semibold' onClick={() => navigate("/login/parent")}>
                I'm a Parent
              </Button>
              <Button className='bg-[#ffbacc] text-white hover:bg-pink-400 px-5 outline-2 outline-offset-2 outline-dashed outline-[#ffbacc] rounded-full text-sm font-semibold' onClick={() => navigate("/login/kid")}>
                I'm a Kid
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className='relative bg-[#faf8f2] overflow-hidden min-h-[650px] flex items-center'>
        {/* קישוטים */}
        {/* <img src="/decor/cloud-blue.svg" className="absolute left-0 top-0 w-48 z-0" alt="" />
  <img src="/decor/star-pink.svg" className="absolute right-10 top-20 w-12 z-0" alt="" />
  <img src="/decor/rocket.svg" className="absolute left-10 bottom-10 w-32 z-0" alt="" />
  <img src="/decor/bike.svg" className="absolute left-1/3 top-32 w-24 z-0" alt="" />
  <img src="/decor/stars.svg" className="absolute right-10 top-1/2 w-16 z-0" alt="" /> */}

        <div className='absolute right-0 w-7/10 h-full z-0 overflow-hidden'>
          <img
            src='/images/hero-kids.jpg'
            alt='Kid learning'
            className='w-full h-full object-cover object-center'
            style={{
              maskImage: "linear-gradient(to left, black 80%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to left, black 70%, transparent 100%)",
              background: "#faf8f2",
            }}
          />
        </div>

        {/* תוכן מרכזי */}
        <div className='container mx-auto flex items-center justify-between relative z-10'>
          <div className='max-w-xl z-20'>
            <div className='bg-[#87d4ee] text-white px-4 py-1 rounded-md text-sm font-bold mb-8 w-fit'>WELCOME TO LITTLEDINO!</div>
            <h1 className='text-6xl font-extrabold text-[#23326a] mb-8 justify-self-start'>
              Earn <span className='text-[#4ec3f7]'>&</span> Play!
            </h1>
            <p className='text-[#7d7d7d] text-lg mb-10 text-left'>Transform household chores into an exciting adventure! Your children will love completing tasks while raising adorable virtual pets.</p>
            <button className='relative bg-[#ffd986] text-white font-bold px-8 py-2 rounded-full shadow hover:bg-[#ffd36a] transition overflow-hidden border-none mr-50'>
              Read More
              <span
                className='pointer-events-none absolute inset-0 rounded-full'
                style={{
                  border: "2px dashed #fff",
                  top: "2px",
                  left: "2px",
                  right: "2px",
                  bottom: "2px",
                  position: "absolute",
                  borderRadius: "9999px",
                  boxSizing: "border-box",
                  zIndex: 1,
                }}
              />
            </button>
          </div>
        </div>
        {/* גל חותך למטה */}
        <svg className='absolute left-0 bottom-0 w-full h-20' viewBox='0 0 1200 120' preserveAspectRatio='none' style={{ pointerEvents: "none" }}>
          <path d='M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z' fill='#ffffff' />
        </svg>
      </div>

      {/* Features Section */}
      <div className='bg-[#ffffff] px-6'>
        <div className='container mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
            <div className='flex flex-col items-center'>
              <AnimalMotionCircle emoji='🦕' color='#89d4f2' pathColor='#89d4f2' scale={0.7} />
              <h3 className='font-bold text-xl mb-3 text-[#23326a]'>Fun Daily Tasks</h3>
              <p className='text-gray-600 text-md leading-relaxed'>
                Kids complete daily tasks
                <br />
                in an engaging and fun way
              </p>
            </div>

            <div className='flex flex-col items-center'>
              <AnimalMotionCircle emoji='🐸' color='#f9a8d4' delay={1.3} pathColor='#f9a8d4' scale={0.7} />
              <h3 className='font-bold text-xl mb-3 text-[#23326a]'>Virtual Pet</h3>
              <p className='text-gray-600 text-md leading-relaxed'>
                Kids raise a virtual pet
                <br />
                by completing their tasks
              </p>
            </div>

            <div className='flex flex-col items-center'>
              <AnimalMotionCircle emoji='🐋' color='#fdba74' delay={2.6} pathColor='#fdba74' scale={0.7} />
              <h3 className='font-bold text-xl mb-3 text-[#23326a]'>Progress Tracking</h3>
              <p className='text-gray-600 text-md leading-relaxed'>
                Parents can track their
                <br />
                kids' progress in real-time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className='relative'>
        <svg viewBox='0 0 1200 120' className='w-full rotate-180 bg-[#fcf8f5]'>
          <path d='M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z' fill='#ffffff' />
        </svg>
      </div>

      {/* Perfect App Section */}
      <div className='relative bg-[#fcf8f5] py-5 px-6 overflow-hidden pb-40'>
        {/* קישוטים */}
        {/* <img src="/decor/dino-yellow.svg" className="absolute left-32 top-8 w-32" alt="" /> */}
        {/* <img src="/decor/pencil-yellow.svg" className="absolute left-8 top-1/3 w-16" alt="" /> */}
        {/* <img src="/decor/cloud-yellow.svg" className="absolute right-12 top-10 w-28" alt="" /> */}
        {/* <img src="/decor/balloons-pink.svg" className="absolute right-16 bottom-32 w-20" alt="" /> */}
        {/* <img src="/decor/dino-blue.svg" className="absolute left-1/2 bottom-0 w-40" alt="" /> */}

        <div className='container mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10 justify-around'>
          {/* תמונה במסגרת מקווקוות */}
          <div className='relative flex items-center justify-center w-[540px] h-[450px]'>
            <div className='absolute left-0 top-0 w-[500px] h-[400px] rounded-3xl border-2 border-dashed border-pink-200 bg-white' style={{ zIndex: 0 }} />
            <img
              src='/images/parent-kid.png'
              alt='Kids'
              className='relative z-10 rounded-3xl w-[500px] h-[400px] object-cover'
              style={{
                marginTop: "10px",
                marginLeft: "20px",
                boxShadow: "0 4px 24px 0 rgba(0,0,0,0.04)",
              }}
            />
          </div>

          {/* תוכן טקסטואלי */}
          <div className='flex-1 flex flex-col justify-center items-start max-w-lg whitespace-normal'>
            <PerfectAppContent scrollToSection={scrollToSection} />
          </div>
        </div>
      </div>

      {/* Statistics over the wave */}
      <div className='relative h-[700px] w-full overflow-hidden z-5 -top-55'>
        <svg id='wave' className='absolute top-0 left-0 w-full' viewBox='0 0 1440 300' version='1.1' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <linearGradient id='sw-gradient-0' x1='0' x2='0' y1='1' y2='0'>
              <stop stopColor='rgba(68, 180, 224, 1)' offset='0%' />
              <stop stopColor='rgba(68, 180, 224, 1)' offset='100%' />
            </linearGradient>
          </defs>
          <path
            style={{ transform: "translate(0, 260px)", opacity: 1 }}
            fill='url(#sw-gradient-0)'
            d='
          M1550,0
          C1320,-120 1120,-80 800,-60
          L1440,0
          Z'
          />
          <defs>
            <linearGradient id='sw-gradient-1' x1='0' x2='0' y1='1' y2='0'>
              <stop stopColor='rgba(137, 212, 242, 1)' offset='0%' />
              <stop stopColor='rgba(137, 212, 242, 1)' offset='100%' />
            </linearGradient>
          </defs>
          <path
            style={{ transform: "translate(0, 50px)", opacity: 1 }}
            fill='url(#sw-gradient-1)'
            d='M0,156L120,149.5C240,143,480,130,720,136.5C960,143,1200,169,1440,156C1680,143,1920,91,2160,110.5C2400,130,2640,221,2880,234C3120,247,3360,182,3600,143C3840,104,4080,91,4320,123.5C4560,156,4800,234,5040,247C5280,260,5520,208,5760,214.5C6000,221,6240,286,6480,266.5C6720,247,6960,143,7200,91C7440,39,7680,39,7920,58.5C8160,78,8400,117,8640,162.5C8880,208,9120,260,9360,286C9600,312,9840,312,10080,273C10320,234,10560,156,10800,149.5C11040,143,11280,208,11520,201.5C11760,195,12000,117,12240,104C12480,91,12720,143,12960,182C13200,221,13440,247,13680,253.5C13920,260,14160,247,14400,208C14640,169,14880,104,15120,97.5C15360,91,15600,143,15840,195C16080,247,16320,299,16560,312C16800,325,17040,299,17160,286L17280,273L17280,390L17160,390C17040,390,16800,390,16560,390C16320,390,16080,390,15840,390C15600,390,15360,390,15120,390C14880,390,14640,390,14400,390C14160,390,13920,390,13680,390C13440,390,13200,390,12960,390C12720,390,12480,390,12240,390C12000,390,11760,390,11520,390C11280,390,11040,390,10800,390C10560,390,10320,390,10080,390C9840,390,9600,390,9360,390C9120,390,8880,390,8640,390C8400,390,8160,390,7920,390C7680,390,7440,390,7200,390C6960,390,6720,390,6480,390C6240,390,6000,390,5760,390C5520,390,5280,390,5040,390,4800,390,4560,390,4320,390,4080,390,3840,390,3600,390,3360,390,3120,390,2880,390,2640,390,2400,390,2160,390,1920,390,1680,390,1440,390,1200,390,960,390,720,390,480,390,240,390,120,390L0,390Z'
          />
        </svg>
        <div className='absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10'>
          <div className='flex flex-col md:flex-row justify-center align-center items-center gap-30 text-center mt-3'>
            <div>
              <div className='text-5xl md:text-6xl font-extrabold text-white mb-4'>10,000+</div>
              <div className='text-lg md:text-xl text-white/90'>Active families</div>
            </div>
            <div>
              <div className='text-5xl md:text-6xl font-extrabold text-white mb-4'>85%</div>
              <div className='text-lg md:text-xl text-white/90'>Improvement in children's behavior</div>
            </div>
            <div>
              <div className='text-5xl md:text-6xl font-extrabold text-white mb-4'>50,000+</div>
              <div className='text-lg md:text-xl text-white/90'>Tasks completed successfully</div>
            </div>
          </div>
          <button className='relative bg-white text-[#89d4f2] font-bold px-8 py-2 rounded-full shadow hover:bg-[#44b4e0] hover:text-white transition overflow-hidden border-none mt-12'>
            Start Now
            <span
              className='pointer-events-none absolute inset-0 rounded-full'
              style={{
                border: "2px dashed #89d4f2",
                top: "3px",
                left: "3px",
                right: "3px",
                bottom: "3px",
                position: "absolute",
                borderRadius: "9999px",
                boxSizing: "border-box",
                zIndex: 1,
              }}
            />
          </button>
        </div>
        <svg id='wave-bottom' className='absolute bottom-0 left-0 w-full scale-y-[-1]' viewBox='0 0 1440 390' version='1.1' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <linearGradient id='sw-gradient-0' x1='0' x2='0' y1='1' y2='0'>
              <stop stopColor='rgba(68, 180, 224, 1)' offset='0%' />
              <stop stopColor='rgba(68, 180, 224, 1)' offset='100%' />
            </linearGradient>
          </defs>
          <path
            style={{ transform: "translate(0, 200px)", opacity: 1 }}
            fill='url(#sw-gradient-0)'
            d='
          M0,0
          C200,-30 500,-120 650,80
          L0,300
          Z'
          />
          <defs>
            <linearGradient id='sw-gradient-1' x1='0' x2='0' y1='1' y2='0'>
              <stop stopColor='rgba(137, 212, 242, 1)' offset='0%' />
              <stop stopColor='rgba(137, 212, 242, 1)' offset='100%' />
            </linearGradient>
          </defs>
          <path
            style={{ transform: "translate(0, 50px)", opacity: 1 }}
            fill='url(#sw-gradient-1)'
            d='M0,156L120,149.5C240,143,480,130,720,136.5C960,143,1200,169,1440,156C1680,143,1920,91,2160,110.5C2400,130,2640,221,2880,234C3120,247,3360,182,3600,143C3840,104,4080,91,4320,123.5C4560,156,4800,234,5040,247C5280,260,5520,208,5760,214.5C6000,221,6240,286,6480,266.5C6720,247,6960,143,7200,91C7440,39,7680,39,7920,58.5C8160,78,8400,117,8640,162.5C8880,208,9120,260,9360,286C9600,312,9840,312,10080,273C10320,234,10560,156,10800,149.5C11040,143,11280,208,11520,201.5C11760,195,12000,117,12240,104C12480,91,12720,143,12960,182C13200,221,13440,247,13680,253.5C13920,260,14160,247,14400,208C14640,169,14880,104,15120,97.5C15360,91,15600,143,15840,195C16080,247,16320,299,16560,312C16800,325,17040,299,17160,286L17280,273L17280,390L17160,390C17040,390,16800,390,16560,390C16320,390,16080,390,15840,390C15600,390,15360,390,15120,390C14880,390,14640,390,14400,390C14160,390,13920,390,13680,390C13440,390,13200,390,12960,390C12720,390,12480,390,12240,390C12000,390,11760,390,11520,390C11280,390,11040,390,10800,390C10560,390,10320,390,10080,390C9840,390,9600,390,9360,390C9120,390,8880,390,8640,390C8400,390,8160,390,7920,390C7680,390,7440,390,7200,390C6960,390,6720,390,6480,390C6240,390,6000,390,5760,390C5520,390,5280,390,5040,390,4800,390,4560,390,4320,390,4080,390,3840,390,3600,390,3360,390,3120,390,2880,390,2640,390,2400,390,2160,390,1920,390,1680,390,1440,390,1200,390,960,390,720,390,480,390,240,390,120,390L0,390Z'
          />
        </svg>
      </div>

      {/* Core Values Section */}
      <div id='core-values' className='bg-white py-20 px-6 relative -top-90'>
        <div className='container mx-auto text-center'>
          <motion.h2 className='text-3xl sm:text-4xl font-bold mb-6 leading-tight' variants={textVariants} transition={{ duration: 0.6 }}>
            <span className='relative inline-block mb-3 '>
              <span className='relative z-10 text-[#23326a] left-[-20px]'>Our Core Values</span>
              <span className='absolute left-[-35px] right-0 bottom-0 h-5 bg-[#f9dadc] z-0 rounded-sm' style={{ zIndex: 0 }}></span>
            </span>
          </motion.h2>
          <p className='text-[#7d7d7d] mb-15 max-w-3xl mx-auto leading-relaxed'>
            At Chope, we believe in building stronger families through shared responsibility, <br /> fun, and meaningful connections. Our values guide everything we do.
          </p>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
            {[
              {
                icon: <Heart className='w-12 h-12 text-white' />,
                title: "Family Connection",
                desc: "We strengthen family bonds by creating shared experiences and meaningful interactions between parents and children.",
                bgColor: "bg-[#fbbdcb]", // pink-300
              },
              {
                icon: <Target className='w-12 h-12 text-white' />,
                title: "Responsibility",
                desc: "We help children develop a sense of responsibility and independence through age-appropriate tasks and achievements.",
                bgColor: "bg-[#8cd4f3]", // sky-300
              },
              {
                icon: <Zap className='w-12 h-12 text-white' />,
                title: "Joyful Learning",
                desc: "We make learning and growing fun by gamifying daily tasks and celebrating every achievement along the way.",
                bgColor: "bg-[#fbdb84]", // amber-300
              },
            ].map((card, idx) => (
              <JumpInCard key={card.title} delay={idx * 0.3} className={`relative ${card.bgColor} rounded-3xl p-8 text-center text-white flex flex-col h-full`}>
                <span className='pointer-events-none absolute inset-0 rounded-3xl' style={{ border: `2px dashed white`, top: "12px", left: "12px", right: "12px", bottom: "12px" }} />
                <div className='flex-grow flex flex-col items-center'>
                  <div className='mx-auto mb-6'>{card.icon}</div>
                  <h3 className='text-2xl font-bold mb-3'>{card.title}</h3>
                  <p className='leading-relaxed'>{card.desc}</p>
                </div>
              </JumpInCard>
            ))}
          </div>
          <div className='flex justify-center mt-20'>
            <div className='flex flex-col gap-6 items-center '>
              <motion.h3 className='text-2xl sm:text-3xl font-bold mb-2' variants={textVariants} transition={{ duration: 0.6 }}>
                <span className='relative inline-block'>
                  <span className='relative z-10 text-[#23326a]'>Why These Values Matter</span>
                  <span className='absolute left-[-8px] right-[-8px] bottom-0 h-4 bg-[#fce8bd] z-0 rounded-sm' style={{ zIndex: 0 }}></span>
                </span>
              </motion.h3>

              <p className='text-center text-lg text-black/70 font-medium max-w-3xl px-4'>In today's digital world, it's more important than ever to create meaningful connections within families. Chope bridges the gap between technology and real-world responsibility, ensuring that screen time leads to productive offline activities. We believe that when children feel valued, responsible, and connected to their families, they develop confidence and life skills that last a lifetime.</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className='relative pb-20 -top-100'>
        <div className='relative'>
          <svg viewBox='0 0 1200 120' className='w-full bg-transparent'>
            <path d='M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z' fill='#fcf8f5' />
          </svg>
        </div>

        <div id='about' className='bg-[#fcf8f5] pt-5 px-6 pb-35'>
          <div className='container mx-auto'>
            <div className='text-center mb-12'>
              <motion.h2 className='text-3xl sm:text-4xl font-bold mb-6 leading-tight' variants={textVariants} transition={{ duration: 0.6 }}>
                <span className='relative inline-block mb-3 '>
                  <span className='relative z-10 text-[#23326a] left-[-20px]'>About Chope</span>
                  <span className='absolute left-[-35px] right-0 bottom-0 h-5 bg-[#f9dadc] z-0 rounded-sm' style={{ zIndex: 0 }}></span>
                </span>
              </motion.h2>
              <p className='text-[#7d7d7d] mb-2 max-w-3xl mx-auto leading-relaxed'>Chope was born from the idea that household chores don't have to be a source of conflict between parents and children. Instead, they can become opportunities for connection, learning, and fun.</p>
            </div>
          </div>

          <div className='flex flex-col gap-6 items-center mb-10'>
            <motion.h3 className='text-2xl sm:text-3xl font-bold mb-2' variants={textVariants} transition={{ duration: 0.6 }}>
              <span className='relative inline-block'>
                <span className='relative z-10 text-[#23326a]'>Our Story</span>
                <span className='absolute left-[-8px] right-[-8px] bottom-0 h-4 bg-[#fce8bd] z-0 rounded-sm' style={{ zIndex: 0 }}></span>
              </span>
            </motion.h3>

            <p className='text-center text-lg text-black/70 font-medium max-w-2xl px-4'>From chaos to connection – through play.</p>
          </div>

          <div className='overflow-x-auto py-2 w-full'>
            <div className='flex gap-6 w-max px-4'>
              {[
                {
                  text: "As parents, we've been there – the daily struggle to get kids to help around the house.",
                  image: "/images/about/story1.png",
                },
                {
                  text: "Traditional rewards just didn't work. And the constant nagging? It only made things worse.",
                  image: "/images/about/story2.png",
                },
                {
                  text: "We knew there had to be a better way...",
                  image: "/images/about/story3.png",
                },
                {
                  text: "That's when we discovered the magic of virtual pet care.",
                  image: "/images/about/story4.png",
                },
                {
                  text: "When real chores feed their pet, motivation comes naturally.",
                  image: "/images/about/story5.png",
                },
                {
                  text: "And family life? It just got a whole lot better.",
                  image: "/images/about/story6.png",
                },
              ].map((item, i) => (
                <div key={i} className='flex-shrink-0 w-64 bg-white rounded-2xl shadow p-4 text-center'>
                  <img src={item.image} alt={`Story step ${i + 1}`} className='w-full h-50 object-cover rounded-xl mb-4' />
                  <p className='text-md text-gray-700'>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orange!!!*/}
      <div className='relative h-[700px] w-full overflow-hidden -top-175 -bottom-100 z-5'>
        <svg id='wave' className='absolute top-0 left-0 w-full' viewBox='0 0 1440 300' version='1.1' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <linearGradient id='ow-gradient-0' x1='0' x2='0' y1='1' y2='0'>
              <stop stopColor='#fbd07a' offset='0%' />
              <stop stopColor='#fbd07a' offset='100%' />
            </linearGradient>
          </defs>
          <path
            style={{ transform: "translate(0, 260px)", opacity: 1 }}
            fill='url(#ow-gradient-0)'
            d='
          M1550,0
          C1320,-120 1120,-80 800,-60
          L1440,0
          Z'
          />
          <defs>
            <linearGradient id='ow-gradient-1' x1='0' x2='0' y1='1' y2='0'>
              <stop stopColor='#ffdd99' offset='0%' />
              <stop stopColor='#ffdd99' offset='100%' />
            </linearGradient>
          </defs>
          <path
            style={{ transform: "translate(0, 50px)", opacity: 1 }}
            fill='url(#ow-gradient-1)'
            d='M0,156L120,149.5C240,143,480,130,720,136.5C960,143,1200,169,1440,156C1680,143,1920,91,2160,110.5C2400,130,2640,221,2880,234C3120,247,3360,182,3600,143C3840,104,4080,91,4320,123.5C4560,156,4800,234,5040,247C5280,260,5520,208,5760,214.5C6000,221,6240,286,6480,266.5C6720,247,6960,143,7200,91C7440,39,7680,39,7920,58.5C8160,78,8400,117,8640,162.5C8880,208,9120,260,9360,286C9600,312,9840,312,10080,273C10320,234,10560,156,10800,149.5C11040,143,11280,208,11520,201.5C11760,195,12000,117,12240,104C12480,91,12720,143,12960,182C13200,221,13440,247,13680,253.5C13920,260,14160,247,14400,208C14640,169,14880,104,15120,97.5C15360,91,15600,143,15840,195C16080,247,16320,299,16560,312C16800,325,17040,299,17160,286L17280,273L17280,390L17160,390C17040,390,16800,390,16560,390C16320,390,16080,390,15840,390C15600,390,15360,390,15120,390C14880,390,14640,390,14400,390C14160,390,13920,390,13680,390C13440,390,13200,390,12960,390C12720,390,12480,390,12240,390C12000,390,11760,390,11520,390C11280,390,11040,390,10800,390C10560,390,10320,390,10080,390C9840,390,9600,390,9360,390C9120,390,8880,390,8640,390C8400,390,8160,390,7920,390C7680,390,7440,390,7200,390C6960,390,6720,390,6480,390C6240,390,6000,390,5760,390C5520,390,5280,390,5040,390,4800,390,4560,390,4320,390,4080,390,3840,390,3600,390,3360,390,3120,390,2880,390,2640,390,2400,390,2160,390,1920,390,1680,390,1440,390,1200,390,960,390,720,390,480,390,240,390,120,390L0,390Z'
          />
        </svg>

        {/* Clouds */}
        <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.5 }} className='absolute top-65 left-[45px] w-40 h-30 z-10'>
          <img src='/icons/cloud.png' alt='Cloud' className='w-full h-full text-white' />
        </motion.div>
        <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} className='absolute top-80 -right-15 w-40 h-30 z-10'>
          <img src='/icons/cloud.png' alt='Cloud' className='w-full h-full' />
        </motion.div>

        {/*Card Row */}
        <div className='absolute inset-0 flex items-center justify-center z-10 px-4'>
          <div className='flex flex-col md:flex-row gap-8'>
            {[
              {
                title: "Family-Centered Design",
                desc: "Designed to strengthen family bonds.",
                borderColor: "#96d3eb", // blue-300
                iconBg: "bg-[#96d3eb]",
                iconColor: "text-white",
              },
              {
                title: "Child Safety First",
                desc: "No distractions, just safe connection.",
                borderColor: "#f9a8d4", // pink-300
                iconBg: "bg-[#f9a8d4]",
                iconColor: "text-white",
              },
              {
                title: "Real-World Impact",
                desc: "Earn online, grow offline.",
                borderColor: "#fbd07a", // yellow-400
                iconBg: "bg-[#fbd07a]",
                iconColor: "text-white",
              },
            ].map((card, i) => (
              <div key={i} className={`relative bg-white rounded-2xl px-8 py-6 shadow-md flex items-center min-w-[240px]`}>
                <span
                  className='pointer-events-none absolute inset-0 rounded-xl'
                  style={{
                    border: `2px dashed ${card.borderColor}`,
                    top: "10px",
                    left: "10px",
                    right: "10px",
                    bottom: "10px",
                  }}
                />
                <div className='flex items-center'>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${card.iconBg} ${card.iconColor} mr-2 font-bold`}>✓</div>
                  <div className='flex flex-col items-start ml-4'>
                    <h3 className='font-bold text-base text-[#23326a]'>{card.title}</h3>
                    <p className='text-sm text-[#7d7d7d]'>{card.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <svg id='wave-bottom' className='absolute bottom-0 left-0 w-full scale-y-[-1]' viewBox='0 0 1440 390' version='1.1' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <linearGradient id='ow-gradient-0' x1='0' x2='0' y1='1' y2='0'>
              <stop stopColor='#fbd07a' offset='0%' />
              <stop stopColor='#fbd07a' offset='100%' />
            </linearGradient>
          </defs>
          <path
            style={{ transform: "translate(0, 200px)", opacity: 1 }}
            fill='url(#ow-gradient-0)'
            d='
          M0,0
          C200,-30 500,-120 650,80
          L0,300
          Z'
          />
          <defs>
            <linearGradient id='ow-gradient-1' x1='0' x2='0' y1='1' y2='0'>
              <stop stopColor='#ffdd99' offset='0%' />
              <stop stopColor='#ffdd99' offset='100%' />
            </linearGradient>
          </defs>
          <path
            style={{ transform: "translate(0, 50px)", opacity: 1 }}
            fill='url(#ow-gradient-1)'
            d='M0,156L120,149.5C240,143,480,130,720,136.5C960,143,1200,169,1440,156C1680,143,1920,91,2160,110.5C2400,130,2640,221,2880,234C3120,247,3360,182,3600,143C3840,104,4080,91,4320,123.5C4560,156,4800,234,5040,247C5280,260,5520,208,5760,214.5C6000,221,6240,286,6480,266.5C6720,247,6960,143,7200,91C7440,39,7680,39,7920,58.5C8160,78,8400,117,8640,162.5C8880,208,9120,260,9360,286C9600,312,9840,312,10080,273C10320,234,10560,156,10800,149.5C11040,143,11280,208,11520,201.5C11760,195,12000,117,12240,104C12480,91,12720,143,12960,182C13200,221,13440,247,13680,253.5C13920,260,14160,247,14400,208C14640,169,14880,104,15120,97.5C15360,91,15600,143,15840,195C16080,247,16320,299,16560,312C16800,325,17040,299,17160,286L17280,273L17280,390L17160,390C17040,390,16800,390,16560,390C16320,390,16080,390,15840,390C15600,390,15360,390,15120,390C14880,390,14640,390,14400,390C14160,390,13920,390,13680,390C13440,390,13200,390,12960,390C12720,390,12480,390,12240,390C12000,390,11760,390,11520,390C11280,390,11040,390,10800,390C10560,390,10320,390,10080,390C9840,390,9600,390,9360,390C9120,390,8880,390,8640,390C8400,390,8160,390,7920,390C7680,390,7440,390,7200,390C6960,390,6720,390,6480,390C6240,390,6000,390,5760,390C5520,390,5280,390,5040,390,4800,390,4560,390,4320,390,4080,390,3840,390,3600,390,3360,390,3120,390,2880,390,2640,390,2400,390,2160,390,1920,390,1680,390,1440,390,1200,390,960,390,720,390,480,390,240,390,120,390L0,390Z'
          />
        </svg>
      </div>

      {/* Testimonials Section */}
      <div className='bg-white py-16 px-6 -mt-210 flex justify-center'>
        <div className='container text-center'>
          <motion.h2 className='text-3xl sm:text-4xl font-bold mb-6 leading-tight' variants={textVariants} transition={{ duration: 0.6 }}>
            <span className='relative inline-block mb-3 '>
              <span className='relative z-10 text-[#23326a] left-[-20px]'>What Parents Say</span>
              <span className='absolute left-[-35px] right-0 bottom-0 h-5 bg-[#f9dadc] z-0 rounded-sm' style={{ zIndex: 0 }}></span>
            </span>
          </motion.h2>
          <p className='text-[#7d7d7d] text-lg max-w-2xl mx-auto mb-12'>
            Chope helps turn everyday tasks into meaningful, joyful moments –<br /> and parents feel the difference.
          </p>

          <div className='relative'>
            <div className='flex overflow-x-auto snap-x snap-mandatory py-8 space-x-8 px-0' ref={carouselRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}>
              {testimonials.map((testimonial, i) => (
                <div
                  key={i}
                  ref={el => {
                    testimonialRefs.current[i] = el;
                  }}
                  className='snap-center flex-shrink-0 w-full md:w-1/3 px-2'>
                  <div className='flex flex-col items-center text-center h-full'>
                    <div className={`relative ${testimonial.color} rounded-3xl p-8 pt-12 text-white h-[250px] flex items-center`}>
                      <Quote className='absolute top-4 left-4 w-12 h-12 text-white/20' />
                      <p className='relative z-10 text-lg leading-relaxed'>{testimonial.text}</p>
                      <div className='absolute bottom-[-15px] left-10 w-8 h-8 rotate-45' style={{ backgroundColor: "inherit" }}></div>
                    </div>
                    <div className='flex items-center gap-4 mt-4'>
                      <img src={testimonial.image} alt={testimonial.name} className='w-16 h-16 rounded-full object-cover border-4 border-white shadow-md' />
                      <div className='text-left'>
                        <h4 className='font-bold text-lg text-[#23326a]'>{testimonial.name}</h4>
                        <p className='text-gray-500'>{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => handleNav("prev")} className='absolute top-1/2 left-0 -translate-y-1/2 bg-white/50 hover:bg-white rounded-full p-2 z-20'>
              <ChevronLeft className='w-6 h-6 text-gray-700' />
            </button>
            <button onClick={() => handleNav("next")} className='absolute top-1/2 right-0 -translate-y-1/2 bg-white/50 hover:bg-white rounded-full p-2 z-20'>
              <ChevronRight className='w-6 h-6 text-gray-700' />
            </button>

            <div className='flex justify-center mt-4 gap-3'>
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => scrollToTestimonial(i)} className={`w-3 h-3 rounded-full ${currentTestimonial === i ? "bg-[#8cd4f3]" : "bg-gray-300"}`}></button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className='relative h-[700px] w-full overflow-hidden -top-15 mb-[-170px] z-5'>
        <svg id='wave' className='absolute top-0 left-0 w-full' viewBox='0 0 1440 300' version='1.1' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <linearGradient id='tw-gradient-0' x1='0' x2='0' y1='1' y2='0'>
              <stop stopColor='#fc9db7' offset='0%' />
              <stop stopColor='#fc9db7' offset='100%' />
            </linearGradient>
          </defs>
          <path
            style={{ transform: "translate(0, 260px)", opacity: 1 }}
            fill='url(#tw-gradient-0)'
            d='
          M1550,0
          C1320,-120 1120,-80 800,-60
          L1440,0
          Z'
          />
          <defs>
            <linearGradient id='tw-gradient-1' x1='0' x2='0' y1='1' y2='0'>
              <stop stopColor='#fcb6c9' offset='0%' />
              <stop stopColor='#fcb6c9' offset='100%' />
            </linearGradient>
          </defs>
          <path
            style={{ transform: "translate(0, 50px)", opacity: 1 }}
            fill='url(#tw-gradient-1)'
            d='M0,156L120,149.5C240,143,480,130,720,136.5C960,143,1200,169,1440,156C1680,143,1920,91,2160,110.5C2400,130,2640,221,2880,234C3120,247,3360,182,3600,143C3840,104,4080,91,4320,123.5C4560,156,4800,234,5040,247C5280,260,5520,208,5760,214.5C6000,221,6240,286,6480,266.5C6720,247,6960,143,7200,91C7440,39,7680,39,7920,58.5C8160,78,8400,117,8640,162.5C8880,208,9120,260,9360,286C9600,312,9840,312,10080,273C10320,234,10560,156,10800,149.5C11040,143,11280,208,11520,201.5C11760,195,12000,117,12240,104C12480,91,12720,143,12960,182C13200,221,13440,247,13680,253.5C13920,260,14160,247,14400,208C14640,169,14880,104,15120,97.5C15360,91,15600,143,15840,195C16080,247,16320,299,16560,312C16800,325,17040,299,17160,286L17280,273L17280,390L17160,390C17040,390,16800,390,16560,390C16320,390,16080,390,15840,390C15600,390,15360,390,15120,390C14880,390,14640,390,14400,390C14160,390,13920,390,13680,390C13440,390,13200,390,12960,390C12720,390,12480,390,12240,390C12000,390,11760,390,11520,390C11280,390,11040,390,10800,390C10560,390,10320,390,10080,390C9840,390,9600,390,9360,390C9120,390,8880,390,8640,390C8400,390,8160,390,7920,390C7680,390,7440,390,7200,390C6960,390,6720,390,6480,390C6240,390,6000,390,5760,390C5520,390,5280,390,5040,390,4800,390,4560,390,4320,390,4080,390,3840,390,3600,390,3360,390,3120,390,2880,390,2640,390,2400,390,2160,390,1920,390,1680,390,1440,390,1200,390,960,390,720,390,480,390,240,390,120,390L0,390Z'
          />
        </svg>
        <div className='absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10 gap-3'>
          <h2 className='text-4xl font-bold text-white mb-4'>Ready to Transform Chore Time?</h2>
          <p className='text-white text-lg mb-6 leading-relaxed'>
            Join thousands of families who have discovered the joy of working together. <br /> Start your Chope journey today and watch your children become eager helpers!
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button className='relative bg-white text-[#ffbacc] font-bold px-8 py-2 rounded-full shadow hover:bg-[#fc9db7] hover:text-white transition overflow-hidden border-none'>
              Start Now
              <span
                className='pointer-events-none absolute inset-0 rounded-full'
                style={{
                  border: "2px dashed #ffbacc",
                  top: "3px",
                  left: "3px",
                  right: "3px",
                  bottom: "3px",
                  position: "absolute",
                  borderRadius: "9999px",
                  boxSizing: "border-box",
                  zIndex: 1,
                }}
              />
            </button>
          </div>
        </div>
        <svg id='wave-bottom' className='absolute bottom-0 left-0 w-full scale-y-[-1]' viewBox='0 0 1440 390' version='1.1' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <linearGradient id='tw-gradient-0' x1='0' x2='0' y1='1' y2='0'>
              <stop stopColor='#fc9db7' offset='0%' />
              <stop stopColor='#fc9db7' offset='100%' />
            </linearGradient>
          </defs>
          <path
            style={{ transform: "translate(0, 200px)", opacity: 1 }}
            fill='url(#tw-gradient-0)'
            d='
          M0,0
          C200,-30 500,-120 650,80
          L0,300
          Z'
          />
          <defs>
            <linearGradient id='tw-gradient-1' x1='0' x2='0' y1='1' y2='0'>
              <stop stopColor='#fcb6c9' offset='0%' />
              <stop stopColor='#fcb6c9' offset='100%' />
            </linearGradient>
          </defs>
          <path
            style={{ transform: "translate(0, 50px)", opacity: 1 }}
            fill='url(#tw-gradient-1)'
            d='M0,156L120,149.5C240,143,480,130,720,136.5C960,143,1200,169,1440,156C1680,143,1920,91,2160,110.5C2400,130,2640,221,2880,234C3120,247,3360,182,3600,143C3840,104,4080,91,4320,123.5C4560,156,4800,234,5040,247C5280,260,5520,208,5760,214.5C6000,221,6240,286,6480,266.5C6720,247,6960,143,7200,91C7440,39,7680,39,7920,58.5C8160,78,8400,117,8640,162.5C8880,208,9120,260,9360,286C9600,312,9840,312,10080,273C10320,234,10560,156,10800,149.5C11040,143,11280,208,11520,201.5C11760,195,12000,117,12240,104C12480,91,12720,143,12960,182C13200,221,13440,247,13680,253.5C13920,260,14160,247,14400,208C14640,169,14880,104,15120,97.5C15360,91,15600,143,15840,195C16080,247,16320,299,16560,312C16800,325,17040,299,17160,286L17280,273L17280,390L17160,390C17040,390,16800,390,16560,390C16320,390,16080,390,15840,390C15600,390,15360,390,15120,390C14880,390,14640,390,14400,390C14160,390,13920,390,13680,390C13440,390,13200,390,12960,390C12720,390,12480,390,12240,390C12000,390,11760,390,11520,390C11280,390,11040,390,10800,390C10560,390,10320,390,10080,390C9840,390,9600,390,9360,390C9120,390,8880,390,8640,390C8400,390,8160,390,7920,390C7680,390,7440,390,7200,390C6960,390,6720,390,6480,390C6240,390,6000,390,5760,390C5520,390,5280,390,5040,390,4800,390,4560,390,4320,390,4080,390,3840,390,3600,390,3360,390,3120,390,2880,390,2640,390,2400,390,2160,390,1920,390,1680,390,1440,390,1200,390,960,390,720,390,480,390,240,390,120,390L0,390Z'
          />
        </svg>
      </div>

      {/* FAQ Section */}
      <FlipDownSection>
        <div id='faq' className='bg-white py-16 px-6'>
          <div className='text-center mb-12'>
            <motion.h2 className='text-3xl sm:text-4xl font-bold mb-6 leading-tight' variants={textVariants} transition={{ duration: 0.6 }}>
              <span className='relative inline-block mb-3 '>
                <span className='relative z-10 text-[#23326a] left-[-20px]'>Frequently Asked Questions</span>
                <span className='absolute left-[-35px] right-0 bottom-0 h-5 bg-[#f9dadc] z-0 rounded-sm' style={{ zIndex: 0 }}></span>
              </span>
            </motion.h2>
            <p className='text-gray-600 text-lg'>Everything you need to know about Chope and how it works for your family.</p>
          </div>
          <div className='rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full'>
            {faqData.map((faq, idx) => (
              <FAQCard key={idx} question={faq.question} answer={faq.answer} borderColor={faq.borderColor} />
            ))}
          </div>
        </div>
      </FlipDownSection>

      {/* Footer */}
      <div className='bg-[#2d4072] text-white pt-25 relative'>
        <div className='container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-[-80px]'>
          {/* Logo and Contact Section */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <img src='/logo-dino.svg' alt='Chope Logo' className='h-10' />
              <span className='text-lg font-bold'>Chope</span>
            </div>
            <p className='text-white/80 text-sm max-w-xs text-start'>
              <b>Making families stronger, one task at a time.</b> <br />
              Help your child grow through fun challenges, adorable pets, and daily goals that bring the family closer together.
            </p>
            <div className='flex gap-4'>
              <a href='#' className='w-8 h-8 bg-[#89d4f2] rounded-full flex items-center justify-center hover:bg-sky-400 px-2 outline-2 outline-offset-2 outline-dashed outline-[#89d4f2]'>
                <img src='/icons/twitter.svg' alt='Twitter' className='w-4 h-4' />
              </a>
              <a href='#' className='w-8 h-8 bg-[#3B5998] rounded-full flex items-center justify-center hover:bg-blue-800 px-2 outline-2 outline-offset-2 outline-dashed outline-[#3B5998]'>
                <img src='/icons/facebook.svg' alt='Facebook' className='w-4 h-4' />
              </a>
              <a href='#' className='w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-[#C8232C] px-2 outline-2 outline-offset-2 outline-dashed outline-red-500'>
                <img src='/icons/pinterest.svg' alt='Pinterest' className='w-4 h-4' />
              </a>
            </div>
          </div>

          {/* Contact Information */}
          <div className='space-y-4'>
            <h3 className='text-xl font-bold mb-6 text-start'>Our Contacts</h3>
            <div className='space-y-4'>
              <div className='flex items-start gap-3'>
                <MapPin className='w-6 text-[#89d4f2]' />
                <p>27 Division St, New York, NY 10002, USA</p>
              </div>
              <div className='flex items-start gap-3'>
                <Phone className='w-6 text-[#89d4f2]' />
                <div>
                  <p>+1 (888) 561 795 1</p>
                  <p>+1 (888) 561 795 2</p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Mail className='w-6 text-[#89d4f2]' />
                <div>
                  <p>chope@wgl.com</p>
                  <p>chope@mail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          <div>
            <h3 className='text-xl font-bold mb-6 text-start'>Our Gallery</h3>
            <div className='grid grid-cols-3 gap-0 w-fit mb-20'>
              {[1, 2, 3, 4, 5, 6].map(num => (
                <div key={num} className='w-24 h-24 mb-4 mr-2'>
                  <img src={`/images/footer/gallery-${num}.jpg`} alt={`Gallery ${num}`} className='w-full h-full object-cover rounded-lg' />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <img src='/images/footer/dino-outline.svg' alt='' className='absolute left-10 bottom-10 w-32 ' />
        <div className='absolute right-10 top-20 flex gap-2'>
          <img src='/images/footer/star-outline.svg' alt='' className='w-6 text-[#ffbacc]' />
          <img src='/images/footer/star-outline.svg' alt='' className='w-8 text-[#ffbacc]' />
          <img src='/images/footer/star-outline.svg' alt='' className='w-6 text-[#ffbacc]' />
        </div>

        {/* Copyright */}
        <div className='relative'>
          {/* Top Wave for Copyright Section */}
          <svg className='w-full' viewBox='0 0 1200 30' preserveAspectRatio='none'>
            <path d='M0,15 C150,30 350,0 600,15 C850,30 1050,0 1200,15 L1200,30 L0,30 Z' fill='#223668' />
          </svg>
          <div className='text-center pb-6 pt-4 bg-[#223668]'>
            <p className='text-white/60'>
              Copyright © 2025 Chope by{" "}
              <a href='#' className='text-white hover:text-[#60a5fa]'>
                N&A
              </a>
              . All Rights Reserved.
            </p>
          </div>
        </div>

        {/* Scroll to top button */}
        <div className='absolute left-1/2 -translate-x-1/2 top-5 z-20'>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className='relative w-10 h-10 bg-[#ffd986] rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-400 transition-colors outline-2 outline-offset-4 outline-dashed outline-[#ffd986]' aria-label='Scroll to top'>
            <ChevronUp className='w-8 h-8 text-white' />
          </button>
        </div>

        {/* Top Wave */}
        <svg className='absolute top-0 left-0 w-full' viewBox='0 0 1200 60' preserveAspectRatio='none' style={{ transform: "rotate(180deg)" }}>
          <path d='M0,30 Q300,0 600,30 T1200,30 L1200,60 L0,60 Z' fill='#ffffff' stroke='none' strokeWidth='0' />
        </svg>
      </div>
    </div>
  );
}
