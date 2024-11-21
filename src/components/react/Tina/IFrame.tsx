export const IFrame = ({ embedCode }) => {
	return <div dangerouslySetInnerHTML={{ __html: embedCode }} />
}

