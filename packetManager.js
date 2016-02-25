// 00 - authentication
module.exports.nameReqPacket = function ()
{
	var buffer = new ArrayBuffer(1 + 4);
	var dv = new DataView(buffer);
	dv.setUint8(0, 001);
	return buffer;
}
module.exports.initGamePacket = function (user)
{
	var buffer = new ArrayBuffer(1 + 4);
	var dv = new DataView(buffer);
	dv.setUint8(0, 002);

	dv.setUint32(1, user.id, false);

	return buffer;
}

// 01 - users
module.exports.createUserPacket = function (user)
{
	// pid, name length, name itself, id, pos_x, pos_y
	var buffer = new ArrayBuffer(1 + 1 + user.name.length + 4 + 4 + 4);
	var dv = new DataView(buffer);
	dv.setUint8(0, 011); // pid

	dv.setUint8(1, user.name.length);
	for(var i = 0;i < user.name.length;++ i)
		dv.setUint8(2+i, user.name.charCodeAt(i));

	dv.setUint32(1+1+user.name.length, user.id, false);

	var p1Offset = 1 + 1 + user.name.length + 4;
	dv.setInt32(p1Offset + 0, user.player.pos.x, false);
	dv.setInt32(p1Offset + 4, user.player.pos.y, false);

	return buffer;
}
module.exports.removeUserPacket = function (user)
{
	var buffer = new ArrayBuffer(1 + 4);
	dv = new DataView(buffer);
	dv.setUint8(0, 012);

	dv.setUint32(1, user.id, false);

	return buffer;
}
module.exports.basicPlayerStatPacket = function (user)
{
	// TODO hp, dead?...

	// pid, userID, pos, rotation, speed
	var buffer = new ArrayBuffer(1 + 4 + 8 + 4 + 4);
	var dv = new DataView(buffer);
	dv.setUint8(0, 013);

	dv.setUint32(1, user.id, false);
	dv.setFloat32(5, user.player.pos.x, false);
	dv.setFloat32(9, user.player.pos.y, false);
	dv.setFloat32(13, user.player.rotation, false);
	dv.setFloat32(17, user.player.speed, false);

	return buffer;
}

// 02 - bullets
module.exports.createBulletPacket = function (id)
{
	// pid, bulletID, shooterID, pos, rotation, radius, damage
	var buffer = new ArrayBuffer(1 + 4 + 4 + 8 + 4 + 4 + 4);
	var dv = new DataView(buffer);
	dv.setUint8(0, 021);

	dv.setUint32(1, id, false);
	dv.setUint32(5, global.bullets[id].shooter, false);
	dv.setInt32(9, global.bullets[id].pos.x, false);
	dv.setInt32(13, global.bullets[id].pos.y, false);
	dv.setFloat32(17, global.bullets[id].rotation, false);
	dv.setFloat32(21, global.bullets[id].radius, false);
	dv.setInt32(25, global.bullets[id].damage, false);

	return buffer;
}
module.exports.removeBulletPacket = function (id)
{
	var buffer = new ArrayBuffer(1 + 4);
	var dv = new DataView(buffer);
	dv.setUint8(0, 022);

	dv.setUint32(1, id, false);

	return buffer;
}
module.exports.basicBulletStatPacket = function (id)
{
	var buffer = new ArrayBuffer(1 + 4 + 8 + 4 + 4);
	var dv = new DataView(buffer);
	dv.setUint8(0, 023);

	dv.setUint32(1, id, false);

	dv.setInt32(5, global.bullets[id].pos.x, false);
	dv.setInt32(9, global.bullets[id].pos.y, false);

	dv.setFloat32(13, global.bullets[id].rotation, false);
	dv.setFloat32(17, global.bullets[id].radius, false);

	return buffer;
}

// 03 - map
module.exports.createWallPacket = function (i)
{
	// pid, id, pos, radius, angle
	var buffer = new ArrayBuffer(1 + 4 + 8 + 8 + 8);
	var dv = new DataView(buffer);
	dv.setUint8(0, 031);

	dv.setUint32(1, i); // id = wall id

	dv.setInt32(5, global.walls[i].pos.x, false);
	dv.setInt32(9, global.walls[i].pos.y, false);

	dv.setFloat32(13, global.walls[i].radius.inner, false);
	dv.setFloat32(17, global.walls[i].radius.outer, false);

	dv.setFloat32(21, global.walls[i].angle.start, false);
	dv.setFloat32(25, global.walls[i].angle.finish, false);

	return buffer;
}
