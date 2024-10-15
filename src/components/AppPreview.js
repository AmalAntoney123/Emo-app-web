import React from 'react';
import RevealOnScroll from './RevealOnScroll';

const screenshots = [
    "/assets/screenshot2.jpg",
    "/assets/screenshot1.jpg",
    "/assets/screenshot3.jpg"
];

function PhoneMockup({ screenshot }) {
    return (
        <RevealOnScroll>
            <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px]">
                <div className="h-[32px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-gray-800">
                    <img src={screenshot} className="w-[272px] h-[572px]" alt="App screenshot" />
                </div>
            </div>
        </RevealOnScroll>
    );
}

function AppPreview() {
    return (
        <section id="app-preview" className="py-20 bg-gray-100">
            <div className="container mx-auto px-4">
                <RevealOnScroll>
                    <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">App Preview</h2>
                </RevealOnScroll>
                <div className="flex flex-wrap justify-center items-center gap-8">
                    {screenshots.map((screenshot, index) => (
                        <div key={index} className={`transform ${index === 1 ? 'scale-100' : 'scale-90'}`}>
                            <PhoneMockup screenshot={screenshot} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default AppPreview;
