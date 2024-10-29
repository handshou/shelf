import type { ComponentProps } from 'react'

import '@styles/globals.css'

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

type CardProps = ComponentProps<typeof Card>

interface ProjectCardProps extends CardProps {
  url: string,
  footer: string,
}

export const ProjectCard = ({ className, ...props }: ProjectCardProps) => {
	return (
		<a href={props.url}>
			<Card
				className={cn('m-2 h-[220px] ease-out duration-300 hover:-translate-y-1', className)}
				{...props}
			>
				<CardHeader>
					<CardTitle className="font-normal font-serif tracking-wide text-2xl lowercase">
						{props.title}
					</CardTitle>
				</CardHeader>
				<CardContent className="font-sans grid gap-4">
					<div>{props.children}</div>
				</CardContent>
				<CardFooter>
					<CardDescription className="font-sans uppercase text-neutral-400">
						{props.footer}
					</CardDescription>
				</CardFooter>
			</Card>
		</a>
	)
}

