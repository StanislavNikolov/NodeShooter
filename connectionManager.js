module.exports.broadcastNewUser = function (user)
{
	var p = global.pm.createUserPacket(user);
	for(var n in global.users)
		if(n != user.id)
			global.users[n].socket.send(p, function err(){});
}

module.exports.broadcastRemoveUser = function (user)
{
	var p = global.pm.removeUserPacket(user);
	for(var n in global.users)
		if(n != user.id)
			global.users[n].socket.send(p, function err(){});
}

module.exports.broadcastBasicPlayerStat = function (user)
{
	var p = global.pm.basicPlayerStatPacket(user);
	for(var n in global.users)
		global.users[n].socket.send(p, function err(){});

}
module.exports.broadcastPlayerDied = function (user)
{
	var p = global.pm.playerDiedPacket(user);
	for(var n in global.users)
		global.users[n].socket.send(p, function err(){});

}
module.exports.broadcastPlayerRespawned = function (user)
{
	var p = global.pm.playerRespawnedPacket(user);
	for(var n in global.users)
		global.users[n].socket.send(p, function err(){});

}

module.exports.broadcastNewBullet = function (id)
{
	var packet = global.pm.createBulletPacket(id);
	for(var i in global.users)
		global.users[i].socket.send(packet, function err(){});
}

module.exports.broadcastRemoveBullet = function (id)
{
	var packet = global.pm.removeBulletPacket(id);
	for(var i in global.users)
		global.users[i].socket.send(packet, function err(){});
}

module.exports.broadcastBasicBulletStat = function (id)
{
	var packet = global.pm.basicBulletStatPacket(id);
	for(var i in global.users)
		global.users[i].socket.send(packet, function err(){});
}

module.exports.sendUsers = function (user)
{
	for(var n in global.users)
		user.socket.send(global.pm.createUserPacket(global.users[n]), function err(){});
}

module.exports.sendMap = function (user)
{
	for(var i in global.walls)
		user.socket.send(global.pm.createWallPacket(i), function err(){});

	for(var i in global.bullets)
		user.socket.send(global.pm.createBulletPacket(i), function err(){});
}

module.exports.initGame = function (user)
{
	user.socket.send(global.pm.initGamePacket(user), function err(){});
}

module.exports.broadcastMessage = function (msg)
{
	var p = global.pm.addMessagePacket(msg);
	for(var i in users)
		global.users[i].socket.send(p, function err(){});
}
module.exports.broadcastScoreboardUpdate = function (user, value, y)
{
	var p = global.pm.scoreboardUpdatePacket(user, value, y);
	for(var i in users)
		global.users[i].socket.send(p, function err(){});
}
