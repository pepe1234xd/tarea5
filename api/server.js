const express = require('express');
const path = require('path');

const app = express();
const v1 = require('./controllers/v1');
const port = 5001;

// JSON Middleware
app.use(express.json());

// Static files
const folder = path.resolve(__dirname, 'public');
app.use('/', express.static(folder));

// Routers
app.use('/v1', v1);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})