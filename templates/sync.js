/**
 * 同步工程目录到开发机
 */

"use strict";

var childProcess = require('child_process');
var utils = require('util');

var sysPath = require('path');
var sysFs = require('fs');

var commandExec = function(cmd, config, callback) {
    childProcess.exec(cmd, config, function(err, stdout, stderr) {
        if (err) {
            throw err;
        }

        if (stdout) {
            console.log(stdout)
        }

        if (stderr) {
            console.log(stderr)
        }

        if (utils.isFunction(callback)) {
            callback();
        }

    })
};

var homeDir = process.cwd();
console.log(homeDir)
var configPath = sysPath.join(homeDir, '.dev');
var configInfo = {},
    devInfo;
if (sysFs.existsSync(configPath)) {
    try {
        configInfo = JSON.parse(sysFs.readFileSync(configPath, 'utf-8'))
    } catch (e) {

    }
}

if (!configInfo.dev) {
    console.log('请配置.dev信息')
    return;
} else {
    devInfo = configInfo.dev
}

var rsyncEls = ["rsync -rzcv --chmod=a='rX,u+w' --rsync-path='sudo rsync' --exclude=.svn --exclude=.git --temp-dir=/tmp ./ ",
    devInfo.host,
    ":",
    devInfo.path
];

var sshEls = ["ssh ",
    devInfo.host,
    " 'sudo /home/q/tools/bin/fekit_common_shell.sh \"",
    devInfo.path,
    "\"'"
];

commandExec(rsyncEls.join(''), {
    maxBuffer: 200 * 1024 * 1024
}, function() {
    commandExec(sshEls.join(''));
})