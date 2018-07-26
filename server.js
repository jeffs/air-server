'use strict';

const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const http = require('http');
const https = require('https');
const childProcess = require('child_process');

const PORT = 3000;
const TOKEN = '42';
const PUBLIC = 'public';
const OUT = 'out';
const TMP = 'tmp';
const PREFIX = `http://localhost:${PORT}`;

const parseProtocol = (url) => {
  if (url.startsWith('http://')) {
    return http;
  } else if (url.startsWith('https://')) {
    return https;
  } else {
    throw new Error(`unsupported protocol for URL: ${url}`);
  }
};

const download = (url, dest) => new Promise((resolve, reject) => {
  const protocol = parseProtocol(url);
  const file = fs.createWriteStream(dest);
  protocol.get(url, response => {
    response.pipe(file);
    file.on('finish', () => {
      resolve(dest);
    });
  }).on('error', err => {
    fs.unlink(dest, () => { });
    reject(new Error(`failed to get ${url}`));
  });
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(PUBLIC));

const parseParams = (req) => new Promise((resolve, reject) => {
  if (!req.body.token) {
    reject(new Error('missing access token'));
    return;
  }
  if (!Array.isArray(req.body.url)) {
    reject(new Error('need at least two files to concatenate'));
    return;
  }
  resolve({
    token: req.body.token,
    urls: req.body.url,
  });
});

const checkAccessToken = (token) => new Promise((resolve, reject) => {
  if (token !== TOKEN) {
    reject(new Error('bad access token'));
    return;
  }
  resolve();
});

const fetchMP4Files = (urls) => Promise.all(
  urls.map((url, i) => download(url, `${TMP}/${i}.mp4`))
);

const writeFileList = (files) => new Promise((resolve, reject) => {
  const list = `${TMP}/inputs.txt`;
  const data = files.map(file => `file '../${file}'\n`).join('');
  fs.writeFile(list, data, err => {
    if (err) {
      reject(err);
      return;
    }
    resolve(list);
  });
});

const exec = (command) => new Promise((resolve, reject) => {
  childProcess.exec(command, err => {
    if (err) {
      reject(err);
      return;
    }
    resolve();
  })
});

const concatMP4Files = (files) => new Promise((resolve, reject) => {
  const output = `${OUT}/output.mp4`;
  writeFileList(files).then(async list => {
    const command =
      `ffmpeg -f concat -safe 0 -y -i ${list} -c copy ${PUBLIC}/${output}`;
    exec(command)
      .then(() => resolve(output))
      .catch(err => reject(err));
  }).catch(err => reject(err));
});

app.post('/', (req, res) => {
  parseParams(req)
    .then(({ token, urls }) => checkAccessToken(token).then(() => urls))
    .then(fetchMP4Files)
    .then(concatMP4Files)
    .then(output => res.send(`${PREFIX}/${output}\n`))
    .catch(err => res.status(400).send(err.message));
});

app.listen(PORT);
console.log(`listening on port ${PORT}`);
