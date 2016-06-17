var filesys = require('fs'),
	pathsys = require('path'),
	readFekitConfig = require('./readFekitConfig.js');

var fekitModule = 'fekit_modules';

var level = 0;

function resolveModule(modulePath) {
	var configPath = pathsys.resolve(modulePath, 'fekit.config'),
		packageJsonPath = pathsys.resolve(modulePath, 'package.json');

	var moduleName = pathsys.basename(modulePath);

	var fekitConfig = readFekitConfig(configPath),
		output = {};

	if (fekitConfig) {
		output.main = fekitConfig.json.main || 'src/index.js';
	} else {
		output = {
			name: moduleName,
			main: 'src/index.js',
			version: 'no version',
			author: 'Qunar team'
		}
	}

	filesys.writeFileSync(packageJsonPath, JSON.stringify(output, null, '\t'));
}

function handleDir(projectPath, isSubModule) {
	var modulePath,
		stat,
		modules,
		fekitModulesPath,
		padding = [];
	
	for(var i = 0; i < level; i++) padding.push('  ');

	fekitModulesPath = isSubModule ? pathsys.join(projectPath, fekitModule) : projectPath;

	if (filesys.existsSync(fekitModulesPath)) {
		modules = filesys.readdirSync(fekitModulesPath);

		for (var j = 0; j < modules.length; j++) {
			console.log(padding.join('') + '--' + modules[j]);

			modulePath = pathsys.join(fekitModulesPath, modules[j]);
			stat = filesys.statSync(modulePath);

			if (stat.isDirectory()) {
				resolveModule(modulePath);
				// 递归检查所有子fekit_modules文件夹
				if (filesys.existsSync(pathsys.join(modulePath, fekitModule))) {
					level++;
					handleDir(modulePath, true);
					level--;
				}
			}
		}
	}
}

function transform(root) {
	var projects = filesys.readdirSync(root),
		projectPath,
		stat;

	for (var i = 0; i < projects.length; i++) {
		projectPath = pathsys.join(root, projects[i]);

		if (projects[i] === fekitModule) {
			console.log('------ Resolved Fekit Modules List ------');
			handleDir(projectPath);
		}
	}
}

module.exports = transform;