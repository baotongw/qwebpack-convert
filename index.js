var filesys = require('fs'),
	pathsys = require('path'),
	childProcess = require('child_process');

console.log('##########  Webpack Convert Start ##########')

var root = process.cwd(),
	moduleRoot = pathsys.dirname(process.argv[1]);
console.log('Current path: ' + root);
console.log('Global path: ' + moduleRoot);

// do fekit module transfer
var command = 'node ./tools/fekit-module-convert.js';

console.log('##########  Step1 convert fekit modules ##########')
try{
	childProcess.exec(command, {
		cwd: root
	}, function(error, stdout, stderr) {
		if (error) {
			console.log('Step 1: convert fekit module failed')
			return
		}

		console.log('Step 1: convert fekit module success');
	});
} catch (e) {
	console.log('Step 1: convert fekit module failed')
}

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
	source: './templates/post-action.js',
	dest: './build/post-action.js'
}, {
	source: './templates/sync.js',
	dest: './build/sync.js'
}]

// copy package.json, webpack.config.js, pack, sync scripts to the project root folder
var buildPath = pathsys.resolve(root, './build');

console.log(buildPath);
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
		dest = pathsys.resolve(root, item.source),
		content;

	if (source == dest) {
		return
	}

	content = filesys.readFileSync(source)
	if (content) {
		filesys.writeFile(dest, content, function(err) {
			if (err) {
				consle.log('write file failed : ' + dest);
			} else {
				console.log('created file : ' + dest);
			}
		});
	}
});