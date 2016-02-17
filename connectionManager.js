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
	newUserPacket.setUint32(1+1+user.name.length, user.id);

	// pos
	var p1Offset = 1 + 1 + user.name.length + 4;
	newUserPacket.setInt32(p1Offset + 0, user.player.pos.x, false);
	newUserPacket.setInt32(p1Offset + 4, user.player.pos.y, false);

	// broadcast to all
	for(var n in global.users)
		global.users[n].socket.send(newUserPacket_b);
}

module.exports.broadcastNewUser = broadcastNewUser;
