import type React from 'react'

import '../styles/globals.css'

import {
	type Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

type CardProps = React.ComponentProps<typeof Card>

export function Card({ className, ...props }: CardProps) {
	return (
		<a href={props.url}>
			<Card
				className={cn('m-2 h-[220px] ease-out duration-300 hover:-translate-y-1', className)}
				{...props}
			>
				<CardHeader>
					<CardTitle>{props.title}</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4">
					<div>{props.children}</div>
				</CardContent>
				<CardFooter>
					<CardDescription>{props.footer}</CardDescription>
				</CardFooter>
			</Card>
		</a>
	)
}
