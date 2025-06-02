import { useState } from 'react';

export default function Home() {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setPrediction('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setPrediction(data.predicted_class);
      }
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
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg text-white font-semibold ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Predicting...' : 'Predict'}
        </button>
        {prediction && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
            Predicted Class: {prediction}
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