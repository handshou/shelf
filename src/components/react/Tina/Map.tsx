import { useEffect, useState } from 'react'

export type MapType = 
  | 'Openstreetmaps' 
  | 'GoogleGPS' 
  | 'GoogleSearch' 
  | 'GoogleGeneral'

interface TinaEmbedProps {
  latitude: string
  longitude: string
  mapType: MapType
}

const API_KEY = import.meta.env?.PUBLIC_GOOGLE_MAPS_API_KEY || ''

export const Map = ({ latitude, longitude, mapType }: TinaEmbedProps) => {
  const [iframeMarkup, setIframeMarkup] = useState('')

  useEffect(() => {
    const fetchIframe = async () => {
      const markup = await getIframeFromCoordinates(latitude, longitude, mapType)
      setIframeMarkup(markup)
    }
    fetchIframe()
  }, [latitude, longitude, mapType])

  return <div dangerouslySetInnerHTML={{ __html: iframeMarkup }} />
}

const getIframeFromCoordinates = async (latitude: string, longitude: string, mapType: MapType) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`

  try {
    const response = await fetch(url)
    const data = await response.json()
    const location = data.display_name

    // Calculate bounding box for the OSM iframe
    const bbox = {
      minLon: Number(longitude) - 0.001,
      minLat: Number(latitude) - 0.001,
      maxLon: Number(longitude) + 0.001,
      maxLat: Number(latitude) + 0.001,
    }

    let iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}&layer=mapnik&marker=${latitude},${longitude}`
    if (mapType === 'GoogleGPS') {
      iframeSrc = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${latitude},${longitude}`
    }
    if (mapType === 'GoogleSearch') {
      iframeSrc = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodeURI(location)}`
    }
    if (mapType === 'GoogleGeneral') {
      iframeSrc = `https://www.google.com/maps/embed/v1/search?key=${API_KEY}&q=${encodeURI(location)}&center=${latitude},${longitude}&zoom=17`
    }
    return `<h3>${location.split(/,(.*)/s)[0]}</h3><p>${location.split(/,(.*)/s)[1]}</p> <iframe loading="lazy" width="100%" height="300px" allowFullScreen src="${iframeSrc}"></iframe>`
  } catch (error) {
    return '<p>Location not found</p>'
  }
}

