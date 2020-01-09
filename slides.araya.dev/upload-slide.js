const path = require('path');
const {spawn} = require('child_process');

const cwd = process.cwd()
const dist = path.resolve(cwd, 'dist');
const arr = cwd.split('/');
const dirName = arr[arr.length - 1];
spawn('rsync', ['--delete', '-r', '-e', '"ssh -i ~/.ssh/araya.dev.pem"', `${dist}/`, `ubuntu@52.69.164.172:/var/www/araya.dev/slides.araya.dev/${dirName}/`], {shell: true, stdio: 'inherit'})
