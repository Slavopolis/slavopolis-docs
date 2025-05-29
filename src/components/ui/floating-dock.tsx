'use client';

import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
    AnimatePresence,
    MotionValue,
    motion,
    useMotionValue,
    useSpring,
    useTransform,
} from "motion/react";

import { useEffect, useRef, useState } from "react";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: { title: string; icon: React.ReactNode; href: string; onClick?: () => void }[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop 
        items={items} 
        {...(desktopClassName ? { className: desktopClassName } : {})} 
      />
      <FloatingDockMobile 
        items={items} 
        {...(mobileClassName ? { className: mobileClassName } : {})} 
      />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string; onClick?: () => void }[];
  className?: string | undefined;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <a
                  href={item.href}
                  key={item.title}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-900"
                  onClick={item.onClick}
                >
                  <div className="h-4 w-4">{item.icon}</div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-800"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string; onClick?: () => void }[];
  className?: string | undefined;
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mouseX = useMotionValue(Infinity);
  
  // 处理自动隐藏
  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 5000); // 5秒后自动隐藏
  };
  
  // 初始化显示呼吸图标
  useEffect(() => {
    setIsVisible(true);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* 呼吸效果提示按钮 */}
      <AnimatePresence>
        {isVisible && !isExpanded && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1 left-1/2 -translate-x-1/2 z-50 h-6 px-3 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm flex items-center justify-center gap-1.5 shadow-md border border-gray-200/30 dark:border-gray-700/30 cursor-pointer hover:bg-white dark:hover:bg-neutral-800 transition-colors duration-200"
            onClick={() => {
              setIsExpanded(true);
              resetTimer();
            }}
            onMouseEnter={() => {
              setIsExpanded(true);
              resetTimer();
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: 0,
              }}
              className="w-1.5 h-1.5 rounded-full bg-blue-500/80 dark:bg-blue-400/80"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="w-1.5 h-1.5 rounded-full bg-blue-500/80 dark:bg-blue-400/80"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: 1,
              }}
              className="w-1.5 h-1.5 rounded-full bg-blue-500/80 dark:bg-blue-400/80"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 主菜单 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onMouseEnter={() => {
              resetTimer();
            }}
            onMouseLeave={() => {
              setIsExpanded(false);
            }}
            onMouseMove={(e) => {
              mouseX.set(e.pageX);
              resetTimer();
            }}
            className={cn(
              "fixed top-5 inset-x-0 mx-auto max-w-xl hidden h-16 items-center justify-center gap-4 rounded-2xl bg-white/90 px-4 py-3 md:flex dark:bg-neutral-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg z-50",
              className
            )}
          >
            {items.map((item) => (
              <IconContainer mouseX={mouseX} key={item.title} {...item} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  onClick,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
  onClick?: () => void;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 50, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 50, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [18, 24, 18]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [18, 24, 18],
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <div 
      onClick={onClick}
      className="cursor-pointer"
    >
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-gray-100 dark:border-gray-700/50"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -bottom-8 left-1/2 w-fit rounded-md border border-gray-100 bg-white px-2 py-0.5 text-xs whitespace-pre text-gray-700 dark:border-gray-800 dark:bg-neutral-900 dark:text-gray-300 shadow-sm"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center text-gray-500 dark:text-gray-300"
        >
          {icon}
        </motion.div>
      </motion.div>
    </div>
  );
}
