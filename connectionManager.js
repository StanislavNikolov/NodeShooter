function broadcastNewUser(user)
{
	var p = global.pm.createUserPacket(user);
	for(var n in global.users)
		if(n != user.id)
			global.users[n].socket.send(p);
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
module.exports.sendUsers = sendUsers;
module.exports.sendMap = sendMap;
module.exports.initGame = initGame;
module.exports.broadcastMessage = broadcastMessage;
