var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

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

walls.push(new Wall(400,400,30,50,Math.PI,Math.PI*2));

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

	players.push( new Player( new Vector(10, 10), name, sid ) );
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
			
			cp = players[indexOf(sid)]; // walls[j]Player - tozi ot socketa
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
			cp.d.y -= 0.2;

		if(data.direction == "down")
			cp.d.y += 0.2;

		if(data.direction == "left")
			cp.d.x -= 0.2;
		
		if(data.direction == "right")
			cp.d.x += 0.2;
		
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
				return {index: j};
			else 
			{	
				var center1 = new Vector(walls[j].pos.x+(Math.cos(walls[j].angle.finish)*(Math.abs(walls[j].radius.outer-walls[j].radius.iner)/2+walls[j].radius.iner)),
					walls[j].pos.y+Math.sin(walls[j].angle.finish)*(Math.abs(walls[j].radius.outer-walls[j].radius.iner)/2+walls[j].radius.iner));
				var center2 = new Vector(walls[j].pos.x+(Math.cos(walls[j].angle.start)*(Math.abs(walls[j].radius.outer-walls[j].radius.iner)/2+walls[j].radius.iner)),
				walls[j].pos.y+Math.sin(walls[j].angle.start)*(Math.abs(walls[j].radius.outer-walls[j].radius.iner)/2+walls[j].radius.iner));
				
				var col1 = distanceBetween(p.pos,center1)<p.radius+Math.abs(walls[j].radius.outer-walls[j].radius.iner)/2;
				var col2 = distanceBetween(p.pos,center2)<p.radius+Math.abs(walls[j].radius.outer-walls[j].radius.iner)/2;
			
				if (col1 || col2)
					return {index: j};
			}
		}
	}
	return {index: -1};
}

function movePlayers()
{
	for(var i = 0;i < players.length;i ++)
	{
		if(players[i].d.x > 0.1 || players[i].d.x < -0.1 || players[i].d.y > 0.1 || players[i].d.y < -0.1)
		{	
			if(inWall(players[i]).index != -1)
			{
				players[i].d.x = -players[i].d.x;
				players[i].d.y = -players[i].d.y;
			}
			else
			{
				players[i].d.x *= 0.97; players[i].d.y *= 0.97;
			}

			players[i].pos.x += players[i].d.x;
			players[i].pos.y += players[i].d.y;
			
			sendToAll("newUserLocation", {simpleid: players[i].simpleid, pos: players[i].pos});
		}
	}
}

setInterval(movePlayers, 20);

function distanceBetween(one, two)
{
    var alpha = one.x - two.x;
    var beta = one.y - two.y;
    return Math.sqrt((alpha*alpha)+(beta*beta));
}

function indexOf(simpleid) // pprosto e - kazvam i simpleid, a tq(funkciqta) na koi index ot masiva players otgovarq
{
	for(var i = 0;i < players.length;i ++)
	{
		if(players[i].simpleid == simpleid)
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
	this.d = new Vector(0, 0);
}