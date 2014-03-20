var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , fs = require('fs');//File System

io.set('log level', 1);
var port = Number(process.env.PORT || 5000);
server.listen(port);

app.get('/', function (req, res)
{
	res.sendfile(__dirname + '/index.html');
});
app.get('/client.js', function (req, res)
{
	res.sendfile(__dirname + '/client.js');
});
app.get('/game.js', function (req, res)
{
	res.sendfile(__dirname + '/game.js');
});

function writeFile(filename, data)
{

}

var players = {}; //map s vsichki player-i
var walls = [];// masiv s stenite
var bullets = []; // masiv s kurshumite
var frame = 0;

walls.push(new Wall(150,300,130,160,Math.PI*0.5,Math.PI*1.5));
walls.push(new Wall(650,300,130,160,Math.PI*1.5,Math.PI*2.5));
walls.push(new Wall(400,50,130,160,Math.PI,Math.PI*2));
walls.push(new Wall(400,550,130,160,0,Math.PI));
walls.push(new Wall(400,300,570,600,0,Math.PI*2));

function generateSid()
{
	return Math.random().toString(36).substring(7);
}

function socketGet(socket, item)
{
	var output;
	socket.get(item, function (err, o) {output = o;});
	return output;
}

function socketSet(socket, item, data)
{
	socket.set(item, data, function () {} );
}

function addUser(socket, name)
{
	var sid = generateSid();
	socket.vars.logged = true;
	socket.vars.sid = sid;

	players[sid] = {};
	players[sid].socket = socket;
	players[sid].player = new Player( new Vector(400, 300), name );

	return sid;
}

function removeUser(socket)
{
	delete players[socket.vars.sid];
}

function sendToAll(type, data, sendFrame)
{
	if(sendFrame == undefined || sendFrame == true)
		data.frame = frame;
	for(var i in players)
		players[i].socket.emit(type, data);
}

io.sockets.on("connection", function (socket) //CQLATA komunikaciq
{
	/*

	players = {}
		* .player = new Player()
		* .socket = socket ------------^ Референция към този сокет

	*/

	socket.vars = {};
	socket.vars.logged = false;
	var cp, mysid;
	
	socket.on("login", function (data)
	{
		if(!socket.vars.logged) // Ако изпрати няколко логин-а, го слагам само първия път
		{
			mysid = addUser(socket, data.name);
			cp = players[ mysid ].player; // currentPlayer - референция към players[mysid].player

			console.log("User logged! Name: " + data.name + " with sid: " + mysid);
			
			sendToAll("initNewPlayer", {sid: mysid, player: cp}, false); // пращам на всички информацията за играча, без .socket

			//пращам на новия всички останали, но без него самия защото той вече се има
			for(var i in players)
			{
				if(i != mysid)
				{
					socket.emit("initNewPlayer", {sid: i, player: players[i].player}, false);
				}
			}

			for (var i = 0 ; i < walls.length ; i ++)
				socket.emit("initNewWall", walls[i]); // може да се замести с players[mysid].socket.emit("init..., но няма смисъл

			for (var i = 0 ; i < bullets.length ; i ++)
				socket.emit("initNewBullet", {sid: bullets[i].simpleid, pos: bullets[i].pos, rotation: bullets[i].rotation});

			//казвам му кой по-точно е той съмия
			socket.emit("joinGame", {sid: mysid });
		}
	});

	socket.on("move", function (data)
	{
		if(players[mysid].socket.vars.logged)
		{
			if(data.direction == "up")
				cp.speed += 0.3;
			if(data.direction == "down")
				cp.speed *= 0.8;
			if(data.direction == "left")
			{
				cp.rotation -= 0.2;
				sendToAll("updatePlayerInformation", {sid: mysid, rotation: cp.rotation});
			}
			if(data.direction == "right")
			{
				cp.rotation += 0.2;
				sendToAll("updatePlayerInformation", {sid: mysid, rotation: cp.rotation});
			}
		}
	});

	socket.on("shoot", function (data)
	{
		if(!cp.dead && (new Date()).getTime() - cp.lastShootTime > 400)
		{
			//bullets.push(new Bullet(cp.pos.x, cp.pos.y, cp.rotation, cp.simpleid, 20));
			//sendToAll("playerShooted", {psimpleid: cp.simpleid, bsimpleid: nextIndex});
			//cp.lastShootTime = (new Date()).getTime();
		}
	});

	socket.on("disconnect", function (data)
	{
		console.log("Received disconnect event!");

		if(socket.vars.logged)
		{
			console.log("Disconnecting user with sid: " + socket.vars.sid);
			sendToAll("removeUser", {simpleid: socket.vars.sid }, false);
		}

		removeUser(socket);
	});
});

