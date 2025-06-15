import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Circle, Globe, Cloud, CheckCircle, Users, Shield, Award, HelpCircle, ChevronDown, ChevronUp, Heart, Target, Zap } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";

const transition = { duration: 4, yoyo: Infinity, ease: "easeInOut" };
const animalPath = "M 239 17 C 142 17 48.5 103 48.5 213.5 C 48.5 324 126 408 244 408 C 362 408 412 319 412 213.5 C 412 108 334 68.5 244 68.5 C 154 68.5 102.68 135.079 99 213.5 C 95.32 291.921 157 350 231 345.5 C 305 341 357.5 290 357.5 219.5 C 357.5 149 314 121 244 121 C 174 121 151.5 167 151.5 213.5 C 151.5 260 176 286.5 224.5 286.5 C 273 286.5 296.5 253 296.5 218.5 C 296.5 184 270 177 244 177 C 218 177 197 198 197 218.5 C 197 239 206 250.5 225.5 250.5 C 245 250.5 253 242 253 218.5";

const boxStyle = (color: string) => ({
  width: 80,
  height: 80,
  backgroundColor: "#fff",
  border: `4px dashed ${color}`,
  borderRadius: "50%",
  position: "absolute" as const,
  top: 0,
  left: 0,
  offsetPath: `path(\"${animalPath}\")`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "3rem",
  zIndex: 2,
});

const pathSvgStyle = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  zIndex: 1,
};

