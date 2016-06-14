#!/usr/bin/env node

var filesys = require('fs'),
	pathsys = require('path'),
	fekitModuleConvert = require('./../tools/fekit-module-convert.js');

console.log('##########  Webpack Convert Start ##########')
console.log('');
var projectRoot = process.cwd(),
	moduleRoot = pathsys.dirname(process.argv[1]);

moduleRoot = pathsys.dirname(moduleRoot);

// do fekit module transfer
var command = 'node ./tools/fekit-module-convert.js';

console.log('');
console.log('##########  Step1 convert fekit modules ##########')
fekitModuleConvert(projectRoot);

console.log('');
console.log('##########  Step2 copy wepback files ##########')

var tmpls = [{
	source: './templates/package.json',
	dest: './package.json'
}, {
	source: './templates/webpack.config.js',
	dest: './webpack.config.js'
}, {
	source: './templates/generate-refs.js',
	dest: './build/generate-refs.js'
}, {
	source: './templates/post-actions.js',
	dest: './build/post-actions.js'
}, {
	source: './templates/sync.js',
	dest: './build/sync.js'
}]

// copy package.json, webpack.config.js, pack, sync scripts to the project projectRoot folder
var buildPath = pathsys.resolve(projectRoot, './build');

try {
	var dirStat = filesys.statSync(buildPath);
	if (!dirStat.isDirectory()) {
		filesys.mkdir(buildPath);
	}
} catch (e) {
	filesys.mkdir(buildPath);
}

tmpls.forEach(function(item, index) {
	var source = pathsys.resolve(moduleRoot, item.source),
		dest = pathsys.resolve(projectRoot, item.dest),
		content;

	if (source == dest) {
		return
	}

	content = filesys.readFileSync(source)
	if (content) {
		try {
			filesys.writeFileSync(dest, content);
			console.log('created file : ' + dest);
		} catch(error) {
			consle.log('write file failed : ' + dest);
			console.log(error)			
		}
	}
});