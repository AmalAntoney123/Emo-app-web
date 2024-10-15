import React, { useEffect, useState, useRef } from 'react';
import { useSpring, animated } from 'react-spring';

const RevealOnScroll = ({ children, direction = 'left' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(ref.current);
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const springProps = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible
      ? 'translateX(0)'
      : `translateX(${direction === 'left' ? '-50px' : '50px'})`,
    config: { mass: 1, tension: 80, friction: 26 },
  });

  return (
    <animated.div ref={ref} style={springProps}>
      {children}
    </animated.div>
  );
};

export default RevealOnScroll;
