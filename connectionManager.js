function broadcastNewUser(user)
{
	// pid, name length, name itself, id, pos_x, pos_y
	var newUserPacket_b = new ArrayBuffer(1 + 1 + user.name.length + 4 + 4 + 4);
	var newUserPacket = new DataView(newUserPacket_b);

	newUserPacket.setUint8(0, 1); // pid

	// name
	newUserPacket.setUint8(1, user.name.length);
	for(var i = 0;i < user.name.length;++ i)
		newUserPacket.setUint8(2+i, user.name.charCodeAt(i));

	// id
	newUserPacket.setUint32(1+1+user.name.length, user.id, false);

	// pos
	var p1Offset = 1 + 1 + user.name.length + 4;
	newUserPacket.setInt32(p1Offset + 0, user.player.pos.x, false);
	newUserPacket.setInt32(p1Offset + 4, user.player.pos.y, false);

	// broadcast to all
	for(var n in global.users)
		global.users[n].socket.send(newUserPacket_b);
}

function sendMap(user)
{
	for(var i in global.walls)
	{
		// pid, id, pos, radius, angle
		var packet_b = new ArrayBuffer(1 + 8 + 8 + 8 + 4)
		var packet = new DataView(packet_b);
		packet.setUint8(0, 2);

		packet.setUint32(1, i); // id = wall id

		packet.setInt32(2, global.walls[i].pos.x, false);
		packet.setInt32(6, global.walls[i].pos.y, false);

		packet.setFloat32(10, global.walls[i].radius.inner, false);
		packet.setFloat32(14, global.walls[i].radius.outer, false);

		packet.setFloat32(18, global.walls[i].angle.start, false);
		packet.setFloat32(22, global.walls[i].angle.finish, false);

		user.socket.send(packet_b);
	}

	// TODO maybe we don't really need this
	// for (var i in bullets)
	// {
	// 	socket.emit("initNewBullet", {bsid: i, pos: bullets[i].pos, rotation: bullets[i].rotation, psid: bullets[i].s// hooter });
	// }
}

function initGame(user)
{
	// Initial connection complete
	var packet_b = new ArrayBuffer(1 + 4);
	var packet = new DataView(packet_b);

	packet.setUint8(0, 5);
	packet.setUint32(1, user.id);
	user.socket.send(packet_b);
}

module.exports.broadcastNewUser = broadcastNewUser;
module.exports.sendMap = sendMap;
module.exports.initGame = initGame;
