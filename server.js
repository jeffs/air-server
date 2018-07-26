const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const http = require('http');
const https = require('https');

const PORT = 3000;

const parseProtocol = (url) => {
  if (url.startsWith('http://')) {
    return http;
  } else if (url.startsWith('https://')) {
    return https;
  } else {
    throw new Error(`unsupported protocol for URL: ${url}`);
  }
};

const download = async (url, dest) => new Promise((resolve, reject) => {
  const protocol = parseProtocol(url);
  const file = fs.createWriteStream(dest);
  protocol.get(url, response => {
    response.pipe(file);
    file.on('finish', () => {
      console.log(`wrote ${dest}`);
      resolve();
    });
  }).on('error', err => {
    fs.unlink(dest, () => { });
    reject(new Error(`failed to get ${url}`));
  });
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/', (req, res) => {

  // check the access token
  // fetch the input files
  // write the local paths to a spec for ffmpeg
  // call ffmpeg, writing the output to a public directory
  // return the mpeg URL to the client


  res.send(JSON.stringify(req.body));
});


const octocat = 'https://assets-cdn.github.com/images/modules/logos_page/Octocat.png';
const pianocat = 'http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg';
download(pianocat, 'piano.jpeg')
  .then(() => download('bad://protocol.com', 'badproto.jpeg'))
  .then(() => download('http://nonesuch@asdfkhgfdfjkjhgfdfjkjhgfdfghjkjgfd.com', 'nonesuch.jpeg'))
  .then(() => download(octocat, 'octo.jpeg'))
  .catch(err => {
    console.log(err.message);
  });

//app.listen(PORT);
//console.log(`listening on port ${PORT}`);
