import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle } from "lucide-react";

export default function PerfectAppContent({ scrollToSection }: { scrollToSection: (sectionId: string) => void }) {
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
    <motion.div ref={ref} className='flex-1 ml-0 md:ml-[50px] items-start text-wrap' variants={containerVariants} initial='hidden' animate={isInView ? "visible" : "hidden"}>
      <motion.h2 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 leading-tight justify-self-start' variants={textVariants} transition={{ duration: 0.6 }}>
        <span className='relative inline-block mb-3 '>
          <span className='relative z-10 text-[#23326a] left-[-10px] md:left-[-20px]'>The Perfect App</span>
          <span className='absolute left-[-18px] md:left-[-28px] right-[-4px] md:right-[-8px] bottom-0 h-4 md:h-5 bg-[#f9dadc] z-0 rounded-sm' style={{ zIndex: 0 }}></span>
        </span>
        <br />
        <span className='relative inline-block'>
          <span className='relative z-10 text-[#23326a]'>For Parents & Kids</span>
          <span className='absolute left-[-4px] md:left-[-8px] right-[-4px] md:right-[-8px] bottom-0 h-4 md:h-5 bg-[#fce8bd] z-0 rounded-sm' style={{ zIndex: 0 }}></span>
        </span>
      </motion.h2>
      <motion.p className='text-[#7d7d7d] mb-6 md:mb-8 leading-relaxed text-sm text-left sm:text-base' variants={textVariants} transition={{ duration: 0.6 }}>
        Chope transforms household chores into an exciting and engaging experience.
        <br /> Your kids will receive carefully planned tasks, raise adorable virtual pets, and you can track their progress in real-time.
        <br />
        The app encourages responsibility, independence, and moves kids away from screens to real-world activities.
      </motion.p>
      <motion.div className='grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8' variants={containerVariants}>
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
              <item.icon className='w-4 h-4 md:w-5 md:h-5 text-green-500' />
            </motion.div>
            <span className='text-neutral-700 text-sm sm:text-base'>{item.text}</span>
          </motion.div>
        ))}
      </motion.div>
      <motion.div variants={textVariants} transition={{ duration: 0.6 }}>
        <button className='relative bg-[#ffd986] text-white font-bold px-6 md:px-8 py-3 md:py-4 rounded-full shadow hover:bg-[#ffd36a] transition overflow-hidden mt-4 md:mt-6 text-sm md:text-base' style={{ border: "none" }} onClick={() => scrollToSection("core-values")}>
          Learn More
          <span
            className='pointer-events-none absolute inset-0 rounded-full'
            style={{
              border: "2.5px dashed #fff",
              top: "4px",
              left: "4px",
              right: "4px",
              bottom: "4px",
              position: "absolute",
              borderRadius: "9999px",
              boxSizing: "border-box",
              zIndex: 1,
            }}
          />
        </button>
      </motion.div>
    </motion.div>
  );
}
