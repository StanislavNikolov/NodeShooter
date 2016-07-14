'use strict';
// 00 - authentication
module.exports.nameReqPacket = function ()
{
	let buffer = new ArrayBuffer(1 + 4);
	let dv = new DataView(buffer);
	dv.setUint8(0, 1);
	return buffer;
}
module.exports.initGamePacket = function (user)
{
	let buffer = new ArrayBuffer(1 + 4 + 4);
	let dv = new DataView(buffer);
	dv.setUint8(0, 2);

	dv.setUint32(1, user.id, false);
	dv.setFloat32(5, global.config.players.bulletsPerSecond, false);

	return buffer;
}

// 01 - users
module.exports.createUserPacket = function (user)
{
	// pid, name length, name itself, id, pos_x, pos_y, kills, deaths
	let buffer = new ArrayBuffer(1 + 1 + user.name.length + 4 + 4 + 4 + 4 + 4);
	let dv = new DataView(buffer);
	dv.setUint8(0, 11); // pid

	dv.setUint8(1, user.name.length);
	for(let i = 0;i < user.name.length;++ i)
		dv.setUint8(2+i, user.name.charCodeAt(i));

	dv.setUint32(1+1+user.name.length, user.id, false);

	let p1Offset = 1 + 1 + user.name.length + 4;
	dv.setInt32(p1Offset + 0, user.player.pos.x, false);
	dv.setInt32(p1Offset + 4, user.player.pos.y, false);

	dv.setInt32(p1Offset + 8, user.kills, false);
	dv.setInt32(p1Offset + 12, user.deaths, false);

	return buffer;
}
module.exports.removeUserPacket = function (user)
{
	let buffer = new ArrayBuffer(1 + 4);
	let dv = new DataView(buffer);
	dv.setUint8(0, 12);

	dv.setUint32(1, user.id, false);

	return buffer;
}
module.exports.basicPlayerStatPacket = function (users)
{
	// pid, count * (userID, pos, rotation, speed, hp/maxhp)
	let buffer = new ArrayBuffer(1 + 4 + users.length * (4 + 8 + 4 + 8));
	let dv = new DataView(buffer);
	dv.setUint8(0, 13);
	dv.setUint32(1, users.length, false);

	for(let i = 0;i < users.length;++ i)
	{
		dv.setUint32(5 + i * 24, global.users[users[i]].id, false);
		dv.setFloat32(9 + i * 24, global.users[users[i]].player.pos.x, false);
		dv.setFloat32(13 + i * 24, global.users[users[i]].player.pos.y, false);
		dv.setFloat32(17 + i * 24, global.users[users[i]].player.speed, false);
		dv.setInt32(21 + i * 24, global.users[users[i]].player.hp, false);
		dv.setInt32(25 + i * 24, global.users[users[i]].player.maxhp, false);
	}

	return buffer;
}
module.exports.playerDiedPacket = function (user)
{
	let buffer = new ArrayBuffer(1 + 4);
	let dv = new DataView(buffer);
	dv.setUint8(0, 14);

	dv.setUint32(1, user.id, false);

	return buffer;
}
module.exports.playerRespawnedPacket = function (user)
{
	let buffer = new ArrayBuffer(1 + 4);
	let dv = new DataView(buffer);
	dv.setUint8(0, 15);
	dv.setUint32(1, user.id, false);

	return buffer;
}

// 02 - bullets
module.exports.removeBulletPacket = function (id)
{
	let buffer = new ArrayBuffer(1 + 4);
	let dv = new DataView(buffer);
	dv.setUint8(0, 22);

	dv.setUint32(1, id, false);

	return buffer;
}
module.exports.basicBulletStatPacket = function (arr)
{
	let buffer = new ArrayBuffer(1 + 4 + arr.length * (4 + 4 + 4 + 4));
	let dv = new DataView(buffer);
	dv.setUint8(0, 23);

	dv.setUint32(1, arr.length, false);

	let count = 0;
	for(let id of arr)
	{
		dv.setUint32(5 + count * 16, id, false);

		dv.setInt32(9 + count * 16, global.bullets[id].pos.x, false);
		dv.setInt32(13 + count * 16, global.bullets[id].pos.y, false);

		dv.setFloat32(17 + count * 16, global.bullets[id].radius, false);

		count ++;
	}

	return buffer;
}

// 03 - map
module.exports.wallsPacket = function (obj)
{
	let len = 0;
	if(Array.isArray(obj))
		len = obj.length;
	else
		len = Object.keys(obj).length;

	// pid, count, {id, pos, radius, angle}
	let buffer = new ArrayBuffer(1 + 4 + len * (4 + 8 + 8 + 8));
	let dv = new DataView(buffer);
	dv.setUint8(0, 31);

	dv.setUint32(1, len, false);

	let count = 0;
	for(let i in obj)
	{
		let wall, id;
		if(Array.isArray(obj))
		{
			wall = walls[obj[i]];
			dv.setUint32(5 + count * 28, obj[i]);
		}
		else
		{
			wall = obj[i];
			dv.setUint32(5 + count * 28, i);
		}

		dv.setInt32(9 + count * 28, wall.pos.x, false);
		dv.setInt32(13 + count * 28, wall.pos.y, false);

		dv.setFloat32(17 + count * 28, wall.radius.inner, false);
		dv.setFloat32(21 + count * 28, wall.radius.outer, false);

		dv.setFloat32(25 + count * 28, wall.angle.start, false);
		dv.setFloat32(29 + count * 28, wall.angle.finish, false);

		count ++;
	}

	return buffer;
}

// 04 - messages
module.exports.addMessagePacket = function (msg)
{
	let buffer = new ArrayBuffer(1 + 4 + msg.length);
	let dv = new DataView(buffer);
	dv.setUint8(0, 41);

	dv.setUint32(1, msg.length, false);
	for(let i = 0;i < msg.length;++ i)
		dv.setUint8(5+i, msg.charCodeAt(i));

	return buffer;
}
module.exports.scoreboardUpdatePacket = function (user, value, y)
{
	let buffer = new ArrayBuffer(1 + 4 + 4 + 1);
	let dv = new DataView(buffer);
	dv.setUint8(0, 42);

	dv.setUint32(1, user.id, false);
	dv.setInt32(5, value, false);
	dv.setUint8(9, y);

	return buffer;
}
