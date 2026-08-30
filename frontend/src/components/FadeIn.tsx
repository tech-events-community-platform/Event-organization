import React, { useEffect, useRef, useState } from 'react';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
  threshold?: number;
}

export default function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  threshold = 0.15,
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (domRef.current) {
              observer.unobserve(domRef.current);
            }
          }
        });
      },
      { threshold }
    );

    const currentEl = domRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [threshold]);

  const getDirectionClass = () => {
    switch (direction) {
      case 'left':
        return isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0';
      case 'right':
        return isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0';
      case 'down':
        return isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0';
      case 'none':
        return isVisible ? 'opacity-100' : 'opacity-0';
      case 'up':
      default:
        return isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0';
    }
  };

  return (
    <div
      ref={domRef}
      style={{
        transitionDuration: '700ms',
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`transition-all ${getDirectionClass()} ${className}`}
    >
      {children}
    </div>
  );
}
