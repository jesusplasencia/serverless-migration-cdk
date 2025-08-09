exports.handler = async (event) => {
  console.log(event);
  try {
    // Perform data consolidation logic
    const consolidatedData = { message: 'Data consolidated successfully', timestamp: new Date().toISOString() };
    console.log("consolidatedData: ", consolidatedData);

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify(consolidatedData),
    };
  } catch (error) {
    console.error('Error during consolidation:', error);

    // Throw error to notify Step Functions of failure
    throw new Error('Consolidation failed');
  }
};
