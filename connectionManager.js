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
module.exports.broadcastPlayerDied = function (user)
{
	var p = global.pm.playerDiedPacket(user);
	for(var n in global.users)
		global.users[n].socket.send(p);

}
module.exports.broadcastPlayerRespawned = function (user)
{
	var p = global.pm.playerRespawnedPacket(user);
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

	for (var i in bullets)
		user.socket.send(global.pm.createBulletPacket(i));
}

module.exports.initGame = function (user)
{
	user.socket.send(global.pm.initGamePacket(user));
}

module.exports.broadcastMessage = function (msg) // TODO
{

}
