import React, { useState, useEffect, useRef } from 'react';
import { useTina } from "tinacms/dist/react"

export function TopNavigation(props) {
  const { data } = useTina(props);
  const { title : tinaTitle } = data.travels;

  const [showTitle, setShowTitle] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const titlePosition = titleRef.current?.getBoundingClientRect() ?? 0;

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
          <h2 
            className="text-xl font-bold"
          >{tinaTitle}</h2>
        ) : (
          <ol className="list-none p-0 flex">
            <li className="flex items-center">
              <a href="/" className="text-gray-500 hover:text-gray-700">Home</a>
              <span className="mx-2">/</span>
            </li>
            <li className="flex items-center">
              <span className="text-gray-900">Travel</span>
            </li>
          </ol>
        )}
      </nav>
    </div>
  );
}

