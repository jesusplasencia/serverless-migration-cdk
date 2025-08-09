exports.handler = async (event) => {
	console.log(event);
	try {
		// Perform data extraction logic
		const extractedData = { message: 'Data extracted successfully', timestamp: new Date().toISOString() };

		console.log("extractedData: ", extractedData);

		// Return success response
		return {
			statusCode: 200,
			body: JSON.stringify(extractedData),
		};
	} catch (error) {
		console.error('Error during extraction:', error);

		// Throw error to notify Step Functions of failure
		throw new Error('Extraction failed');
	}
};
