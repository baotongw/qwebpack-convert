/**
 * --------------------------------------------------------------------------- *
 *
 * @Project: qwebpack-convert
 * @FileName: clean.js
 * @Dependence: --
 * @Description: --
 * @CreatedBy: liao.zhang
 * @CreateDate: 2016/6/23 14:21
 * @LastModifiedBy: liao.zhang
 * @LastModifiedDate: 2016/6/23 14:21
 *
 * --------------------------------------------------------------------------- *
 * 清除上一次生成的信息
 */

"use strict";

var rimraf = require('rimraf');

rimraf.sync('./prd');
rimraf.sync('./refs');