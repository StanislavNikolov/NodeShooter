/*
Коментирал съм редовете които викат moveusers, movebullets, respawnusers.
Може да ги откоментираш като щеш.
*/

var users = global.users;
var walls = global.walls;
var bullets = global.bullets; 
var frame = global.frame;
var sendToAll = global.sendToAll;

var classes = require('./classes.js');

walls.push(new classes.Wall(150,300,130,160,Math.PI*0.5,Math.PI*1.5));
walls.push(new classes.Wall(650,300,130,160,Math.PI*1.5,Math.PI*2.5));
walls.push(new classes.Wall(400,50,130,160,Math.PI,Math.PI*2));
walls.push(new classes.Wall(400,550,130,160,0,Math.PI));
walls.push(new classes.Wall(400,300,570,600,0,Math.PI*2));

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
				var center1 = new classes.Vector(walls[j].pos.x+(Math.cos(walls[j].angle.finish)*(Math.abs(walls[j].radius.outer-walls[j].radius.iner)/2+walls[j].radius.iner)),
					walls[j].pos.y+Math.sin(walls[j].angle.finish)*(Math.abs(walls[j].radius.outer-walls[j].radius.iner)/2+walls[j].radius.iner));
				var center2 = new classes.Vector(walls[j].pos.x+(Math.cos(walls[j].angle.start)*(Math.abs(walls[j].radius.outer-walls[j].radius.iner)/2+walls[j].radius.iner)),
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

			users[i].player.d.x = Math.cos(users[i].player.rotation) * users[i].player.speed;
			users[i].player.d.y = Math.sin(users[i].player.rotation) * users[i].player.speed;

			users[i].player.pos.x += users[i].player.d.x;
			users[i].player.pos.y += users[i].player.d.y;
			
			console.log("asd");
			sendToAll("updatePlayerInformation", {sid: users[i].socket.vars.sid, pos: users[i].player.pos, rotation: users[i].player.rotation});
		}
	}
}

function movebullets()
{
	for(var i = 0;i < bullets.length;i ++)
	{
		var collision = false;
		bullets[i].radius -= 0.004;
		bullets[i].d.x = Math.cos(bullets[i].rotation) * 6;
		bullets[i].d.y = Math.sin(bullets[i].rotation) * 6;
		bullets[i].pos.x += bullets[i].d.x;
		bullets[i].pos.y += bullets[i].d.y;

		for(var j = 0;j < users.length;j ++)
		{
			if(users[j].simpleid != bullets[i].shooter && !users[j].dead && distanceBetween(bullets[i].pos, users[j].pos) < bullets[i].radius + users[j].radius)
			{
				if((new Date()).getTime() - users[j].speTime > 5000)
				{
					users[j].radius -= 0.2;
					users[j].hp -= bullets[i].damage;
				}

				if(users[j].hp > 0)
					sendToAll("updatePlayerInformtion", {simpleid: users[j].simpleid, radius: users[j].radius, hp: users[j].hp});
				if(users[j].hp <= 0)
				{
					sendToAll("updatePlayerInformtion", {simpleid: users[j].simpleid, dead: true});
					users[j].dead = true;
					users[j].speTime = (new Date()).getTime();
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

function respawnusers()
{
	for(var i = 0;i < users.length; i ++)
	{
		if(users[i].dead && (new Date).getTime() - users[i].speTime > 5000)
		{
			sendToAll("updatePlayerInformtion", {simpleid: users[i].simpleid, dead: false, pos: new classes.Vector(400, 300), radius: 10, speed: 0, hp: 100});
			users[i].pos = new classes.Vector(400, 300);
			users[i].hp = 100;
			users[i].radius = 10;
			users[i].speed = 0;
			users[i].dead = false;
			users[i].speTime = (new Date()).getTime();
		}
	}
}

setInterval(movePlayers, 20);
//setInterval(movebullets, 20);
//setInterval(respawnusers, 1000);

function distanceBetween(one, two)
{
    var alpha = one.x - two.x;
    var beta = one.y - two.y;
    return Math.sqrt((alpha*alpha)+(beta*beta));
}

