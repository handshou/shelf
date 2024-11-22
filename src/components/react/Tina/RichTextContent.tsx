import { TinaMarkdown } from 'tinacms/dist/rich-text'

import { convertDMSToDecimal, validateGPSCoordinates } from '@/lib/map'
import {
  IFrame, Map as EmbedMap, CldImage, CldVideo,
  type MapType, type LinkProps
} from '@rc/Tina'

const components = {
  a: (props: LinkProps) => (
    <a href={props.url} target="_blank" rel="noopener noreferrer">
      {props.children}
    </a>
  ),

  img: (props: LinkProps) => (
    <a href={props.url} target="_blank" rel="noopener noreferrer">
      <CldImage url={props.url} />
    </a>
  ),

  Map: (props: { gpsCoordinates: string; mapType: MapType }) => {
    let { gpsCoordinates = "30 19' 45.49N, 35 26' 34.86E", mapType } = props
    if (typeof validateGPSCoordinates(gpsCoordinates) === 'string')
      gpsCoordinates = "30 19' 45.49N, 35 26' 34.86E"

    return (
      <>
        <EmbedMap {...convertDMSToDecimal(gpsCoordinates)} mapType={mapType} />
      </>
    )
  },

  IFrame: (props: {
    embedCode: string
  }) => {
    return <IFrame embedCode={props.embedCode} />
  },

  Video: (props: {
    videoUrl: string
  }) => {
    return (
      <div className="flex justify-center items-center">
        <div className="w-2/3 max-w-xs">
          <CldVideo videoUrl={props.videoUrl} />
        </div>
      </div>
    )
  },
}

export const RichTextContent = ({ content }) =>
  <article
    className="
            prose 
            prose-img:rounded-lg 
            prose-base 
            prose-neutral 
            lg:prose-neutral 
            first:prose-tr:bg-slate-50
            first:prose-tr:text-gray-500
            first:prose-tr:text-xs
            first:prose-tr:uppercase
            first:prose-tr:font-medium
            not-first:hover:prose-tr:bg-orange-50
            prose-table:!border-none
            prose-td:!border-none
            prose-td:!p-1
            "
  >
    {/* @ts-ignore component types must match TinaMarkdown component types*/}
    < TinaMarkdown components={components} content={content} />
  </article>
