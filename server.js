'use strict';

let app = require('express')()
  , server = require('http').createServer(app)
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({server: server})
  , config = require('./config.json');

// Default values if such in the config are missing
if(config == null) { config = {}; }

if(config.server == null) { config.server = {}; }
config.server.port = process.env.PORT || config.server.port || 5000;

if(config.bullets == null) { config.bullets = {}; }
if(config.bullets.ticksPerSecond == null) { config.bullets.ticksPerSecond = 120; }
if(config.bullets.sendTicksDivisor == null) { config.bullets.sendTicksDivisor = 2; }
if(config.bullets.speedMultiplier == null) { config.bullets.speedMultiplier = 1.2; }
if(config.bullets.decayRateMultiplier == null) { config.bullets.decayRateMultiplier = 2; }
if(config.bullets.decayOnRicochetMultiplier == null)
{ config.bullets.decayOnRicochetMultiplier = 0.4; }
if(config.bullets.damage == null) { config.bullets.damage = 5; }

if(config.players == null) { config.players = {}; }
if(config.players.ticksPerSecond == null) { config.players.ticksPerSecond = 40; }
if(config.players.speedMultiplier == null) { config.players.speedMultiplier = 1; }
if(config.players.bulletsPerSecond == null) { config.players.bulletsPerSecond = 10; }

global.config = config;

global.classes = require('./classes.js');
global.cm = require('./connectionManager.js');
global.pm = require('./packetManager.js');

let cm = global.cm;
let pm = global.pm;
let classes = global.classes;

server.listen(config.server.port, function () { console.log('Listening on ' + server.address().port) });

app.get('/', function (req, res)
{
	res.sendfile(__dirname + '/userFiles/index.html');
});

let userFiles = ['client.js', 'game.js', 'styles.css', 'simulation.js'];
userFiles.map(function (file)
{
	app.get('/userFiles/' + file, function (req, res)
	{
		res.sendfile(__dirname + '/userFiles/' + file);
	});
});

const MAX_BUFF_SIZE = [1+12, 5, 2];
const MIN_BUFF_SIZE = [2, 5, 2];

global.users = {};
global.walls = {};
global.bullets = {};
global.frame = 0;

let users = global.users;
let walls = global.walls;
let bullets = global.bullets;
let frame = global.frame;

let nextID = 0;
function generateID()
{
	return nextID ++;
}
global.generateID = generateID;

wss.on('connection', function (socket)
{
	let cu; // current user

	let authRequest = new Uint8Array([1]);
	socket.send(authRequest.buffer);

	socket.on('message', function(rawData, flags)
	{
		/*
		 * 'rawData' is of type 'Buffer', but we need the standart javascript ArrayBuffer.
		 * The conversion is expensive to the CPU, so it would be pretty easy to hog the whole server
		 * by sending a huge packet.  This is what this 'if' is for, pun not intended.
		 */

		if(rawData.length > MAX_BUFF_SIZE[rawData[0]] + 1
			|| rawData.length < MIN_BUFF_SIZE[rawData[0]])
			return;

		let data_b = new ArrayBuffer(rawData.length);
		let data = new DataView(data_b);
		for(let i = 0;i < rawData.length;++ i)
			data.setUint8(i, rawData[i]);

		if(data.getUint8(0) == 0)
		{
			if(cu != null && cu.name != null) // This user already has a name
				return;

			if(data.byteLength > 12 || data.byteLength <= 0) // Invalid name
			{
				let authRequest = new Uint8Array([1]);
				socket.send(authRequest.buffer);
				return;
			}

			let name = "";
			for(let i = 0;i < data.byteLength-1;++ i)
				name += String.fromCharCode(data.getUint8(1+i));

			// Check if there's already a user with that name
			for(let i in global.users)
			{
				if(global.users[i].name == name)
				{
					let authRequest = new Uint8Array(1);
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
		if(data.getUint8(0) == 1 && cu != null)
		{
			let minTimeBetweenBullets = 1000 / config.players.bulletsPerSecond;
			if(!cu.dead && (new Date()).getTime() - cu.lastEvent.shoot > minTimeBetweenBullets)
			{
				let id = generateID();
				bullets[id] = new classes.Bullet(
						  cu.player.pos.x
						, cu.player.pos.y
						, data.getFloat32(1, false)
						, cu.id, global.config.bullets.damage);

				cu.lastEvent.shoot = (new Date()).getTime();
			}
		}
		if(data.getUint8(0) == 2 && cu != null && cu.player != null && !cu.dead)
		{
			cu.player.direction = data.getUint8(1);
		}
	});
	socket.on('close', function (rawData, flags)
	{
		if(socket.ownerID != null)
		{
			cm.broadcastMessage(users[socket.ownerID].name + ' quit');
			cm.broadcastRemoveUser(users[socket.ownerID]);
			delete users[socket.ownerID];
		}
	});
});

// Last file, because it calls functions written here
var simulation = require("./simulation.js");
