'use strict';
let walls = global.walls;
let config = global.config;
let classes = global.classes;
let geometry = global.geometry;

generateMap(Number(process.env.MAP_TYPE || 1));

function generateMap(type)
{
	switch(type)
	{
		case 0:
			walls[generateID()] = new classes.Wall(150,300,130,160,Math.PI*0.5,Math.PI*1.5);
			walls[generateID()] = new classes.Wall(650,300,130,160,Math.PI*1.5,Math.PI*2.5);
			walls[generateID()] = new classes.Wall(400,50,130,160,Math.PI,Math.PI*2);
			walls[generateID()] = new classes.Wall(400,550,130,160,0,Math.PI);
			walls[generateID()] = new classes.Wall(400,300,570,600,0,Math.PI*2);
			break;

		case 1:
			for (let i = 0;i < Math.PI*2;i += Math.PI*2/5)
				walls[generateID()] = new classes.Wall(400, 300, 570, 600, i, 0.6+i);
			for (let i = 0;i < Math.PI*2;i += Math.PI*2/5)
			{
				let angle = i - Math.PI/10 - 0.01;
				walls[generateID()] = new classes.Wall(
						  400 + Math.cos(angle) * (570 / 2 + 300) // x
						, 300 + Math.sin(angle) * (570 / 2 + 300) // y
						, 170, 190, 0, 2 * Math.PI);
			}
			walls[generateID()] = new classes.Wall(400, 300, 170, 290, 0, Math.PI);
			break;

		case 2:
			generateRandomMap(65);
			break;
	}
}

function generateRandomMap(sp)
{
	let wallsCount = 0;
	for(let i = 0;i < 100000 && wallsCount < sp;i ++)
	{
		let r1 = Math.random() * 200 + 40;
		let r2 = r1 + Math.random() * 10 + 20;
		let a1 = Math.random() * Math.PI * 2;
		let a2 = a1 + Math.random() * Math.PI * 2;
		let x = Math.floor(Math.random() * 1000 - 500);
		let y = Math.floor(Math.random() * 1000 - 500);
		let ang = a2 - a1;

		if(ang < Math.PI / 180 * 45
				|| (ang > Math.PI / 180 * 300 && ang < Math.PI / 180 * 360)
				|| !geometry.isFree(x, y, r2))
		{
			continue;
		}

		walls[generateID()] = new classes.Wall(x, y, r1, r2, a1, a2);
		wallsCount ++;
	}
	walls[generateID()] = new classes.Wall(0, 0, 800, 840, 0, Math.PI * 2);
}
