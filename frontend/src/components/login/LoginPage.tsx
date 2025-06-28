import { motion, AnimatePresence } from "framer-motion";

interface LoginPageProps {
  mode: "login" | "register";
  userType: "parent" | "child";
  onSwitchMode: () => void;
  children: React.ReactNode;
}

export default function LoginPage({ mode, userType, onSwitchMode, children }: LoginPageProps) {
  const isLogin = mode === "login";
  const isParent = userType === "parent";

  return (
    <div className='min-h-screen grid lg:grid-cols-2'>
      {/* Left side - Form */}
      <div className='flex items-center justify-center p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
          <AnimatePresence mode='wait'>
            <motion.div key={mode + userType} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: "easeOut" }}>
              {/* Header */}
              <div className='flex flex-col space-y-2 text-center'>
                <motion.div
                  className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#ffbacc] to-[#f9a8d4] rounded-2xl mb-4 mx-auto'
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}>
                  <span className='text-2xl'>{isParent ? "👨‍👩" : "👶"}</span>
                </motion.div>
                <motion.h1 className='text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 leading-tight' initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <span className='relative inline-block mb-3'>
                    <span className='relative z-10 text-[#23326a] left-[-10px] md:left-[-20px]'>{isLogin ? "Welcome Back!" : "Join the Fun!"}</span>
                    <span className='absolute left-[-18px] md:left-[-28px] right-[-4px] md:right-[-8px] bottom-0 h-4 md:h-5 bg-[#f9dadc] z-0 rounded-sm' style={{ zIndex: 0 }} />
                  </span>
                </motion.h1>
                <motion.p className='text-[#7d7d7d] text-sm md:text-base mb-2 md:mb-4 leading-relaxed' initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                  {isLogin ? `Sign in to your ${isParent ? "parent" : "kid"} account and continue the adventure` : `Create your ${isParent ? "parent" : "kid"} account and start earning with your virtual pet`}
                </motion.p>
              </div>

              {/* Form */}
              <motion.div className='mt-8' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
                {children}
              </motion.div>

              {/* Switch mode */}
              <motion.div className='mt-8 text-center' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.8 }}>
                <div className='relative flex items-center justify-center'>
                  <div className='flex-1 border-t border-gray-200'></div>
                  <span className='px-4 bg-background text-[#7d7d7d] text-sm'>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
                  <div className='flex-1 border-t border-gray-200'></div>
                </div>
                <motion.button type='button' onClick={onSwitchMode} className='mt-4 text-[#4ec3f7] hover:text-[#23326a] font-medium transition-colors duration-200 text-sm' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {isLogin ? "Create new account" : "Sign in instead"}
                </motion.button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right side - Background with content */}
      <div className='hidden lg:block relative bg-gradient-to-br from-[#faf8f2] via-[#fcf8f5] to-[#ffffff]'>
        {/* Background decorative elements */}
        <div className='absolute inset-0 overflow-hidden'>
          {/* Top left decoration */}
          <motion.div
            className='absolute -top-20 -left-20 w-40 h-40 bg-[#89d4f2]/20 rounded-full blur-xl'
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className='absolute top-40 -left-10 w-20 h-20 bg-[#fbbdcb]/20 rounded-full blur-lg'
            animate={{
              y: [-10, 10, -10],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />

          {/* Top right decoration */}
          <motion.div
            className='absolute -top-10 -right-10 w-32 h-32 bg-[#fbdb84]/20 rounded-full blur-xl'
            animate={{
              rotate: [0, 360],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className='absolute top-20 right-20 w-16 h-16 bg-[#8cd4f3]/20 rounded-full blur-lg'
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />

          {/* Bottom decorations */}
          <motion.div
            className='absolute -bottom-20 left-1/4 w-36 h-36 bg-[#f9a8d4]/20 rounded-full blur-xl'
            animate={{
              y: [0, -15, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
          <motion.div
            className='absolute bottom-40 right-1/3 w-24 h-24 bg-[#ffd986]/20 rounded-full blur-lg'
            animate={{
              rotate: [0, -360],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
              delay: 1.5,
            }}
          />
        </div>

        {/* Content overlay */}
        <div className='relative z-10 flex items-center justify-center max-h-screen p-8 pb-32'>
          <motion.div className='text-center max-w-md' initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
            {/* Main illustration */}
            <motion.div className='mb-8 relative mt-16'>
              <motion.div
                className='absolute inset-0 bg-gradient-to-br from-[#89d4f2]/30 to-[#fbbdcb]/30 rounded-full blur-3xl'
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div className='relative' whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                <img
                  src='/images/hero-kids.jpg'
                  alt='Kids having fun'
                  className='w-full h-auto rounded-3xl shadow-2xl object-cover'
                  style={{
                    maxHeight: "400px",
                    objectPosition: "center",
                  }}
                />
              </motion.div>

              {/* Floating elements */}
              <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className='absolute -top-4 -right-4 w-16 h-16 bg-[#ffd986] rounded-full flex items-center justify-center shadow-lg' whileHover={{ scale: 1.1 }}>
                <span className='text-2xl'>🦕</span>
              </motion.div>

              <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }} className='absolute -bottom-4 -left-4 w-12 h-12 bg-[#f9a8d4] rounded-full flex items-center justify-center shadow-lg' whileHover={{ scale: 1.1 }}>
                <span className='text-xl'>🐸</span>
              </motion.div>
            </motion.div>

            {/* Text content */}
            <motion.div className='space-y-6' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}>
              <div>
                <h2 className='text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 leading-tight'>
                  <span className='relative inline-block mb-3'>
                    <span className='relative z-10 text-[#23326a] left-[-10px] md:left-[-20px]'>Making families stronger</span>
                    <span className='absolute left-[-18px] md:left-[-28px] right-[-4px] md:right-[-8px] bottom-0 h-4 md:h-5 bg-[#f9dadc] z-0 rounded-sm' style={{ zIndex: 0 }} />
                  </span>
                  <br />
                  <span className='relative inline-block'>
                    <span className='relative z-10 text-[#23326a]'>One task at a time</span>
                    <span className='absolute left-[-4px] md:left-[-8px] right-[-4px] md:right-[-8px] bottom-0 h-4 md:h-5 bg-[#fce8bd] z-0 rounded-sm' style={{ zIndex: 0 }} />
                  </span>
                </h2>
                <p className='text-[#7d7d7d] text-sm md:text-base mb-6 md:mb-8 leading-relaxed'>
                  Chope transforms household chores into an exciting and engaging experience.
                  <br /> Your kids will receive carefully planned tasks, raise adorable virtual pets, and you can track their progress in real-time.
                </p>
              </div>
            </motion.div>

            {/* Star animation */}
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className='absolute top-6/8 right-20 w-10 h-10 bg-[#8cd4f3] rounded-full flex items-center justify-center shadow-md' whileHover={{ scale: 1.2 }}>
              <span className='text-sm'>⭐</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom wave decoration */}
        <div className='absolute bottom-0 left-0 w-full'>
          <svg viewBox='0 0 1200 120' className='w-full' preserveAspectRatio='none'>
            <path d='M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z' fill='url(#wave-gradient)' />
            <defs>
              <linearGradient id='wave-gradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                <stop offset='0%' stopColor='#89d4f2' stopOpacity='0.3' />
                <stop offset='50%' stopColor='#fbbdcb' stopOpacity='0.3' />
                <stop offset='100%' stopColor='#ffd986' stopOpacity='0.3' />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
