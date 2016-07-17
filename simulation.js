'use strict';
let users = global.users;
let walls = global.walls;
let bullets = global.bullets;
let config = global.config;
let classes = global.classes;
let cm = global.cm;
let geometry = global.geometry;

let wallActionArray = [];

// the final division is a constant to keep speedMultiplier setting "simpler"
let playerSpeed = 1000 / config.players.ticksPerSecond / config.players.simStepsPerTick
					* config.players.speedMultiplier / 10;

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

		if(Math.abs(users[i].player.d.x) < 0.005)
			users[i].player.d.x = 0;
		if(Math.abs(users[i].player.d.y) < 0.005)
			users[i].player.d.y = 0;

		let change = users[i].player.d.y != 0 || users[i].player.d.x != 0;

		for(let simStep = 0;simStep < config.players.simStepsPerTick;++ simStep)
		{
			users[i].player.pos.x += users[i].player.d.x;
			users[i].player.pos.y += users[i].player.d.y;
			let iw = geometry.inWall(users[i].player);
			if(iw.index != -1)
			{
				change = true;

				let index = iw.index;
				let objectCollided = iw.partCollided;
				let r1 = users[i].player.radius + 1, r2 = objectCollided.radius;

				users[i].player.pos.x -= users[i].player.d.x;
				users[i].player.pos.y -= users[i].player.d.y;
				users[i].player.d.mul(0.5);

				if(!objectCollided.inIner)
					geometry.putOutOf(users[i].player, objectCollided, r1+r2);
				else
					geometry.putOutOf(users[i].player, objectCollided, r2-r1);
			}
		}
		if(change)
			toBroadcast.push(i);
	}
	if(toBroadcast.length > 0)
		cm.broadcastBasicPlayerStatPack(toBroadcast);
}

let bulletSpeed = 1000 / config.bullets.ticksPerSecond / config.bullets.simStepsPerTick
					* config.bullets.speedMultiplier;

// the final division is a constant to keep speedMultiplier setting "simpler"
let bulletDecayRate = config.bullets.decayRateMultiplier * bulletSpeed / 100;

function moveBullets()
{
	let bulletsToBroadcast = [];
	let usersToBroadcast = [];
	for(let i in bullets)
	{
		let deleted = false;
		for(let simStep = 0;simStep < config.bullets.simStepsPerTick;simStep ++)
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
						&& geometry.distanceBetween(bullets[i].pos, cu.player.pos)
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

						cm.broadcastPlayerDied(cu);
						cm.broadcastScoreboardUpdate(cu, cu.deaths, 1);

						let killer = users[bullets[i].shooter];
						if(killer != null)
						{
							killer.kills ++;
							cm.broadcastMessage(killer.name + ' killed ' + cu.name);
							cm.broadcastScoreboardUpdate(killer, killer.kills, 0);
						}
					}

					collision = true;
				}
			}

			if(!collision)
			{
				if(geometry.inWall(bullets[i]).index != -1)
				{
					let index = geometry.inWall(bullets[i]).index;
					let objectCollided = geometry.inWall(bullets[i]).partCollided;
					let r1 = bullets[i].radius + 1, r2 = objectCollided.radius;

					bullets[i].radius -= config.bullets.decayOnRicochetMultiplier;

					if(!objectCollided.inIner)
						geometry.putOutOf(bullets[i], objectCollided, r1+r2);
					else
						geometry.putOutOf(bullets[i], objectCollided, r2-r1);

					bullets[i].rotation = geometry.findNewAngle(bullets[i], objectCollided);

					if(walls[index].events.rotationOnHit != 0)
						wallActionArray.push(index);
				}
			}

			if(bullets[i].radius > 4)
				bullets[i].radius = 4;
			if(bullets[i].radius <= 0.5)
			{
				cm.broadcastRemoveBullet(i);
				delete bullets[i];
				deleted = true;
				break; // move on to the next bullet
			}
		}

		if(!deleted)
			bulletsToBroadcast.push(i);
	}

	if(bulletsToBroadcast.length > 0)
		cm.broadcastBasicBulletStat(bulletsToBroadcast);
	if(usersToBroadcast.length > 0)
		cm.broadcastBasicPlayerStatPack(usersToBroadcast);
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
			cm.broadcastBasicPlayerStatPack([i]);
			cm.broadcastPlayerRespawned(users[i]);
		}
	}
}

function reactOnWallEvents()
{
	if(wallActionArray.length == 0)
		return;

	for(let i in wallActionArray)
	{
		let id = wallActionArray[i];
		walls[id].angle.start += Math.PI / 180;
		walls[id].angle.finish += Math.PI / 180;

		if(walls[id].angle.start > Math.PI * 2)
		{
			walls[id].angle.start -= Math.PI * 2;
			walls[id].angle.finish -= Math.PI * 2;
		}
	}

	cm.broadcastWalls(wallActionArray);
	wallActionArray = [];
}

setInterval(reactOnWallEvents, 50);

setInterval(movePlayers, 1000 / config.players.ticksPerSecond);
setInterval(moveBullets, 1000 / config.bullets.ticksPerSecond);
setInterval(respawnUsers, 1000);
