import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Circle, Globe, Cloud, CheckCircle, Users, Shield, Award, HelpCircle, ChevronDown, ChevronUp, Heart, Target, Zap } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
// import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import AnimalMotionCircle  from "./AnimalMotionCircle";
import PerfectAppContent from "./PerfectAppContent";

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
<nav className='bg-white shadow-md relative z-50'>
  <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
    <div className='flex justify-between items-center h-20'>
      {/* Logo */}
      <div className='flex-shrink-0 flex items-center'>
        {/* <img className='h-10 w-auto' src='/logo-dino.svg' alt='Little Dino Logo' /> */}
        <span className='ml-2 text-lg font-extrabold text-[#102358]'>Little <span className='text-[#60a5fa]'>Dino</span></span>
      </div>

      {/* Menu */}
      <div className='hidden md:flex space-x-6'>
        <button onClick={() => scrollToSection("home")} className={`text-sm font-bold px-3 py-1 rounded-md ${activeSection === "home" ? "bg-[#ffd986] text-[#ffffff]" : "text-[#102358] hover:bg-[#ffd986]"}`}>Home</button>
        <button onClick={() => scrollToSection("core-values")} className='text-sm font-bold text-[#102358] hover:bg-[#ffd986] hover:text-[#ffffff] px-3 py-1 rounded-md'>Our Core Values</button>
        <button onClick={() => scrollToSection("about")} className='text-sm font-bold text-[#102358] hover:bg-[#ffd986] hover:text-[#ffffff] px-3 py-1 rounded-md'>About</button>
        <button onClick={() => scrollToSection("faq")} className='text-sm font-bold text-[#102358] hover:bg-[#ffd986] hover:text-[#ffffff] px-3 py-1 rounded-md'>FAQ</button>
      </div>

      {/* Action Buttons */}
      <div className='hidden md:flex gap-4'>
        <Button className='bg-[#ffd986] text-white hover:bg-yellow-400 px-5 outline-2 outline-offset-2 outline-dashed outline-[#ffd986] rounded-full text-sm font-semibold' onClick={() => navigate("/login/parent")}>I'm a Parent</Button>
        <Button className='bg-[#ffbacc] text-white hover:bg-pink-400 px-5 outline-2 outline-offset-2 outline-dashed outline-[#ffbacc] rounded-full text-sm font-semibold' onClick={() => navigate("/login/kid")}>I'm a Kid</Button>
      </div>
    </div>
  </div>
</nav>

{/* Hero Section */}
<div className="relative bg-[#faf8f2] overflow-hidden min-h-[650px] flex items-center">
  {/* קישוטים */}
  {/* <img src="/decor/cloud-blue.svg" className="absolute left-0 top-0 w-48 z-0" alt="" />
  <img src="/decor/star-pink.svg" className="absolute right-10 top-20 w-12 z-0" alt="" />
  <img src="/decor/rocket.svg" className="absolute left-10 bottom-10 w-32 z-0" alt="" />
  <img src="/decor/bike.svg" className="absolute left-1/3 top-32 w-24 z-0" alt="" />
  <img src="/decor/stars.svg" className="absolute right-10 top-1/2 w-16 z-0" alt="" /> */}

  <div className="absolute right-0 w-7/10 h-full z-0 overflow-hidden">
    <img
      src="/images/hero-kids.jpg"
      alt="Kid learning"
      className="w-full h-full object-cover object-center"
      style={{
        maskImage: "linear-gradient(to left, black 80%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to left, black 70%, transparent 100%)",
        background: "#faf8f2"
      }}
    />
   
  </div>

  {/* תוכן מרכזי */}
  <div className="container mx-auto flex items-center justify-between relative z-10">
    <div className="max-w-xl z-20">
      <div className="bg-[#87d4ee] text-white px-4 py-1 rounded-md text-sm font-bold mb-8 w-fit">WELCOME TO LITTLEDINO!</div>
      <h1 className="text-6xl font-extrabold text-[#23326a] mb-8 justify-self-start">
        Earn <span className="text-[#4ec3f7]">&</span> Play!
      </h1>
      <p className="text-[#7d7d7d] text-lg mb-10 text-left">Transform household chores into an exciting adventure! Your children will love completing tasks while raising adorable virtual pets.</p>
      <button
        className="relative bg-[#ffd986] text-white font-bold px-8 py-2 rounded-full shadow hover:bg-[#ffd36a] transition overflow-hidden border-none mr-50"
      >
        Read More
        <span
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            border: "2px dashed #fff",
            top: "2px",
            left: "2px",
            right: "2px",
            bottom: "2px",
            position: "absolute",
            borderRadius: "9999px",
            boxSizing: "border-box",
            zIndex: 1
          }}
        />
          </button>
    </div>
        </div>
         {/* גל חותך למטה */}
    <svg
      className="absolute left-0 bottom-0 w-full h-20"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      style={{ pointerEvents: "none" }}
    >
      <path
        d="M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z"
        fill="#ffffff"
      />
    </svg>
