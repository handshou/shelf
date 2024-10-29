import '@styles/globals.css'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from '@radix-ui/react-icons'

export default function BackButton() {
	return (
		<a href="javascript:history.go(-1)" className="text-gray-500 hover:text-gray-700">
			<Button
				className="fixed top-6 left-6 z-20 bg-orange-500 text-white 
        hover:bg-orange-600 transition-colors duration-200 hidden lg:flex"
			>
				<ArrowLeftIcon className="h-4 w-4" />
				back
			</Button>
		</a>
	)
}
