var canvas = document.getElementById("mainCanvas");
var context = canvas.getContext("2d");

var minimap = document.getElementById("minimap");
var mmContext = minimap.getContext("2d");
var minimapScale = 20;

function getPlayerRotation(event)
{
	if(myself != null)
	{
		var dx = event.clientX - canvas.width / 2;
		var dy = event.clientY - canvas.height / 2;
		var angle = Math.atan2(dy, dx);
		rotation = angle;
	}
}
window.addEventListener("mousemove", getPlayerRotation, false);

var walls = {};
var users = {};
var bullets = {};

var keys = []; // saves the keyboard state
var myself; // reference to the 'current' player
var rotation = 0;

function Bullet()
{
	// The values used for rendering
	this.pos = new Vector(0, 0);
	this.radius = 0;

	// The values last received by the server
	this.target = {pos: new Vector(0, 0), radius: 0};
}

function Vector(x, y)
{
	this.x = x;
	this.y = y;
}
Vector.prototype.length = function()
{
	return Math.sqrt(this.x * this.x + this.y * this.y);
}

function Player(p)
{
	this.pos = p; // must be Vector
	this.radius = 10;
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

function drawWall(current, ctx)
{
	ctx.beginPath();

	ctx.arc(current.pos.x, current.pos.y, current.radius.inner,
			current.angle.start, current.angle.finish);

	ctx.lineTo(current.pos.x + Math.cos(current.angle.finish) * current.radius.outer,
			current.pos.y + Math.sin(current.angle.finish) * current.radius.outer);

	ctx.arc(current.pos.x, current.pos.y, current.radius.outer,
			current.angle.finish, current.angle.start, true);

	ctx.closePath();
	ctx.fill();

	ctx.beginPath();
	ctx.arc(current.pos.x+(Math.cos(current.angle.start)*(Math.abs(current.radius.outer-current.radius.inner)/2+current.radius.inner)),
			current.pos.y+Math.sin(current.angle.start)*(Math.abs(current.radius.outer-current.radius.inner)/2+current.radius.inner),
			Math.abs(current.radius.outer-current.radius.inner)/2,0,2*Math.PI);
	ctx.closePath();
	ctx.fill();

	ctx.beginPath();
	ctx.arc(current.pos.x+(Math.cos(current.angle.finish)*(Math.abs(current.radius.outer-current.radius.inner)/2+current.radius.inner)),
			current.pos.y+Math.sin(current.angle.finish)*(Math.abs(current.radius.outer-current.radius.inner)/2+current.radius.inner),
			Math.abs(current.radius.outer-current.radius.inner)/2,0,2*Math.PI);
	ctx.closePath();
	ctx.fill();
}

function drawHpBar(p, ms, sx, sy, w) //player, maxsize, startx, starty, width
{
	context.globalAlpha = 0.7;
	context.fillStyle = "red";
	context.strokeStyle = "black";

	var hpBarSize = (p.hp / p.maxhp) * ms;
	context.fillRect(sx, sy, hpBarSize, w);
	context.strokeRect(sx, sy, ms, w);
}

function drawUser(user)
{
	context.strokeStyle = context.fillStyle;
	context.font = "10px Monospace";
	context.textAlign = "center";

	context.fillText(user.name, user.player.pos.x + 0.001
			, user.player.pos.y - user.player.radius - 2);

	// draw the player
	context.beginPath();

	context.arc(user.player.pos.x, user.player.pos.y
			, user.player.radius, 0
			, Math.PI * 2);

	context.globalAlpha = 0.1; context.fill();
	context.globalAlpha = 1; context.stroke();

	context.closePath();
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

		mmContext.globalAlpha = 1;
		mmContext.fillStyle = "white";
		mmContext.fillRect(0, 0, minimap.width, minimap.height);

		mmContext.save();
		mmContext.translate(-myself.player.pos.x / minimapScale + minimap.width / 2,
				-myself.player.pos.y / minimapScale + minimap.height / 2);
		mmContext.scale(1 / minimapScale, 1 / minimapScale);

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

		context.fillStyle = "green";
		mmContext.fillStyle = "green";
		for(var i in walls)
		{
			drawWall(walls[i], mmContext, 0.1);
			drawWall(walls[i], context, 1);
		}

		mmContext.fillStyle = "black";
		for(var i in users)
		{
			if(users[i].dead)
				continue;
			mmContext.beginPath();
			mmContext.arc(users[i].player.pos.x, users[i].player.pos.y, 40, 0, Math.PI*2);
			mmContext.fill();
			mmContext.closePath();

			if(i == myself.id) // Change the color and draw the helper line for aiming
			{
				context.fillStyle = "blue";

				context.beginPath();
				context.moveTo(myself.player.pos.x, myself.player.pos.y);
				context.lineTo(Math.cos(rotation) * myself.player.radius + myself.player.pos.x,
						Math.sin(rotation) * myself.player.radius + myself.player.pos.y);
				context.closePath();
				context.stroke();
			}
			else
			{
				context.fillStyle = "red";
			}
			drawUser(users[i]);

			drawHpBar(users[i].player
					, 20
					, users[i].player.pos.x - users[i].player.radius
					, users[i].player.pos.y + users[i].player.radius + 2
					, 3);

		}

		context.restore();
		mmContext.restore();

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
