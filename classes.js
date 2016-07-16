function Vector(x, y)
{
	this.x = x;
	this.y = y;
}

Vector.prototype.mul = function VectorMultiply(num) {
	this.x *= num;
	this.y *= num;
}

Vector.prototype.add = this.add = function VectorAdd(other) {
	this.x += other.x;
	this.y += other.y;
}

Vector.prototype.len = this.len = function VectorLength() {
	return Math.sqrt(this.x*this.x + this.y*this.y);
}

function Wall(x, y, innerRadius, outerRadius, startAngle, finishAngle)
{
	this.pos = new Vector(x, y);
	this.radius = {inner:innerRadius, outer:outerRadius};
	this.angle = {start:startAngle, finish:finishAngle};
	this.events = {rotationOnHit: 0};
}

function Player(p) // The part of the "user" that's used by the simulation
{
	this.pos = p; // must be Vector
	this.radius = 10;
	this.speed = 0;
	this.hp = 100;
	this.maxhp = 100;
	this.d = new Vector(0, 0);
	this.direction = 1;
}

function User(socket, name, id)
{
	this.socket = socket;
	this.name = name;
	this.id = id;
	this.kills = 0;
	this.deaths = 0;
	this.dead = false;
	this.lastEvent = {shoot: 0, killed: 0, respawn: 0};

	this.player = new Player(new Vector(0, 0));
}

function Bullet(x, y, r, shr, damage)
{
	this.pos = new Vector(x, y);
	this.rotation = r;
	this.radius = 4;
	this.shooter = shr;
	this.d = new Vector(Math.cos(r), Math.sin(r));
	this.damage = damage;
}

module.exports.Vector = Vector;
module.exports.Wall = Wall;
module.exports.Player = Player;
module.exports.User = User;
module.exports.Bullet = Bullet;
