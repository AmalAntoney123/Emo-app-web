import React from 'react';
import { useSpring, animated } from 'react-spring';
import RevealOnScroll from './RevealOnScroll';

function Hero() {
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
    const apkUrl = '/assets/emo-app.apk'; // Update this with the actual path to your APK file
    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = 'emo-app.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <RevealOnScroll>
            <div className="md:w-1/2 text-left md:pr-16">
              <h2 className="text-5xl font-bold text-gray-800 mb-4">Welcome to Emo</h2>
              <p className="text-xl text-gray-600 mb-8">Your companion for mental health and wellbeing</p>
              <button 
                onClick={handleDownload}
                className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primaryLight transition duration-300 transform hover:scale-105"
              >
                Download Now
              </button>
            </div>
          </RevealOnScroll>
          <RevealOnScroll>
            <animated.div style={imageAnimation} className="md:w-75 mt-8 md:mt-0">
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
