const { BlobServiceClient } = require('@azure/storage-blob');
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

const containerName = 'legal-documents';
const containerClient = blobServiceClient.getContainerClient(containerName);

// Create container if it doesn't exist
async function createContainer() {
  try {
    await containerClient.createIfNotExists();
    console.log('Azure Blob Storage container ready');
  } catch (error) {
    console.error('Error creating container:', error);
  }
}

createContainer();

module.exports = { blobServiceClient, containerClient };