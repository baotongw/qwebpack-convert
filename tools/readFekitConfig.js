var filesys = require('fs'),
	pathsys = require('path');

var patterns = {
	singleLineComment: /(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/g,
	multiLineComment: /(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/g
}

function readFekitConfig(path) {
	var content,
		json = {};

	try {
		content = filesys.readFileSync(path, {
			encoding: 'utf-8'
		});

		content = content.replace(patterns.singleLineComment, '').replace(patterns.multiLineComment);
		json = JSON.parse(content);

	} catch (error) {}

	return {
		content: content,
		json: json
	}
}

module.exports = readFekitConfig;