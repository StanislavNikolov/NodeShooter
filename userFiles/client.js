var serverIP = 'localhost:5000';
var socket = new WebSocket('ws://' + serverIP);
socket.binaryType = 'arraybuffer';

socket.onopen = function(event)
{
	console.log('Connection succssesful');
}

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
	if(message.getUint8(0) == 0) // auth reqest
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
	if(message.getUint8(0) == 1) // new user
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
	if(message.getUint8(0) == 2) // new wall
	{
		var id = message.getUint32(1, false);

		var x = message.getInt32(2, false);
		var y = message.getInt32(6, false);

		var ir = message.getFloat32(10, false);
		var or = message.getFloat32(14, false);

		var sa = message.getFloat32(18, false);
		var fa = message.getFloat32(22, false);

		walls[id] = new Wall(x, y, ir, or, sa, fa);
	}
	if(message.getUint8(0) == 3) // new bullet
	{
		var bid = message.getUint32(1, false);
		var sid = message.getUint32(5, false);

		var px = message.getInt32(9, false);
		var py = message.getInt32(13, false);

		var rt = message.getFloat32(17, false);

		bullets[bid] = new Bullet(px, py, rt, sid, 20);
	}
	if(message.getUint8(0) == 4) // remove user
	{
		console.log('User disconected');
		var id = message.getUint32(1);

		for(var i in scoreBoard)
		{
			if(i != 0 && scoreBoard[i][0] == users[id].name)
			{
				scoreBoard.splice(i, 1);
				break;
			}
		}

		delete users[id];
	}
	if(message.getUint8(0) == 5)
	{
		var id = message.getUint32(1, false);
		myself = users[id]; // used in game.js for drawing
	}
}

function sendShootRequest()
{
	currentShootPeriod --;
	if(keys[32] && currentShootPeriod <= 0)
	{
		var shootPacket = new Uint8Array([1]);
		socket.send(shootPacket.buffer);
		currentShootPeriod = maxShootPeriod;
	}
}
setInterval(sendShootRequest, 20);

/*
socket.on("updatePlayerInformation", function (data)
{
	if(data.pos != undefined)
		users[data.sid].player.pos = data.pos;
	if(data.rotation != undefined)
		users[data.sid].player.rotation = data.rotation;
	if(data.radius != undefined)
		users[data.sid].player.radius = data.radius;
	if(data.hp != undefined)
		users[data.sid].player.hp = data.hp;
	if(data.dead != undefined)
		users[data.sid].player.dead = data.dead;
});
socket.on("updateBulletInformation", function (data)
{
	if(data.pos != undefined)
		bullets[data.sid].pos = data.pos;
	if(data.rotation != undefined)
		bullets[data.sid].rotation = data.rotation;
	if(data.radius != undefined)
		bullets[data.sid].radius = data.radius;
});

socket.on("updateScoreBoard", function (data)
{
	var x = 1;
	for(var i in users)
	{
		if(i == data.sid)
		{
			scoreBoard[x][data.y] = data.value;
			return;
		}
		x ++;
	}
});
socket.on("removeBullet", function (data) // kogato nqkoi se disconnectne, go maham
{
	delete bullets[data.sid];
});
socket.on("addMessage", function (data)
{
	messageBoard.push(data.message);
});

function sendMoveRequest()
{
	if(keys[87] || keys[38])
		socket.emit("move", {direction: "up"});
	if(keys[83] || keys[40])
		socket.emit("move", {direction: "down"});
	if(keys[65] || keys[37])
		socket.emit("move", {direction: "left"});
	if(keys[68] || keys[39])
		socket.emit("move", {direction: "right"});
}

setInterval(sendMoveRequest, 50);
*/
