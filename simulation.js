// shortcuts
var users = global.users;
var walls = global.walls;
var bullets = global.bullets; 
var frame = global.frame;
var sendToAll = global.sendToAll;
var generateSid = global.generateSid;

var classes = require('./classes.js');

var type = 2;
if(type == 0)
{
	walls[generateID()] = new classes.Wall(150,300,130,160,Math.PI*0.5,Math.PI*1.5);
	walls[generateID()] = new classes.Wall(650,300,130,160,Math.PI*1.5,Math.PI*2.5);
	walls[generateID()] = new classes.Wall(400,50,130,160,Math.PI,Math.PI*2);
	walls[generateID()] = new classes.Wall(400,550,130,160,0,Math.PI);
	walls[generateID()] = new classes.Wall(400,300,570,600,0,Math.PI*2);

} else if(type == 1)
{
	for ( var i = 0 ; i < Math.PI*2 ; i += Math.PI*2/5 )
		walls[generateID()] = new classes.Wall(400,300,570,600,i,0.6+i);
	for ( var i = 0 ; i < Math.PI*2 ; i += Math.PI*2/5 )
	{
		var angle = i - Math.PI/10 - 0.01;
		walls[generateID()] = new classes.Wall(400 + Math.cos( angle )*(570/2 + 300),
				300 + Math.sin( angle )*(570/2 + 300),
				170, 190, 0, 2*Math.PI);
	}
	walls[generateID()] = new classes.Wall( 400, 300 , 170,290,0,Math.PI);
} else if(type == 2)
{
	generateRandomMap(25);
}

function isFree(x, y, r)
{
	for(var i in walls)
	{
		if(distanceBetween({x: x, y: y}, walls[i].pos) < walls[i].radius.outer + r)
		{
			return false;
		}

	}
	return true;
}

function generateRandomMap(sp)
{
	var wallsCount = 0;
	for(var i = 0;i < 100000 && wallsCount < sp;i ++)
	{
		var r1 = Math.random() * 200 + 40; var r2 = r1 + Math.random() * 10 + 20;
		var a1 = Math.random() * Math.PI * 2; var a2 = a1 + Math.random() * Math.PI * 2;
		var x = Math.random() * 1000 - 500; var y = Math.random() * 1000 - 500;
var ang = a2 - a1; 
		if(ang < Math.PI / 180 * 90 || (ang > Math.PI / 180 * 300 && ang < Math.PI / 180 * 360) || !isFree(x, y, r2)) {if(i < 29){i --;}continue;}
		walls[generateID()] = new classes.Wall(x, y, r1, r2, a1, a2);
		wallsCount ++;
	}

	walls[generateID()] = new classes.Wall(0, 0, 800, 840, 0, Math.PI * 2);
}


