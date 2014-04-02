var serverIP = "localhost"; // Тук се настроива ип-то на сървъра
//var serverIP = "192.168.43.163";
var socket = io.connect(serverIP);// сокет за връзка със сървъра

var loginName = ""; 

socket.on("enterUsername", function (data)
{
	loginName = prompt("Enter you username", "The maximal size is 12 characters!");
	socket.emit("login", {name: loginName});
});

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

socket.on("initNewPlayer", function (data)
{
	users[data.sid] = {}; 
	users[data.sid].player = data.player;
	users[data.sid].socket = {};
	scoreBoard.push([users[data.sid].player.name, users[data.sid].player.kills, users[data.sid].player.deads]);
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

socket.on("initNewWall", function (data)
{
	walls[data.sid] = data.wall;
});
socket.on("removeUser", function (data) // kogato nqkoi se disconnectne, go maham
{
	console.log("Received removeUser event!");
	
	for(var i in scoreBoard)
	{
		if(i != 0 && scoreBoard[i][0] == users[data.sid].player.name)
		{
			scoreBoard.splice(i, 1);
			break;
		}
	}

	delete users[data.sid];
});
socket.on("removeBullet", function (data) // kogato nqkoi se disconnectne, go maham
{
	delete bullets[data.sid];
});
socket.on("playerShooted", function (data) // kogato nqkoi se disconnectne, go maham
{
	bullets[data.bsid] = new Bullet( users[data.psid].player.pos.x, users[data.psid].player.pos.y, users[data.psid].player.rotation, data.psid );
});

socket.on("initNewBullet", function (data) // kogato nqkoi se disconnectne, go maham
{
	bullets[data.bsid] = new Bullet( data.pos.x, data.pos.y, data.rotation, data.psid );
});

socket.on("joinGame", function (data) // значи: "Ок, всички вече те знаят, влизай и ти"
{
	console.log("Received joinGame event!");
	myself = users[data.sid].player; // за да знам точно кой съм аз0
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

function sendShootRequest()
{
	currentShootPeriod --;
	if(keys[32] && currentShootPeriod <= 0)
	{
		socket.emit("shoot", {});
		currentShootPeriod=maxShootPeriod;
	}
}

setInterval(sendMoveRequest, 50);
setInterval(sendShootRequest, 20);
