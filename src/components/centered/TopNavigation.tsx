import React, { useState, useEffect, useRef } from 'react'
import { useTina } from 'tinacms/dist/react'

import '@/styles/globals.css'
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, ChevronLeftIcon } from "@radix-ui/react-icons"

import { SITE_TITLE } from '../../config'

import { breadcrumbPosition, isBottom, showNavigation, titlePosition } from '../../store/titleStore'

export function TopNavigation(props) {
  const { data } = useTina(props)
  const { title: tinaTitle } = data.travels

  const [showTitle, setShowTitle] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const titleRef = useRef(null)

  useEffect(() => {
    const titleElement = document.querySelector('.travel-title')
    const crumbElement = document.querySelector('.travel-crumb')
    window?.addEventListener(
      'scroll',
      () => {
        const titleRect = titleElement?.getBoundingClientRect()
        const crumbRect = crumbElement?.getBoundingClientRect()
        titlePosition.set(titleRect?.top + titleRect?.height || 0)
        breadcrumbPosition.set(crumbRect?.height || 0)
        if (window.scrollY > lastScrollY) {
          showNavigation.set(false)
        } else {
          showNavigation.set(true)
        }
        setLastScrollY(window.scrollY)
      },
      { passive: true }
    )

    return window?.removeEventListener('wheel', () => {
      const titleRect = titleElement?.getBoundingClientRect()
      const crumbRect = crumbElement?.getBoundingClientRect()
      titlePosition.set(titleRect?.top + titleRect?.height || 0)
      breadcrumbPosition.set(crumbRect?.height || 0)
    })
  }, [lastScrollY])

  useEffect(() => {
    titlePosition.subscribe((pos) => {
      if (pos - breadcrumbPosition.get() >= 0 || isBottom.get()) {
        setShowTitle(false)
      } else {
        setShowTitle(true)
      }
    })
  }, [])

  return (
    <div className="travel-crumb sticky top-0 z-10 bg-white h-20">
      <nav className="text-sm pt-8 pl-8" aria-label="Breadcrumb">
        {showTitle ? (
          <h2 className="font-serif text-4xl font-bold">{tinaTitle}</h2>
        ) : (
          <ol className="list-none p-0 flex">
            <li className="flex items-center">
              <a href="/" className="text-gray-500 hover:text-gray-700">
                {SITE_TITLE}
              </a>
            </li>
            <li className="flex items-center">
              <span className="mx-2"><ChevronLeftIcon /></span>
              <a href="/travels" className="text-gray-500 hover:text-gray-700">
                travels
              </a>
            </li>
            {isBottom.get() && (
              <>
                <li className="flex items-center text-gray-900 font-bold">
                  <span className="mx-2"><ChevronLeftIcon /></span>
                  {tinaTitle.toLowerCase()}
                </li>
              </>
            )}
          </ol>
        )}
      </nav>
    </div>
  )
}
