import type { ReactNode } from 'react'

import { IFrame } from '@rc/Tina/IFrame'
import { Map, type MapType } from '@rc/Tina/Map'
import { CldImage, CldVideo } from '@rc/Tina/cloudinary'

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  url: string
  children: ReactNode
}

export { type LinkProps, IFrame, Map, type MapType, CldImage, CldVideo }
