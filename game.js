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

function draw() // moje bi edinstvenoto koeto pravi game.js
{	
	if(myself != undefined) // samo ako znam koi sum az, s cel "anti-crash"
	{
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
	context.strokeRect(0, 0, canvas.width, canvas.height);
}

setInterval(draw, 50);