function moveBullets()
{
	for(var i in bullets)
	{
		var diff = new Vector(bullets[i].target.pos.x - bullets[i].pos.x,
							bullets[i].target.pos.y - bullets[i].pos.y);

		bullets[i].pos.x += diff.x / 3;
		bullets[i].pos.y += diff.y / 3;
	}
}

setInterval(moveBullets, 20);
