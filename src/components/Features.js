import React from 'react';
import { FaSmile, FaRunning, FaBook, FaGamepad, FaFire, FaChartLine, FaUsers, FaTrophy } from 'react-icons/fa';
import { useSpring, animated } from 'react-spring';
import RevealOnScroll from './RevealOnScroll';

function FeatureCard({ icon, title, description, index }) {
  const [hoverProps, setHover] = useSpring(() => ({
    scale: 1,
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    config: { mass: 1, tension: 200, friction: 20 },
  }));

  const iconAnimation = useSpring({
    from: { transform: 'rotate(0deg)' },
    to: async (next) => {
      while (true) {
        await next({ transform: 'rotate(10deg)' });
        await next({ transform: 'rotate(-10deg)' });
        await next({ transform: 'rotate(0deg)' });
      }
    },
    config: { duration: 2000 },
  });

  return (
    <RevealOnScroll direction={index % 2 === 0 ? 'left' : 'right'}>
      <animated.div 
        style={{
          transform: hoverProps.scale.to(s => `scale(${s})`),
          boxShadow: hoverProps.shadow,
        }}
        className="bg-white p-6 rounded-lg"
        onMouseEnter={() => setHover({ scale: 1.05, shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' })}
        onMouseLeave={() => setHover({ scale: 1, shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' })}
      >
        <animated.div style={iconAnimation} className="text-primary text-4xl mb-4">{icon}</animated.div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </animated.div>
    </RevealOnScroll>
  );
}

function Features() {
  const features = [
    {
      icon: <FaGamepad />,
      title: "Fun Challenges",
      description: "Engage in exciting mental wellness quests and level up your mood!"
    },
    {
      icon: <FaFire />,
      title: "Streaks & Rewards",
      description: "Keep your streak alive and earn awesome rewards for consistent self-care."
    },
    {
      icon: <FaChartLine />,
      title: "Mood Analytics",
      description: "Track your progress with AI-powered mood predictions and insights."
    },
    {
      icon: <FaBook />,
      title: "Daily Journal",
      description: "Express yourself freely in your personal digital diary."
    },
    {
      icon: <FaUsers />,
      title: "Support Squad",
      description: "Connect with others and cheer each other on in group chats."
    },
    {
      icon: <FaTrophy />,
      title: "High Scores",
      description: "Compete with friends and top the leaderboard of positivity!"
    }
  ];

  return (
    <section className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <RevealOnScroll>
          <h2 className="text-4xl font-bold text-white text-center mb-12">Embark on Your Wellness Quest</h2>
        </RevealOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
