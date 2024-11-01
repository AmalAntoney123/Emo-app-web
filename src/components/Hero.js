import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import RevealOnScroll from './RevealOnScroll';
import { FaQuestionCircle } from 'react-icons/fa';

function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const imageAnimation = useSpring({
    from: { transform: 'translateY(0px)' },
    to: async (next) => {
      while (true) {
        await next({ transform: 'translateY(-10px)' });
        await next({ transform: 'translateY(0px)' });
      }
    },
    config: { duration: 2000 },
  });

  const handleDownload = () => {
    window.open('/assets/emo-app.apk', '_blank');
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <RevealOnScroll>
            <div className="text-left">
              <h2 className="text-5xl font-bold text-gray-800 mb-4">Welcome to Emo</h2>
              <p className="text-xl text-gray-600 mb-8">Your companion for mental health and wellbeing</p>
              <div className="flex items-center">
                <a
                  href="/downloads"
                  className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primaryLight transition duration-300 transform hover:scale-105"
                >
                  Download Emo
                </a>
              </div>
            </div>
          </RevealOnScroll>
          <RevealOnScroll>
            <animated.div style={imageAnimation} className="w-full">
              <img
                src="/assets/hero-image-2.jpeg"
                alt="Emo App Showcase"
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
            </animated.div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

export default Hero;
