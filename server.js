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
	res.sendfile(__dirname + '/index.html');
});
app.get('/client.js', function (req, res)
{
	res.sendfile(__dirname + '/client.js');
});
app.get('/game.js', function (req, res)
{
	res.sendfile(__dirname + '/game.js');
});
app.get('/styles.css', function (req, res)
{
	res.sendfile(__dirname + '/styles.css');
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

function generateSid(prefix)//За юзър той е _, а за куршуми e *
{
	return prefix + Math.random().toString(36).substring(2, 8);
}

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
	if(sendFrame == undefined || sendFrame == true)
		data.frame = frame;
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
	
	socket.on("login", function (data)
	{
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
		}
	});

	socket.on("move", function (data)
	{
		if(users[mysid].socket.vars.logged) // Нужно е за да съм сигурен, че cp и mysid съществуват 
		{
			if(data.direction == "up")
				cp.speed += 0.3;
			if(data.direction == "down")
				cp.speed *= 0.8;
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
		if(!cp.dead && (new Date()).getTime() - cp.lastShootTime > 400)//С това подсигурявам, че няма да спамя с булети
		{
			var bsid = generateSid("*"); 
			bullets[bsid] = new classes.Bullet(cp.pos.x, cp.pos.y, cp.rotation, mysid, 20);
			sendToAll("playerShooted", {psid: mysid, bsid: bsid});
			cp.lastShootTime = (new Date()).getTime();
		}
	});

	socket.on("disconnect", function (data)
	{
		if(socket.vars.logged) // Няма смисъл да казвам на всички, че някой е влязъл, ако не се е логнал
			sendToAll("removeUser", {sid: socket.vars.sid }, false);

		removeUser(socket);
	});
});

var simulation = require("./simulation.js"); // последен файл, защото вика функции написани в този