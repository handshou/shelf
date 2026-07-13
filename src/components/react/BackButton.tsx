import '@styles/globals.css'
import { Button } from '@/components/ui/button.tsx'
import { ArrowLeftIcon } from '@radix-ui/react-icons'

export default function BackButton() {
	// React 19 throws on javascript: URLs, so navigate from a click handler
	return (
		<Button
			onClick={() => history.go(-1)}
			className="fixed top-6 left-6 z-20 bg-orange-500 text-white
        hover:bg-orange-600 transition-colors duration-200 hidden lg:flex"
		>
			<ArrowLeftIcon className="h-4 w-4" />
			back
		</Button>
	)
}
