function inWall(p)
{
	for (var j in walls)
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
				collision = true;
			}
		}	

		if(bullets[i].radius <= 0.5 || collision)
		{
			delete bullets[i];
		}
		else
		{
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

setInterval(movebullets, 20);

function distanceBetween(one, two)
{
    var alpha = one.x - two.x;
    var beta = one.y - two.y;
    return Math.sqrt((alpha*alpha)+(beta*beta));
}
