const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const contactRoutes = require('./routes/contact');

const app = express();

// Middleware
// CORS origins are read from env so they never go stale when you redeploy.
// Set ALLOWED_ORIGINS in your Render dashboard (Environment tab) to a
// comma-separated list, e.g.:
//   ALLOWED_ORIGINS=https://your-actual-vercel-url.vercel.app,http://localhost:5173
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (curl, server-to-server, some mobile webviews)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Simple health check — useful to confirm the backend is awake/reachable
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Portfolio backend is running' }));

// Routes
app.use('/api/contact', contactRoutes);

// Serve static files (optional for local testing)
app.use(express.static('../client/build'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

