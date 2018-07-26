const express = require('express');

const PORT = 3000;
 
const app = express()

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000);
console.log(`listening on port ${PORT}`);
