var loginName = ""; 
while(loginName == "" || loginName.length > 12)
{
	loginName = prompt("Enter you username", "The maximal size is 12 characters!");
}

var serverIP = "localhost"; // Тук се настроива ип-то на сървъра

var socket = io.connect(serverIP);// сокет за връзка със сървъра
console.log("Sending login info...");
socket.emit("login", {name: loginName });
console.log("Login info sent.");

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
		bullets[data.sid].player.pos = data.pos;
	if(data.rotation != undefined)
		bullets[data.sid].player.rotation = data.rotation; 
	if(data.radius != undefined)
		bullets[data.sid].player.radius = data.radius; 
});

socket.on("initNewPlayer", function (data) // kogato nqkoi se logne, survara mi go prashta za da go dobavq
{
	console.log(data);
	users[data.sid] = {}; 
	users[data.sid].player = data.player;
	users[data.sid].socket = {};
});
socket.on("initNewWall", function (data)
{
	walls.push(data);
});
socket.on("removeUser", function (data) // kogato nqkoi se disconnectne, go maham
{
	console.log("Received removeUser event!");
	delete users[data.sid];
});
socket.on("removeBullet", function (data) // kogato nqkoi se disconnectne, go maham
{
	//bullets.splice( data.sidOf(data.simpleid, "bullet"), 1 );
});
socket.on("playerShooted", function (data) // kogato nqkoi se disconnectne, go maham
{
	//bullets.push(new Bullet(  users[data.sid].pos.x, 
	//	users[data.sid].pos.y, users[data.sid].rotation, data.bsimpleid  ));
});

socket.on("initNewBullet", function (data) // kogato nqkoi se disconnectne, go maham
{
	//bullets.push(new Bullet( data.pos.x, data.pos.y, data.rotation, data.simpleid ));
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