const express = require('express');

const PORT = 3000;
 
const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/', (req, res) => {
  res.send(JSON.stringify(req.body));
});

app.listen(PORT);
console.log(`listening on port ${PORT}`);
