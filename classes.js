function Vector(x, y)
{
	this.x = x;
	this.y = y;
}

Vector.prototype.multiply = function VectorMultiply (num) {
	this.x *= num;
	this.y *= num;
}

Vector.prototype.add = this.add = function VectorAdd (b) {
	this.x += b.x;
	this.y += b.y;
}

Vector.prototype.len = this.len = function VectorLength() {
	return Math.sqrt(this.x*this.x+this.y*this.y);
}

function Wall(x, y, inerRadius, outerRadius, startAngle, finishAngle)
{
	this.pos = new Vector(x, y);
	this.radius = {iner:inerRadius, outer:outerRadius};
	this.angle = {start:startAngle, finish:finishAngle};
}

function Player(p, n)
{
	this.pos = p; // трябва да е Vector
	this.name = n;
	this.radius = 10;
	this.rotation = 0;
	this.speed = 0;
	this.hp = 100;
	this.maxhp = 100;
	this.d = new Vector(0, 0);
	this.lastEvent = {move: 0, shoot: 0, respawn: 0, killed: 0};
	this.kills = 0;
	this.deads = 0;
}

function Bullet(x, y, r, shr, damage)
{
	this.pos = new Vector(x, y);
	this.rotation = r;
	this.radius = 2;
	this.shooter = shr;
	this.d = new Vector(Math.cos(r), Math.sin(r));
	this.damage = damage;
}

module.exports.Vector = Vector;
module.exports.Wall = Wall;
module.exports.Player = Player;
module.exports.Bullet = Bullet;
