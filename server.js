const express = require('express');
// const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();

const paymentRoutes = require('./routes/routes.js');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// app.use(bodyParser.json());
app.use('/api', paymentRoutes);
app.use(cors());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.DATABASE_URL)
  .then(()=>console.log('Database Connected'))
  .catch(error => console.log(errror));

// Create a server instance and listen on the specified port
const server = app.listen(PORT, () => {
    console.log(`Server Started at http://localhost:${PORT}`);
});


// module.exports = { app, server };
