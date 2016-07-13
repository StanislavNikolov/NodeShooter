var canvas = document.getElementById("mainCanvas");
var context = canvas.getContext("2d");

function resize()
{
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	draw();
}
resize();

function getPlayerRotation(event)
{
	if(typeof(myself) != 'undefined')
	{
		var dx = event.clientX - canvas.width / 2;
		var dy = event.clientY - canvas.height / 2;
		var angle = Math.atan2(dy, dx);
		myself.player.rotation = angle;
	}
}
window.addEventListener("resize", resize, false);
window.addEventListener("mousemove", getPlayerRotation, false);

var walls = {};
var users = {};
var bullets = {};

var keys = []; // saves the keyboard state
var myself; // reference to the our player

var messageBoard = [];

function Bullet()
{
	this.pos = new Vector(0, 0);
	this.radius = 0;
}

function Vector(x, y)
{
	this.x = x;
	this.y = y;
}

function Player(p)
{
	this.pos = p; // must be Vector
	this.radius = 10;
	this.rotation = 0;
	this.speed = 0;
	this.hp = 100;
	this.maxhp = 100;
	this.d = new Vector(0, 0);
}

function Wall(x, y, innerRadius, outerRadius, startAngle, finishAngle)
{
	this.pos = new Vector(x, y);
	this.radius = {inner:innerRadius, outer:outerRadius};
	this.angle = {start:startAngle, finish:finishAngle};
}

function User(name, id, player)
{
	this.name = name;
	this.id = id;
	this.kills = 0;
	this.deaths = 0;
	this.lastEvent = {move: 0, shoot: 0, respawn: 0, getKilled: 0};
	this.player = player;
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
	if(offset != undefined)
	{
		current.pos.x -= offset.x;
		current.pos.y -= offset.y;
	}

	context.fillStyle = "green";
	context.beginPath();

	context.moveTo(current.pos.x+Math.cos(current.angle.start)*current.radius.inner,current.pos.y+Math.sin(i+current.angle.start)*current.radius.inner);
	for (var i = current.angle.start ; i <= current.angle.finish;i += Math.abs(current.angle.finish-current.angle.start)/50) {
		context.lineTo(current.pos.x+Math.cos(i)*current.radius.inner,current.pos.y+Math.sin(i)*current.radius.inner);
	}
	context.lineTo(current.pos.x+Math.cos(current.angle.finish)*current.radius.inner,current.pos.y+Math.sin(current.angle.finish)*current.radius.inner);
	for (var i = current.angle.finish ; i >= current.angle.start;i -= Math.abs(current.angle.finish-current.angle.start)/50) {
		context.lineTo(current.pos.x+Math.cos(i)*current.radius.outer,current.pos.y+Math.sin(i)*current.radius.outer);
	}
	context.lineTo(current.pos.x+Math.cos(current.angle.start)*current.radius.outer,current.pos.y+Math.sin(current.angle.start)*current.radius.outer);

	context.closePath();
	context.fill();

	context.beginPath();
	context.arc(current.pos.x+(Math.cos(current.angle.start)*(Math.abs(current.radius.outer-current.radius.inner)/2+current.radius.inner)),
						current.pos.y+Math.sin(current.angle.start)*(Math.abs(current.radius.outer-current.radius.inner)/2+current.radius.inner),
									Math.abs(current.radius.outer-current.radius.inner)/2,0,2*Math.PI);
	context.closePath();
	context.fill();
	context.beginPath();
	context.arc(current.pos.x+(Math.cos(current.angle.finish)*(Math.abs(current.radius.outer-current.radius.inner)/2+current.radius.inner)),
						current.pos.y+Math.sin(current.angle.finish)*(Math.abs(current.radius.outer-current.radius.inner)/2+current.radius.inner),
									Math.abs(current.radius.outer-current.radius.inner)/2,0,2*Math.PI);
	context.closePath();
	context.fill();

	if(offset != undefined)
	{
		current.pos.x += offset.x;
		current.pos.y += offset.y;
	}
}

function drawHpBar(p, ms, sx, sy, w)//player, maxsize, startx, starty, width
{
	var def = context.fillStyle, sDef = context.strokeStyle;
	context.globalAlpha = 0.7; context.fillStyle = "red";
	var hpBarSize = (p.hp / p.maxhp) * ms;
	context.fillRect(sx, sy, hpBarSize, w);
	context.strokeStyle = "black";
	context.strokeRect(sx, sy, ms, w);
	context.strokeStyle = sDef;
	context.globalAlpha = 1;
	context.fillStyle = def;
}

