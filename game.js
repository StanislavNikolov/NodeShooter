var canvas = document.getElementById("main");
var context = canvas.getContext("2d");

var walls = []; // pazq si vsichki steni
var players = []; // ppazq si vsichki player-i
var keys = []; // koi buton e natisnat
var myself; //ukazatel (referenciq) kum elementa ot players, koito predstavlqvam
var bullets = [];

var maxShootPeriod = 20, currentShootPeriod = 0;

function Bullet(x, y, r, s)
{
	this.pos = new Vector(x, y);
	this.rotation = r;
	this.radius = 2;
	this.simpleid = s;
}

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
	this.radius = 10;
	this.rotation = 0;
}

function indexOf(simpleid, t) // pprosto e - kazvam i simpleid, a tq(funkciqta) na koi index ot masiva players otgovarq
{
	var array;
	if(t == undefined || t == "player")
		array = players;
	else
	{
		if(t == "wall")
			array = walls;
		else
			array = bullets;
	}
	
	for(var i = 0;i < array.length;i ++)
	{
		if(array[i].simpleid == simpleid)
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
function drawWall(current, offset)
{	
	console.log(current.pos, offset);
	if(offset != undefined)
	{
		current.pos.x -= offset.x;
		current.pos.y -= offset.y;
	}

	context.fillStyle = "green";
	context.beginPath();

	context.moveTo(current.pos.x+Math.cos(current.angle.start)*current.radius.iner,current.pos.y+Math.sin(i+current.angle.start)*current.radius.iner);
	for (var i = current.angle.start ; i <= current.angle.finish;i += Math.abs(current.angle.finish-current.angle.start)/100) {
		context.lineTo(current.pos.x+Math.cos(i)*current.radius.iner,current.pos.y+Math.sin(i)*current.radius.iner);
	}
	for (var i = current.angle.finish ; i >= current.angle.start;i -= Math.abs(current.angle.finish-current.angle.start)/100) {
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

	if(offset != undefined)
	{
		current.pos.x += offset.x;
		current.pos.y += offset.y;
	}
}
	
function draw() // moje bi edno ot malkoto neshta koito pravi game.js
{	
	context.clearRect(0,0,canvas.width,canvas.height);

	if(myself != undefined)
	{
		var offset = new Vector(myself.pos.x - canvas.width / 2, myself.pos.y - canvas.height / 2);
		
		for(var i = 0;i < bullets.length;i ++)
		{
			context.beginPath();

			context.arc(bullets[i].pos.x - offset.x, bullets[i].pos.y - offset.y, bullets[i].radius, 0, Math.PI * 2);
			context.fill();

			context.closePath();
		}

		for ( var i = 0 ; i < players.length ; i ++ )
		{
			context.fillStyle = "red";
			if (players[i].simpleid == myself.simpleid)
				context.fillStyle = "blue";

			context.beginPath();

			context.arc(players[i].pos.x - offset.x, players[i].pos.y - offset.y, players[i].radius, players[i].rotation, Math.PI * 2 + players[i].rotation);
			context.lineTo(players[i].pos.x - offset.x, players[i].pos.y - offset.y);
			context.stroke();

			context.closePath();
		}
		
		i = undefined;

		for (var i = 0 ; i < walls.length ; i ++)
			drawWall(walls[i], offset);
	}
	
	context.strokeRect(0, 0, canvas.width, canvas.height);
}

setInterval(draw, 50);