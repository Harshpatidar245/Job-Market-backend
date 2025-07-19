const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser'); // ✅ for handling cookies

// Route imports
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const userRoutes = require('./routes/users');
const applicationRoutes = require('./routes/applications');

dotenv.config();

const app = express();

// ======== MIDDLEWARE =========

// CORS setup
app.use(cors({
  origin: "http://localhost:5173", // e.g., 'https://job-portal-frontend.onrender.com'
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // ✅ Enable cookie parsing

// ======== SESSION SETUP =========
app.use(session({
  secret: process.env.SESSION_SECRET , // replace in .env
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true only in production with HTTPS
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
}));

// ======== STATIC FILES =========
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======== ROUTES =========
app.use('/api/auth', authRoutes);
app.use('/api/jobs', (req, res, next) => {
  console.log('Job route hit!');
  next();
}, jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);

// ======== DATABASE =========
mongoose.connect(process.env.MONGODB_URI , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully');
  console.log('Database name:', mongoose.connection.name);
})
.catch(err => console.error('MongoDB connection error:', err));

// ======== ERROR HANDLER =========
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// ======== START SERVER =========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
