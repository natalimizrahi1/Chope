import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "./LoginForm"
import { motion } from "framer-motion"

// function ImageSide() {
//   return (
//     <div className="w-[320px] bg-muted relative hidden lg:flex items-center justify-center">
//       <img
//         src="/placeholder.svg"
//         alt="Image"
//         className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
//       />
//     </div>
//   );
// }

export default function LoginPage({
  mode = "login",
  userType = "parent",
  onSwitchMode,
  children,
}: {
  mode?: "login" | "register";
  userType?: "parent" | "kid";
  onSwitchMode?: () => void;
  children?: React.ReactNode;
}) {
  const isLogin = mode === "login";
  const isParent = userType === "parent";

  // Animation values
  const formInitialX = isLogin ? 320 : -320;
  const formExitX = isLogin ? -320 : 320;

  const imageInitialX = isLogin ? 320 : -320;
  const imageExitX = isLogin ? -320 : 320;

  return (
    <div className="relative min-h-screen flex items-stretch justify-stretch overflow-hidden w-full">
      {isLogin ? (
        <>
          <motion.div
            key={mode + userType + 'form'}
            initial={{ x: formInitialX }}
            animate={{ x: 0 }}
            exit={{ x: formExitX }}
            transition={{ duration: 0.5, type: 'tween' }}
            className="flex-1 flex items-center justify-center bg-white relative"
          >
            <a href="#" className="flex items-center gap-2 font-medium absolute left-6 top-6 z-10">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              Acme Inc.
            </a>
            <div className="w-full max-w-xs mx-auto">
              <LoginForm
                title={isLogin ? `Login to your ${isParent ? "Parent" : "Kid"} account` : `Register as ${isParent ? "Parent" : "Kid"}`}
                subtitle={isLogin ? `Enter your email below to login to your account` : `Fill the form to create your account`}
                footer={
                  <>
                    {isLogin ? (
                      <>
                        Don&apos;t have an account?{' '}
                        <button type="button" className="underline underline-offset-4" onClick={onSwitchMode}>
                          Sign up
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <button type="button" className="underline underline-offset-4" onClick={onSwitchMode}>
                          Login
                        </button>
                      </>
                    )}
                  </>
                }
              >
                {children}
              </LoginForm>
            </div>
          </motion.div>
          <motion.div
            key={mode + userType + 'img'}
            initial={{ x: imageInitialX }}
            animate={{ x: 0 }}
            exit={{ x: imageExitX }}
            transition={{ duration: 0.5, type: 'tween' }}
            className="hidden lg:flex flex-1 items-center justify-center bg-muted"
          >
            <img
              src="/src/images/homepage-pic.png"
              alt="Image"
              className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </motion.div>
        </>
      ) : (
        <>
          <motion.div
            key={mode + userType + 'img'}
            initial={{ x: imageInitialX }}
            animate={{ x: 0 }}
            exit={{ x: imageExitX }}
            transition={{ duration: 0.5, type: 'tween' }}
            className="hidden lg:flex flex-1 items-center justify-center bg-muted"
          >
            <img
              src="/src/images/homepage-pic.png"
              alt="Image"
              className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </motion.div>
          <motion.div
            key={mode + userType + 'form'}
            initial={{ x: formInitialX }}
            animate={{ x: 0 }}
            exit={{ x: formExitX }}
            transition={{ duration: 0.5, type: 'tween' }}
            className="flex-1 flex items-center justify-center bg-white relative"
          >
            <a href="#" className="flex items-center gap-2 font-medium absolute left-6 top-6 z-10">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              Acme Inc.
            </a>
            <div className="w-full max-w-xs mx-auto">
              <LoginForm
                title={isLogin ? `Login to your ${isParent ? "Parent" : "Kid"} account` : `Register as ${isParent ? "Parent" : "Kid"}`}
                subtitle={isLogin ? `Enter your email below to login to your account` : `Fill the form to create your account`}
                footer={
                  <>
                    {isLogin ? (
                      <>
                        Don&apos;t have an account?{' '}
                        <button type="button" className="underline underline-offset-4" onClick={onSwitchMode}>
                          Sign up
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <button type="button" className="underline underline-offset-4" onClick={onSwitchMode}>
                          Login
                        </button>
                      </>
                    )}
                  </>
                }
              >
                {children}
              </LoginForm>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
