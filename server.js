var app = require('express')()
  , server = require('http').createServer(app)
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({server: server})
  , fs = require('fs')
  , classes = require('./classes.js')
  , cm = require('./connectionManager.js');

var port = Number(process.env.PORT || 5000);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });

app.get('/', function (req, res)
{
	res.sendfile(__dirname + '/userFiles/index.html');
});

var userFiles = ['client.js', 'game.js', 'styles.css', 'simulation.js'];
userFiles.map(function (file)
{
	app.get('/userFiles/' + file, function (req, res)
	{
		res.sendfile(__dirname + '/userFiles/' + file);
	});
});

global.users = {};
global.walls = {};
global.bullets = {};
global.frame = 0;

var users = global.users;
var walls = global.walls;
var bullets = global.bullets;
var frame = global.frame;

var nextID = 0;
function generateID()
{
	return nextID ++;
}
global.generateID = generateID;


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

wss.on('connection', function (socket)
{
	var cu = {}; // current user

	var authRequest = new Uint8Array(1);
	socket.send(authRequest.buffer);

	socket.on('message', function(rawData, flags)
	{
		var data = new Uint8Array(rawData);
		if(data[0] == 0)
		{
			if(typeof cu.name === "string")
				return; // This user already has a name

			if(data.length > 12+1 || data.length <= 1) // Invalid name
			{
				var authRequest = new Uint8Array(1);
				socket.send(authRequest.buffer);
				return;
			}

			var name = "";
			for(var i = 0;i < data.length-1;++ i)
				name += String.fromCharCode(data[i+1]);

			// Check if there's already a user with than name
			for(var i in global.users)
			{
				if(global.users[i].name == name)
				{
					var authRequest = new Uint8Array(1);
					socket.send(authRequest.buffer);
					return;
				}
			}

			cu = new classes.User(socket, name, generateID());
			users[cu.sid] = cu;
			socket.ownerID = cu.id;

			cm.broadcastNewUser(cu);
			cm.sendMap(cu);
			cm.initGame(cu);
		}
	});
	socket.on('close', function (rawData, flags)
	{
		if(typeof socket.ownerID !== "undefined")
			delete users[socket.ownerID];
	});
// 		sendToAll("addMessage", {message: ("Player " + data.name + " joined.") });
// 		}
// 	});
//
//
// 	socket.on("move", function (data)
// 	{
// 		if(mysid != undefined) // Нужно е за да съм сигурен, че cp и mysid съществуват
// 		{
// 			if(data.direction == "up" && (new Date()).getTime() - cp.lastEvent.move > 50)
// 			{
// 				cp.lastEvent.move = (new Date()).getTime();
// 				cp.speed += 0.6;
// 			}
//
// 			if(data.direction == "down")
// 			{
// 				cp.speed *= 0.8;
// 			}
//
// 			if(data.direction == "left")
// 			{
// 				cp.rotation -= 0.2;
// 				sendToAll("updatePlayerInformation", {sid: mysid, rotation: cp.rotation});
// 			}
// 			if(data.direction == "right")
// 			{
// 				cp.rotation += 0.2;
// 				sendToAll("updatePlayerInformation", {sid: mysid, rotation: cp.rotation});
// 			}
// 		}
// 	});
//
// 	socket.on("shoot", function (data)
// 	{
// 		if(!cp.dead && (new Date()).getTime() - cp.lastEvent.shoot > 120)//С това подсигурявам, че няма да спамя с булети
// 		{
// 			var bsid = generateSid("*"); 
// 			bullets[bsid] = new classes.Bullet(cp.pos.x, cp.pos.y, cp.rotation, mysid, 20);
// 			sendToAll("playerShooted", {psid: mysid, bsid: bsid});
// 			cp.lastEvent.shoot = (new Date()).getTime();
// 		}
// 	});
//
// 	socket.on("disconnect", function (data)
// 	{
// 		if(socket.vars.logged) // Няма смисъл да казвам на всички, че някой е влязъл, ако не се е логнал
// 		{
// 			sendToAll("addMessage", {message: ("Player " + cp.name + " disconnected.") });
// 			sendToAll("removeUser", {sid: socket.vars.sid }, false);
// 		}
//
// 		removeUser(socket);
// 	});
});


var simulation = require("./simulation.js"); // последен файл, защото вика функции написани в този
