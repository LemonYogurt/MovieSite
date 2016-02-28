var mongoose = require('mongoose');
var UserSchema = require('../schemas/user');

/**
 * 创建模型
 * 调用mongoose的model方法，第一个参数是模型的名字，第二个参数是模式
 */
var User = mongoose.model('User', UserSchema);
module.exports = User;