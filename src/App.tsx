import React, { useState } from 'react';
import axios from 'axios';

const App = () => {

interface Snippet {
  title: string;
  url: string;
}

  const [videoUrl, setVideoUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  const processVideo = async () => {
    setProcessing(true);
    try {
      await axios.get(`http://3.106.230.195:3001/process-video`, {
        params: { url: videoUrl },
        headers: { 'Content-Type': 'application/json' }
      });
      setProcessing(false);
      alert('Video processing started. Fetch snippets after some time.');
    } catch (error) {
      setProcessing(false);
      console.error('Error processing video:', error);
      alert('Error processing video. Please check the console for details.');
    }
  };

  const fetchSnippets = async () => {
    try {
      const response = await axios.get(`http://3.106.230.195:3001/get-snippets`, {
        params: { url: videoUrl },
        headers: { 'Content-Type': 'application/json' }
      });
      setSnippets(response.data.snippets);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error:any) {
      console.error('Error fetching snippets:', error);
      if (error.response) {
        console.error('Error response:', error.response);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      alert('Error fetching snippets. Please check the console for details.');
    }
  };

  return (
    <div>
      <input 
        type="text" 
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        placeholder="Enter YouTube video URL" 
      />
      <button onClick={processVideo} disabled={processing}>Generate Snippets</button>
      <button onClick={fetchSnippets} disabled={processing}>Fetch Snippets</button>

      {snippets.length > 0 && (
        <div>
          <h3>MP3 Snippets</h3>
          <ul>
            {snippets.map((snippet, index) => (
              <li key={index}>
                <a href={snippet.url} download>{snippet.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
