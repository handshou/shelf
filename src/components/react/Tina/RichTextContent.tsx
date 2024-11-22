import type { ReactNode } from 'react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { convertDMSToDecimal, validateGPSCoordinates } from '@/lib/map'
import { IFrame } from '@rc/Tina/IFrame'
import { Map as EmbedMap, type MapType } from '@rc/Tina/Map'
import { CldImage, CldVideo } from '@rc/cloudinary'

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  url: string
  children: ReactNode
}

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

export const RichTextContent = ({ content }: { any }) => < TinaMarkdown components={components} content={content} />
