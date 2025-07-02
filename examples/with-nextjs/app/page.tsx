'use client'

import { useState, useEffect } from 'react'
import { ApiClient } from '../generated/api'
import * as schemas from '../generated/schemas'
import * as types from '../generated/types'

// Initialize API client
const petstoreClient = new ApiClient('https://petstore.swagger.io/v2')

export default function Home() {
  const [pets, setPets] = useState<types.Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPet, setNewPet] = useState<Partial<types.Pet>>({
    name: '',
    photoUrls: [''],
    status: 'available'
  })

  useEffect(() => {
    fetchPets()
  }, [])

  const fetchPets = async () => {
    try {
      setLoading(true)
      const response = await petstoreClient.getPetFindByStatus('available')
      
      // Validate response with generated Zod schema
      const validatedPets = schemas.PetSchema.array().parse(response.data)
      setPets(validatedPets)
      setError(null)
    } catch (err) {
      setError('Failed to fetch pets')
      console.error('Error fetching pets:', err)
    } finally {
      setLoading(false)
    }
  }

  const createPet = async () => {
    try {
      // Validate pet data with generated Zod schema
      const validatedPet = schemas.PetSchema.parse(newPet)
      
      await petstoreClient.postPet(validatedPet)
      
      // Refresh pets list
      await fetchPets()
      
      // Reset form
      setNewPet({
        name: '',
        photoUrls: [''],
        status: 'available'
      })
      
      setError(null)
    } catch (err) {
      if (err instanceof Error) {
        setError(`Validation error: ${err.message}`)
      } else {
        setError('Failed to create pet')
      }
      console.error('Error creating pet:', err)
    }
  }

  const updatePhotoUrl = (index: number, value: string) => {
    const updatedUrls = [...(newPet.photoUrls || [])]
    updatedUrls[index] = value
    setNewPet({ ...newPet, photoUrls: updatedUrls })
  }

  const addPhotoUrl = () => {
    setNewPet({
      ...newPet,
      photoUrls: [...(newPet.photoUrls || []), '']
    })
  }

  const removePhotoUrl = (index: number) => {
    const updatedUrls = newPet.photoUrls?.filter((_, i) => i !== index) || []
    setNewPet({ ...newPet, photoUrls: updatedUrls })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Petstore API with zod-swagger
        </h2>
        <p className="text-lg text-gray-600">
          Using generated TypeScript types and Zod schemas from OpenAPI specification
        </p>
      </div>

      {/* Create Pet Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Create New Pet</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={newPet.name}
              onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pet name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={newPet.status}
              onChange={(e) => setNewPet({ ...newPet, status: e.target.value as types.Pet['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo URLs *
            </label>
            {newPet.photoUrls?.map((url, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updatePhotoUrl(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/photo.jpg"
                />
                <button
                  onClick={() => removePhotoUrl(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addPhotoUrl}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Add Photo URL
            </button>
          </div>

          <button
            onClick={createPet}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Create Pet
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Pets List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold">Available Pets</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Loading pets...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pets.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No pets available</p>
              </div>
            ) : (
              pets.map((pet) => (
                <div key={pet.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {pet.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        ID: {pet.id} | Status: {pet.status}
                      </p>
                      {pet.photoUrls && pet.photoUrls.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">Photos:</p>
                          <div className="flex gap-2 mt-1">
                            {pet.photoUrls.map((url, index) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-600 text-sm"
                              >
                                Photo {index + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      pet.status === 'available' ? 'bg-green-100 text-green-800' :
                      pet.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {pet.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Generated Types Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-lg font-medium text-blue-900 mb-2">
          Generated Types from OpenAPI
        </h4>
        <p className="text-blue-800 text-sm">
          This application uses TypeScript types, interfaces, and Zod schemas automatically generated from the Petstore OpenAPI specification using zod-swagger.
        </p>
      </div>
    </div>
  )
} 