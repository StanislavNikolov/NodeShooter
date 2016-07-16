function distanceBetween(one, two)
{
    let alpha = one.x - two.x;
    let beta = one.y - two.y;
    return Math.sqrt((alpha * alpha) + (beta * beta));
}

function inWall(p)
{
	for(let j in walls)
	{
		if(distanceBetween(walls[j].pos, p.pos) < p.radius + walls[j].radius.outer
			&& distanceBetween(walls[j].pos, p.pos) + p.radius > walls[j].radius.inner)
		{
			let angle;
			if(p.pos.y - walls[j].pos.y > 0)
			{
				angle = Math.acos(
						(p.pos.x - walls[j].pos.x) / distanceBetween(walls[j].pos, p.pos) );
			}
			else
			{
				angle = 2 * Math.PI - Math.acos(
						(p.pos.x - walls[j].pos.x) / distanceBetween(walls[j].pos, p.pos) );
			}

			if( (angle > walls[j].angle.start && angle < walls[j].angle.finish)
				|| (walls[j].angle.finish > 2 * Math.PI
					&& angle + 2 * Math.PI > walls[j].angle.start
					&& angle + 2 * Math.PI < walls[j].angle.finish)
				)
			{
				if(distanceBetween(walls[j].pos, p.pos) < (walls[j].radius.inner + walls[j].radius.outer) / 2)
					return {index: j, partCollided: {pos: walls[j].pos, radius: walls[j].radius.inner, inIner: 1}};
				else
					return {index: j, partCollided: {pos: walls[j].pos, radius: walls[j].radius.outer, inIner: 0}};

			}
			else
			{
				let center1 = new classes.Vector(walls[j].pos.x+(Math.cos(walls[j].angle.finish)*(Math.abs(walls[j].radius.outer-walls[j].radius.inner)/2+walls[j].radius.inner)),
					walls[j].pos.y+Math.sin(walls[j].angle.finish)*(Math.abs(walls[j].radius.outer-walls[j].radius.inner)/2+walls[j].radius.inner));
				let center2 = new classes.Vector(walls[j].pos.x+(Math.cos(walls[j].angle.start)*(Math.abs(walls[j].radius.outer-walls[j].radius.inner)/2+walls[j].radius.inner)),
				walls[j].pos.y+Math.sin(walls[j].angle.start)*(Math.abs(walls[j].radius.outer-walls[j].radius.inner)/2+walls[j].radius.inner));

				let col1 = distanceBetween(p.pos,center1)<p.radius+Math.abs(walls[j].radius.outer-walls[j].radius.inner)/2;
				let col2 = distanceBetween(p.pos,center2)<p.radius+Math.abs(walls[j].radius.outer-walls[j].radius.inner)/2;

				if (col1)
					return {index: j, partCollided:{pos: center1, radius: Math.abs(walls[j].radius.outer-walls[j].radius.inner)/2, inIner: 0}};
				if (col2)
					return {index: j, partCollided:{pos: center2, radius: Math.abs(walls[j].radius.outer-walls[j].radius.inner)/2, inIner: 0}};
			}
		}
	}
	return {index: -1};
}

function putOutOf(o1, o2, distance)
{
	o1.pos.x = o2.pos.x + (o1.pos.x - o2.pos.x) * distance / (distanceBetween(o1.pos, o2.pos));
	o1.pos.y = o2.pos.y + (o1.pos.y - o2.pos.y) * distance / (distanceBetween(o1.pos, o2.pos));
}

function findNewAngle(p, w)
{
	let vx = p.d.x;
	let vy = p.d.y;
	let tpx = (w.pos.x-p.pos.x);
	let tpy = (w.pos.y-p.pos.y)
	let bx = w.pos.x
	let by = w.pos.y;
	let px = p.pos.x;
	let py = p.pos.y;

	p = 2 * (vx*tpx+vy*tpy) / (tpx*tpx+tpy*tpy);
	vx = vx - p * tpx;
	vy = vy - p * tpy;

	if (vy > 0)
		return Math.acos(vx / Math.sqrt(vx * vx + vy * vy));
	else
		return Math.PI * 2 - Math.acos(vx / Math.sqrt(vx * vx + vy * vy));
}

function isFree(x, y, r)
{
	for(let i in walls)
		if(distanceBetween({x: x, y: y}, walls[i].pos) < walls[i].radius.outer + r)
			return false;

	return true;
}


module.exports.distanceBetween = distanceBetween;
module.exports.inWall = inWall;
module.exports.putOutOf = putOutOf;
module.exports.findNewAngle = findNewAngle;
module.exports.isFree = isFree;
