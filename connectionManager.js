'use strict';
function broadcastPacket(packet, exclude)
{
	for(let i in global.users)
		if(i != exclude)
			global.users[i].socket.send(packet, function err(){});
}

module.exports.broadcastNewUser = function (user)
{
	let packet = global.pm.createUserPacket(user);
	broadcastPacket(packet, user.id);
}

module.exports.broadcastRemoveUser = function (user)
{
	let packet = global.pm.removeUserPacket(user);
	broadcastPacket(packet, user.id);
}

module.exports.broadcastBasicPlayerStatPack = function (users)
{
	let packet = global.pm.basicPlayerStatPacket(users);
	broadcastPacket(packet);
}

module.exports.broadcastPlayerDied = function (user)
{
	let packet = global.pm.playerDiedPacket(user);
	broadcastPacket(packet);
}

module.exports.broadcastPlayerRespawned = function (user)
{
	let packet = global.pm.playerRespawnedPacket(user);
	broadcastPacket(packet);
}

module.exports.broadcastRemoveBullet = function (id)
{
	let packet = global.pm.removeBulletPacket(id);
	broadcastPacket(packet);
}

module.exports.broadcastBasicBulletStat = function (arr)
{
	let packet = global.pm.basicBulletStatPacket(arr);
	broadcastPacket(packet);
}

module.exports.sendUsers = function (user)
{
	for(let n in global.users)
		user.socket.send(global.pm.createUserPacket(global.users[n]), function err(){});
}

module.exports.sendMap = function (user)
{
	for(let i in global.walls)
		user.socket.send(global.pm.createWallPacket(i), function err(){});

	for(let i in global.bullets)
		user.socket.send(global.pm.createBulletPacket(i), function err(){});
}

module.exports.initGame = function (user)
{
	user.socket.send(global.pm.initGamePacket(user), function err(){});
}

module.exports.broadcastMessage = function (msg)
{
	let packet = global.pm.addMessagePacket(msg);
	broadcastPacket(packet);
}

module.exports.broadcastScoreboardUpdate = function (user, value, y)
{
	let packet = global.pm.scoreboardUpdatePacket(user, value, y);
	broadcastPacket(packet);
}
