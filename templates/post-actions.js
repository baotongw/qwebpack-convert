/**
 * 生成refs目录中的版本信息
 */

"use strict";

var refsGenerator = require('./generate-refs.js');
var webpackConfig = require('../webpack.config.js');
refsGenerator(webpackConfig.originExports);