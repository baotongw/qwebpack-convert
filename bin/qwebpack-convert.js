#!/usr/bin/env node

var filesys = require('fs'),
	pathsys = require('path'),
	readFekitConfig = require('./../tools/readFekitConfig.js'),
	fekitModuleConvert = require('./../tools/fekit-module-convert.js');

console.log('');
console.log('##########  Webpack Convert Start ##########')

var projectRoot = process.cwd(),
	moduleRoot = pathsys.dirname(process.argv[1]);

moduleRoot = pathsys.dirname(moduleRoot);

console.log('');
console.log('##########  Step1 转换fekit_modules包到标准包 ##########')
fekitModuleConvert(projectRoot);

console.log('');
console.log('##########  Step2 复制webpack文件到工程中 ##########')

var tmpls = [{
	source: './templates/package.json',
	dest: './package.json'
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

console.log('')
console.log('##########  Step3 移植fekit.config中的exports和alias ##########')

var fekitPath = pathsys.resolve(projectRoot, 'fekit.config'),
	webpackConfigPath = pathsys.resolve(moduleRoot, './templates/webpack.config.js'),
	destPath = pathsys.resolve(projectRoot, './webpack.config.js');

var fekitConfig = readFekitConfig(fekitPath),
	exports, alias;

if(!fekitConfig) {
	throw new Error('当前目录下未发现fekit.config文件，请确认后再次执行');
}

exports = fekitConfig.json.export;
alias = fekitConfig.json.alias;

//fekit alias中 以/开头的路径，在webpack中会被当做绝对路径 导致模块解析错误
Object.keys(alias).forEach(function(item,index){
	alias[item] = alias[item].replace(/^(\/|\\)+/,'')
});


var template = filesys.readFileSync(webpackConfigPath, {
	encoding: 'utf-8'
});

var output = template.replace(/\{exports\}/, JSON.stringify(exports, null, '\t'))
	.replace(/\{alias\}/, JSON.stringify(alias, null, '\t\t\t'));

filesys.writeFileSync(destPath, output);
console.log('webpack.config.js已生成');

console.log('')
console.log('########## webpack初始化已完成 ##########')