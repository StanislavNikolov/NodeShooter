module.exports.broadcastNewUser = function (user)
{
	var p = global.pm.createUserPacket(user);
	for(var n in global.users)
		if(n != user.id)
			global.users[n].socket.send(p);
}

module.exports.broadcastRemoveUser = function (user)
{
	var p = global.pm.removeUserPacket(user);
	for(var n in global.users)
		if(n != user.id)
			global.users[n].socket.send(p);
}

module.exports.broadcastBasicPlayerStat = function (user)
{
	var p = global.pm.basicPlayerStatPacket(user);
	for(var n in global.users)
		global.users[n].socket.send(p);

}

module.exports.broadcastNewBullet = function (id)
{
	var packet = global.pm.createBulletPacket(id);
	for(var i in global.users)
		global.users[i].socket.send(packet);
}

module.exports.broadcastRemoveBullet = function (id)
{
	var packet = global.pm.removeBulletPacket(id);
	for(var i in global.users)
		global.users[i].socket.send(packet);
}

module.exports.broadcastBasicBulletStat = function (id)
{
	var packet = global.pm.basicBulletStatPacket(id);
	for(var i in global.users)
		global.users[i].socket.send(packet);
}

module.exports.sendUsers = function (user)
{
	for(var n in global.users)
		user.socket.send(global.pm.createUserPacket(global.users[n]));
}

module.exports.sendMap = function (user)
{
	for(var i in global.walls)
		user.socket.send(global.pm.createWallPacket(i));

	// TODO maybe we don't really need this
	// for (var i in bullets)
	// {
	// 	socket.emit("initNewBullet", {bsid: i, pos: bullets[i].pos, rotation: bullets[i].rotation, psid: bullets[i].s// hooter });
	// }
}

module.exports.initGame = function (user)
{
	user.socket.send(global.pm.initGamePacket(user));
}

module.exports.broadcastMessage = function (msg) // TODO
{

}
