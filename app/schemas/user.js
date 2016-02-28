/**
 * 用户的数据模型
 * @type {*|exports|module.exports}
 */

var mongoose = require('mongoose');
/**
 * 这个库是专门为密码存储设计的算法
 * 主要是用它生成一个随机的盐，然后将密码和这个盐混合进来加密，就拿到最终要存储的密码
 */
var bcrypt = require('bcryptjs');

var SALT_WORK_FACTOR = 10;

/**
 * 用户名
 * 密码
 * 头像
 * 元信息
 * 角色
 */
var UserSchema = new mongoose.Schema({
	name: {
		// 表示是唯一的
		unique: true,
		type: String
	},
	password: {
		unique: true,
		type: String
	},
	avatar: {
		unique: true,
		type: String
	},
	meta: {
		createAt: {
			type: Date,
			default: Date.now()
		},
		updateAt: {
			type: Date,
			default: Date.now()
		}
	},
	/**
	 * 根据不同的用户分配不同的角色,用String类型并不方便
	 * 默认注册的用户都是0
	 * 0：normal user
	 * 1：verified user
	 * 2：professional user
	 * > 10：admin
	 * >50 ：super admin
	 */
	role: {
		type: Number,
		default: 0
	}
});

/**
 * 在存储数据之前，调用该方法
 */
UserSchema.pre('save', function (next) {
	var user = this;

	/**
	 * 如果数据是新添加的，更新时间和创建时间是相同的
	 * 如果数据是更新的，则把更新时间设置成当前时间
	 */
	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now();
	} else {
		this.meta.updateAt = Date.now();
	}

	/**
	 * 生成一个随机的盐
	 * 两个参数：
	 * ①：计算强度
	 * ②：回调函数，在回调函数中能够拿到生成的盐
	 */
	bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
		if (err) {
			return next(err);
		}

		bcrypt.hash(user.password, salt, function (err, hash) {
			if (err) {
				return next(err);
			}

			user.password = hash;
			// 将请求传递下去
			next();
		});
	});
});

/**
 * Schema创建实例方法
 */

UserSchema.methods = {
	comparePassword: function (_password, callback) {
		bcrypt.compare(_password, this.password, function (err, isMatch) {
			if (err) {
				return callback(err);
			} else {
				callback(null, isMatch);
			}
		});
	}
};


/**
 * Schema 创建静态方法
 */
UserSchema.statics = {
	fetch: function (cb) {
		return this.find({}).sort('meta.updateAt').exec(cb);
	},
	findById: function (id, cb) {
		return this.findOne({_id: id}).exec(cb);
	}
};

module.exports = UserSchema;