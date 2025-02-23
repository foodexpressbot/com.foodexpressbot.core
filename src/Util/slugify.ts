export default (text: string): string => {
	return text
		.toString()
		.toLowerCase()
		.replace(/\W/g, ' ')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/#/, 'sharp');
};
