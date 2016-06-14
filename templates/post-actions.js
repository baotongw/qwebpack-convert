/**
 * --------------------------------------------------------------------------- *
 *
 * @Project: package_mobile
 * @FileName: postActions.js
 * @Dependence: --
 * @Description: --
 * @CreatedBy: liao.zhang
 * @CreateDate: 2016/5/13 19:48
 * @LastModifiedBy: liao.zhang
 * @LastModifiedDate: 2016/5/13 19:48
 *
 * --------------------------------------------------------------------------- *
 */

"use strict";

var refsGenerator = require('./generate-refs.js');
var webpackConfig = require('../webpack.config.js');
refsGenerator(webpackConfig.originExports);