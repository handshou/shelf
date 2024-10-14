import React from 'react'

export default function BackButton() {
	return (
		<button
			type="button"
			className="fixed top-8 left-8 z-20 bg-orange-500 text-white 
            px-4 py-2 rounded-md 
            hover:bg-orange-600 transition-colors duration-200 
            hidden lg:block"
		>
			Back
		</button>
	)
}
