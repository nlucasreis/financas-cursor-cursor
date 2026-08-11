import React, { useState, useEffect, useRef } from 'react';
import { Home, Receipt, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export type NavTab = 'home' | 'contas' | 'fixas' | 'ajustes';

interface FloatingNavProps {
  activeNav: NavTab;
  setActiveNav: (nav: NavTab) => void;
  hidden?: boolean;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  activeNav,
  setActiveNav,
  hidden = false,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [dragNav, setDragNav] = useState<NavTab | null>(null);
  const lastScrollY = useRef(0);
  const navRef = useRef<HTMLDivElement>(null);

  const displayNav = dragNav || activeNav;

  useEffect(() => {
    const container = document.getElementById('iphone-scroll-container');
    const handleScroll = () => {
      const currentScrollY = container ? container.scrollTop : window.scrollY;
      const diff = currentScrollY - lastScrollY.current;

      if (currentScrollY < 40) {
        setIsVisible(true);
      } else if (diff < -8) {
        setIsVisible(true);
      } else if (diff > 18) {
        setIsVisible(false);
      }
      lastScrollY.current = currentScrollY;
    };

    container?.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleTabClick = (tab: NavTab) => {
    setActiveNav(tab);
  };

  const updateTabFromPointerX = (clientX: number) => {
    if (!navRef.current) return;
    const buttons = navRef.current.querySelectorAll<HTMLButtonElement>('[data-tab-id]');
    let closestTab: NavTab | null = null;
    let minDistance = Infinity;

    buttons.forEach((btn) => {
      const rect = btn.getBoundingClientRect();
      const tabId = btn.getAttribute('data-tab-id') as NavTab;
      if (clientX >= rect.left && clientX <= rect.right) {
        closestTab = tabId;
        minDistance = 0;
      } else {
        const center = rect.left + rect.width / 2;
        const dist = Math.abs(clientX - center);
        if (dist < minDistance) {
          minDistance = dist;
          closestTab = tabId;
        }
      }
    });

    if (closestTab) {
      setDragNav(closestTab);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsInteracting(true);
    updateTabFromPointerX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isInteracting) {
      updateTabFromPointerX(e.clientX);
    }
  };

  const handlePointerUp = () => {
    if (isInteracting) {
      if (dragNav) {
        handleTabClick(dragNav);
      }
      setIsInteracting(false);
      setDragNav(null);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsInteracting(true);
      updateTabFromPointerX(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isInteracting && e.touches.length > 0) {
      updateTabFromPointerX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (isInteracting) {
      if (dragNav) {
        handleTabClick(dragNav);
      }
      setIsInteracting(false);
      setDragNav(null);
    }
  };

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Início', icon: <Home className="w-4.5 h-4.5" /> },
    { id: 'contas', label: 'Contas', icon: <Receipt className="w-4.5 h-4.5" /> },
    { id: 'ajustes', label: 'Ajustes', icon: <Settings className="w-4.5 h-4.5" /> },
  ];

  const isNavVisible = !hidden && isVisible;

  return (
    <div
      className={`absolute bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-40 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isNavVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto scale-100'
          : 'translate-y-20 opacity-0 pointer-events-none scale-95'
      }`}
    >
      <motion.nav
        ref={navRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/60 dark:border-zinc-700/80 rounded-full p-1.5 flex items-center gap-1 relative select-none touch-none cursor-grab active:cursor-grabbing"
      >
        {navItems.map((item) => {
          const isActive = displayNav === item.id;
          return (
            <button
              key={item.id}
              data-tab-id={item.id}
              type="button"
              onClick={() => handleTabClick(item.id)}
              className={`relative flex items-center gap-1.5 px-2.5 sm:px-5 py-2.5 rounded-full text-[10px] sm:text-sm font-semibold transition-colors duration-200 cursor-pointer z-10 ${
                isActive
                  ? 'text-white dark:text-zinc-900'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="liquid-glass-indicator"
                  className="absolute inset-0 rounded-full bg-zinc-900 dark:bg-zinc-100 z-[-1]"
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 28,
                    mass: 0.8,
                  }}
                />
              )}
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
};
