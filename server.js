const express = require('express');
const bodyParser = require('body-parser');
const paymentRoutes = require('./routes/routes.js');

const app = express();
app.use(bodyParser.json());
app.use('/api', paymentRoutes);

const PORT = process.env.PORT || 5000;

// Create a server instance and listen on the specified port
const server = app.listen(PORT, () => {
    console.log(`Server Started at http://localhost:${PORT}`);
});


module.exports = { app, server };