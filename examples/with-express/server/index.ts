import express from 'express';
import cors from 'cors';
import { ApiClient } from './generated/api';
import * as schemas from './generated/schemas';
import * as types from './generated/types';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize API client with Petstore API
const petstoreClient = new ApiClient('https://petstore.swagger.io/v2');

// Example route using generated types
app.get('/pets', async (req, res) => {
  try {
    // Using generated API client
    const response = await petstoreClient.getPetFindByStatus('available');
    
    // Validate response with generated Zod schema
    const pets = schemas.PetSchema.array().parse(response.data);
    
    res.json({
      success: true,
      data: pets,
      count: pets.length
    });
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pets'
    });
  }
});

// Example route with request validation
app.post('/pets', async (req, res) => {
  try {
    // Validate request body with generated Zod schema
    const petData = schemas.PetSchema.parse(req.body);
    
    // Using generated API client to create pet
    const response = await petstoreClient.postPet(petData);
    
    res.json({
      success: true,
      data: response.data,
      message: 'Pet created successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: `Validation error: ${error.message}`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
});

// Example route using generated types for parameters
app.get('/pets/:petId', async (req, res) => {
  try {
    const petId = parseInt(req.params.petId);
    
    if (isNaN(petId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pet ID'
      });
    }
    
    // Using generated API client
    const response = await petstoreClient.getPetPetId(petId);
    
    // Validate response with generated Zod schema
    const pet = schemas.PetSchema.parse(response.data);
    
    res.json({
      success: true,
      data: pet
    });
  } catch (error) {
    console.error('Error fetching pet:', error);
    res.status(404).json({
      success: false,
      message: 'Pet not found'
    });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Express server with zod-swagger is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`🚀 Express server running on port ${port}`);
  console.log(`📊 Using generated types from zod-swagger`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
  console.log(`🐾 Pet endpoints: http://localhost:${port}/pets`);
}); 