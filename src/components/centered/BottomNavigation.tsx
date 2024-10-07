import React from 'react';

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-8 left-8 z-20 bg-gray-50 p-4 rounded-lg transition-transform duration-300">
      <ul className="space-y-2">
        <li>
          <a href="/" className="block px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors duration-200">
            Home
          </a>
        </li>
        <li>
          <a href="/profile" className="block px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors duration-200">
            Profile
          </a>
        </li>
        <li>
          <a href="/settings" className="block px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors duration-200">
            Settings
          </a>
        </li>
      </ul>
    </nav>
  );
}

