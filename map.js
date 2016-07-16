'use strict';
let walls = global.walls;
let config = global.config;
let classes = global.classes;
let geometry = global.geometry;

generateMap(process.env.MAP_TYPE || 1);

function generateMap(type)
{
	if(!Number.isInteger(type))
	{
		if(type == "random")
			type = Math.floor(Math.random() * 4);
		else
			type = Number(type);

		if(Number.isNaN(type))
			type = 3;
	}

	let g = Math.PI / 180;
	if(type == 0)
	{
		let ir = 130, or = 130+30;
		let dist = 250;

		walls[generateID()] = new classes.Wall(-dist, 0,	ir, or, g*90,	g*90 + g*180);
		walls[generateID()] = new classes.Wall(dist, 0,		ir, or, g*270,	g*270 + g*180);
		walls[generateID()] = new classes.Wall(0, -dist,	ir, or, g*180,	g*180 + g*180);
		walls[generateID()] = new classes.Wall(0, dist,		ir, or, g*0,	g*0 + g*180);

		walls[generateID()] = new classes.Wall(0, 0, 570, 600, g*0, g*0 + g*360);
	}
	if(type == 1)
	{
		for (let i = 0;i < Math.PI*2;i += Math.PI*2/5)
			walls[generateID()] = new classes.Wall(0, 0, 570, 600, i, 0.6+i);
		for (let i = 0;i < Math.PI*2;i += Math.PI*2/5)
		{
			let angle = i - Math.PI/10 - 0.01;
			walls[generateID()] = new classes.Wall(
					Math.cos(angle) * (570 / 2 + 300) // x
					, Math.sin(angle) * (570 / 2 + 300) // y
					, 170, 190, 0, 2 * Math.PI);
		}
		let id = generateID();
		walls[id] = new classes.Wall(0, 0, 170, 290, 0, Math.PI);
		walls[id].events.rotationOnHit = 1;
	}
	if(type == 2)
	{
		generateRandomMap(65);
	}
	if(type == 3)
	{
		for(let i = 1;i < 10;++ i)
		{
			let ang1 = Math.random() * Math.PI * 2;
			let ang2 = ang1 + Math.PI / 180 * 120;
			let id = generateID();
			walls[id] = new classes.Wall(0, 0, i*80, i*80+20, ang1, ang2);
			walls[id].events.rotationOnHit = 1;
		}

		let ir = 10*80 + 120, or = ir + 80;
		let diff = Math.floor(Math.abs(Math.cos(g*30) * or)) - (or - ir) / 3;
		walls[generateID()] = new classes.Wall(0, 0,		ir, or, g*30,	g*30+g*300);
		walls[generateID()] = new classes.Wall(2*diff, 0,	ir, or, g*210,	g*210+g*300);
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