function inWall(p)
{
	for (var j = 0 ; j < walls.length ; j ++)
	{
		if (distanceBetween(walls[j].pos,p.pos)<p.radius+walls[j].radius.outer && distanceBetween(walls[j].pos,p.pos)+p.radius>walls[j].radius.iner)
		{
			
			var angle;
			
			if (p.pos.y-walls[j].pos.y>0)
			{
				angle = Math.acos((p.pos.x-walls[j].pos.x)/distanceBetween(walls[j].pos,p.pos));
			}
			else 
			{
				angle = 2*Math.PI - Math.acos((p.pos.x-walls[j].pos.x)/distanceBetween(walls[j].pos,p.pos));
			}
			
			if ((angle>walls[j].angle.start && angle<walls[j].angle.finish) || 
							(walls[j].angle.finish>2*Math.PI && angle+2*Math.PI>walls[j].angle.start && angle+2*Math.PI<walls[j].angle.finish)  )
			{
				if (distanceBetween(walls[j].pos,p.pos)<(walls[j].radius.iner+walls[j].radius.outer)/2)
					return {index: j, partCollided: {pos: walls[j].pos, radius: walls[j].radius.iner, inIner: 1}};
				else 
					return {index: j, partCollided: {pos: walls[j].pos, radius: walls[j].radius.outer, inIner: 0}};
				
			}
			else 
			{	
				var center1 = new Vector(walls[j].pos.x+(Math.cos(walls[j].angle.finish)*(Math.abs(walls[j].radius.outer-walls[j].radius.iner)/2+walls[j].radius.iner)),
					walls[j].pos.y+Math.sin(walls[j].angle.finish)*(Math.abs(walls[j].radius.outer-walls[j].radius.iner)/2+walls[j].radius.iner));
				var center2 = new Vector(walls[j].pos.x+(Math.cos(walls[j].angle.start)*(Math.abs(walls[j].radius.outer-walls[j].radius.iner)/2+walls[j].radius.iner)),
				walls[j].pos.y+Math.sin(walls[j].angle.start)*(Math.abs(walls[j].radius.outer-walls[j].radius.iner)/2+walls[j].radius.iner));
				
				var col1 = distanceBetween(p.pos,center1)<p.radius+Math.abs(walls[j].radius.outer-walls[j].radius.iner)/2;
				var col2 = distanceBetween(p.pos,center2)<p.radius+Math.abs(walls[j].radius.outer-walls[j].radius.iner)/2;
			
				if (col1)
					return {index: j, partCollided:{pos: center1, radius: Math.abs(walls[j].radius.outer-walls[j].radius.iner)/2, inIner: 0}};
				if (col2)
					return {index: j, partCollided:{pos: center2, radius: Math.abs(walls[j].radius.outer-walls[j].radius.iner)/2, inIner: 0}};
			}
		}
	}
	return {index: -1};
}

function putOutOf(o1,o2,distance)
{
	o1.pos.x = o2.pos.x + (o1.pos.x-o2.pos.x)*distance/(distanceBetween(o1.pos,o2.pos));
	o1.pos.y = o2.pos.y + (o1.pos.y-o2.pos.y)*distance/(distanceBetween(o1.pos,o2.pos));
}

function findNewAngle (p,w)
{
	var vx=p.d.x,vy=p.d.y,tpx=(w.pos.x-p.pos.x),tpy=(w.pos.y-p.pos.y),p;
	var bx = w.pos.x,by = w.pos.y, px = p.pos.x , py = p.pos.y;

	p = 2*(vx*tpx+vy*tpy)/(tpx*tpx+tpy*tpy);
	vx=(vx-p*tpx);//
	vy=(vy-p*tpy);//*(Math.abs(vy*tpx-vx*tpy)/(0.1+0.9*Math.sqrt(vx*vx+vy*vy)*Math.sqrt(tpx*tpx+tpy*tpy)));
	if (vy>0)
	{
		return Math.acos(vx/(Math.sqrt(vx*vx+vy*vy)));
	}
	else 
	{
		return Math.PI*2-Math.acos(vx/(Math.sqrt(vx*vx+vy*vy)));
	}		
}

