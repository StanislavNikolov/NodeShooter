var loginName = ""; 
while(loginName == "" || loginName.length > 12)
{
	loginName = prompt("Enter you username", "The maximal size is 12 characters!");
}

var serverIP = "localhost"; // Тук се настроива ип-то на сървъра

var socket = io.connect(serverIP);//pravq socket za vruzka s server-a
console.log("Sending login info...");
socket.emit("login", {name: loginName });
console.log("Login info sent.");

socket.on("updateUserInformation", function (data) // servera kazva za promqna na nqkoi user
{
	var index = indexOf(data.simpleid);
	if(data.pos != undefined)
		players[index].pos = data.pos;
	if(data.rotation != undefined)
		players[index].rotation = data.rotation; 
	if(data.radius != undefined)
		players[index].radius = data.radius; 
	if(data.hp != undefined)
		players[index].hp = data.hp; 
	if(data.dead != undefined)
		players[index].dead = data.dead; 
});
socket.on("updateBulletInformation", function (data)
{
	var index = indexOf(data.simpleid,"bullet");
	if(data.pos != undefined)
		bullets[index].pos = data.pos;
	if(data.rotation != undefined)
		bullets[index].rotation = data.rotation; 
	if(data.radius != undefined)
		bullets[index].radius = data.radius; 
});

socket.on("initNewUser", function (data) // kogato nqkoi se logne, survara mi go prashta za da go dobavq
{
	console.log("Received initNewUser event!");
	players.push(data);
});
socket.on("initNewWall", function (data)
{
	walls.push(data);
});
socket.on("removeUser", function (data) // kogato nqkoi se disconnectne, go maham
{
	console.log("Received removeUser event!");
	players.splice( indexOf(data.simpleid), 1 );
});
socket.on("removeBullet", function (data) // kogato nqkoi se disconnectne, go maham
{
	bullets.splice( indexOf(data.simpleid, "bullet"), 1 );
});
socket.on("playerShooted", function (data) // kogato nqkoi se disconnectne, go maham
{
	console.log(frame - data.frame);
	var index = indexOf(data.psimpleid);
	bullets.push(new Bullet(  players[index].pos.x, 
		players[index].pos.y, players[index].rotation, data.bsimpleid  ));
});

socket.on("initNewBullet", function (data) // kogato nqkoi se disconnectne, go maham
{
	bullets.push(new Bullet( data.pos.x, data.pos.y, data.rotation, data.simpleid ));
});

socket.on("joinGame", function (data) // ako sum poluchil tova, znachi drugite me vijdat
{
	console.log("Received joinGame event!");
	myself = players[indexOf(data.simpleid)]; // za da imam referenciq kum sebesi
	frame = data.frame;
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
setInterval(function nextFrame() {frame ++;}, 20);