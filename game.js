var canvas = document.getElementById("main");
var context = canvas.getContext("2d");

var walls = []; // pazq si vsichki steni
var players = []; // ppazq si vsichki player-i
var keys = []; // koi buton e natisnat
var myself; //ukazatel (referenciq) kum elementa ot players, koito predstavlqvam

function Vector(x, y)
{
	this.x = x;
	this.y = y;
}

function Player(p, n, sid)
{
	this.pos = p;
	this.name = n;
	this.simpleid = sid;
	this.size = new Vector(10, 10);
}

function indexOf(simpleid) // pprosto e - kazvam i simpleid, a tq(funkciqta) na koi index ot masiva players otgovarq
{
	for(var i = 0;i < players.length;i ++)
	{
		if(players[i].simpleid == simpleid)
			return i;
	}
}

for(var i = 0;i < 200;i ++){keys[i] = false;}

window.addEventListener("keydown", function (args)
{
    keys[args.keyCode] = true;
}, false);

window.addEventListener("keyup", function (args)
{
    keys[args.keyCode] = false;
}, false);
function drawWall(current){
	
	context.fillStyle = "green";
	context.beginPath();
	context.moveTo(current.x+Math.cos(current.startAngle)*current.inerRadius,current.y+Math.sin(i+current.startAngle)*current.inerRadius);
	for (var i = current.startAngle ; i <= current.finishAngle;i += Math.abs(current.finishAngle-current.startAngle)/50) {
		context.lineTo(current.x+Math.cos(i)*current.inerRadius,current.y+Math.sin(i)*current.inerRadius);
	}
	for (var i = current.finishAngle ; i >= current.startAngle;i -= Math.abs(current.finishAngle-current.startAngle)/50) {
		context.lineTo(current.x+Math.cos(i)*current.outerRadius,current.y+Math.sin(i)*current.outerRadius);
	}
	context.closePath();
	context.fill();
	context.beginPath();
	context.arc(current.x+(Math.cos(current.startAngle)*(Math.abs(current.outerRadius-current.inerRadius)/2+current.inerRadius)),
						current.y+Math.sin(current.startAngle)*(Math.abs(current.outerRadius-current.inerRadius)/2+current.inerRadius),
									Math.abs(current.outerRadius-current.inerRadius)/2,0,2*Math.PI);
	context.closePath();
	context.fill();
	context.beginPath();
	context.arc(current.x+(Math.cos(current.finishAngle)*(Math.abs(current.outerRadius-current.inerRadius)/2+current.inerRadius)),
						current.y+Math.sin(current.finishAngle)*(Math.abs(current.outerRadius-current.inerRadius)/2+current.inerRadius),
									Math.abs(current.outerRadius-current.inerRadius)/2,0,2*Math.PI);
	context.closePath();
	context.fill();
	
}
function draw() // moje bi edinstvenoto koeto pravi game.js
{	
	context.clearRect(0,0,canvas.width,canvas.height);

	if(myself != undefined)
	{
		for ( var i = 0 ; i < players.length ; i ++ )
		{
			context.fillStyle = "red";
			if (players[i].simpleid == myself.simpleid)
				context.fillStyle = "blue";
			context.fillRect(players[i].pos.x, players[i].pos.y, 10, 10);
		}
	}
	
	i = undefined;
	
	testWall = {startAngle:Math.PI/2,finishAngle:Math.PI*3/2,inerRadius:30,outerRadius:50,x:400,y:400}
	drawWall(testWall);
	
	
	context.strokeRect(0, 0, canvas.width, canvas.height);
}

setInterval(draw, 50);