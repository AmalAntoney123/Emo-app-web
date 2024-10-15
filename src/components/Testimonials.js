import React from 'react';
import RevealOnScroll from './RevealOnScroll';

const testimonials = [
  {
    name: "Sarah J.",
    text: "Emo has been a game-changer for my mental health. The daily check-ins and personalized insights have helped me understand my emotions better than ever before.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80"
  },
  {
    name: "Michael T.",
    text: "I love how Emo makes tracking my mood fun and rewarding. The challenges have really motivated me to prioritize self-care.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80"
  },
  {
    name: "Emily R.",
    text: "As someone who's always been skeptical of mental health apps, Emo surprised me. It's intuitive, engaging, and genuinely helpful.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80"
  }
];

function TestimonialCard({ name, text, avatar, index }) {
  return (
    <RevealOnScroll direction={index % 2 === 0 ? 'left' : 'right'}>
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
        <p className="text-gray-600 italic mb-4">{text}</p>
        <div className="flex items-center mt-auto">
          <img src={avatar} alt={name} className="w-12 h-12 rounded-full mr-4 object-cover" />
          <span className="font-semibold text-gray-800">{name}</span>
        </div>
      </div>
    </RevealOnScroll>
  );
}

function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-gray-100">
      <div className="container mx-auto px-4">
        <RevealOnScroll>
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">What Our Users Say</h2>
        </RevealOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
