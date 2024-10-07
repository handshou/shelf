import React, { useState, useEffect, useRef } from 'react';

export default function TopNavigation({ title }) {
  const [showTitle, setShowTitle] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const titlePosition = titleRef.current?.offsetTop ?? 0;

      if (currentScrollY > titlePosition) {
        setShowTitle(true);
      } else {
        setShowTitle(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="sticky top-0 z-10 bg-white">
      <nav className="text-sm p-4" aria-label="Breadcrumb">
        {showTitle ? (
          <h2 className="text-xl font-bold">{title}</h2>
        ) : (
          <ol className="list-none p-0 flex">
            <li className="flex items-center">
              <a href="/" className="text-gray-500 hover:text-gray-700">Home</a>
              <span className="mx-2">/</span>
            </li>
            <li className="flex items-center">
              <a href="#" className="text-gray-500 hover:text-gray-700">Category</a>
              <span className="mx-2">/</span>
            </li>
            <li className="flex items-center">
              <span className="text-gray-900">Current Page</span>
            </li>
          </ol>
        )}
      </nav>
    </div>
  );
}

