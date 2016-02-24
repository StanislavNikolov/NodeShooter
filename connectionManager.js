function broadcastNewUser(user)
{
	var p = global.pm.createUserPacket(user);
	for(var n in global.users)
		if(n != user.id)
			global.users[n].socket.send(p);
}

function broadcastRemoveUser(user)
{
	var p = global.pm.removeUserPacket(user);
	for(var n in global.users)
		if(n != user.id)
			global.users[n].socket.send(p);
}

function broadcastBasicPlayerStat(user)
{
	var p = global.pm.basicPlayerStatPacket(user);
	for(var n in global.users)
		global.users[n].socket.send(p);

}

function broadcastNewBullet(id)
{
	var packet = global.pm.createBulletPacket(id);
	for(var i in global.users)
		global.users[i].socket.send(packet);
}

function broadcastRemoveBullet(id)
{
	var packet = global.pm.removeBulletPacket(id);
	for(var i in global.users)
		global.users[i].socket.send(packet);

}

function sendUsers(user)
{
	for(var n in global.users)
		user.socket.send(global.pm.createUserPacket(global.users[n]));
}

function sendMap(user)
{
	for(var i in global.walls)
		user.socket.send(global.pm.createWallPacket(i));

	// TODO maybe we don't really need this
	// for (var i in bullets)
	// {
	// 	socket.emit("initNewBullet", {bsid: i, pos: bullets[i].pos, rotation: bullets[i].rotation, psid: bullets[i].s// hooter });
	// }
}

function initGame(user)
{
	user.socket.send(global.pm.initGamePacket(user));
}

function broadcastMessage(msg) // TODO
{

}

module.exports.broadcastNewUser = broadcastNewUser;
module.exports.broadcastRemoveUser = broadcastRemoveUser;
module.exports.broadcastBasicPlayerStat = broadcastBasicPlayerStat;
module.exports.broadcastNewBullet = broadcastNewBullet;
module.exports.broadcastRemoveBullet = broadcastRemoveBullet;
module.exports.sendUsers = sendUsers;
module.exports.sendMap = sendMap;
module.exports.initGame = initGame;
module.exports.broadcastMessage = broadcastMessage;
