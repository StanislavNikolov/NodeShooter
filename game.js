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
	context.moveTo(current.pos.x+Math.cos(current.angle.start)*current.radius.iner,current.pos.y+Math.sin(i+current.angle.start)*current.radius.iner);
	for (var i = current.angle.start ; i <= current.angle.finish;i += Math.abs(current.angle.finish-current.angle.start)/50) {
		context.lineTo(current.pos.x+Math.cos(i)*current.radius.iner,current.pos.y+Math.sin(i)*current.radius.iner);
	}
	for (var i = current.angle.finish ; i >= current.angle.start;i -= Math.abs(current.angle.finish-current.angle.start)/50) {
		context.lineTo(current.pos.x+Math.cos(i)*current.radius.outer,current.pos.y+Math.sin(i)*current.radius.outer);
	}
	context.closePath();
	context.fill();
	context.beginPath();
	context.arc(current.pos.x+(Math.cos(current.angle.start)*(Math.abs(current.radius.outer-current.radius.iner)/2+current.radius.iner)),
						current.pos.y+Math.sin(current.angle.start)*(Math.abs(current.radius.outer-current.radius.iner)/2+current.radius.iner),
									Math.abs(current.radius.outer-current.radius.iner)/2,0,2*Math.PI);
	context.closePath();
	context.fill();
	context.beginPath();
	context.arc(current.pos.x+(Math.cos(current.angle.finish)*(Math.abs(current.radius.outer-current.radius.iner)/2+current.radius.iner)),
						current.pos.y+Math.sin(current.angle.finish)*(Math.abs(current.radius.outer-current.radius.iner)/2+current.radius.iner),
									Math.abs(current.radius.outer-current.radius.iner)/2,0,2*Math.PI);
	context.closePath();
	context.fill();
	
}
var testWall = {angle:{start:Math.PI,finish:Math.PI*2},radius:{iner:30,outer:50},pos:{x:400,y:400}};
	
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
			context.beginPath();
			context.arc(players[i].pos.x, players[i].pos.y, players[i].size.x, 0 , Math.PI*2);
			context.closePath();
			context.fill();
		}
	}
	
	i = undefined;
	drawWall(testWall);
	
	
	context.strokeRect(0, 0, canvas.width, canvas.height);
}

setInterval(draw, 50);