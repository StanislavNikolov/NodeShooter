'use strict';
let users = global.users;
let walls = global.walls;
let bullets = global.bullets;
let classes = global.classes;

generateMap(Number(process.env.MAP_TYPE || 1));

function generateMap(type)
{
	switch(type)
	{
		case 0:
			walls[generateID()] = new classes.Wall(150,300,130,160,Math.PI*0.5,Math.PI*1.5);
			walls[generateID()] = new classes.Wall(650,300,130,160,Math.PI*1.5,Math.PI*2.5);
			walls[generateID()] = new classes.Wall(400,50,130,160,Math.PI,Math.PI*2);
			walls[generateID()] = new classes.Wall(400,550,130,160,0,Math.PI);
			walls[generateID()] = new classes.Wall(400,300,570,600,0,Math.PI*2);
			break;

		case 1:
			for (let i = 0;i < Math.PI*2;i += Math.PI*2/5)
				walls[generateID()] = new classes.Wall(400, 300, 570, 600, i, 0.6+i);
			for (let i = 0;i < Math.PI*2;i += Math.PI*2/5)
			{
				let angle = i - Math.PI/10 - 0.01;
				walls[generateID()] = new classes.Wall(
						  400 + Math.cos(angle) * (570 / 2 + 300) // x
						, 300 + Math.sin(angle) * (570 / 2 + 300) // y
						, 170, 190, 0, 2 * Math.PI);
			}
			walls[generateID()] = new classes.Wall(400, 300, 170, 290, 0, Math.PI);
			break;

		case 2:
			generateRandomMap(65);
			break;
	}
}

function isFree(x, y, r)
{
	for(let i in walls)
		if(distanceBetween({x: x, y: y}, walls[i].pos) < walls[i].radius.outer + r)
			return false;

	return true;
}

