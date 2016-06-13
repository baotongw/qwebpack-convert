var filesys = require('fs'),
	pathsys = require('path');

var root = process.cwd(),
	fekitModule = 'fekit_modules';

function resolveModule(modulePath) {
	var configPath = pathsys.resolve(modulePath, 'fekit.config'),
		packageJsonPath = pathsys.resolve(modulePath, 'package.json');

	var moduleName = pathsys.basename(modulePath);

	filesys.readFile(configPath, function(err, fekitConfig) {
		var packageJson;

		// 部分fekit组件不存在fekit.config文件
		if (err) {
			packageJson = {
				name: moduleName,
				main: 'src/index.js',
				version: 'no version',
				author: 'Qunar team'
			}
		} else {
			packageJson = JSON.parse(fekitConfig);
			packageJson.main = packageJson.main || 'src/index.js';
		}

		filesys.writeFile(packageJsonPath, JSON.stringify(packageJson), function(err) {
			if (err) throw err;

			console.log('package.json was added to the ' + pathsys.basename(modulePath) || modulePath);
		});
	});
}

function handleDir(projectPath, isInnerProject) {
	var modulePath,
		stat,
		modules,
		fekitModulesPath;

	fekitModulesPath = isInnerProject ? projectPath : pathsys.join(projectPath, fekitModule);

	if (filesys.existsSync(fekitModulesPath)) {
		modules = filesys.readdirSync(fekitModulesPath);

		console.log('modules list: ');
		console.log(modules);

		for (var j = 0; j < modules.length; j++) {
			modulePath = pathsys.join(fekitModulesPath, modules[j]);
			stat = filesys.statSync(modulePath);

			if (stat.isDirectory()) {
				resolveModule(modulePath);
				// 递归检查所有子fekit_modules文件夹
				if (filesys.existsSync(pathsys.join(modulePath, fekitModule))) {
					handleDir(modulePath);
				}
			}
		}
	}
}

function transform() {
	var projects = filesys.readdirSync(root),
		projectPath,
		stat;

	for (var i = 0; i < projects.length; i++) {
		projectPath = pathsys.join(root, projects[i]);

		if (projects[i] === fekitModule) {
			handleDir(projectPath, true);
		}

		projectPath = pathsys.join(root, projects[i]);

		stat = filesys.statSync(projectPath);

		if (stat.isDirectory()) {
			console.log('check path: ' + projects[i]);

			handleDir(projectPath);
		}
	}
}

transform();