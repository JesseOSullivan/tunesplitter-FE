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
  Skeleton,
  Grid,
  useMediaQuery,
  useTheme,
  Grow,
} from '@mui/material';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import { useSpring, useTransition, animated } from '@react-spring/web';
import './App.css'; // Import the CSS file
import mascot from '../mascot.png'; // Import the image
const App = () => {
  interface Snippet {
    title: string;
    url: string;
  }

  const [videoUrl, setVideoUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [loadingSnippets, setLoadingSnippets] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const processAndFetchSnippets = async () => {
    if (hasFetched) {
      alert('Snippets have already been fetched.');
      return;
    }

    setProcessing(true);
    setLoadingSnippets(true);
    try {
      await axios.get(`http://localhost:3001/process-video`, {
        params: { url: videoUrl },
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await axios.get(`http://localhost:3001/get-snippets`, {
        params: { url: videoUrl },
        headers: { 'Content-Type': 'application/json' },
      });
      setSnippets(response.data.snippets);
      setHasFetched(true);
      setProcessing(false);
      setLoadingSnippets(false);
    } catch (error) {
      setProcessing(false);
      setLoadingSnippets(false);
      console.error('Error processing and fetching snippets:', error);
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
    setHasFetched(false);
    setSnippets([]);
  };

  const videoId = extractVideoId(videoUrl);
  const iframeUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';

  const textFieldProps = useSpring({
    width: isValidUrl ? (isSmallScreen ? '100%' : '40%') : '100%',
    transform: isValidUrl ? 'translateX(0%)' : 'translateX(0%)',
    config: { duration: 1000 },
  });

  const widthProps = useSpring({
    width: isValidUrl ? (isSmallScreen ? '100%' : '40%') : '100%',
    config: { duration: 1000 },
  });

  const buttonTransitions = useTransition(isValidUrl, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(20px)' },
    config: { duration: 800 },
  });

  return (
    <div>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src={mascot} alt="Mascot" style={{ width: '50px', height: '50px', marginRight: '10px' }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              TuneSplitter
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {!isValidUrl && (
        <Grow in={true} timeout={1000}>
        <Box sx={{ textAlign: 'center', mt: 4, px: 2 }}>
          <Typography variant="h6" component="div" gutterBottom>
            Welcome to TuneSplitter!
          </Typography>
          <Typography variant="body1" component="div">
            Enter a YouTube video URL to generate and download MP3 snippets from the video. Simply paste the URL
            into the input box below and click "Generate and Fetch Snippets".
          </Typography>
        </Box>
        </Grow>
      )}


      <Box
        className="side-by-side-content"
        sx={{
          padding: isSmallScreen ? 2 : 2,
          display: 'flex',
          flexDirection: isSmallScreen ? 'column' : 'row',
          alignItems: isSmallScreen ? 'center' : 'flex-start',
          justifyContent: 'center',
        }}
      >
        <animated.div style={{ ...textFieldProps, ...widthProps }}>
          <Box
            sx={{
              margin: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingRight: 0,
              mt: isSmallScreen ? 2 : 7,
              maxWidth: '1000px',
              transition: 'all 0.5s ease-in-out',
              justifyContent: 'center',
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
                    {!hasFetched && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={processAndFetchSnippets}
                        disabled={processing || !isValidUrl}
                        sx={{
                          backgroundColor: processing ? theme.palette.action.disabledBackground : theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: processing ? theme.palette.action.disabledBackground : theme.palette.primary.dark,
                          },
                          borderRadius: '20px',
                          boxShadow: '0 3px 5px 2px rgba(66, 165, 245, .3)',
                          padding: '10px 20px',
                          fontWeight: 'bold',
                          textTransform: 'none',
                          minWidth: '200px',
                        }}
                      >
                        {processing ? <CircularProgress size={24} /> : 'Snip It'}
                      </Button>
                    )}
                    {hasFetched && (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={downloadAll}
                        disabled={snippets.length === 0}
                        sx={{
                          backgroundColor: snippets.length === 0 ? theme.palette.action.disabledBackground : theme.palette.secondary.main,
                          '&:hover': {
                            backgroundColor: snippets.length === 0 ? theme.palette.action.disabledBackground : theme.palette.secondary.dark,
                          },
                          borderRadius: '20px',
                          boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                          padding: '10px 20px',
                          fontWeight: 'bold',
                          textTransform: 'none',
                        }}
                      >
                        Download All
                      </Button>
                    )}
                  </Box>
                </animated.div>
              ) : null
            )}
          </Box>
        </animated.div>
        {iframeUrl && (
          <Card sx={{ mt: isSmallScreen ? 2 : 0, flex: 1, width: isSmallScreen ? '100%' : 'auto' }}>
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

      <Box sx={{ mt: 4, width: '100%', paddingLeft: 2, paddingRight: 2, bgcolor:'white', pb:5 }}>
        <Grid container spacing={2} >
          { 
            snippets.length > 0 && (
              <Grid item xs={12} >
                <Typography variant="h6" component="div" gutterBottom>
                  Snippets
                </Typography>
              </Grid>
            )
          }


          {loadingSnippets ? (
            
            [1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => (
              <Grid item xs={12} sm={6} key={index} >
                <ListItem>
                  <ListItemIcon>
                    <AudiotrackIcon />
                  </ListItemIcon>
                  <ListItemText primary={<Skeleton variant="text" width="40%" />} />
                </ListItem>
              </Grid>
            ))
          ) : (
            snippets.map((snippet, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <ListItem button component="a" href={snippet.url} download>
                  <ListItemIcon>
                    <AudiotrackIcon />
                  </ListItemIcon>
                  <ListItemText primary={snippet.title} />
                </ListItem>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </div>
  );
};

export default App;
