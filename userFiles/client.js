var socket = new WebSocket('ws://' + location.host + location.pathname);
socket.binaryType = 'arraybuffer';

socket.onopen = function(event)
{
	console.log('Connection succssesful');
}

var debugData = new Array(256);
for(var i = 0;i < 256;++ i)
	debugData[i] = 0;

var bulletsPerSecond = 1;

socket.onmessage = function(event)
{
	var message = new DataView(event.data);
	var packID = message.getUint8(0);

	debugData[packID] ++; // for performance debugging

	if(packID === 1) // auth reqest
	{
		var loginName = "";
		do
		{
			loginName = prompt("Enter your nickname", "12 characters max");
		} while(loginName.length > 12 || loginName.length < 1);
		loginName = encodeURI(loginName);

		var response_b = new ArrayBuffer(1 + loginName.length);
		var response = new DataView(response_b);

		response.setUint8(0, 0); // pid
		for(var i = 0;i < loginName.length;++ i)
			response.setUint8(1+i, loginName.charCodeAt(i));

		socket.send(response_b);
	}
	if(packID === 2)
	{
		var id = message.getUint32(1, false);
		myself = users[id]; // used in game.js for drawing

		bulletsPerSecond = message.getFloat32(5, false);
		setInterval(sendShootRequest, 10);
	}
	if(packID === 11) // add user
	{
		var name = "", nameRawLen = message.getUint8(1);
		for(var i = 0;i < nameRawLen;++ i)
			name += String.fromCharCode(message.getUint8(2+i));
		name = decodeURI(name);

		var id = message.getUint32(2+nameRawLen, false);
		var x = message.getInt32(2+nameRawLen+4 + 0, false);
		var y = message.getInt32(2+nameRawLen+4 + 4, false);

		var kills = message.getInt32(2+nameRawLen+4 + 8, false);
		var deaths = message.getInt32(2+nameRawLen+4 + 12, false);

		var user = new User(name, id, new Player(new Vector(x, y)), kills, deaths);
		users[user.id] = user;
		refreshScoreboard();
	}
	if(packID === 12) // remove user
	{
		var id = message.getUint32(1);
		removeUserFromScoreboard(id);
		delete users[id];
	}
	if(packID === 13) // basic player info
	{
		var count = message.getUint32(1, false);

		for(var i = 0;i < count;++ i)
		{
			var id = message.getUint32(5 + i * 24, false);
			users[id].player.pos.x = message.getFloat32(9 + i * 24, false);
			users[id].player.pos.y = message.getFloat32(13 + i * 24, false);
			users[id].player.speed = message.getFloat32(17 + i * 24, false);
			users[id].player.hp = message.getInt32(21 + i * 24, false);
			users[id].player.maxhp = message.getInt32(25 + i * 24, false);
		}
	}
	if(packID === 14) // player died
		users[message.getUint32(1, false)].dead = true;
	if(packID === 15) // player respawned
		users[message.getUint32(1, false)].dead = false;
	if(packID === 22) // remove bullet
	{
		delete bullets[message.getUint32(1, false)];
	}
	if(packID === 23) // basic bullet stat
	{
		var count = message.getUint32(1, false);
		for(var i = 0;i < count;++ i)
		{
			var id = message.getUint32(5 + i * 16, false);
			var x = message.getInt32(9 + i * 16, false);
			var y = message.getInt32(13 + i * 16, false);

			if(bullets[id] == null)
			{
				bullets[id] = new Bullet();
				bullets[id].pos.x = x;
				bullets[id].pos.y = y;
			}
			else
			{
				bullets[id].pos.x = bullets[id].target.pos.x;
				bullets[id].pos.y = bullets[id].target.pos.y;
			}
			bullets[id].target.pos.x = x;
			bullets[id].target.pos.y = y;

			bullets[id].radius = message.getFloat32(17 + i * 16, false);
		}
	}
	if(packID === 31) // walls
	{
		var count = message.getUint32(1, false);

		for(var i = 0;i < count;++ i)
		{
			var id = message.getUint32(5 + i * 28, false);
			if(walls[id] == null)
				walls[id] = new Wall();

			walls[id].pos.x = message.getInt32(9 + i * 28, false);
			walls[id].pos.y = message.getInt32(13 + i * 28, false);
			walls[id].radius.inner = message.getFloat32(17 + i * 28, false);
			walls[id].radius.outer = message.getFloat32(21 + i * 28, false);
			walls[id].angle.start = message.getFloat32(25 + i * 28, false);
			walls[id].angle.finish = message.getFloat32(29 + i * 28, false);
		}

	}
	if(packID === 41)
	{
		var msg = '';
		var s = message.getUint32(1, false);
		for(var i = 0;i < s;++ i)
			msg += String.fromCharCode(message.getUint8(5+i));
		msg = decodeURI(msg);
		addMessageToMessageboard(msg);
	}
	if(packID === 42)
	{
		var id = message.getUint32(1, false);
		var value = message.getInt32(5, false);
		var y = message.getUint8(9);
		if(y == 0)
			users[id].kills = value;
		if(y == 1)
			users[id].deaths = value;
		refreshScoreboard();
	}
}

var lastShootTime = 0;
function sendShootRequest()
{
	if(keys[32] && (new Date).getTime() - lastShootTime > 1000 / bulletsPerSecond)
	{
		var packet_b = new ArrayBuffer(5);
		var packet = new DataView(packet_b);
		packet.setUint8(0, 1);
		packet.setFloat32(1, rotation, false);
		socket.send(packet_b);

		lastShootTime = (new Date).getTime();
	}
}

var lastSentMoveDirection = 1;
function sendMoveRequest()
{
	if(myself.dead)
		return;

	var data = 1;

	if(keys[87] || keys[38]) // up
		data *= 2;
	if(keys[83] || keys[40]) // down
		data *= 3;
	if(keys[65] || keys[37]) // left
		data *= 5;
	if(keys[68] || keys[39]) // right
		data *= 7;

	if(data != lastSentMoveDirection)
	{
		var packet_b = new ArrayBuffer(1+1);
		var packet = new DataView(packet_b);
		packet.setUint8(0, 2);
		packet.setUint8(1, data);

		socket.send(packet_b);
		lastSentMoveDirection = data;
	}
}
setInterval(sendMoveRequest, 50);

function debugLog()
{
	console.log('=============');
	var sum = 0;
	for(var i = 0;i < 256;++ i)
	{
		if(debugData[i] > 0)
		{
			console.log(i, ': ', debugData[i]);
			sum += debugData[i];
			debugData[i] = 0;
		}
	}
	console.log('sum: ', sum);
}
//setInterval(debugLog, 1000);
