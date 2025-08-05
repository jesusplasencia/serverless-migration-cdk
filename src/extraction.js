exports.handler = async (event) => {
  try {
    // Perform data extraction logic
    const extractedData = { message: 'Data extracted successfully', timestamp: new Date().toISOString() };

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
