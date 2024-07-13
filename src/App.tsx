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
  CssBaseline,
  Card,
  CardContent,
} from '@mui/material';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import { useSpring, useTransition, animated } from '@react-spring/web';
import './App.css'; // Import the CSS file

const App = () => {
  interface Snippet {
    title: string;
    url: string;
  }

  const [videoUrl, setVideoUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isValidUrl, setIsValidUrl] = useState(false);

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

  const extractVideoId = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('v');
    } catch (error) {
      console.error('Invalid URL:', error);
      return null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
    const videoId = extractVideoId(url);
    setIsValidUrl(!!videoId);
  };

  const videoId = extractVideoId(videoUrl);
  const iframeUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';

  const textFieldProps = useSpring({
    width: isValidUrl ? '40%' : '100%',
    transform: isValidUrl ? 'translateX(-20%)' : 'translateX(0%)',
    config: { duration: 1000 }, // Adjust the duration to make the animation slower
  });

  const widthProps = useSpring({
    width: isValidUrl ? '40%' : '100%',
    config: { duration: 1500 }, // Adjust the duration to make the width change slower
  });

  const buttonTransitions = useTransition(isValidUrl, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(20px)' },
    config: { duration: 500 },
  });

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
      <Box className="side-by-side-content">
        <animated.div style={{ ...textFieldProps, ...widthProps}}>
          <Box
            sx={{
              margin: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingLeft: isValidUrl ? 25 : 0,
              paddingRight: 0,
              transition: 'all 0.5s ease-in-out',
            }}
          >
            <TextField
              fullWidth
              label="Enter YouTube video URL"
              variant="outlined"
              value={videoUrl}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            {buttonTransitions((style, item) =>
              item ? (
                <animated.div style={style}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Button variant="contained" color="primary" onClick={processVideo} disabled={processing || !isValidUrl}>
                      {processing ? <CircularProgress size={24} /> : 'Generate Snippets'}
                    </Button>
                    <Button variant="contained" color="secondary" onClick={fetchSnippets} disabled={processing || !isValidUrl}>
                      {processing ? <CircularProgress size={24} /> : 'Fetch Snippets'}
                    </Button>
                    <Button variant="contained" onClick={downloadAll} disabled={snippets.length === 0}>
                      Download All
                    </Button>
                  </Box>
                </animated.div>
              ) : null
            )}
          </Box>
        </animated.div>
        {iframeUrl && (
          <Card sx={{ mt: 0, flex: 1 }}>
            <CardContent>
              <iframe
                width="100%"
                height="415"
                src={iframeUrl}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube video"
              />
            </CardContent>
          </Card>
        )}
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