function draw()
{
	if(myself == undefined)
		return;
	if(!myself.dead)
	{
		// Clear the screen and apply the "-put name here-" effect
		context.globalAlpha = myself.hp / myself.maxhp;
		context.fillStyle = "white";
		context.fillRect(0, 0, canvas.width, canvas.height);

		context.globalAlpha = 1;
		context.font = "10px Arial";

		var offset = new Vector(myself.player.pos.x - canvas.width / 2, myself.player.pos.y - canvas.height / 2);

		context.fillStyle = "black";
		for(var i in bullets)
		{
			context.beginPath();

			context.arc(bullets[i].pos.x - offset.x,
					bullets[i].pos.y - offset.y,
					bullets[i].radius,
					0, Math.PI * 2);
			context.fill();

			context.closePath();
		}

		for (var i in walls)
			drawWall(walls[i], offset);

		for ( var i in users )
		{
			if(!users[i].dead)
			{
				context.fillStyle = "red";
				if (myself.id == i)
					context.fillStyle = "blue";
				drawHpBar(users[i].player
						, 20
						, users[i].player.pos.x - offset.x - users[i].player.radius
						, users[i].player.pos.y - offset.y + users[i].player.radius + 2
						, 3);

				context.strokeStyle = context.fillStyle;
				var textSize = 10 * users[i].name.length;
				context.fillText(users[i].name, users[i].player.pos.x - offset.x - textSize/3, users[i].player.pos.y - offset.y - users[i].player.radius - 2);

				// draw the player
				context.beginPath();

				context.arc(users[i].player.pos.x - offset.x, users[i].player.pos.y - offset.y, users[i].player.radius, users[i].player.rotation, Math.PI * 2 + users[i].player.rotation); if (myself.id == i) context.lineTo(users[i].player.pos.x - offset.x, users[i].player.pos.y - offset.y);

				context.globalAlpha = 0.1; context.fill();
				context.globalAlpha = 1; context.stroke();

				context.closePath();
			}
		}

		drawHpBar(myself.player, 200, 5, 5, 15);
	}

	if(myself.dead) // :(
	{
		context.globalAlpha = 0.1;
		context.fillStyle = "white";
		context.fillRect(0, 0, canvas.width, canvas.height);

		context.fillStyle = "red";
		context.font = "30px Arial";
		context.fillText("You were killed!", 50, 50);
	}

	// Score board
	context.font = "13px Arial";

	var x = 0.80 * canvas.width;
	var y = 0.05 * canvas.height;
	var sizeX = 0.05 * canvas.width;
	var sizeY = sizeX / 5;

	context.globalAlpha = 0.5;
	context.fillStyle = 'black';
	context.fillRect(x + 0*(sizeX+5), y, sizeX, sizeY);
	context.fillRect(x + 1*(sizeX+5), y, sizeX, sizeY);
	context.fillRect(x + 2*(sizeX+5), y, sizeX, sizeY);

	context.globalAlpha = 1;
	context.fillStyle = 'yellow';
	context.fillText('Name', x+ 0*(sizeX+5), y+sizeY - 2);
	context.fillText('Kills', x+ 1*(sizeX+5), y+sizeY - 2);
	context.fillText('Deaths', x+ 2*(sizeX+5), y+sizeY - 2);
	var row = 0;
	for(var i in users)
	{
		row ++;
		context.globalAlpha = 0.5;
		context.fillStyle = 'black';
		context.fillRect(x + 0*(sizeX+5), y + row*(sizeY+2), sizeX, sizeY);
		context.fillRect(x + 1*(sizeX+5), y + row*(sizeY+2), sizeX, sizeY);
		context.fillRect(x + 2*(sizeX+5), y + row*(sizeY+2), sizeX, sizeY);

		context.globalAlpha = 1;
		context.fillStyle = 'yellow';
		context.fillText(users[i].name, x+ 0*(sizeX+5), y+sizeY + row*(sizeY+2) - 2);
		context.fillText(users[i].kills, x+ 1*(sizeX+5), y+sizeY + row*(sizeY+2) - 2);
		context.fillText(users[i].deaths, x+ 2*(sizeX+5), y+sizeY + row*(sizeY+2) - 2);

	}

	var drawY = canvas.height - 75;
	context.font = "14px Arial";
	context.fillStyle = "black";
	for(var i in messageBoard)
	{
		if(i > messageBoard.length - 5)
		{
			context.fillText(messageBoard[i], 10, drawY);
			drawY += 15;
		}
	}

	context.strokeStyle = "black";
	context.strokeRect(0, 0, canvas.width, canvas.height);
}

setInterval(draw, 1000/60);
