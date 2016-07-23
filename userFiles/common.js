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

var canvas = document.getElementById("mainCanvas");
var context = canvas.getContext("2d");

var minimap = document.getElementById("minimap");
var mmContext = minimap.getContext("2d");
var minimapScale = 20;

var walls = {};
var users = {};
var bullets = {};

var keys = []; // saves the keyboard state
var myself; // reference to the 'current' player
var rotation = 0;

for(var i = 0;i < 200;i ++){keys[i] = false;}

window.addEventListener("keydown", function (args)
{
	setDeviceTouchStatus(false);
    keys[args.keyCode] = true;
}, false);

window.addEventListener("keyup", function (args)
{
	setDeviceTouchStatus(false);
    keys[args.keyCode] = false;
}, false);

function distance(x1, y1, x2, y2)
{
	return Math.sqrt( (x1-x2) * (x1-x2) + (y1-y2) * (y1-y2) );
}

var touchDevice;
function setDeviceTouchStatus(status)
{
	if(touchDevice === status)
		return;

	touchDevice = status;
	reorganizeUI();
}

function handleMouseMove(event)
{
	setDeviceTouchStatus(false);
	if(myself != null)
	{
		var dx = event.clientX - canvas.width / 2;
		var dy = event.clientY - canvas.height / 2;
		var angle = Math.atan2(dy, dx);
		rotation = angle;
	}
}
