'use strict';

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
      resolve(dest);
    });
  }).on('error', err => {
    fs.unlink(dest, () => { });
    reject(new Error(`failed to get ${url}`));
  });
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/', async (req, res) => {
  const urls = req.body.url;
  if (!Array.isArray(urls)) {
    return res.status(400).send('need at least two files to concatenate\n');
  }
  Promise.all(
    urls.map((url, i) => download(url, `tmp/${i}.mp4`))
  ).then(files => {
    res.send(JSON.stringify(files));
  }).catch(err => {
    res.status(500).send(err.message);
  });

  // check the access token
  // fetch the input files
  // write the local paths to a spec for ffmpeg
  // call ffmpeg, writing the output to a public directory
  // return the mpeg URL to the client

});


app.listen(PORT);
console.log(`listening on port ${PORT}`);
