
var sysFs = require('fs');
var sysPath = require('path');
var sysOS = require('os');
var sysCrypto = require('crypto');

var rimraf = require('rimraf');
var mkdirp = require('mkdirp');

var config = {
    srcPath: './src/',
    prdPath: './prd/',
    vmPath: './vm/',
    refsPath: './refs/',
    fileEncoding: 'utf-8',
    validTemplateType: ['.vm', '.html', '.htm'],
    validUpdateType: ['.vm']
};

var fsUtil = {
    getPathList: function(basePath, fileExtList, recursive) {
        var pathList = [];
        this._fillPathList(basePath, pathList, recursive);
        if (!fileExtList) {
            return pathList;
        } else {
            var newPathList = [];
            var extList = fileExtList.map(function(ext, index) {
                return ext.toLowerCase();
            })
            pathList.forEach(function(path) {
                var fileType = sysPath.extname(path).toLowerCase();
                if (extList.indexOf(fileType) !== -1) {
                    newPathList.push(path);
                }
            });
            return newPathList;
        }
    },
    _getPathStat: function(path) {
        var pathStat;
        try {
            pathStat = sysFs.statSync(path);
        } catch (e) {
            pathStat = null;
            console.log('获取路径状态失败:', path, '\n', e)
        }
        return pathStat;
    },
    _fillPathList: function(basePath, fileList, recursive) {
        var self = this;
        var pathStat = self._getPathStat(basePath);
        if (pathStat) {
            if (pathStat.isFile()) {
                fileList.push(basePath);
            } else if (pathStat.isDirectory()) {
                var files = sysFs.readdirSync(basePath);
                files.forEach(function(name) {
                    var nextPath = sysPath.join(basePath, name);
                    pathStat = self._getPathStat(nextPath);
                    if (pathStat) {
                        if (pathStat.isFile()) {
                            fileList.push(nextPath);
                        } else if (pathStat.isDirectory()) {
                            recursive && self._fillPathList(nextPath, fileList, recursive);
                        } else {
                            //noop
                        }
                    }
                })
            } else {
                //noop
            }
        }
    },
    mkdirPSync: function(path) {
        mkdirp.sync(path);
    },
    rmdirRSync: function(path) {
        rimraf.sync(path)
    }
}

