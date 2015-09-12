var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , fs = require('fs')//File System
  , classes = require('./classes.js');

io.set('log level', 1);// За да няма постоянни debug съобщения
var port = Number(process.env.PORT || 5000);//  Определя порта, защото за heroku примерно той може да не е 5000
server.listen(port);

app.get('/', function (req, res)
{
	res.sendfile(__dirname + '/userFiles/index.html');
});

var userFiles = ['client.js', 'game.js', 'style.css', 'simulation.js'];
userFiles.map(function(file)
{
	app.get('/userFiles/' + file, function (req, res)
	{
		res.sendFile(__dirname + '/userFiles/' + file);
	});
});

//Записвам го така за да може да се достигат тези променливи от други файлове
global.users = {};// мап с всички плеъри и сокети
global.walls = {};// масив с стените
global.bullets = {};// мап с куршумите
global.frame = 0;

var users = global.users;
var walls = global.walls;
var bullets = global.bullets; 
var frame = global.frame;

function generateSid(prefix)//За юзър той е _, а за куршуми e *, за стена е +
{
	return prefix + Math.random().toString(36).substring(2, 8);
}
global.generateSid = generateSid;

function addUser(socket, name)// Записва човека в масива с потребители
{
	var sid = generateSid("_");
	socket.vars.logged = true;
	socket.vars.sid = sid;

	users[sid] = {};
	users[sid].socket = socket;
	users[sid].player = new classes.Player( new classes.Vector(400, 300), name );

	return sid;
}

function removeUser(socket)
{
	delete users[socket.vars.sid];
}

function sendToAll(type, data, sendFrame)// функция която изпраща информация на всички вече логналите се
{
	for(var i in users)
		users[i].socket.emit(type, data);
}

global.sendToAll = sendToAll;

io.sockets.on("connection", function (socket) //Почти цялата документация с клиентите
{
	/*
	users = {}
		* .player = new Player()
		* .socket = socket ------------^ Референция към този сокет
		* .account = 
	*/

	socket.vars = {};
	socket.vars.logged = false;
	var cp, mysid;

	socket.emit("enterUsername", {});
	
	socket.on("login", function (data)
	{
		if(data == undefined || data.name == undefined || data.name.length > 12 || data.name == "")
		{
			socket.emit("enterUsername", {});
			return;
		}

		for(var i in users)
		{
			if(users[i].player.name == data.name)
			{
				socket.emit("enterUsername", {});
				return;
			}
		}

		if(!socket.vars.logged) // Ако изпрати няколко логин-а, го слагам само първия път
		{
			mysid = addUser(socket, data.name);
			cp = users[ mysid ].player; // currentPlayer - референция към users[mysid].player

			console.log("User logged! Name: " + data.name + " with sid: " + mysid);
			
			sendToAll("initNewPlayer", {sid: mysid, player: cp}, false); // пращам на всички (и на мен) информацията за играча, без .socket

			//пращам на новия всички останали, но без него самия защото той вече се има
			for(var i in users)
			{
				if(i != mysid)
					socket.emit("initNewPlayer", {sid: i, player: users[i].player}, false);
			}

			for (var i in walls)
				socket.emit("initNewWall", { sid: i, wall: walls[i] }); // може да се замести с users[mysid].socket.emit("init..., но няма смисъл

			for (var i in bullets)
				socket.emit("initNewBullet", {bsid: i, pos: bullets[i].pos, rotation: bullets[i].rotation, psid: bullets[i].shooter });

			//казвам му кой по-точно е той съмия
			socket.emit("joinGame", {sid: mysid });
			sendToAll("addMessage", {message: ("Player " + data.name + " joined.") });
		}
	});

	socket.on("move", function (data)
	{
		if(mysid != undefined) // Нужно е за да съм сигурен, че cp и mysid съществуват 
		{
			if(data.direction == "up" && (new Date()).getTime() - cp.lastEvent.move > 50)
			{
				cp.lastEvent.move = (new Date()).getTime();
				cp.speed += 0.6;
			}

			if(data.direction == "down")
			{
				cp.speed *= 0.8;
			}

			if(data.direction == "left")
			{
				cp.rotation -= 0.2;
				sendToAll("updatePlayerInformation", {sid: mysid, rotation: cp.rotation});
			}
			if(data.direction == "right")
			{
				cp.rotation += 0.2;
				sendToAll("updatePlayerInformation", {sid: mysid, rotation: cp.rotation});
			}
		}
	});

	socket.on("shoot", function (data)
	{
		if(!cp.dead && (new Date()).getTime() - cp.lastEvent.shoot > 120)//С това подсигурявам, че няма да спамя с булети
		{
			var bsid = generateSid("*"); 
			bullets[bsid] = new classes.Bullet(cp.pos.x, cp.pos.y, cp.rotation, mysid, 20);
			sendToAll("playerShooted", {psid: mysid, bsid: bsid});
			cp.lastEvent.shoot = (new Date()).getTime();
		}
	});

	socket.on("disconnect", function (data)
	{
		if(socket.vars.logged) // Няма смисъл да казвам на всички, че някой е влязъл, ако не се е логнал
		{
			sendToAll("addMessage", {message: ("Player " + cp.name + " disconnected.") });
			sendToAll("removeUser", {sid: socket.vars.sid }, false);
		}

		removeUser(socket);
	});
});

var simulation = require("./simulation.js"); // последен файл, защото вика функции написани в този