function movePlayers()
{
	for(var i = 0;i < players.length;i ++)
	{
		if( (players[i].speed > 0.01 || players[i].speed < -0.01) && !players[i].dead)
		{	
		
			if(inWall(players[i]).index != -1){
				//tuka she ima nqkvi magii
				
				var index = inWall(players[i]).index, objectCollided = inWall(players[i]).partCollided,r1 = players[i].radius + 1, r2 = objectCollided.radius;
				
				if (!objectCollided.inIner)
					putOutOf(players[i],objectCollided,r1+r2);
				else
					putOutOf(players[i],objectCollided,r2-r1);
					
				players[i].speed *= 0.8;
				players[i].rotation = findNewAngle(players[i],objectCollided);
				
			}
			else
				players[i].speed *= 0.97;

			players[i].d.x = Math.cos(players[i].rotation) * players[i].speed;
			players[i].d.y = Math.sin(players[i].rotation) * players[i].speed;

			players[i].pos.x += players[i].d.x;
			players[i].pos.y += players[i].d.y;
			
			sendToAll("updateUserInformation", {simpleid: players[i].simpleid, pos: players[i].pos, rotation: players[i].rotation});
		}
	}
}

function moveBullets()
{
	for(var i = 0;i < bullets.length;i ++)
	{
		var collision = false;
		bullets[i].radius -= 0.004;
		bullets[i].d.x = Math.cos(bullets[i].rotation) * 6;
		bullets[i].d.y = Math.sin(bullets[i].rotation) * 6;
		bullets[i].pos.x += bullets[i].d.x;
		bullets[i].pos.y += bullets[i].d.y;

		for(var j = 0;j < players.length;j ++)
		{
			if(players[j].simpleid != bullets[i].shooter && !players[j].dead && distanceBetween(bullets[i].pos, players[j].pos) < bullets[i].radius + players[j].radius)
			{
				if((new Date()).getTime() - players[j].speTime > 5000)
				{
					players[j].radius -= 0.2;
					players[j].hp -= bullets[i].damage;
				}

				if(players[j].hp > 0)
					sendToAll("updateUserInformation", {simpleid: players[j].simpleid, radius: players[j].radius, hp: players[j].hp});
				if(players[j].hp <= 0)
				{
					sendToAll("updateUserInformation", {simpleid: players[j].simpleid, dead: true});
					players[j].dead = true;
					players[j].speTime = (new Date()).getTime();
				}

				collision = true;
			}
		}
		
		sendToAll("updateBulletInformation", {simpleid: bullets[i].simpleid, rotation: bullets[i].rotation, pos: bullets[i].pos, radius: bullets[i].radius});

		if(bullets[i].radius <= 0.5 || collision)
		{
			sendToAll("removeBullet", {simpleid: bullets[i].simpleid});
			bullets.splice(i, 1);
			i --;
		}else {
			if (inWall(bullets[i]).index!=-1){
				
				var index = inWall(bullets[i]).index, objectCollided = inWall(bullets[i]).partCollided,r1 = bullets[i].radius + 1, r2 = objectCollided.radius;
				
				if (!objectCollided.inIner)
					putOutOf(bullets[i],objectCollided,r1+r2);
				else
					putOutOf(bullets[i],objectCollided,r2-r1);
					
				bullets[i].rotation = findNewAngle(bullets[i],objectCollided);
			
			}
		}
	}
}

function respawnPlayers()
{
	for(var i = 0;i < players.length; i ++)
	{
		if(players[i].dead && (new Date).getTime() - players[i].speTime > 5000)
		{
			sendToAll("updateUserInformation", {simpleid: players[i].simpleid, dead: false, pos: new Vector(400, 300), radius: 10, speed: 0, hp: 100});
			players[i].pos = new Vector(400, 300);
			players[i].hp = 100;
			players[i].radius = 10;
			players[i].speed = 0;
			players[i].dead = false;
			players[i].speTime = (new Date()).getTime();
		}
	}
}

setInterval(movePlayers, 20);
setInterval(moveBullets, 20);
setInterval(respawnPlayers, 1000);

function distanceBetween(one, two)
{
    var alpha = one.x - two.x;
    var beta = one.y - two.y;
    return Math.sqrt((alpha*alpha)+(beta*beta));
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

function Vector(x, y)
{
	this.x = x;
	this.y = y;
	this.multiply = function VectorMultiply (num) {
		this.x *= num;
		this.y *= num;
	}
	this.add = function VectorAdd (b) {
		this.x += b.x;
		this.y += b.y;
	}
	this.len = function VectorLength() {
		return Math.sqrt(this.x*this.x+this.y*this.y);
	}
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
	this.speTime = (new Date().getTime()); //special event time (kill time, respawn time, etc)
	this.lastShootTime = 0;
}

function Bullet(x, y, r, shr, damage)
{
	this.pos = new Vector(x, y);
	this.rotation = r;
	this.radius = 2;
	this.simpleid = ++ nextIndex;
	this.shooter = shr;
	this.d = new Vector(Math.cos(r),Math.sin(r));
	this.damage = damage;
}

setInterval(function nextFrame() {frame ++;}, 20);