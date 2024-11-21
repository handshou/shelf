export const extractVideoIdFromUrl = (source: string) => {
	// Check if the source is a valid string
	if (!source || typeof source !== 'string') {
		console.error('Invalid source URL provided')
		return source
	}

	// Regular expression to capture the path + public ID (after /upload/v<version>)
	const regex = /\/upload\/v\d{8,12}\/(.+)\.[^/.]+/
	const matches = regex.exec(source)

	// Check if there was a match
	if (matches?.[1]) {
		return matches[1] // Return the directory/path and public ID
	}

	console.error('No match found in the provided URL')
	return source
}

export const extractImageIdFromUrl = (source: string) => {
	const regex = /\/upload\/v\d{8,12}\/(.+)$/
	const matches = regex.exec(source)

	if (matches) {
		return matches[1]
	}

	return source
}
