/*
 * @Description: 
 * @Author: ZhangChuan
 * @Date: 2020-07-01 16:40:34
 * @LastEditors: ZhangChuan
 * @LastEditTime: 2020-07-01 17:19:45
 */ 

'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const fstream = require('fstream');
const tar = require('tar');
var zipdir = require('zip-dir');
var chalk = require('chalk');
console.log(__dirname,'__dirname')
const processPath = path.resolve(__dirname, 'process.json');
// const buildPath = path.resolve(__dirname, '../package');

const entry = path.resolve(__dirname, 'build/') //tar zip输入文件夹
const output = path.resolve(__dirname, '../dist/') //tar zip 输出文件夹
const version =  '2.0.19.17'; //获取版本号
const fileName= "Authority"

// const content = fs.readFileSync(path.resolve(__dirname, '../package.json'));
// let packageJson = JSON.parse(content);
// delete packageJson.devDependencies;
// delete packageJson.betterScripts;
// delete packageJson.repository;
// packageJson.engines.node = '>=7.6';
// packageJson.main = 'server.js';
// packageJson.scripts = {
//   start: 'better-npm-run start'
// };
// packageJson.betterScripts = {
//   start: {
//     command: 'nohup node ./server/app.js &',
//     env: {
//       'NODE_ENV': 'production'
//     }
//   }
// };

// fs.createReadStream(processPath).pipe(fs.createWriteStream(__dirname + '/process.json'));
// fs.writeFileSync(path.resolve(__dirname, 'package/package.json'), JSON.stringify(packageJson, null, 2));
console.log(entry,'entry')
fstream.Reader({
    'path': entry,
    'type': 'Directory'
  })
  .pipe( new tar.Pack({
    noRepository: true,
    fromBase: true
  }))
  //.pipe(zlib.Gzip())
  .pipe(fstream.Writer({
    'path': `${output}/SWP-${fileName}-${version}-PRO.tar`
  }));
console.log(chalk.cyan('tar Build complete.\n'))

zipdir(entry, {
  saveTo: `${output}/H5_${fileName}_${version}.zip`
}, function (err, buffer) {
  if (err) console.log(err)
  //if (buffer) console.log(buffer)
});
console.log(chalk.cyan('Zip Build complete.\n'))