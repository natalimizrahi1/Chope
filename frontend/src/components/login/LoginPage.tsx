import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { GalleryVerticalEnd } from "lucide-react"

interface LoginPageProps {
  mode: "login" | "register"
  userType: "parent" | "child"
  onSwitchMode: () => void
  children: React.ReactNode
}

export default function LoginPage({
  mode,
  userType,
  onSwitchMode,
  children,
}: LoginPageProps) {
  const isLogin = mode === "login";
  const isParent = userType === "parent";

  return (
    <div className="relative min-h-screen flex items-stretch justify-stretch overflow-hidden w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode + userType}
          initial={{ opacity: 0, x: isLogin ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isLogin ? -100 : 100 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-1 flex items-center justify-center bg-white relative"
        >
          <a href="/" className="flex items-center gap-2 font-medium absolute left-6 top-6 z-10">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Chope
          </a>
          <div className="w-full max-w-xs mx-auto px-4">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">
                  {isLogin ? `Login to your ${isParent ? "Parent" : "Kid"} account` : `Register as ${isParent ? "Parent" : "Kid"}`}
                </h1>
                <p className="text-muted-foreground text-sm text-balance">
                  {isLogin ? `Enter your email below to login to your account` : `Fill the form to create your account`}
                </p>
              </div>
              {children}
              <div className="text-center text-sm">
                {isLogin ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button type="button" className="text-primary hover:underline underline-offset-4" onClick={onSwitchMode}>
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button type="button" className="text-primary hover:underline underline-offset-4" onClick={onSwitchMode}>
                      Login
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          key="image"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="hidden lg:flex flex-1 items-center justify-center bg-muted"
        >
          <img
            src="/src/images/homepage-pic.png"
            alt="Welcome"
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
