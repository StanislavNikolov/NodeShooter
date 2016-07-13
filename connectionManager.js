'use strict';
module.exports.broadcastNewUser = function (user)
{
	let p = global.pm.createUserPacket(user);
	for(let n in global.users)
		if(n != user.id)
			global.users[n].socket.send(p, function err(){});
}

module.exports.broadcastRemoveUser = function (user)
{
	let p = global.pm.removeUserPacket(user);
	for(let n in global.users)
		if(n != user.id)
			global.users[n].socket.send(p, function err(){});
}

module.exports.broadcastBasicPlayerStatPack = function (users)
{
	let p = global.pm.basicPlayerStatPacket(users);
	for(let n in global.users)
		global.users[n].socket.send(p, function err(){});

}
module.exports.broadcastPlayerDied = function (user)
{
	let p = global.pm.playerDiedPacket(user);
	for(let n in global.users)
		global.users[n].socket.send(p, function err(){});

}
module.exports.broadcastPlayerRespawned = function (user)
{
	let p = global.pm.playerRespawnedPacket(user);
	for(let n in global.users)
		global.users[n].socket.send(p, function err(){});

}

module.exports.broadcastRemoveBullet = function (id)
{
	let packet = global.pm.removeBulletPacket(id);
	for(let i in global.users)
		global.users[i].socket.send(packet, function err(){});
}

module.exports.broadcastBasicBulletStat = function (arr)
{
	let packet = global.pm.basicBulletStatPacket(arr);
	for(let i in global.users)
		global.users[i].socket.send(packet, function err(){});
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
	let p = global.pm.addMessagePacket(msg);
	for(let i in users)
		global.users[i].socket.send(p, function err(){});
}
module.exports.broadcastScoreboardUpdate = function (user, value, y)
{
	let p = global.pm.scoreboardUpdatePacket(user, value, y);
	for(let i in users)
		global.users[i].socket.send(p, function err(){});
}
