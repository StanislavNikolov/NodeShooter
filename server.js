var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

io.set('log level', 1);
server.listen(8080); // setvam si port-a

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

var users = []; // masiv s SOCKET-ite
var nextIndex = 0; // s tova se zadava simpleid-to
var players = []; // vsichki player-i, vsecki socket znae simpleid-to na playera koito predstavlqva
var walls = [];// masiv s stenite
var bullets = [];

walls.push(new Wall(400,400,30,50,0,Math.PI));
walls.push(new Wall(400,300,280,300,0,Math.PI));

//walls.push(new Wall(0,0,200,220,Math.PI,Math.PI*2));

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
	var sid = ++nextIndex;

	socketSet(socket, "simpleid", sid); //vajno e socketa da znae za koi player otgovarq
	socketSet(socket, "logged", true);

	players.push( new Player( new Vector(300, 300), name, sid ) );
	users.push(socket);
}

function removeUser(socket)
{
	var simpleid = socketGet(socket, "simpleid");
	players.splice(indexOf(simpleid), 1);
	for(var i = 0;i < users.length;i ++)
	{
		if(socketGet(users[i], "simpleid") == simpleid)
		{
			users.splice(i, 1);
			return;
		}
	}
}

function sendToAll(type, data)
{
	for(var i = 0;i < users.length;i ++)
		users[i].emit(type, data);
}

io.sockets.on("connection", function (socket) //CQLATA komunikaciq
{
	console.log("Connection from unknown user.");
	socketSet(socket, "logged", false);

	var sid; //simple id-to na player-a i socketa
	var cp; //copy na player-a s tozi socket
	
	socket.on("login", function (data) 
	{
		if(socketGet(socket, "logged") == false) // ako reshi da me spami s "login"-i da ne dobavqm user-i kat poburkan
		{
			addUser(socket, data.name); sid = socketGet(socket, "simpleid");
			console.log("User logged! Name: " + data.name + " with sid: " + sid);
			
			cp = players[indexOf(sid)]; // currentPlayer - tozi ot socketa
			sendToAll("initNewUser", cp);

			//prashtam lognalite se na noviq, no ne se samoprashtam
			for(var i = 0;i < users.length;i ++)
			{
				if(socketGet(users[i], "simpleid") != socketGet(socket, "simpleid"))
				{
					var pts = players[ indexOf( socketGet(users[i], "simpleid") ) ]; //player to send, tozi do koito shte prashtam
					socket.emit("initNewUser", pts );
				}
			}

			for (var i = 0 ; i < walls.length ; i ++)
				socket.emit("initNewWall", walls[i]);

			//prashtam mu negovoto id, za da znae koi ot po-gore poluchenite e toi samiq
			socket.emit("joinGame", {simpleid: socketGet(socket, "simpleid") });
		}
	});

	socket.on("move", function (data)
	{
		if(data.direction == "up")
			cp.speed += 0.3;
		if(data.direction == "down")
			cp.speed -= 0.15;
		if(data.direction == "left")
		{
			cp.rotation -= 0.2;
			sendToAll("newUserLocation", {simpleid: cp.simpleid, rotation: cp.rotation});
		}
		if(data.direction == "right")
		{
			cp.rotation += 0.2;
			sendToAll("newUserLocation", {simpleid: cp.simpleid, rotation: cp.rotation});
		}
	});

	socket.on("shoot", function (data)
	{
		bullets.push(new Bullet(cp.pos.x, cp.pos.y, cp.rotation, cp.simpleid, 1));
		sendToAll("playerShooted", {psimpleid: cp.simpleid, bsimpleid: nextIndex});
	});

	socket.on("disconnect", function (data)
	{
		console.log("Disconnecting user: " + cp.name + " with sid: " + cp.simpleid);
 
		for(var i = 0;i < users.length;i ++)
			users[i].emit("removeUser", {simpleid: cp.simpleid });

		removeUser(socket);
	});
});

