import React from 'react';
import { FaTimes, FaExclamationTriangle, FaDownload, FaShieldAlt, FaCheck } from 'react-icons/fa';

function InstallModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-primary">Installing Emo APK</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition duration-300">
            <FaTimes size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaDownload className="mr-2 text-primary" /> Installation Steps
            </h3>
            <ol className="space-y-4 list-decimal list-inside">
              <li>Enable installation from unknown sources in your device settings.</li>
              <li>Download the Emo APK file.</li>
              <li>Tap the downloaded APK file to begin installation.</li>
              <li>You may see a warning about installing apps from unknown sources. This is normal for APK installations.</li>
              <li>Tap "Install" to proceed.</li>
              <li>Android might scan the app for harmful behavior. This is a standard security measure.</li>
              <li>Once the installation is complete, tap "Open" to launch Emo.</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FaExclamationTriangle className="mr-2 text-yellow-500" /> What to Expect During Installation
            </h3>
            <ul className="space-y-2">
              <li><strong>"Unknown sources" warning:</strong> This appears because Emo is not from the Google Play Store. It's safe to proceed.</li>
              <li><strong>"Harmful app" scan:</strong> Android may scan Emo for security. This is a normal protective measure.</li>
              <li><strong>Permission requests:</strong> Emo will ask for necessary permissions to function properly. You can review these before accepting.</li>
            </ul>
          </div>

          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FaShieldAlt className="mr-2 text-green-500" /> Safety Assurance
            </h3>
            <p>Emo is safe to install. These warnings are standard for APK installations and don't indicate any issues with our app. We prioritize your device's security and your data privacy.</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FaCheck className="mr-2 text-blue-500" /> After Installation
            </h3>
            <p>Once installed, you can find the Emo app in your device's app drawer. Enjoy using Emo!</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primaryLight transition duration-300 w-full md:w-auto"
        >
          Got it, thanks!
        </button>
      </div>
    </div>
  );
}

export default InstallModal;
