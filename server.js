const express = require('express');
const cors = require('cors');
const path = require('path');
const bfhlRoutes = require('./routes/bfhl');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Register the BFHL routes
app.use('/bfhl', bfhlRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
