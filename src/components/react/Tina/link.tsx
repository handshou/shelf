import type { ReactNode } from 'react'

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  url: string
  children: ReactNode
}

export { type LinkProps }
