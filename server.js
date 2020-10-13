const express = require('express');

const app = express();

const PORT = process.env.PORT || 5000; //use environment variable if exists

app.get('/', ((req, res) => res.send('API is Running')));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
