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

/*
// by "Joni", http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
function toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >>18),
                      0x80 | ((charcode>>12) & 0x3f),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}
*/

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
			loginName = prompt("Enter you username", "The maximal size is 12 characters!");
		} while(loginName.length > 12 || loginName == "");
		/* TODO
		* Javascript stores strings in UTF-16
		* We convert it to UTF-8 and send it back to the server
		* var utf8LoginName = toUTF8Array(loginName);
		*/

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
		var name = "";
		for(var i = 0;i < message.getUint8(1);++ i)
			name += String.fromCharCode(message.getUint8(2+i));

		var id = message.getUint32(2+name.length, false);
		var x = message.getInt32(2+name.length+4 + 0, false);
		var y = message.getInt32(2+name.length+4 + 4, false);

		var user = new User(name, id, new Player(new Vector(x, y)));
		users[user.id] = user;
	}
	if(packID === 12) // remove user
		delete users[message.getUint32(1)];
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

			if(bullets[id] == null)
				bullets[id] = new Bullet('');

			bullets[id].pos.x = message.getInt32(9 + i * 16, false);
			bullets[id].pos.y = message.getInt32(13 + i * 16, false);
			bullets[id].radius = message.getFloat32(17 + i * 16, false);
		}
	}
	if(packID === 31) // add wall
	{
		var id = message.getUint32(1, false);

		var x = message.getInt32(5, false);
		var y = message.getInt32(9, false);
		var ir = message.getFloat32(13, false);
		var or = message.getFloat32(17, false);
		var sa = message.getFloat32(21, false);
		var fa = message.getFloat32(25, false);

		walls[id] = new Wall(x, y, ir, or, sa, fa);
	}
	if(packID === 41)
	{
		var msg = '';
		var s = message.getUint32(1, false);
		for(var i = 0;i < s;++ i)
			msg += String.fromCharCode(message.getUint8(5+i));
		messageBoard.push(msg);
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
		packet.setFloat32(1, myself.player.rotation, false);
		socket.send(packet_b);

		lastShootTime = (new Date).getTime();
	}
}

var lastSentMoveDirection = 1;
function sendMoveRequest()
{
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
setInterval(debugLog, 1000);
