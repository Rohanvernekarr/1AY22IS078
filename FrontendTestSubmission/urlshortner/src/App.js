import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import axios from 'axios';

export default function App() {
  const [url, setUrl] = useState('');
  const [shortLink, setShortLink] = useState(null);

  const handleSubmit = async () => {
    try {
      const res = await axios.post('http://localhost:5000/shorturls', { url });
      setShortLink(res.data.shortLink);
    } catch (err) {
      console.error(err);
      alert('Error shortening URL');
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '3rem' }}>
      <Typography variant="h4" gutterBottom>URL Shortener</Typography>
      <TextField
        fullWidth
        label="Enter long URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        margin="normal"
      />
      <Button variant="contained" onClick={handleSubmit}>Shorten</Button>
      {shortLink && (
        <Typography variant="h6" style={{ marginTop: '1rem' }}>
          Shortened URL: <a href={shortLink}>{shortLink}</a>
        </Typography>
      )}
    </Container>
    
  );
}