var refsGenerator = {
    _generageVersionMapping: function(pathMD5Mapping, refsVerBase) {
        if (!sysFs.existsSync(refsVerBase)) {
            fsUtil.mkdirPSync(refsVerBase);
        }

        var versionMappingLines = pathMD5Mapping.map(function(mapData, index) {
            return mapData.join('#');
        });

        sysFs.writeFileSync(sysPath.join(refsVerBase, 'versions.mapping'), versionMappingLines.join(sysOS.EOL), config.fileEncoding);
    },
    _generageVersionFiles: function(pathMD5Mapping, refsVerBase) {
        pathMD5Mapping.forEach(function(mapData, index) {
            var filePath = mapData[0];
            var verFilePath = sysPath.join(refsVerBase, filePath) + '.ver';
            if (!sysFs.existsSync(verFilePath)) {
                fsUtil.mkdirPSync(sysPath.dirname(verFilePath));
            }
            sysFs.writeFileSync(verFilePath, mapData[1], config.fileEncoding);
        });
    },
    getMD5: function(content) {
        var hashObj, buffer;
        buffer = new Buffer(content);
        hashObj = sysCrypto.createHash('md5');
        hashObj.update(buffer);
        return hashObj.digest('hex');
    },
    computeFilesVersion:function(exportsList){
        var self = this;
        if (!exportsList) {
            throw Error('bad exportsList');
        }

        var pathMD5Mapping = [],
            srcBase = config.srcPath;
        exportsList.forEach(function(filePath, index) {
            var absPath = sysPath.join(srcBase, filePath);
            var content = '',
                contentMD5;
            if (sysFs.existsSync(absPath)) {
                content = sysFs.readFileSync(absPath);
                contentMD5 = self.getMD5(content);
                pathMD5Mapping.push([filePath, contentMD5]);
            } else {
                console.log(absPath, ' does not exists');
            }
        });
        return pathMD5Mapping;
    },
    /**
     * 从生成的prd目录中获取响应的version信息
     * @param exportsList
     * @returns {Array}
     */
    getFilesVersion: function(exportsList) {
        var self = this;
        if (!exportsList) {
            throw Error('bad exportsList');
        }

        var pathMD5Mapping = [],
            prdBase = config.prdPath,
            nameHashPattern = /@(\w+)\./;
        exportsList.forEach(function(filePath, index) {
            var absPath = sysPath.join(prdBase, filePath);
            var dirname = sysPath.dirname(absPath);
            var dirInfo;
            if (sysFs.existsSync(dirname)) {
                dirInfo = sysFs.readdirSync(dirname);
                dirInfo.length !== 0 &&  dirInfo[0].replace(nameHashPattern,function(fullMatch,hash){
                        pathMD5Mapping.push([filePath, hash]);
                        return fullMatch;
                });
            } else {
                console.log(absPath, ' does not exists');
            }
        });
        return pathMD5Mapping;
    },
    _updateVers: function(content, matchRegex, prefix, resourceMD5Dict) {
        return content.replace(matchRegex, function(wholePath, relativePath) {
            //部分用来查找
            var filePath = prefix + relativePath;
            var fileHash = resourceMD5Dict[filePath];

            //整体用来替换
            var extIndex = wholePath.lastIndexOf('.');
            var wholeBaseName = wholePath.substring(0, extIndex)
            var fileExt = wholePath.substring(extIndex);
            if (fileHash !== undefined) {
                return [wholeBaseName, '@', fileHash, fileExt].join('');
            } else {
                return wholePath;
            }
        });
    },
    _updateCssVers: function(content, resourceMD5Dict) {
        var cssRe = /"\${qzzUrl}\${cssPath}([^'">\s]+)"/g;
        content = this._updateVers(content, cssRe, 'styles', resourceMD5Dict);
        return content;
    },
    _updateJsVers: function(content, resourceMD5Dict) {
        var jsRe = /"\${qzzUrl}\${jsPath}([^'">\s]+)"/g;
        content = this._updateVers(content, jsRe, 'scripts', resourceMD5Dict);
        return content;
    },
    _updateQzzVers: function(srcPath, dstPath, resourceMD5Dict) {
        var content = sysFs.readFileSync(srcPath, "utf-8");
        content = this._updateCssVers(content, resourceMD5Dict);
        content = this._updateJsVers(content, resourceMD5Dict);

        !dstPath && (dstPath = srcPath);
        if (!sysFs.existsSync(dstPath)) {
            fsUtil.mkdirPSync(sysPath.dirname(dstPath));
        }
        sysFs.writeFileSync(dstPath, content, "utf-8");
    },
    generateVersionFiles:function(pathMD5Mapping){
        var refsVerPath = sysPath.join(config.refsPath, 'ver');
        this._generageVersionMapping(pathMD5Mapping, refsVerPath);
        this._generageVersionFiles(pathMD5Mapping, refsVerPath);
    },
    generateVmFiles: function(resourceMD5Dict) {
        var validFileList = fsUtil.getPathList(config.vmPath, config.validTemplateType, true);
        var refsVmBase = config.refsPath;
        var self = this;
        var validUpdateType = config.validUpdateType.map(function(item) {
            return item.toLowerCase();
        });
        validFileList.forEach(function(filePath, index) {
            var fileExt = sysPath.extname(filePath).toLowerCase();
            if (validUpdateType.indexOf(fileExt) !== -1) {
                self._updateQzzVers(filePath, sysPath.join(refsVmBase, filePath), resourceMD5Dict)
            }
        });
        console.log('共处理文件: ', validFileList.length, ' 个');
    },

    generateRefs: function(exportsList) {
        if (sysFs.existsSync(config.refsPath)) {
            fsUtil.rmdirRSync(config.refsPath);
        }
        var pathMD5Mapping = this.getFilesVersion(exportsList);
        this.generateVersionFiles(pathMD5Mapping);

        var resourceMD5Dict = {};
        pathMD5Mapping.forEach(function(mapData) {
            resourceMD5Dict[mapData[0]] = mapData[1];
        });
        this.generateVmFiles(resourceMD5Dict);
    }
}

module.exports = function(exportsList) {
    if (!exportsList) {
        return;
    }

    var validExports = [];
    exportsList.forEach(function(item) {
        "use strict";
        if (typeof item === 'object') {
            if (!item.no_version && item.path) {
                validExports.push(item.path);
            }
        } else {
            validExports.push(item)
        }
    });

    refsGenerator.generateRefs(validExports)
};