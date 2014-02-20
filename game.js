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
	context.clearRect(0,0,canvas.width,canvas.height);
	for (var i =0 ;i < players.length ; i++){
		if (players[i]!=undefined){
			context.fillStyle = "red";
			if (players[i].simpleid == myself.simpleid){
				context.fillStyle = "blue";
				console.log (i);
			}
			context.fillRect(players[i].pos.x*i*5, players[i].pos.y, 10, 10);
		}
	}
	/*
	if(myself != undefined) // samo ako znam koi sum az, s cel "anti-crash"
	{
		context.fillRect(myself.pos.x*myself.simpleid, myself.pos.y, 10, 10);
	}
	*/
	context.strokeRect(0, 0, canvas.width, canvas.height);
}

setInterval(draw, 50);