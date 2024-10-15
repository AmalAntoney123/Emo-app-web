import React from 'react';
import RevealOnScroll from './RevealOnScroll';

function About() {
  return (
    <section className="py-20 bg-gray-100">
      <div className="container mx-auto px-4">
        <RevealOnScroll>
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-8">About Emo</h2>
        </RevealOnScroll>
        <div className="max-w-3xl mx-auto text-center">
          <RevealOnScroll>
            <p className="text-xl text-gray-600 mb-6">
              Emo is more than just an app – it's your personal companion on the journey to better mental health and wellbeing. 
              We believe that everyone deserves to feel their best, and we're here to make that journey fun, engaging, and rewarding.
            </p>
          </RevealOnScroll>
          <RevealOnScroll>
            <p className="text-xl text-gray-600">
              With Emo, you'll discover a new way to track your moods, challenge yourself, and connect with others who are on similar paths. 
              Our AI-powered insights and gamified approach to mental wellness make self-care an adventure you'll look forward to every day.
            </p>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

export default About;
