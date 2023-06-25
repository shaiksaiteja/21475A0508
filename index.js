const express = require('express');
const axios = require('axios');

const app = express();
const port = 8008;

app.get('/', (req, res) => {
  res.send('Welcome to the Number Management Service');
});

app.get('/numbers', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URLs are required' });
  }

  const urls = Array.isArray(url) ? url : [url];

  try {
    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          const response = await axios.get(url, { timeout: 500 });
          return response.data.numbers;
        } catch (error) {
          console.error(`Error fetching data from ${url}: ${error.message}`);
          return null;
        }
      })
    );

    const mergedNumbers = results
      .filter((numbers) => numbers !== null)
      .flat()
      .reduce((uniqueNumbers, number) => {
        if (!uniqueNumbers.includes(number)) {
          uniqueNumbers.push(number);
        }
        return uniqueNumbers;
      }, [])
      .sort((a, b) => a - b);

    res.json({ numbers: mergedNumbers });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
