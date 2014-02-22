var loginName = ""; 
while(loginName == "")
{
	loginName = prompt("Enter you username");
}

var socket = io.connect('http://localhost');//pravq socket za vruzka s server-a

console.log("Sending login info...");
socket.emit("login", {name: loginName });
console.log("Login info sent.");

socket.on("newUserLocation", function (data) // kogato nqkoi iska da sepremesti i poluchi odobrenie, da go obnovq v masiva-si
{
	console.log("Received newUserLocation event!");
	players[indexOf(data.simpleid)].pos = data.pos;
});

socket.on("initNewUser", function (data) // kogato nqkoi se logne, survara mi go prashta za da go dobavq
{
	console.log("Received initNewUser event!");
	players.push(data);
});
socket.on("setWall", function (data)
{
	walls.push(data);
});
socket.on("removeUser", function (data) // kogato nqkoi se disconnectne, go maham
{
	console.log("Received removeUser event!");
	players.splice( indexOf(data.simpleid), 1 );
});

socket.on("joinGame", function (data) // ako sum poluchil tova, znachi drugite me vijdat
{
	console.log("Received joinGame event!");
	myself = players[indexOf(data.simpleid)]; // za da imam referenciq kum sebesi
});

function sendMoveRequest()
{
	if(keys[87])
		socket.emit("move", {direction: "up"});
	if(keys[83])
		socket.emit("move", {direction: "down"});
	if(keys[65])
		socket.emit("move", {direction: "left"});
	if(keys[68])
		socket.emit("move", {direction: "right"});
}

setInterval(sendMoveRequest, 50);