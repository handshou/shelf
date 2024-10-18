import React, { useEffect, useState } from 'react'
import { tinaField, useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import type { TravelsQuery } from '../../tina/__generated__/types'

import { AdvancedImage, lazyload, responsive } from '@cloudinary/react'
import { Cloudinary } from '@cloudinary/url-gen'
import { quality } from '@cloudinary/url-gen/actions/delivery'
import { format } from '@cloudinary/url-gen/actions/delivery'
import { auto } from '@cloudinary/url-gen/qualifiers/format'

const convertDMSToDecimal = (dms) => {
    // Split the input into latitude and longitude
    const [latString, lonString] = dms.split(',').map(coord => coord.trim());

    const convertSingleDMS = (coord) => {
        // Remove the direction and trim spaces
        const direction = coord.slice(-1);
        const cleanedCoord = coord.slice(0, -1).trim();

        // Split by spaces and handle the presence of seconds
        const parts = cleanedCoord.split(/\s+/);
        let degrees = parseFloat(parts[0]);
        let minutes = parseFloat(parts[1]) || 0;
        let seconds = parseFloat(parts[2]) || 0;

        // If only degrees and minutes are present
        if (parts.length === 2) {
            seconds = 0; // Assume no seconds provided
        } else if (parts.length === 1) {
            minutes = 0; // Only degrees provided
            seconds = 0;
        }

        // Calculate the decimal value
        let decimal = degrees + (minutes / 60) + (seconds / 3600);

        // Adjust for direction
        if (direction === 'S' || direction === 'W') {
            decimal *= -1;
        }

        return decimal;
    };

    // Convert latitude and longitude
    const latitude = convertSingleDMS(latString);
    const longitude = convertSingleDMS(lonString);

console.log({latitude, longitude})
    return { latitude, longitude };
};

// Example usage
const gpsCoordinates = "30 19' 45.49N, 35 26' 34.86E";

const TinaEmbed = ({ latitude, longitude }) => {
  const [iframeMarkup, setIframeMarkup] = useState('');

  useEffect(() => {
    const fetchIframe = async () => {
      const markup = await getIframeFromCoordinates(latitude, longitude);
      setIframeMarkup(markup);
    };

    fetchIframe();
  }, [latitude, longitude]);

  return (
    <div dangerouslySetInnerHTML={{ __html: iframeMarkup }} />
  );
};

const getIframeFromCoordinates = async (latitude, longitude) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    const location = data.display_name;
    
   // Calculate bounding box for the OSM iframe
    const bbox = {
        minLon: longitude - 0.001,
        minLat: latitude - 0.001,
        maxLon: longitude + 0.001,
        maxLat: latitude + 0.001,
    };

    const iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}&layer=mapnik&marker=${latitude},${longitude}`;
    return `<h3>${location.split(/,(.*)/s)[0]}</h3><p>${location.split(/,(.*)/s)[1]}</p> <iframe width="100%" height="400px" src="${iframeSrc}"></iframe>`;
  } catch (error) {
    console.error('Error fetching location:', error);
    return '<p>Location not found</p>';
  }
};

export const TravelComponent = (props: {
	data: TravelsQuery
	variables: {
		relativePath: string
	}
	query: string
}) => {
	const { data } = useTina(props)

	const { title } = data.travels

	const cld = new Cloudinary({
		cloud: {
			cloudName: 'dbifqlg1w',
		},
	})

  const API_KEY = import.meta.env.GOOGLE_MAPS_API_KEY

	const extractImageIdFromUrl = (source) => {
		const regex = /\/upload\/v\d{8,12}\/(.+)$/
		const matches = regex.exec(source)

		if (matches) {
			return matches[1]
		}

		return null
	}

	const myImage = (url) =>
		cld.image(extractImageIdFromUrl(url)).delivery(quality(70)).delivery(format(auto()))

	const components = {
		a: (props) => (
			<a href={props.url} target="_blank" rel="noopener noreferrer">
				{props.children}
			</a>
		),

		img: (props) => (
			<a href={props.url} target="_blank" rel="noopener noreferrer">
				<AdvancedImage cldImg={myImage(props.url)} plugins={[lazyload(), responsive()]} />
			</a>
		),

    html: (props) => (
    <>
      {/*<iframe width="100%" height="350" 
        src={"https://www.openstreetmap.org/export/embed.html?" 
        + "bbox=" + "103.84615302085876" 
        + "%2C"   + "1.2855071020885447" 
        + "%2C"   + "103.85844826698305" 
        + "%2C"   + "1.293465882410554"
        + "&amp;layer=mapnik"} />
      <small>
        <a target="_blank" href="https://www.openstreetmap.org/#map=17/1.289486/103.852301">
          View Larger Map
        </a>
      </small>*/}
      {/*<iframe 
      width="100%"
      height="350"
      src={`https://nominatim.openstreetmap.org/ui/reverse.html?lat=30.32967&lon=35.44303`}
      >
      </iframe>
      <iframe
      width="100%"
      height="350"
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      src={`https://www.google.com/maps/embed/v1/place?key=${API_KEY}
      &q=30%2019%20'45.49N,35%2026'%2034.86E
      `}>
      </iframe>
      <iframe 
      src="https://www.google.com/maps/d/embed?mid=1fgfekK1Q3ivRaapgnxDP4_UJhd9atos&ehbc=2E312F&noprof=1"
      width="100%" 
      height="350"
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      >
      </iframe>
      <iframe src = "https://maps.google.com/maps?q=10.305385,77.923029&hl=es;z=14&amp;output=embed"></iframe>
      */}
      <TinaEmbed {...convertDMSToDecimal(gpsCoordinates)} />
      </>
    ),
	}

	return (
		<>
			<div className="p-8 space-y-8 pb-48 lg:pb-24">
				<h1
					className="travel-title font-serif text-4xl font-bold mb-6"
					data-tina-field={tinaField(data.travels, 'title')}
				>
					{title}
				</h1>
				<div data-tina-field={tinaField(data.travels, 'body')}>
					<article className="prose prose-img:rounded-lg prose-base prose-neutral lg:prose-neutral">
						<TinaMarkdown components={components} content={data.travels.body} />
					</article>
				</div>
			</div>
		</>
	)
}
