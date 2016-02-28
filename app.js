var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var favicon = require('serve-favicon');
var mongoose = require('mongoose');
var _ = require('underscore');
var moment = require('moment');
var logger = require('morgan');
var multipart = require('connect-multiparty');
var MongoStore = require("connect-mongo")(expressSession);

/**
 * 导入路由
 */
var index = require('./app/routes/index');
var user = require('./app/routes/user');
var adminUser = require('./app/routes/adminUser');
var adminMovie = require('./app/routes/adminMovie');
var adminCategory = require('./app/routes/adminCategory');

/**
 * 导入配置文件，连接mongodb
 */
var config = require('./app/config/config');
var dbUrl = 'mongodb://' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.db;
mongoose.connect(dbUrl);

var app = express();
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
	console.info('服务器在', PORT, '端口监听成功!!!');
});

app.set('views', './app/views/pages');
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(multipart());
app.use(cookieParser());
app.use(expressSession({
	secret: 'MovieSite',
	resave: false,
	saveUninitialized: true,
	store: new MongoStore({
		url: dbUrl,
		collection: 'sessions'
	})
}));
app.use(logger('dev'));
app.use(function (req, res, next) {
	var _user = req.session.user;
	app.locals.user = _user;
	next();
});

/**
 * 设置路由：
 */
app.use('/', index);
app.use('/user', user);
app.use('/admin/user', adminUser);
app.use('/admin/movie', adminMovie);
app.use('/admin/category', adminCategory);

if ('development' === app.get('env')) {
	app.set('showStackError', true);
	/**
	 * 设置jade模板渲染格式化
	 * @type {boolean}
	 */
	app.locals.pretty = true;
	mongoose.set('debug', true);
}

app.locals.moment = moment;