</div>

      {/* Features Section */}
      <div className='bg-[#ffffff] px-6'>
        <div className='container mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
            <div className='flex flex-col items-center'>
              <AnimalMotionCircle emoji='🦕' color='#67e8f9' pathColor='#67e8f9' scale={0.7} />
              <h3 className='font-bold text-xl mb-3 text-[#142757]'>Fun Daily Tasks</h3>
              <p className='text-[#142757] text-sm leading-relaxed'>
                Kids complete daily tasks
                <br />
                in an engaging and fun way
              </p>
            </div>

            <div className='flex flex-col items-center'>
              <AnimalMotionCircle emoji='🐸' color='#f9a8d4' delay={1.3} pathColor='#f9a8d4' scale={0.7} />
              <h3 className='font-bold text-xl mb-3 text-[#142757]'>Virtual Pet</h3>
              <p className='text-[#142757] text-sm leading-relaxed'>
                Kids raise a virtual pet
                <br />
                by completing their tasks
              </p>
            </div>

            <div className='flex flex-col items-center'>
              <AnimalMotionCircle emoji='🐋' color='#fdba74' delay={2.6} pathColor='#fdba74' scale={0.7} />
              <h3 className='font-bold text-xl mb-3 text-[#142757]'>Progress Tracking</h3>
              <p className='text-[#142757] text-sm leading-relaxed'>
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
      <div className="relative bg-[#fcf8f5] py-5 px-6 overflow-hidden">
        {/* קישוטים */}
        {/* <img src="/decor/dino-yellow.svg" className="absolute left-32 top-8 w-32" alt="" /> */}
        {/* <img src="/decor/pencil-yellow.svg" className="absolute left-8 top-1/3 w-16" alt="" /> */}
        {/* <img src="/decor/cloud-yellow.svg" className="absolute right-12 top-10 w-28" alt="" /> */}
        {/* <img src="/decor/balloons-pink.svg" className="absolute right-16 bottom-32 w-20" alt="" /> */}
        {/* <img src="/decor/dino-blue.svg" className="absolute left-1/2 bottom-0 w-40" alt="" /> */}

        <div className="container mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10 justify-around">
          {/* תמונה במסגרת מקווקוות */}
          <div className="relative flex items-center justify-center w-[540px] h-[450px]">
            <div
              className="absolute left-0 top-0 w-[500px] h-[400px] rounded-3xl border-2 border-dashed border-pink-200 bg-white"
              style={{ zIndex: 0 }}
            />
            <img
              src="/images/parent-kid.png"
              alt="Kids"
              className="relative z-10 rounded-3xl w-[500px] h-[400px] object-cover"
              style={{
                marginTop: "10px",
                marginLeft: "20px",
                boxShadow: "0 4px 24px 0 rgba(0,0,0,0.04)"
              }}
            />
          </div>

          {/* תוכן טקסטואלי */}
          <div className="flex-1 flex flex-col justify-center items-start max-w-lg whitespace-normal">
            <PerfectAppContent scrollToSection={scrollToSection} />
          </div>
        </div>
      </div>

      <div className='relative'>
        <svg viewBox='0 0 1200 120' className='w-full bg-[#fcf8f5]'>
          <path d='M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z' fill='#89d4f2' />
        </svg>
      </div>


      {/* Core Values Section */}
      <div id='core-values' className='bg-[#89d4f2] px-6 relative overflow-hidden'>
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

      <div className='relative'>
        <svg viewBox='0 0 1200 120' className='w-full bg-[#89d4f2]'>
          <path d='M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z' fill='#fcf8f5' />
        </svg>
      </div>

      {/* About Section */}
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

// function PerfectAppPhone() {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, amount: 0.3 });
//   return (
//     <motion.div ref={ref} className='flex-1' initial={{ opacity: 0, x: -100, scale: 0.8 }} animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -100, scale: 0.8 }} transition={{ duration: 0.8, ease: "easeOut" }}>
//       <div className='relative w-full h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl'>
//         <motion.div className='text-center' initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.6, delay: 0.3 }}>
//           <motion.div className='text-6xl mb-4' initial={{ scale: 0, rotate: -180 }} animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }} transition={{ duration: 0.7, delay: 0.5, type: "spring", stiffness: 200 }}>
//             📱
//           </motion.div>
//           <motion.div className='flex justify-center gap-2 mb-4' initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
//             <motion.div className='w-12 h-12 bg-[oklch(88.2%_0.059_254.128)] rounded-full flex items-center justify-center text-white text-xl' initial={{ scale: 0, x: -20 }} animate={isInView ? { scale: 1, x: 0 } : { scale: 0, x: -20 }} transition={{ duration: 0.4, delay: 0.8, type: "spring" }}>
//               👨
//             </motion.div>
//             <motion.div className='w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center mt-2' initial={{ scale: 0, y: -10 }} animate={isInView ? { scale: 1, y: 0 } : { scale: 0, y: -10 }} transition={{ duration: 0.4, delay: 1, type: "spring" }}>
//               ❤️
//             </motion.div>
//             <motion.div className='w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white text-xl' initial={{ scale: 0, x: 20 }} animate={isInView ? { scale: 1, x: 0 } : { scale: 0, x: 20 }} transition={{ duration: 0.4, delay: 1.2, type: "spring" }}>
//               👧
//             </motion.div>
//           </motion.div>
//           <motion.div className='text-purple-800 font-bold' initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.5, delay: 1.4 }}>
//             Connected Families
//           </motion.div>
//         </motion.div>
//       </div>
//     </motion.div>
//   );
// }


