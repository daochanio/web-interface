import { Image as ImageData } from '../../common/api'

export default function Image({
	image,
	width,
	height,
	borderRadius,
}: {
	image: ImageData
	width?: number
	height?: number
	borderRadius?: string
}) {
	const { url, contentType } = image.formatted
	if (contentType.startsWith('video')) {
		return (
			<video autoPlay muted loop width={width} height={height} style={{ borderRadius: borderRadius }}>
				<source src={url} type={contentType} />
			</video>
		)
	}

	return <img src={url} width={width} height={height} style={{ borderRadius: borderRadius }} />
}
