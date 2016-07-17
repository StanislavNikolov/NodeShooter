var canvas = document.getElementById("mainCanvas");
var context = canvas.getContext("2d");

function getPlayerRotation(event)
{
	if(myself != null)
	{
		var dx = event.clientX - canvas.width / 2;
		var dy = event.clientY - canvas.height / 2;
		var angle = Math.atan2(dy, dx);
		myself.player.rotation = angle;
	}
}
window.addEventListener("mousemove", getPlayerRotation, false);

var walls = {};
var users = {};
var bullets = {};

var keys = []; // saves the keyboard state
var myself; // reference to the 'current' player

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

function User(name, id, player, kills, deaths)
{
	this.name = name;
	this.id = id;
	this.kills = kills;
	this.deaths = deaths;
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

function drawWall(current)
{
	context.save();

	context.fillStyle = "green";
	context.beginPath();

	context.arc(current.pos.x, current.pos.y, current.radius.inner,
			current.angle.start, current.angle.finish);

	context.lineTo(current.pos.x + Math.cos(current.angle.finish) * current.radius.outer,
			current.pos.y + Math.sin(current.angle.finish) * current.radius.outer);

	context.arc(current.pos.x, current.pos.y, current.radius.outer,
			current.angle.finish, current.angle.start, true);

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

	context.restore();
}

function drawHpBar(p, ms, sx, sy, w) //player, maxsize, startx, starty, width
{
	context.save();

	context.globalAlpha = 0.7;
	context.fillStyle = "red";
	context.strokeStyle = "black";

	var hpBarSize = (p.hp / p.maxhp) * ms;
	context.fillRect(sx, sy, hpBarSize, w);
	context.strokeRect(sx, sy, ms, w);

	context.restore();
}

function draw()
{
	if(myself == null)
		return;

	if(!myself.dead)
	{
		context.globalAlpha = 1;
		context.fillStyle = "white";
		context.fillRect(0, 0, canvas.width, canvas.height);

		context.save();
		context.translate(-myself.player.pos.x + canvas.width / 2,
				-myself.player.pos.y + canvas.height / 2);

		context.fillStyle = "black";
		for(var i in bullets)
		{
			context.beginPath();

			context.arc(bullets[i].pos.x
					, bullets[i].pos.y
					, bullets[i].radius
					, 0, Math.PI * 2);

			context.fill();
			context.closePath();
		}

		for(var i in walls)
			drawWall(walls[i]);

		for(var i in users)
		{
			if(users[i].dead)
				continue;

			context.fillStyle = "red";
			if(myself.id == i) context.fillStyle = "blue";

			drawHpBar(users[i].player
					, 20
					, users[i].player.pos.x - users[i].player.radius
					, users[i].player.pos.y + users[i].player.radius + 2
					, 3);

			context.strokeStyle = context.fillStyle;
			context.font = "10px Monospace";
			context.textAlign = "center";
			context.fillText(users[i].name, users[i].player.pos.x + 0.001
					, users[i].player.pos.y - users[i].player.radius - 2);

			// draw the player
			context.beginPath();

			context.arc(users[i].player.pos.x, users[i].player.pos.y
					, users[i].player.radius, users[i].player.rotation
					, Math.PI * 2 + users[i].player.rotation);

			if(myself.id == i)
				context.lineTo(users[i].player.pos.x, users[i].player.pos.y);

			context.globalAlpha = 0.1; context.fill();
			context.globalAlpha = 1; context.stroke();

			context.closePath();
		}

		context.restore();

		drawHpBar(myself.player
				, canvas.width / 6
				, 0.02 * canvas.width
				, 0.02 * canvas.height
				, 15);
	}

	if(myself.dead) // :(
	{
		context.globalAlpha = 0.1;
		context.fillStyle = "white";
		context.fillRect(0, 0, canvas.width, canvas.height);

		context.fillStyle = "red";
		context.font = "30px Monospace";
		context.fillText("You were killed!", 50, 50);
	}

	context.strokeStyle = "black";
	context.strokeRect(0, 0, canvas.width, canvas.height);

}

function animate()
{
	draw();
	window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);
