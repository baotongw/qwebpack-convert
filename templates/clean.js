/**
 * 清除上一次生成的信息
 */

"use strict";

var rimraf = require('rimraf');

rimraf.sync('./prd');
rimraf.sync('./refs');