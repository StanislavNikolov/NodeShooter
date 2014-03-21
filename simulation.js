/*
Коментирал съм редовете които викат moveg.users, moveg.bullets, respawng.users.
Може да ги откоментираш като щеш.
*/

var g = global;
var classes = require('./classes.js');

g.walls.push(new classes.Wall(150,300,130,160,Math.PI*0.5,Math.PI*1.5));
g.walls.push(new classes.Wall(650,300,130,160,Math.PI*1.5,Math.PI*2.5));
g.walls.push(new classes.Wall(400,50,130,160,Math.PI,Math.PI*2));
g.walls.push(new classes.Wall(400,550,130,160,0,Math.PI));
g.walls.push(new classes.Wall(400,300,570,600,0,Math.PI*2));

function inWall(p)
{
	for (var j = 0 ; j < g.walls.length ; j ++)
	{
		if (distanceBetween(g.walls[j].pos,p.pos)<p.radius+g.walls[j].radius.outer && distanceBetween(g.walls[j].pos,p.pos)+p.radius>g.walls[j].radius.iner)
		{
			
			var angle;
			
			if (p.pos.y-g.walls[j].pos.y>0)
			{
				angle = Math.acos((p.pos.x-g.walls[j].pos.x)/distanceBetween(g.walls[j].pos,p.pos));
			}
			else 
			{
				angle = 2*Math.PI - Math.acos((p.pos.x-g.walls[j].pos.x)/distanceBetween(g.walls[j].pos,p.pos));
			}
			
			if ((angle>g.walls[j].angle.start && angle<g.walls[j].angle.finish) || 
							(g.walls[j].angle.finish>2*Math.PI && angle+2*Math.PI>g.walls[j].angle.start && angle+2*Math.PI<g.walls[j].angle.finish)  )
			{
				if (distanceBetween(g.walls[j].pos,p.pos)<(g.walls[j].radius.iner+g.walls[j].radius.outer)/2)
					return {index: j, partCollided: {pos: g.walls[j].pos, radius: g.walls[j].radius.iner, inIner: 1}};
				else 
					return {index: j, partCollided: {pos: g.walls[j].pos, radius: g.walls[j].radius.outer, inIner: 0}};
				
			}
			else 
			{	
				var center1 = new Vector(g.walls[j].pos.x+(Math.cos(g.walls[j].angle.finish)*(Math.abs(g.walls[j].radius.outer-g.walls[j].radius.iner)/2+g.walls[j].radius.iner)),
					g.walls[j].pos.y+Math.sin(g.walls[j].angle.finish)*(Math.abs(g.walls[j].radius.outer-g.walls[j].radius.iner)/2+g.walls[j].radius.iner));
				var center2 = new Vector(g.walls[j].pos.x+(Math.cos(g.walls[j].angle.start)*(Math.abs(g.walls[j].radius.outer-g.walls[j].radius.iner)/2+g.walls[j].radiuwwws.iner)),
				g.walls[j].pos.y+Math.sin(g.walls[j].angle.start)*(Math.abs(g.walls[j].radius.outer-g.walls[j].radius.iner)/2+g.walls[j].radius.iner));
				
				var col1 = distanceBetween(p.pos,center1)<p.radius+Math.abs(g.walls[j].radius.outer-g.walls[j].radius.iner)/2;
				var col2 = distanceBetween(p.pos,center2)<p.radius+Math.abs(g.walls[j].radius.outer-g.walls[j].radius.iner)/2;
			
				if (col1)
					return {index: j, partCollided:{pos: center1, radius: Math.abs(g.walls[j].radius.outer-g.walls[j].radius.iner)/2, inIner: 0}};
				if (col2)
					return {index: j, partCollided:{pos: center2, radius: Math.abs(g.walls[j].radius.outer-g.walls[j].radius.iner)/2, inIner: 0}};
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

function moveusers()
{
	for(var i = 0;i < g.users.length;i ++)
	{
		if( (g.users[i].speed > 0.01 || g.users[i].speed < -0.01) && !g.users[i].dead)
		{	
		
			if(inWall(g.users[i]).index != -1){
				//tuka she ima nqkvi magii
				
				var index = inWall(g.users[i]).index, objectCollided = inWall(g.users[i]).partCollided,r1 = g.users[i].radius + 1, r2 = objectCollided.radius;
				
				if (!objectCollided.inIner)
					putOutOf(g.users[i],objectCollided,r1+r2);
				else
					putOutOf(g.users[i],objectCollided,r2-r1);
					
				g.users[i].speed *= 0.8;
				g.users[i].rotation = findNewAngle(g.users[i],objectCollided);
				
			}
			else
				g.users[i].speed *= 0.97;

			g.users[i].d.x = Math.cos(g.users[i].rotation) * g.users[i].speed;
			g.users[i].d.y = Math.sin(g.users[i].rotation) * g.users[i].speed;

			g.users[i].pos.x += g.users[i].d.x;
			g.users[i].pos.y += g.users[i].d.y;
			
			sendToAll("updateUserInformation", {simpleid: g.users[i].simpleid, pos: g.users[i].pos, rotation: g.users[i].rotation});
		}
	}
}

function movebullets()
{
	for(var i = 0;i < g.bullets.length;i ++)
	{
		var collision = false;
		g.bullets[i].radius -= 0.004;
		g.bullets[i].d.x = Math.cos(g.bullets[i].rotation) * 6;
		g.bullets[i].d.y = Math.sin(g.bullets[i].rotation) * 6;
		g.bullets[i].pos.x += g.bullets[i].d.x;
		g.bullets[i].pos.y += g.bullets[i].d.y;

		for(var j = 0;j < g.users.length;j ++)
		{
			if(g.users[j].simpleid != g.bullets[i].shooter && !g.users[j].dead && distanceBetween(g.bullets[i].pos, g.users[j].pos) < g.bullets[i].radius + g.users[j].radius)
			{
				if((new Date()).getTime() - g.users[j].speTime > 5000)
				{
					g.users[j].radius -= 0.2;
					g.users[j].hp -= g.bullets[i].damage;
				}

				if(g.users[j].hp > 0)
					sendToAll("updateUserInformation", {simpleid: g.users[j].simpleid, radius: g.users[j].radius, hp: g.users[j].hp});
				if(g.users[j].hp <= 0)
				{
					sendToAll("updateUserInformation", {simpleid: g.users[j].simpleid, dead: true});
					g.users[j].dead = true;
					g.users[j].speTime = (new Date()).getTime();
				}

				collision = true;
			}
		}
		
		sendToAll("updateBulletInformation", {simpleid: g.bullets[i].simpleid, rotation: g.bullets[i].rotation, pos: g.bullets[i].pos, radius: g.bullets[i].radius});

		if(g.bullets[i].radius <= 0.5 || collision)
		{
			sendToAll("removeBullet", {simpleid: g.bullets[i].simpleid});
			g.bullets.splice(i, 1);
			i --;
		}else {
			if (inWall(g.bullets[i]).index!=-1){
				
				var index = inWall(g.bullets[i]).index, objectCollided = inWall(g.bullets[i]).partCollided,r1 = g.bullets[i].radius + 1, r2 = objectCollided.radius;
				
				if (!objectCollided.inIner)
					putOutOf(g.bullets[i],objectCollided,r1+r2);
				else
					putOutOf(g.bullets[i],objectCollided,r2-r1);
					
				g.bullets[i].rotation = findNewAngle(g.bullets[i],objectCollided);
			
			}
		}
	}
}

function respawnusers()
{
	for(var i = 0;i < g.users.length; i ++)
	{
		if(g.users[i].dead && (new Date).getTime() - g.users[i].speTime > 5000)
		{
			sendToAll("updateUserInformation", {simpleid: g.users[i].simpleid, dead: false, pos: new Vector(400, 300), radius: 10, speed: 0, hp: 100});
			g.users[i].pos = new Vector(400, 300);
			g.users[i].hp = 100;
			g.users[i].radius = 10;
			g.users[i].speed = 0;
			g.users[i].dead = false;
			g.users[i].speTime = (new Date()).getTime();
		}
	}
}

//setInterval(moveg.users, 20);
//setInterval(moveg.bullets, 20);
//setInterval(respawng.users, 1000);

function distanceBetween(one, two)
{
    var alpha = one.x - two.x;
    var beta = one.y - two.y;
    return Math.sqrt((alpha*alpha)+(beta*beta));
}

