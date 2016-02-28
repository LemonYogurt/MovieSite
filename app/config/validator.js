/**
 * 定义两个中间件：
 * 第一个：验证用户是否登录过，如果未登录，则定位到登录页面
 * 第二个：验证用户是否有权限，如果权限不够，则定位到登录页面
 */
exports.signinRequired = function (req, res, next) {
	var user = req.session.user;
	if (!user) {
		return res.redirect('/user/signin');
	}
	next();
};


exports.adminRequired = function (req, res, next) {
	var user = req.session.user;
	if (user.role < 10) {
		return res.redirect('/user/signin');
	}
	next();
};