function generateRandomMap(sp)
{
	let wallsCount = 0;
	for(let i = 0;i < 100000 && wallsCount < sp;i ++)
	{
		let r1 = Math.random() * 200 + 40;
		let r2 = r1 + Math.random() * 10 + 20;
		let a1 = Math.random() * Math.PI * 2;
		let a2 = a1 + Math.random() * Math.PI * 2;
		let x = Math.floor(Math.random() * 1000 - 500);
		let y = Math.floor(Math.random() * 1000 - 500);
		let ang = a2 - a1;

		if(ang < Math.PI / 180 * 45
				|| (ang > Math.PI / 180 * 300 && ang < Math.PI / 180 * 360)
				|| !isFree(x, y, r2))
		{
			continue;
		}

		walls[generateID()] = new classes.Wall(x, y, r1, r2, a1, a2);
		wallsCount ++;
	}
	walls[generateID()] = new classes.Wall(0, 0, 800, 840, 0, Math.PI * 2);
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
	o1.pos.x = o2.pos.x + (o1.pos.x-o2.pos.x) * distance / (distanceBetween(o1.pos,o2.pos));
	o1.pos.y = o2.pos.y + (o1.pos.y-o2.pos.y) * distance / (distanceBetween(o1.pos,o2.pos));
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

// the final division is a constant to keep speedMultiplier setting "simpler"
let playerSpeed = 1000 / global.config.players.ticksPerSecond
						* global.config.players.speedMultiplier / 10;

function movePlayers()
{
	let toBroadcast = [];
	for(let i in users)
	{
		users[i].player.d.mul(0.8);

		if(users[i].player.direction % 2 == 0)
			users[i].player.d.y -= playerSpeed;
		if(users[i].player.direction % 3 == 0)
			users[i].player.d.y += playerSpeed;
		if(users[i].player.direction % 5 == 0)
			users[i].player.d.x -= playerSpeed;
		if(users[i].player.direction % 7 == 0)
			users[i].player.d.x += playerSpeed;

		if(Math.abs(users[i].player.d.x) < 0.05)
			users[i].player.d.x = 0;
		if(Math.abs(users[i].player.d.y) < 0.05)
			users[i].player.d.y = 0;

		if(users[i].player.d.x === 0 && users[i].player.d.y === 0)
			continue;

		for(let c = 0;c < 5;++ c)
		{
			users[i].player.pos.x += users[i].player.d.x;
			users[i].player.pos.y += users[i].player.d.y;
			let iw = inWall(users[i].player);
			if(iw.index != -1)
			{
				let index = iw.index;
				let objectCollided = iw.partCollided;
				let r1 = users[i].player.radius + 1, r2 = objectCollided.radius;

				users[i].player.pos.x -= users[i].player.d.x;
				users[i].player.pos.y -= users[i].player.d.y;
				users[i].player.d.mul(0.5);

				if(!objectCollided.inIner)
					putOutOf(users[i].player, objectCollided, r1+r2);
				else
					putOutOf(users[i].player, objectCollided, r2-r1);
			}
			else
			{
				break;
			}
		}
		toBroadcast.push(i);
	}
	if(toBroadcast.length > 0)
		global.cm.broadcastBasicPlayerStatPack(toBroadcast);
}

let bulletSpeed = 1000 / global.config.bullets.ticksPerSecond
					* global.config.bullets.speedMultiplier;

// the final division is a constant to keep speedMultiplier setting "simpler"
let bulletDecayRate = 1000 / global.config.bullets.ticksPerSecond
					* global.config.bullets.decayRateMultiplier / 1000;

let bulletSimFrame = 0; // incremented every frame
function moveBullets()
{
	let bulletsToBroadcast = [];
	let usersToBroadcast = [];
	for(let i in bullets)
	{
		let collision = false;
		bullets[i].radius -= bulletDecayRate;
		bullets[i].d.x = Math.cos(bullets[i].rotation) * bulletSpeed;
		bullets[i].d.y = Math.sin(bullets[i].rotation) * bulletSpeed;
		bullets[i].pos.x += bullets[i].d.x;
		bullets[i].pos.y += bullets[i].d.y;

		// Check if the bullet hit soembody
		for(let j in users)
		{
			let cu = users[j];
			if(j != bullets[i].shooter && !cu.dead
					&& distanceBetween(bullets[i].pos, cu.player.pos)
					< bullets[i].radius + cu.player.radius)
			{
				// The first 5 seconds after respawn the user can't take damage
				if((new Date()).getTime() - cu.lastEvent.respawn > 5000)
					cu.player.hp -= bullets[i].damage;

				if(cu.player.hp > 0)
					usersToBroadcast.push(j);

				if(cu.player.hp <= 0)
				{
					cu.dead = true;
					cu.lastEvent.killed = (new Date()).getTime();
					cu.deaths ++;

					global.cm.broadcastPlayerDied(cu);
					global.cm.broadcastScoreboardUpdate(cu, cu.deaths, 1);

					let killer = users[bullets[i].shooter];
					if(killer != null)
					{
						killer.kills ++;
						global.cm.broadcastMessage(killer.name + ' killed ' + cu.name);
						global.cm.broadcastScoreboardUpdate(killer, killer.kills, 0);
					}
				}

				collision = true;
			}
		}

		if(!collision)
		{
			if(inWall(bullets[i]).index!=-1)
			{
				let index = inWall(bullets[i]).index;
				let objectCollided = inWall(bullets[i]).partCollided;
				let r1 = bullets[i].radius + 1, r2 = objectCollided.radius;

				if (!objectCollided.inIner)
					putOutOf(bullets[i],objectCollided,r1+r2);
				else
					putOutOf(bullets[i],objectCollided,r2-r1);

				bullets[i].rotation = findNewAngle(bullets[i], objectCollided);
				bullets[i].radius -= global.config.bullets.decayOnRicochetMultiplier;
			}
		}

		if(bullets[i].radius <= 0.5)
		{
			global.cm.broadcastRemoveBullet(i);
			delete bullets[i];
		}
		else
		{
			if(bulletSimFrame % global.config.bullets.sendTicksDivisor == 0)
				bulletsToBroadcast.push(i);
		}
	}
	if(bulletsToBroadcast.length > 0)
		global.cm.broadcastBasicBulletStat(bulletsToBroadcast);
	if(usersToBroadcast.length > 0)
		cm.broadcastBasicPlayerStatPack(usersToBroadcast);

	bulletSimFrame ++;
}

function respawnUsers()
{
	for(let i in users)
	{
		if(users[i].dead && (new Date).getTime() - users[i].lastEvent.killed > 5000)
		{
			users[i].player.hp = 100;
			users[i].player.radius = 10;
			users[i].player.speed = 0;
			users[i].dead = false;
			users[i].lastEvent.respawn = (new Date()).getTime();
			global.cm.broadcastBasicPlayerStatPack([i]);
			global.cm.broadcastPlayerRespawned(users[i]);
		}
	}
}

setInterval(movePlayers, 1000 / global.config.players.ticksPerSecond);
setInterval(moveBullets, 1000 / global.config.bullets.ticksPerSecond);
setInterval(respawnUsers, 1000);

function distanceBetween(one, two)
{
    let alpha = one.x - two.x;
    let beta = one.y - two.y;
    return Math.sqrt((alpha * alpha) + (beta * beta));
}