function AnimalMotionCircle({ emoji, color, delay = 0, pathColor = "#67e8f9" }: { emoji: string; color: string; delay?: number; pathColor?: string }) {
  return (
    <div style={{ position: "relative", width: 451, height: 437 }}>
      <svg xmlns='http://www.w3.org/2000/svg' width='451' height='437' style={pathSvgStyle}>
        <motion.path d={animalPath} fill='transparent' strokeWidth='12' stroke={pathColor} strokeLinecap='round' initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={transition} />
      </svg>
      <motion.div style={boxStyle(color)} initial={{ offsetDistance: "0%", scale: 2.5 }} animate={{ offsetDistance: "100%", scale: 1 }} transition={{ ...transition, delay }}>
        {emoji}
      </motion.div>
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
    },
    {
      question: "What age group is Chope designed for?",
      answer: "Chope is perfect for children ages 4-12. The tasks and interface are designed to be age-appropriate, and parents can customize difficulty levels based on their child's abilities and maturity.",
    },
    {
      question: "Is Chope safe for children?",
      answer: "Absolutely! Chope has no social features, chat functions, or external links. Children can only interact with family members added by parents. All data is encrypted and we never share personal information with third parties.",
    },
    {
      question: "Can I customize the tasks for my child?",
      answer: "Yes! Parents have complete control over task creation and can customize everything from difficulty level to point values. You can create tasks that match your family's routine and your child's abilities.",
    },
    {
      question: "How do I track my child's progress?",
      answer: "The parent dashboard shows real-time progress, completed tasks, and your child's virtual pet status. You'll receive notifications when tasks are completed and can celebrate achievements together.",
    },
    {
      question: "What happens if my child doesn't complete their tasks?",
      answer: "The virtual pet won't be harmed, but it won't grow as quickly or unlock new features. This creates natural motivation without causing distress. Parents can adjust expectations and provide additional support as needed.",
    },
    {
      question: "Is there a cost to use Chope?",
      answer: "Chope offers a free tier with basic features. Premium plans include advanced customization, multiple pets, detailed analytics, and family sharing features. We believe every family should have access to our core functionality.",
    },
    {
      question: "Can multiple children use the same account?",
      answer: "Yes! Family accounts support multiple children, each with their own tasks, progress tracking, and virtual pets. Parents can manage everything from one dashboard while keeping each child's experience personalized.",
    },
  ];

  function FAQCard({ question, answer }: { question: string; answer: string }) {
    return (
      <div className='group [perspective:1200px] w-full min-h-[220px] h-full flex justify-center items-center '>
        <div className='relative w-full h-full min-h-[220px] transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]'>
          {/* Front Side */}
          <Card className='absolute w-full h-full min-h-[220px] [backface-visibility:hidden] flex flex-col justify-center items-center'>
            <CardHeader className='flex flex-col items-center justify-center w-full px-6 py-4'>
              <CardTitle className='text-lg font-semibold text-gray-800 text-center w-full'>{question}</CardTitle>
            </CardHeader>
          </Card>
          {/* Back Side */}
          <Card className='absolute w-full h-full min-h-[220px] [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-center items-center'>
            <CardContent className='px-6 pb-6 pt-0 text-gray-700 text-base animate-fade-in text-center w-full'>{answer}</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-transparent text-white min-h-screen font-sans relative overflow-hidden'>
      {/* Decorative Elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
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
      </div>

      {/* Header Bar */}
      <nav className='bg-[#223668] relative z-10'>
        <div className='max-w-7xl px-2 sm:px-6 lg:px-8 '>
          <div className='relative flex h-16 items-center justify-between'>
            <div className='absolute inset-y-0 left-0 flex items-center sm:hidden'>
              {/* Mobile menu button */}
              <Button type='button' variant='ghost' size='icon' className='relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-none focus:ring-inset mr-2' aria-controls='mobile-menu' aria-expanded={mobileMenuOpen ? "true" : "false"} onClick={() => setMobileMenuOpen(v => !v)}>
                <span className='absolute -inset-0.5'></span>
                <span className='sr-only'>Open main menu</span>
                {/* Hamburger icon */}
                {!mobileMenuOpen ? (
                  <svg className='block size-6' fill='none' viewBox='0 0 24 24' strokeWidth='1.5' stroke='currentColor' aria-hidden='true'>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5' />
                  </svg>
                ) : (
                  <svg className='block size-6' fill='none' viewBox='0 0 24 24' strokeWidth='1.5' stroke='currentColor' aria-hidden='true'>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M6 18 18 6M6 6l12 12' />
                  </svg>
                )}
              </Button>
              {/* Logo for mobile - moved to flex container */}
              <div className='text-xl font-bold text-white'>Chope</div>
            </div>
            <div className='flex flex-1 items-center'>
              <div className='hidden sm:flex items-center'>
                <div className='text-xl font-bold text-white ml-2'>Chope</div>
              </div>
              <div className='hidden sm:ml-6 sm:block'>
                <div className='flex space-x-4'>
                  <Button variant='ghost' className={`${activeSection === "home" ? "bg-[rgb(253,186,116)]" : ""} text-white hover:bg-orange-300 px-4 py-2 rounded-full`} onClick={() => scrollToSection("home")}>
                    Home
                  </Button>
                  <Button variant='ghost' className='text-white hover:bg-white/10 px-4 py-2 rounded-full' onClick={() => scrollToSection("core-values")}>
                    Our Core Values
                  </Button>
                  <Button variant='ghost' className='text-white hover:bg-white/10 px-4 py-2 rounded-full' onClick={() => scrollToSection("about")}>
                    About
                  </Button>
                  <Button variant='ghost' className='text-white hover:bg-white/10 px-4 py-2 rounded-full' onClick={() => scrollToSection("faq")}>
                    FAQ
                  </Button>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              {/* Desktop buttons */}
              <div className='hidden sm:flex gap-2'>
                <Button className='bg-[oklch(88.2%_0.059_254.128)] text-black hover:bg-[oklch(89.4%_0.057_293.283)] px-6 py-2 rounded-full' onClick={() => navigate("/login/parent")}>
                  I'm a Parent
                </Button>
                <Button className='bg-[oklch(88.2%_0.059_254.128)] text-black hover:bg-[oklch(89.4%_0.057_293.283)] px-6 py-2 rounded-full' onClick={() => navigate("/login/kid")}>
                  I'm a Kid
                </Button>
              </div>

              {/* Mobile dropdown */}
              <div className='sm:hidden'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className='bg-[oklch(88.2%_0.059_254.128)] text-black hover:bg-[oklch(89.4%_0.057_293.283)] px-4 py-2 rounded-full flex items-center gap-2'>
                      Login
                      <ChevronDown className='w-4 h-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='bg-white border border-gray-200 rounded-lg shadow-lg'>
                    <DropdownMenuItem className='cursor-pointer hover:bg-gray-100 px-4 py-2' onClick={() => navigate("/login/parent")}>
                      I'm a Parent
                    </DropdownMenuItem>
                    <DropdownMenuItem className='cursor-pointer hover:bg-gray-100 px-4 py-2' onClick={() => navigate("/login/kid")}>
                      I'm a Kid
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile menu, show/hide based on state */}
        {mobileMenuOpen && (
          <div className='sm:hidden' id='mobile-menu'>
            <div className='space-y-1 px-2 pt-2 pb-3'>
              <Button
                variant='ghost'
                className={`${activeSection === "home" ? "bg-orange-400" : ""} w-full text-left text-white hover:bg-orange-300 px-4 py-2 rounded-full`}
                onClick={() => {
                  scrollToSection("home");
                  setMobileMenuOpen(false);
                }}
              >
                Home
              </Button>
              <Button
                variant='ghost'
                className='w-full text-left text-white hover:bg-white/10 px-4 py-2 rounded-full'
                onClick={() => {
                  scrollToSection("core-values");
                  setMobileMenuOpen(false);
                }}
              >
                Our Core Values
              </Button>
              <Button
                variant='ghost'
                className='w-full text-left text-white hover:bg-white/10 px-4 py-2 rounded-full'
                onClick={() => {
                  scrollToSection("about");
                  setMobileMenuOpen(false);
                }}
              >
                About
              </Button>
              <Button
                variant='ghost'
                className='w-full text-left text-white hover:bg-white/10 px-4 py-2 rounded-full'
                onClick={() => {
                  scrollToSection("faq");
                  setMobileMenuOpen(false);
                }}
              >
                FAQ
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div id='home' className='relative text-left py-16 px-6 lg:px-12 bg-[#223668]'>
        <div className='container mx-auto flex flex-col lg:flex-row items-center justify-between gap-10'>
          <div className='flex-1 relative z-10'>
            <div className='bg-[rgb(253,186,116)] text-white px-4 py-1 rounded-full text-sm inline-block mb-4'>WELCOME TO CHOPE!</div>
            <h1 className='text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight'>
              The Most <span className='text-[oklch(71.4%_0.203_305.504)]'>Fun</span>
              <br />
              Way to Do <span className='text-[oklch(71.4%_0.203_305.504)]'>Chores</span>
            </h1>
            <p className='text-white/90 text-lg mb-6 leading-relaxed'>Transform household chores into an exciting adventure! Your children will love completing tasks while raising adorable virtual pets.</p>
          </div>

          <div className='flex-1 flex justify-center relative'>
            <div className='relative w-[500px] h-[400px] flex items-center justify-center'>
              {/* Hero Illustration */}
              <div className='flex-1 flex justify-center relative'>
                <div className='relative w-[400px] h-[400px]'>
                  {/* Blob shape background */}
                  <div className='absolute inset-0 bg-gradient-to-br from-[oklch(71.4%_0.203_305.504)] via-[oklch(71.4%_0.203_305.504)] to-[oklch(82.7%_0.119_306.383)] rounded-[60px] transform rotate-12'></div>
                  <div className='absolute inset-4 bg-gradient-to-br from-orange-300 via-red-300 to-pink-400 rounded-[50px] transform -rotate-6'></div>
                  <div className='absolute inset-8 bg-white rounded-[40px] overflow-hidden shadow-2xl'>
                    {/* Child image placeholder */}
                    <div className='w-full h-full bg-gradient-to-br from-[oklch(82.7%_0.119_306.383)] to-[oklch(71.4%_0.203_305.504)] flex items-center justify-center'>
                      <div className='text-6xl'>👧</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Transition */}
      <div className='relative'>
        <svg viewBox='0 0 1200 120' className='w-full rotate-180 bg-[#89d4f2]'>
          <path d='M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z' fill='#223668' />
        </svg>
      </div>

      {/* Features Section */}
      <div className='bg-[#89d4f2] py-16 px-6'>
        <div className='container mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
            <div className='flex flex-col items-center'>
              <AnimalMotionCircle emoji='🦕' color='#67e8f9' pathColor='#67e8f9' />
              <h3 className='font-bold text-xl mb-3 text-white'>Fun Daily Tasks</h3>
              <p className='text-white/90 text-sm leading-relaxed'>
                Kids complete daily tasks
                <br />
                in an engaging and fun way
              </p>
            </div>

            <div className='flex flex-col items-center'>
              <AnimalMotionCircle emoji='🐸' color='#f9a8d4' delay={1.3} pathColor='#f9a8d4' />
              <h3 className='font-bold text-xl mb-3 text-white'>Virtual Pet</h3>
              <p className='text-white/90 text-sm leading-relaxed'>
                Kids raise a virtual pet
                <br />
                by completing their tasks
              </p>
            </div>

            <div className='flex flex-col items-center'>
              <AnimalMotionCircle emoji='🐋' color='#fdba74' delay={2.6} pathColor='#fdba74' />
              <h3 className='font-bold text-xl mb-3 text-white'>Progress Tracking</h3>
              <p className='text-white/90 text-sm leading-relaxed'>
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
        <svg viewBox='0 0 1200 120' className='w-full rotate-180 bg-[#ffffff]'>
          <path d='M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z' fill='#89d4f2' />
        </svg>
      </div>

      {/* Perfect App Section */}
      <div className='bg-[#ffffff] py-16 px-6 relative overflow-hidden'>
        <div className='container mx-auto flex flex-col lg:flex-row items-center gap-12'>
          {/* Phone Animation */}
          <PerfectAppPhone />

          {/* Text Content */}
          <PerfectAppContent scrollToSection={scrollToSection} />
        </div>
      </div>

      {/* Core Values Section */}
      <div className='relative'>
        <svg viewBox='0 0 1200 120' className='w-full bg-[#ffffff]'>
          <path d='M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z' fill='#fcf8f5' />
        </svg>
      </div>

      <div id='core-values' className='bg-[#fcf8f5] px-6 relative overflow-hidden'>
        <Star className='absolute text-pink-300 w-6 h-6 top-12 left-16 animate-pulse z-0' fill='currentColor' />
        <Star className='absolute text-yellow-300 w-4 h-4 top-20 right-32 animate-pulse z-0' fill='currentColor' />
        <Star className='absolute text-pink-300 w-5 h-5 bottom-20 left-24 animate-pulse z-0' fill='currentColor' />

        <div className='container mx-auto text-center relative z-10'>
          <h2 className='text-4xl font-bold text-white mb-4'>Our Core Values</h2>
          <p className='text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed'>At Chope, we believe in building stronger families through shared responsibility, fun, and meaningful connections. Our values guide everything we do.</p>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300'>
              <div className='w-16 h-16 bg-[oklch(88.2%_0.059_254.128)] rounded-full flex items-center justify-center mx-auto mb-4'>
                <Heart className='w-8 h-8 text-white' />
              </div>
              <h3 className='text-xl font-bold text-white mb-3'>Family Connection</h3>
              <p className='text-white/90 leading-relaxed'>We strengthen family bonds by creating shared experiences and meaningful interactions between parents and children.</p>
            </div>

            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300'>
              <div className='w-16 h-16 bg-[oklch(87%_0.065_274.039)] rounded-full flex items-center justify-center mx-auto mb-4'>
                <Target className='w-8 h-8 text-white' />
              </div>
              <h3 className='text-xl font-bold text-white mb-3'>Responsibility</h3>
              <p className='text-white/90 leading-relaxed'>We help children develop a sense of responsibility and independence through age-appropriate tasks and achievements.</p>
            </div>

            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300'>
              <div className='w-16 h-16 bg-[oklch(87%_0.065_274.039)] rounded-full flex items-center justify-center mx-auto mb-4'>
                <Zap className='w-8 h-8 text-white' />
              </div>
              <h3 className='text-xl font-bold text-white mb-3 '>Joyful Learning</h3>
              <p className='text-white/90 leading-relaxed'>We make learning and growing fun by gamifying daily tasks and celebrating every achievement along the way.</p>
            </div>
          </div>

          <div className='bg-gradient-to-r from-[oklch(88.2%_0.059_254.128)/20] to-[oklch(87%_0.065_274.039)/20] rounded-2xl p-8 max-w-4xl mx-auto hover:bg-white/20 transition-all duration-300'>
            <h3 className='text-2xl font-bold text-white mb-4'>Why These Values Matter</h3>
            <p className='text-white/90 leading-relaxed text-lg'>In today's digital world, it's more important than ever to create meaningful connections within families. Chope bridges the gap between technology and real-world responsibility, ensuring that screen time leads to productive offline activities. We believe that when children feel valued, responsible, and connected to their families, they develop confidence and life skills that last a lifetime.</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className='relative'>
        <svg viewBox='0 0 1200 120' className='w-full rotate-180 bg-red'>
          <path d='M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z' fill='#fcf8f5' />
        </svg>
      </div>

      <div id='about' className='bg-gradient-to-b py-16 px-6'>
        <div className='container mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-4xl font-bold text-white mb-4'>About Chope</h2>
            <p className='text-white text-lg max-w-3xl mx-auto leading-relaxed'>Chope was born from the idea that household chores don't have to be a source of conflict between parents and children. Instead, they can become opportunities for connection, learning, and fun.</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16'>
            <div>
              <h3 className='text-2xl font-bold text-white mb-4'>Our Story</h3>
              <p className='text-white leading-relaxed mb-6'>As parents ourselves, we understand the daily struggle of motivating children to help with household tasks. Traditional reward systems often fall short, and the constant nagging creates tension in the home. We knew there had to be a better way.</p>
              <p className='text-white leading-relaxed mb-6'>That's when we discovered the power of gamification combined with virtual pet care. Children naturally love caring for pets, and when that care is directly linked to their real-world responsibilities, magic happens. Tasks become adventures, and children become eager participants in family life.</p>
            </div>
            <div className='bg-gradient-to-br from-[oklch(88.2%_0.059_254.128)] to-[oklch(87%_0.065_274.039)] rounded-3xl p-8 h-80 flex items-center justify-center'>
              <div className='text-center'>
                <div className='text-6xl mb-4'></div>
                <div className='text-white font-bold text-xl mb-2'></div>
                <div className='text-white'></div>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div className='bg-gradient-to-br from-[oklch(88.2%_0.059_254.128)] to-[oklch(87%_0.065_274.039)] rounded-3xl p-8 h-80 flex items-center justify-center'>
              <div className='text-center'>
                <div className='text-6xl mb-4'></div>
                <div className='text-white font-bold text-xl mb-2'></div>
                <div className='text-white'></div>
              </div>
            </div>
            <div>
              <h3 className='text-2xl font-bold text-white mb-4'>What Makes Us Different</h3>
              <div className='space-y-4'>
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 bg-[oklch(88.2%_0.059_254.128)] rounded-full flex items-center justify-center mt-1'>
                    <Users className='w-4 h-4 text-white' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-white'>Family-Centered Design</h4>
                    <p className='text-white'>Every feature is designed to bring families closer together, not replace parental involvement.</p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 bg-[oklch(87%_0.065_274.039)] rounded-full flex items-center justify-center mt-1'>
                    <Shield className='w-4 h-4 text-white' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-white'>Child Safety First</h4>
                    <p className='text-white'>No social features, no chat functions - just safe, supervised family interaction.</p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 bg-[oklch(87%_0.065_274.039)] rounded-full flex items-center justify-center mt-1'>
                    <Award className='w-4 h-4 text-white' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-white'>Real-World Impact</h4>
                    <p className='text-white'>Digital achievements lead to real-world responsibilities and life skills.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className='relative'>
        <svg viewBox='0 0 1200 120' className='w-full'>
          <path d='M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z' fill='oklch(89.4% 0.057 293.283)' />
        </svg>
      </div>

      <div id='faq' className='bg-[oklch(88.2%_0.059_254.128)] py-16 px-6'>
        <div className='text-center mb-12'>
          <div className='w-16 h-16 bg-[oklch(62.7%_0.265_303.9)] rounded-full flex items-center justify-center mx-auto mb-4'>
            <HelpCircle className='w-8 h-8 text-white' />
          </div>
          <h2 className='text-4xl font-bold text-gray-800 mb-4'>Frequently Asked Questions</h2>
          <p className='text-gray-600 text-lg'>Everything you need to know about Chope and how it works for your family.</p>
        </div>
        <div className='bg-[oklch(88.2%_0.059_254.128)] rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full'>
          {faqData.map((faq, idx) => (
            <FAQCard key={idx} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className='relative'>
        <svg viewBox='0 0 1200 120' className='w-full rotate-180'>
          <path d='M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z' fill='oklch(89.4% 0.057 293.283)' />
        </svg>
      </div>

      <div className='bg-gradiant purple py-16 px-6 text-center'>
        <div className='container mx-auto max-w-4xl'>
          <h2 className='text-4xl font-bold text-white mb-4'>Ready to Transform Chore Time?</h2>
          <p className='text-white/90 text-lg mb-8 leading-relaxed'>Join thousands of families who have discovered the joy of working together. Start your Chope journey today and watch your children become eager helpers!</p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button className='bg-[rgb(103,232,249)] hover:bg-[rgb(83,212,229)] text-white px-8 py-3 rounded-full text-lg font-semibold'>Start Free Trial</Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='bg-gray-800 text-white py-8 px-6'>
        <div className='container mx-auto text-center'>
          <div className='flex items-center justify-center gap-2 mb-4'>
            <div className='w-8 h-8 bg-gradient-to-br from-[oklch(88.2%_0.059_254.128)] to-[oklch(62.7%_0.265_303.9)] rounded-full flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>C</span>
            </div>
            <div className='text-xl font-bold'>Chope</div>
          </div>
          <p className='text-gray-400 mb-4'>Making families stronger, one task at a time.</p>
          <p className='text-gray-500 text-sm'>© 2025 Chope. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

function PerfectAppPhone() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <motion.div ref={ref} className='flex-1' initial={{ opacity: 0, x: -100, scale: 0.8 }} animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -100, scale: 0.8 }} transition={{ duration: 0.8, ease: "easeOut" }}>
      <div className='relative w-full h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl'>
        <motion.div className='text-center' initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <motion.div className='text-6xl mb-4' initial={{ scale: 0, rotate: -180 }} animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }} transition={{ duration: 0.7, delay: 0.5, type: "spring", stiffness: 200 }}>
            📱
          </motion.div>
          <motion.div className='flex justify-center gap-2 mb-4' initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
            <motion.div className='w-12 h-12 bg-[oklch(88.2%_0.059_254.128)] rounded-full flex items-center justify-center text-white text-xl' initial={{ scale: 0, x: -20 }} animate={isInView ? { scale: 1, x: 0 } : { scale: 0, x: -20 }} transition={{ duration: 0.4, delay: 0.8, type: "spring" }}>
              👨
            </motion.div>
            <motion.div className='w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center mt-2' initial={{ scale: 0, y: -10 }} animate={isInView ? { scale: 1, y: 0 } : { scale: 0, y: -10 }} transition={{ duration: 0.4, delay: 1, type: "spring" }}>
              ❤️
            </motion.div>
            <motion.div className='w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white text-xl' initial={{ scale: 0, x: 20 }} animate={isInView ? { scale: 1, x: 0 } : { scale: 0, x: 20 }} transition={{ duration: 0.4, delay: 1.2, type: "spring" }}>
              👧
            </motion.div>
          </motion.div>
          <motion.div className='text-purple-800 font-bold' initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.5, delay: 1.4 }}>
            Connected Families
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function PerfectAppContent({ scrollToSection }: { scrollToSection: (sectionId: string) => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };
  return (
    <motion.div ref={ref} className='flex-1' variants={containerVariants} initial='hidden' animate={isInView ? "visible" : "hidden"}>
      <motion.h2 className='text-3xl sm:text-4xl font-bold text-white mb-6' variants={textVariants} transition={{ duration: 0.6 }}>
        The Perfect App
        <br />
        For Parents & Kids
      </motion.h2>
      <motion.p className='text-white mb-8 leading-relaxed text-sm sm:text-base' variants={textVariants} transition={{ duration: 0.6 }}>
        Chope transforms household chores into an exciting and engaging experience. Your kids will receive carefully planned tasks, raise adorable virtual pets, and you can track their progress in real-time.
        <br />
        <br />
        The app encourages responsibility, independence, and moves kids away from screens to real-world activities.
      </motion.p>
      <motion.div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8' variants={containerVariants}>
        {[
          { icon: CheckCircle, text: "Safe & Secure" },
          { icon: CheckCircle, text: "Age Appropriate" },
          { icon: CheckCircle, text: "Real-time Updates" },
          { icon: CheckCircle, text: "Family Friendly" },
        ].map((item, index) => (
          <motion.div key={index} className='flex items-center gap-2' variants={textVariants} transition={{ duration: 0.4 }}>
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -90 }}
              transition={{
                duration: 0.5,
                delay: 0.8 + index * 0.1,
                type: "spring",
                stiffness: 200,
              }}
            >
              <item.icon className='w-5 h-5 text-green-500' />
            </motion.div>
            <span className='text-white text-sm sm:text-base'>{item.text}</span>
          </motion.div>
        ))}
      </motion.div>
      <motion.div variants={textVariants} transition={{ duration: 0.6 }}>
        <Button className='bg-[rgb(103,232,249)] hover:bg-[rgb(83,212,229)] text-black px-6 sm:px-8 py-3 rounded-full font-semibold text-sm sm:text-base' onClick={() => scrollToSection("core-values")}>
          Learn More
        </Button>
      </motion.div>
    </motion.div>
  );
}
