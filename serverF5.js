import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = 5006; // Running on a separate port

app.use(express.json());
app.use(cors());


// Test API endpoint for Check F5
app.post('/checkF5', async (req, res) => {
  const { fqdn } = req.body;

  // Replace this with any test API endpoint
  const testApiUrl = `https://jsonplaceholder.typicode.com/todos/1`;

  try {
    const response = await axios.get(testApiUrl); // Replace with real API later
    res.json({
      fqdn,
      result: response.data,
    });
  } catch (error) {
    console.error('Error querying F5 API:', error.message);
    res.status(500).json({ error: 'Failed to query F5 API.' });
  }
});

app.listen(PORT, () => {
  console.log(`F5 API Server running on http://localhost:${PORT}`);
});