function inWall(p)
{
	for (var j = 0 ; j < walls.length ; j ++)
	{
		if (distanceBetween(walls[j].pos,p.pos)<p.radius+walls[j].radius.outer && distanceBetween(walls[j].pos,p.pos)+p.radius>walls[j].radius.iner)
		{
			var angle = Math.acos((walls[j].pos.x-p.pos.x)/distanceBetween(walls[j].pos,p.pos))+(p.pos.y<walls[j].pos.y)*Math.PI;
			if (angle>walls[j].angle.start && angle<walls[j].angle.finish)
			{
				console.log ("distance:",distanceBetween(walls[j].pos,p.pos),walls[j].radius.iner );
				if (distanceBetween(walls[j].pos,p.pos)<walls[j].radius.iner)
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

function movePlayers()
{
	for(var i = 0;i < players.length;i ++)
	{
		if(players[i].speed > 0.1 || players[i].speed < -0.1)
		{	
		
			
			if(inWall(players[i]).index != -1){
				//tuka she ima nqkvi magii
				
				var index = inWall(players[i]).index, objectCollided = inWall(players[i]).partCollided;
				var vx=players[i].d.x,vy=players[i].d.y,tpx=(objectCollided.pos.x-players[i].pos.x),tpy=(objectCollided.pos.y-players[i].pos.y),p,increasement=0;
				var bx = objectCollided.pos.x,by = objectCollided.pos.y, r1 = players[i].radius, r2 = objectCollided.radius, px = players[i].pos.x , py = players[i].pos.y;
				if (!objectCollided.inIner)
				{
					console.log ("outer");
					players[i].pos.x = bx + (px-bx)*(r1+r2)/(distanceBetween({x: px , y:py},{x:bx , y:by}));
					players[i].pos.y = by + (py-by)*(r1+r2)/(distanceBetween({x: px , y:py},{x:bx , y:by}));
				
					/*while(tpx*tpx+tpy*tpy<=(r1+r2)*(r1+r2))
					{
						players[i].pos.x-=0.1*vx;
						players[i].pos.y-=0.1*vy;
						tpx+=0.1*vx;
						tpy+=0.1*vy;
					}*/
				}
				else
				{	
					console.log ("iner");
				
					players[i].pos.x = bx + (px-bx)*(r2-r1)/(distanceBetween({x: px , y:py},{x:bx , y:by}));
					players[i].pos.y = by + (py-by)*(r2-r1)/(distanceBetween({x: px , y:py},{x:bx , y:by}));
					
					/*while(tpx*tpx+tpy*tpy>=(r1+r2)*(r1+r2))
					{
						players[i].pos.x-=0.1*vx;
						players[i].pos.y-=0.1*vy;
						tpx+=0.1*vx;
						tpy+=0.1*vy;
					}*/
				}
					
				p = 2*(vx*tpx+vy*tpy)/(tpx*tpx+tpy*tpy);
				players[i].d.x=(vx-p*tpx);//*(Math.abs(vy*tpx-vx*tpy)/(0.1+0.9*Math.sqrt(vx*vx+vy*vy)*Math.sqrt(tpx*tpx+tpy*tpy)));
				players[i].d.y=(vy-p*tpy);//*(Math.abs(vy*tpx-vx*tpy)/(0.1+0.9*Math.sqrt(vx*vx+vy*vy)*Math.sqrt(tpx*tpx+tpy*tpy)));
				players[i].speed *= 0.8;
					
				if (players[i].d.y<0)
				{
					increasement = Math.PI;
				}
				
				players[i].rotation = Math.acos(players[i].d.x/(distanceBetween({x:0,y:0}, players[i].d)))+increasement;
				
				console.log("p:",p,"dX:",players[i].d.x,"dY:",players[i].d.y,"rotation:",players[i].rotation);
				
			}
			else
				players[i].speed *= 0.97;

			players[i].d.x = Math.cos(players[i].rotation) * players[i].speed;
			players[i].d.y = Math.sin(players[i].rotation) * players[i].speed;

			players[i].pos.x += players[i].d.x;
			players[i].pos.y += players[i].d.y;
			
			sendToAll("newUserLocation", {simpleid: players[i].simpleid, pos: players[i].pos, rotation: players[i].rotation});
		}
	}
}

function moveBullets()
{
	for(var i = 0;i < bullets.length;i ++)
	{
		var collision = false;
		bullets[i].radius -= 0.004;
		bullets[i].pos.x += Math.cos(bullets[i].rotation) * 6;
		bullets[i].pos.y += Math.sin(bullets[i].rotation) * 6;

		for(var j = 0;j < players.length;j ++)
		{
			if(players[j].simpleid != bullets[i].shooter && distanceBetween(bullets[i].pos, players[j].pos) < bullets[i].radius + players[j].radius)
			{

				players[j].radius -= 0.2;
				sendToAll("newUserLocation", {simpleid: players[j].simpleid, radius: players[j].radius});
				collision = true;
			}
		}
		
		sendToAll("newBulletLocation", {simpleid: bullets[i].simpleid, rotation: bullets[i].rotation, pos: bullets[i].pos});

		if(bullets[i].radius <= 0.1 || collision)
		{
			bullets.splice(i, 1);
			i --;
		}else {
			if (inWall(bullets[i]).index!=-1){
				bullets[i].rotation+=Math.PI;	
			}
		}
	}
}


setInterval(movePlayers, 20);
setInterval(moveBullets, 20);

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
}

function Wall(x, y, inerRadius, outerRadius, startAngle, finishAngle)
{
	this.pos = new Vector(x, y);
	this.radius = {iner:inerRadius, outer:outerRadius};
	this.angle = {start:startAngle, finish:finishAngle};
}

function Player(p, n, sid)
{
	this.pos = p;
	this.name = n;
	this.simpleid = sid;
	this.radius = 10;
	this.rotation = 0;
	this.speed = 0;
	this.d = new Vector(0, 0);
}

function Bullet(x, y, r, shr, damage)
{
	this.pos = new Vector(x, y);
	this.rotation = r;
	this.radius = 2;
	this.simpleid = ++ nextIndex;
	this.shooter = shr;
	this.damage = damage;
}