var app = require('express')()
  , server = require('http').createServer(app)
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({server: server});

global.classes = require('./classes.js');
global.cm = require('./connectionManager.js')
global.pm = require('./packetManager.js');

var cm = global.cm;
var pm = global.pm;
var classes = global.classes;

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

var MAX_BUFF_SIZE = [1+12, 0, 5];

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

wss.on('connection', function (socket)
{
	var cu; // current user

	var authRequest = new Uint8Array([1]);
	socket.send(authRequest.buffer);

	socket.on('message', function(rawData, flags)
	{
/*
 * 'rawData' is of type 'Buffer', but we need the standart javascript ArrayBuffer.
 * The conversion is expensive to the CPU, so it would be pretty easy to hog the whole server by sending a huge packet.
 * This is what this 'if' is for, pun not intended.
 */
		if(rawData.length > MAX_BUFF_SIZE[rawData[0]] + 1)
			return;

		var data_b = new ArrayBuffer(rawData.length);
		var data = new DataView(data_b);
		for(var i = 0;i < rawData.length;++ i)
			data.setUint8(i, rawData[i]);

		if(data.getUint8(0) == 0)
		{
			if(typeof(cu) != 'undefined' && typeof(cu.name) == 'string')
				return; // This user already has a name

			if(data.byteLength > 12 || data.byteLength <= 0) // Invalid name
			{
				var authRequest = new Uint8Array([1]);
				socket.send(authRequest.buffer);
				return;
			}

			var name = "";
			for(var i = 0;i < data.byteLength-1;++ i)
				name += String.fromCharCode(data.getUint8(1+i));

			// Check if there's already a user with that name
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
			users[cu.id] = cu;
			socket.ownerID = cu.id;

			cm.broadcastNewUser(cu);
			cm.sendUsers(cu);
			cm.sendMap(cu);
			cm.initGame(cu);

			cm.broadcastMessage('Player ' + cu.name + ' joined');
		}
		if(data.getUint8(0) == 1 && typeof(cu) != 'undefined')
		{
			if(!cu.dead && (new Date()).getTime() - cu.lastEvent.shoot > 120)
			{
				var id = generateID();
				bullets[id] = new classes.Bullet(cu.player.pos.x, cu.player.pos.y, cu.player.rotation, cu.id, 20);
				cm.broadcastNewBullet(id);
				cu.lastEvent.shoot = (new Date()).getTime();
			}
		}
		if(data.getUint8(0) == 2 && typeof(cu) != 'undefined' && typeof(cu.player) != 'undefined')
		{
			if((new Date()).getTime() - cu.lastEvent.move < 50)
				return;

			cu.lastEvent.move = (new Date()).getTime();

			var dir = data.getUint8(1);
			if(dir % 2 == 0)
				cu.player.d.y -= 6;
			if(dir % 3 == 0)
				cu.player.d.y += 6;
			if(dir % 5 == 0)
				cu.player.d.x -= 6;
			if(dir % 7 == 0)
				cu.player.d.x += 6;

			cm.broadcastBasicPlayerStat(cu);
		}
		if(data.getUint8(0) == 3 && typeof(cu) != 'undefined' && typeof(cu.player) != 'undefined')
		{
			cu.player.rotation = data.getFloat32(1, false);
			cm.broadcastBasicPlayerStat(cu);
		}
	});
	socket.on('close', function (rawData, flags)
	{
		if(typeof(socket.ownerID) !== 'undefined')
		{
			cm.broadcastMessage(user[socket.ownerID].name + ' quit');
			cm.broadcastRemoveUser(users[socket.ownerID]);
			delete users[socket.ownerID];
		}
	});
});

// Last file, because it calls functions written here
var simulation = require("./simulation.js");
