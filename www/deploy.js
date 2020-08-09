/// ./www/deploy.js

if (process.env.NODE_ENV !== 'production') {
    console.log('Using dotenv...');
    require('dotenv').config();
}

var FtpDeploy = require("ftp-deploy");
var ftpDeploy = new FtpDeploy();
 
console.log('Connecting to [%s:%s] as "%s"...', process.env.FTP_HOST, process.env.FTP_PORT, process.env.FTP_USER );

var config = {
    user: process.env.FTP_USER,
    // Password optional, prompted if none given
    password: process.env.FTP_PASSWORD,
    host: process.env.FTP_HOST,
    port: process.env.FTP_PORT,
    localRoot: __dirname + "/dist/",
    remoteRoot: "/",
    include: ["*", "**/*"],      // this would upload everything except dot files
    deleteRemote: true,
    // Passive mode is forced (EPSV command is not sent)
    forcePasv: true
};
 
console.log('Starting deployment...');

ftpDeploy.on("uploaded", function(data) {
    console.log(data); // same data as uploading event
});
ftpDeploy.on("log", function(data) {
    console.log(data); // same data as uploading event
});
ftpDeploy.on("upload-error", function(data) {
    console.log(data.err); // data will also include filename, relativePath, and other goodies
});

ftpDeploy
    .deploy(config)
    .then(res => console.log("finished:", res))
    .catch(err => console.log(err));
    