function inWall(p)
{
	for (var j in walls)
	{
		if (distanceBetween(walls[j].pos,p.pos)<p.radius+walls[j].radius.outer && distanceBetween(walls[j].pos,p.pos)+p.radius>walls[j].radius.inner)
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
				if (distanceBetween(walls[j].pos,p.pos)<(walls[j].radius.inner+walls[j].radius.outer)/2)
					return {index: j, partCollided: {pos: walls[j].pos, radius: walls[j].radius.inner, inIner: 1}};
				else 
					return {index: j, partCollided: {pos: walls[j].pos, radius: walls[j].radius.outer, inIner: 0}};
				
			}
			else 
			{	
				var center1 = new classes.Vector(walls[j].pos.x+(Math.cos(walls[j].angle.finish)*(Math.abs(walls[j].radius.outer-walls[j].radius.inner)/2+walls[j].radius.inner)),
					walls[j].pos.y+Math.sin(walls[j].angle.finish)*(Math.abs(walls[j].radius.outer-walls[j].radius.inner)/2+walls[j].radius.inner));
				var center2 = new classes.Vector(walls[j].pos.x+(Math.cos(walls[j].angle.start)*(Math.abs(walls[j].radius.outer-walls[j].radius.inner)/2+walls[j].radius.inner)),
				walls[j].pos.y+Math.sin(walls[j].angle.start)*(Math.abs(walls[j].radius.outer-walls[j].radius.inner)/2+walls[j].radius.inner));
				
				var col1 = distanceBetween(p.pos,center1)<p.radius+Math.abs(walls[j].radius.outer-walls[j].radius.inner)/2;
				var col2 = distanceBetween(p.pos,center2)<p.radius+Math.abs(walls[j].radius.outer-walls[j].radius.inner)/2;
			
				if (col1)
					return {index: j, partCollided:{pos: center1, radius: Math.abs(walls[j].radius.outer-walls[j].radius.inner)/2, inIner: 0}};
				if (col2)
					return {index: j, partCollided:{pos: center2, radius: Math.abs(walls[j].radius.outer-walls[j].radius.inner)/2, inIner: 0}};
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
	for(var i in users)
	{
		if( (users[i].player.speed > 0.01 || users[i].player.speed < -0.01) && !users[i].player.dead)
		{	
			var iw = inWall(users[i].player);// За да не се смята отново и отново
			if(iw.index != -1){
				var index = iw.index, objectCollided = iw.partCollided,r1 = users[i].player.radius + 1, r2 = objectCollided.radius;

				if (!objectCollided.inIner)
					putOutOf(users[i].player,objectCollided,r1+r2);
				else
					putOutOf(users[i].player,objectCollided,r2-r1);
					
				users[i].player.speed *= 0.8;
				users[i].player.rotation = findNewAngle(users[i].player,objectCollided);
				
			}
			else
				users[i].player.speed *= 0.97;

			users[i].player.d.x *= 0.2;
			users[i].player.d.y *= 0.2;

			users[i].player.d.x += Math.cos(users[i].player.rotation) * users[i].player.speed;
			users[i].player.d.y += Math.sin(users[i].player.rotation) * users[i].player.speed;

			users[i].player.pos.x += users[i].player.d.x;
			users[i].player.pos.y += users[i].player.d.y;
			
			//console.log("asd");
			sendToAll("updatePlayerInformation", {sid: i, pos: users[i].player.pos, rotation: users[i].player.rotation});
		}
	}
}

function movebullets()
{
	for(var i in bullets)
	{
		var collision = false;
		bullets[i].radius -= 0.02;
		bullets[i].d.x = Math.cos(bullets[i].rotation) * 10;
		bullets[i].d.y = Math.sin(bullets[i].rotation) * 10;
		bullets[i].pos.x += bullets[i].d.x;
		bullets[i].pos.y += bullets[i].d.y;

		for(var j in users)
		{
			var cp = users[j].player;
			if(j != bullets[i].shooter && !cp.dead && distanceBetween(bullets[i].pos, cp.pos) < bullets[i].radius + cp.radius)
			{
				if((new Date()).getTime() - cp.lastEvent.respawn > 5000)
				{
					cp.hp -= bullets[i].damage;
				}

				if(cp.hp > 0)
				{
					sendToAll("updatePlayerInformation", {sid: j, hp: cp.hp});
				}

				if(cp.hp <= 0)
				{
					sendToAll("updatePlayerInformation", {sid: j, dead: true});
					cp.dead = true;
					cp.lastEvent.killed = (new Date()).getTime();

					cp.deads ++;
					sendToAll("updateScoreBoard", {sid: j, value: cp.deads, y: 2});

					var scndp = users[bullets[i].shooter].player; scndp.kills ++;
					sendToAll("updateScoreBoard", {sid: bullets[i].shooter, value: scndp.kills, y: 1});
					sendToAll("addMessage", {message: (scndp.name + " killed " + cp.name) });
				}

				collision = true;
			}
		}	
		
		if(bullets[i].radius <= 0.5 || collision)
		{
			sendToAll("removeBullet", {sid: i});
			delete bullets[i];
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

function respawnusers()
{
	for(var i in users)
	{
		if(users[i].player.dead && (new Date).getTime() - users[i].player.lastEvent.killed > 5000)
		{
			sendToAll("updatePlayerInformation", {sid: i, dead: false, pos: new classes.Vector(400, 300), radius: 10, speed: 0, hp: 100});
			users[i].player.pos = new classes.Vector(400, 300);
			users[i].player.hp = 100;
			users[i].player.radius = 10;
			users[i].player.speed = 0;
			users[i].player.dead = false;
			users[i].player.lastEvent.respawn = (new Date()).getTime();
		}
	}
}

setInterval(movePlayers, 20);
setInterval(movebullets, 20);
setInterval(respawnusers, 1000);

function distanceBetween(one, two)
{
    var alpha = one.x - two.x;
    var beta = one.y - two.y;
    return Math.sqrt((alpha*alpha)+(beta*beta));
}

function sync()
{
	for(var i in bullets)
	{
		sendToAll("updateBulletInformation", {sid: i,
			rotation: bullets[i].rotation,
			pos: bullets[i].pos,
			radius: bullets[i].radius});
	}
}

setInterval(sync, 10000);
