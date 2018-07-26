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

const parseParams = (req) => new Promise((resolve, reject) => {
  if (!req.body.token) {
    reject(new Error('missing access token'));
  } else if (!Array.isArray(req.body.url)) {
    reject(new Error('need at least two files to concatenate'));
  } else {
    resolve({
      token: req.body.token,
      urls: req.body.url,
    });
  }
});

const checkAccessToken = async (token) => new Promise((resolve, reject) => {
  if (token === '42') {
    resolve();
  } else {
    reject(new Error('bad access token'));
  }
});

const fetchInputFiles = (urls) => Promise.all(
  urls.map((url, i) => download(url, `tmp/${i}.mp4`))
);

app.post('/', (req, res) => {
  parseParams(req)
    .then(({ token, urls }) => checkAccessToken(token).then(() => urls))
    .then(fetchInputFiles)
    .then(files => {
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
