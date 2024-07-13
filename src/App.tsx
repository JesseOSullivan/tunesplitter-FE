import React, { useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  AppBar,
  Toolbar,
  CssBaseline
} from '@mui/material';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';

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
      await axios.get(`http://localhost:3001/process-video`, {
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
      const response = await axios.get(`http://localhost:3001/get-snippets`, {
        params: { url: videoUrl },
        headers: { 'Content-Type': 'application/json' }
      });
      setSnippets(response.data.snippets);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
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

  const downloadAll = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/download-all`, {
        params: { url: videoUrl },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'snippets.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading all snippets:', error);
      alert('Error downloading all snippets. Please check the console for details.');
    }
  };

  return (
    <div>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            YouTube Snippet Generator
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          mt: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: 'md',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: 2,
          paddingRight: 2
        }}
      >
        <TextField
          fullWidth
          label="Enter YouTube video URL"
          variant="outlined"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button variant="contained" color="primary" onClick={processVideo} disabled={processing}>
            {processing ? <CircularProgress size={24} /> : 'Generate Snippets'}
          </Button>
          <Button variant="contained" color="secondary" onClick={fetchSnippets} disabled={processing}>
            {processing ? <CircularProgress size={24} /> : 'Fetch Snippets'}
          </Button>
          <Button variant="contained" onClick={downloadAll} disabled={snippets.length === 0}>
            Download All
          </Button>
        </Box>
      </Box>
      {snippets.length > 0 && (
        <Box sx={{ mt: 4, width: '100%', paddingLeft: 2, paddingRight: 2 }}>
          <Typography variant="h5" component="div" gutterBottom>
            MP3 Snippets
          </Typography>
          <List>
            {snippets.map((snippet, index) => (
              <ListItem button component="a" href={snippet.url} download key={index}>
                <ListItemIcon>
                  <AudiotrackIcon />
                </ListItemIcon>
                <ListItemText primary={snippet.title} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </div>
  );
};

export default App;
