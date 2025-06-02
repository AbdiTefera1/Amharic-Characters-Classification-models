"use client"

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Image from 'next/image';

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Create and clean up object URL for the image
  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setImageUrl(url);
      // Clean up the URL when the component unmounts or image changes
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImageUrl(null);
    }
  }, [image]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setPrediction('');
      setError('');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);

    try {
      console.log("Before I send request")
      const response = await fetch('https://amharic-chars-classif.onrender.com/predict', {
        method: 'POST',
        body: formData,
      });
      const data: { predicted_class?: string; error?: string } = await response.json();
      console.log("Here is data response: ", data)
      if (data.error) {
        setError(data.error);
      } else {
        setPrediction(data.predicted_class || '');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to get prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">Image Classification</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        {imageUrl && (
          <div className="mb-4">
            <Image
              src={imageUrl}
              alt="Image to Predict"
              width={200}
              height={200}
              className="object-contain"
            />
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg text-white font-semibold ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Predicting...' : 'Predict'}
        </button>
        {prediction && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg text-2xl">
            Predicted Class: <span className="text-7xl">{prediction}</span> 
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}