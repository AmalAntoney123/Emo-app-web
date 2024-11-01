import React, { useState, useEffect } from 'react';
import { FaDownload, FaHistory } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { db } from '../firebase';
import { ref, get } from 'firebase/database';

const screenshots = [
  {
    img: "/assets/screenshots/1-dark.jpg",
    alt: "Login Screen Dark Mode",
    caption: "Beautiful Login Interface Dark Mode"
  },
  {
    img: "/assets/screenshots/1-light.jpg",
    alt: "Login Screen Light Mode",
    caption: "Beautiful Login Interface Light Mode"
  },
  {
    img: "/assets/screenshots/2-dark.jpg",
    alt: "Feature Screen Dark Mode",
    caption: "Feature Overview Dark Mode"
  },
  {
    img: "/assets/screenshots/2-light.jpg",
    alt: "Settings Screen Light Mode",
    caption: "Easy Settings Management Light Mode"
  },
  // Add more screenshots as needed
];

function Downloads() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      const versionsRef = ref(db, 'appVersions');
      const snapshot = await get(versionsRef);
      if (snapshot.exists()) {
        const versionsData = Object.entries(snapshot.val())
          .map(([id, data]) => ({
            id,
            ...data,
            changes: Array.isArray(data.changes) ? data.changes : [data.changes]
          }))
          .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        setVersions(versionsData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching versions:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = (downloadUrl) => {
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-background to-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!versions.length) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-background to-gray-100">
          <div className="container mx-auto px-4 py-16">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
              <div className="max-w-2xl mx-auto">
                <img 
                  src="/assets/hero-image-2.jpeg" 
                  alt="Coming Soon" 
                  className="w-64 h-64 mx-auto mb-8"
                />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Coming Soon!
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  We're working hard to bring you the first version of our app. 
                  Stay tuned for updates!
                </p>
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-gray-500">
                    Want to be notified when we launch?
                  </p>
                  <a 
                    href="#newsletter" 
                    className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primaryLight transition duration-300"
                  >
                    Join Our Newsletter
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-gradient-to-b from-background to-gray-100">

        <div className="container mx-auto px-4 py-16">
          {/* Current Version Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 mb-16 border-4 border-primary">
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-3xl font-bold text-gray-800">Version {versions[0].version}</h2>
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm">
                    Current
                  </span>
                </div>
                <p className="text-gray-600 mb-6">
                  Released on {formatDate(versions[0].releaseDate)}
                </p>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">What's New:</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    {versions[0].changes.map((change, index) => (
                      <li key={index}>{change}</li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => handleDownload(versions[0].downloadUrl)}
                  className="flex items-center bg-primary text-white px-8 py-4 rounded-full hover:bg-primaryLight transition duration-300 text-lg"
                >
                  <FaDownload className="mr-3 text-xl" />
                  Download Latest Version
                </button>
              </div>
              <div className="flex-1">
                <img 
                  src="/assets/hero-image-2.jpeg" 
                  alt="Current Version Preview" 
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* App Screenshots Carousel */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">App Preview</h2>
            <div className="max-w-7xl mx-auto px-4">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000 }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                  },
                  1024: {
                    slidesPerView: 3,
                  },
                }}
                className="app-screenshots-swiper"
              >
                {screenshots.map((screen, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative group cursor-pointer">
                      <div className="h-[610px] bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                        <img 
                          src={screen.img} 
                          alt={screen.alt} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-center text-sm">{screen.caption}</p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* Previous Versions */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            <div className="flex items-center mb-8">
              <FaHistory className="text-3xl text-gray-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-800">Previous Versions</h2>
            </div>
            
            {versions.length <= 1 ? (
              // Show this when no previous versions exist
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">
                  No previous versions exist yet.
                </p>
              </div>
            ) : (
              // Show previous versions list
              <div className="space-y-8">
                {versions.slice(1).map((version) => (
                  <div 
                    key={version.id}
                    className="border-b border-gray-200 pb-8 last:border-b-0 hover:bg-gray-50 rounded-lg p-4 transition duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                          Version {version.version}
                        </h3>
                        <span className="text-gray-500">
                          {formatDate(version.releaseDate)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownload(version.downloadUrl)}
                        className="flex items-center bg-gray-100 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-200 transition duration-300 mt-4 md:mt-0"
                      >
                        <FaDownload className="mr-2" />
                        Download v{version.version}
                      </button>
                    </div>
                    <div className="pl-4 border-l-4 border-gray-200">
                      <h4 className="font-semibold mb-2 text-gray-700">Changes:</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {version.changes.map((change, index) => (
                          <li key={index}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Downloads;
