function createUserPacket(user)
{
	// pid, name length, name itself, id, pos_x, pos_y
	var buffer = new ArrayBuffer(1 + 1 + user.name.length + 4 + 4 + 4);
	var dv = new DataView(buffer);
	dv.setUint8(0, 1); // pid

	dv.setUint8(1, user.name.length);
	for(var i = 0;i < user.name.length;++ i)
		dv.setUint8(2+i, user.name.charCodeAt(i));

	dv.setUint32(1+1+user.name.length, user.id, false);

	var p1Offset = 1 + 1 + user.name.length + 4;
	dv.setInt32(p1Offset + 0, user.player.pos.x, false);
	dv.setInt32(p1Offset + 4, user.player.pos.y, false);

	return buffer;
}

function removeUserPacket(user)
{
	var buffer = new ArrayBuffer(1 + 4);
	dv = new DataView(buffer);
	dv.setUint8(0, 4);

	dv.setUint32(1, user.id, false);

	return buffer;
}

function basicPlayerStatPacket(user)
{
	// TODO hp, dead?...

	// pid, userID, pos, rotation, speed
	var buffer = new ArrayBuffer(1 + 4 + 8 + 4 + 4);
	var dv = new DataView(buffer);
	dv.setUint8(0, 6);

	dv.setUint32(1, user.id, false);

	dv.setInt32(5, user.player.pos.x, false);
	dv.setInt32(9, user.player.pos.y, false);

	dv.setFloat32(13, user.player.rotation, false);

	dv.setFloat32(17, user.player.speed, false);

	return buffer;
}

function createWallPacket(i)
{
	// pid, id, pos, radius, angle
	var buffer = new ArrayBuffer(1 + 4 + 8 + 8 + 8);
	var dv = new DataView(buffer);
	dv.setUint8(0, 2);

	dv.setUint32(1, i); // id = wall id

	dv.setInt32(5, global.walls[i].pos.x, false);
	dv.setInt32(9, global.walls[i].pos.y, false);

	dv.setFloat32(13, global.walls[i].radius.inner, false);
	dv.setFloat32(17, global.walls[i].radius.outer, false);

	dv.setFloat32(21, global.walls[i].angle.start, false);
	dv.setFloat32(25, global.walls[i].angle.finish, false);

	return buffer;
}

function createBulletPacket(id)
{
	// TODO send damage & more

	// pid, bulletID, shooterID, pos, rotation
	var buffer = new ArrayBuffer(1 + 4 + 4 + 8 + 4);
	var dv = new DataView(buffer);
	dv.setUint8(0, 3);

	dv.setUint32(1, id, false);
	dv.setUint32(5, global.bullets[id].shooter, false);

	dv.setInt32(9, global.bullets[id].pos.x, false);
	dv.setInt32(13, global.bullets[id].pos.y, false);

	dv.setFloat32(17, global.bullets[id].rotation, false);

	return buffer;
}

function initGamePacket(user)
{
	var buffer = new ArrayBuffer(1 + 4);
	var dv = new DataView(buffer);
	dv.setUint8(0, 5);

	dv.setUint32(1, user.id, false);

	return buffer;
}

module.exports.createUserPacket = createUserPacket;
module.exports.removeUserPacket = removeUserPacket;
module.exports.basicPlayerStatPacket = basicPlayerStatPacket;
module.exports.createWallPacket = createWallPacket;
module.exports.createBulletPacket = createBulletPacket;
module.exports.initGamePacket = initGamePacket;
