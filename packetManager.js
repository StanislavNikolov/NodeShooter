function createUserPacket(user)
{
	// pid, name length, name itself, id, pos_x, pos_y
	var newUserPacket_b = new ArrayBuffer(1 + 1 + user.name.length + 4 + 4 + 4);
	var newUserPacket = new DataView(newUserPacket_b);
	newUserPacket.setUint8(0, 1); // pid

	newUserPacket.setUint8(1, user.name.length);
	for(var i = 0;i < user.name.length;++ i)
		newUserPacket.setUint8(2+i, user.name.charCodeAt(i));

	newUserPacket.setUint32(1+1+user.name.length, user.id, false);

	var p1Offset = 1 + 1 + user.name.length + 4;
	newUserPacket.setInt32(p1Offset + 0, user.player.pos.x, false);
	newUserPacket.setInt32(p1Offset + 4, user.player.pos.y, false);

	return newUserPacket_b;
}

function removeUserPacket(user)
{
	var removeUserPacket_b = new ArrayBuffer(1 + 4);
	removeUserPacket = new DataView(removeUserPacket_b);
	removeUserPacket.setUint8(0, 4);

	removeUserPacket.setUint32(1, user.id, false);

	return removeUserPacket_b;
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
	var packet_b = new ArrayBuffer(1 + 8 + 8 + 8 + 4);
	var packet = new DataView(packet_b);
	packet.setUint8(0, 2);

	packet.setUint32(1, i); // id = wall id

	packet.setInt32(2, global.walls[i].pos.x, false);
	packet.setInt32(6, global.walls[i].pos.y, false);

	packet.setFloat32(10, global.walls[i].radius.inner, false);
	packet.setFloat32(14, global.walls[i].radius.outer, false);

	packet.setFloat32(18, global.walls[i].angle.start, false);
	packet.setFloat32(22, global.walls[i].angle.finish, false);

	return packet_b;
}

function createBulletPacket(id)
{
	// TODO send damage & more

	// pid, bulletID, shooterID, pos, rotation
	var packet_b = new ArrayBuffer(1 + 4 + 4 + 8 + 4);
	var packet = new DataView(packet_b);
	packet.setUint8(0, 3);

	packet.setUint32(1, id, false);
	packet.setUint32(5, global.bullets[id].shooter, false);

	packet.setInt32(9, global.bullets[id].pos.x, false);
	packet.setInt32(13, global.bullets[id].pos.y, false);

	packet.setFloat32(17, global.bullets[id].rotation, false);

	return packet_b;
}

function initGamePacket(user)
{
	var packet_b = new ArrayBuffer(1 + 4);
	var packet = new DataView(packet_b);
	packet.setUint8(0, 5);

	packet.setUint32(1, user.id, false);

	return packet_b;
}

module.exports.createUserPacket = createUserPacket;
module.exports.removeUserPacket = removeUserPacket;
module.exports.basicPlayerStatPacket = basicPlayerStatPacket;
module.exports.createWallPacket = createWallPacket;
module.exports.createBulletPacket = createBulletPacket;
module.exports.initGamePacket = initGamePacket;
