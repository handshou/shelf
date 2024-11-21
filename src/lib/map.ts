export const validateGPSCoordinates = (value: string) => {
	if (!value || value.trim() === '') {
		return 'GPS coordinates are required'
	}

	const parts = value.split(',')

	if (parts.length !== 2) {
		return 'Invalid format. Expected format: 30 19 45.49N, 35 26 34.86E'
	}

	const validatePart = (part: string) => {
		const trimmedPart = part.trim()
		const direction = trimmedPart.slice(-1)
		const dmsString = trimmedPart.slice(0, -1).trim()

		// Split DMS string into parts
		const dmsParts = dmsString.split(/\s+/)

		if (dmsParts.length < 3 || dmsParts.length > 4) {
			return 'Invalid DMS format'
		}

		// Convert degrees, minutes, and seconds to numbers
		const degrees = Number(dmsParts[0])
		const minutes = Number(dmsParts[1])
		const seconds = dmsParts.length === 4 ? Number(dmsParts[2]) : 0

		// Validate that degrees, minutes, and seconds are numbers
		if (
			Number.isNaN(degrees) ||
			Number.isNaN(minutes) ||
			Number.isNaN(seconds) ||
			degrees < 0 ||
			degrees > 180 || // Valid degrees range
			minutes < 0 ||
			minutes >= 60 || // Valid minutes range
			seconds < 0 ||
			seconds >= 60 // Valid seconds range
		) {
			return 'Degrees, minutes, and seconds must be valid numbers'
		}

		// Validate direction
		if (!['N', 'S', 'E', 'W'].includes(direction)) {
			return 'Direction must be N, S, E, or W'
		}

		return true // Validation passed
	}

	// Validate both latitude and longitude
	const latValidation = validatePart(parts[0])
	const lonValidation = validatePart(parts[1])

	if (latValidation !== true) {
		return latValidation // Return error from latitude validation
	}

	if (lonValidation !== true) {
		return lonValidation // Return error from longitude validation
	}

	return true // Validation passed
}

export const convertDMSToDecimal = (dms: string) => {
	// Split the input into latitude and longitude
	const [latString, lonString] = dms.split(',').map((coord) => coord.trim())

	const convertSingleDMS = (coord: string) => {
		// Remove the direction and trim spaces
		const direction = coord.slice(-1)
		const cleanedCoord = coord.slice(0, -1).trim()

		// Split by spaces and handle the presence of seconds
		const parts = cleanedCoord.split(/\s+/)
		const degrees = Number.parseFloat(parts[0])
		let minutes = Number.parseFloat(parts[1]) || 0
		let seconds = Number.parseFloat(parts[2]) || 0

		// If only degrees and minutes are present
		if (parts.length === 2) {
			seconds = 0 // Assume no seconds provided
		} else if (parts.length === 1) {
			minutes = 0 // Only degrees provided
			seconds = 0
		}

		// Calculate the decimal value
		let decimal = degrees + minutes / 60 + seconds / 3600

		// Adjust for direction
		if (direction === 'S' || direction === 'W') {
			decimal *= -1
		}

		return decimal
	}

	// Convert latitude and longitude
	const latitude = convertSingleDMS(latString).toString()
	const longitude = convertSingleDMS(lonString).toString()

	return { latitude, longitude }
}
