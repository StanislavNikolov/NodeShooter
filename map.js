'use strict';
let walls = global.walls;
let config = global.config;
let classes = global.classes;
let geometry = global.geometry;

let g = Math.PI / 180;

generateMap(process.env.MAP_TYPE || 1);

function generateMap(type)
{
	if(!Number.isInteger(type))
	{
		if(type == "random")
			type = Math.floor(Math.random() * 5);
		else
			type = Number(type);

		if(Number.isNaN(type))
			type = 3;
	}

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
	if(type == 4)
	{
		createSecotor_1(0, 0, true, false, false, false);
		createSecotor_1(1790, 0, false, true, true, true);
		createSecotor_1(1790, -1790, false, true, false, false);
		createSecotor_1(1790, 1790, false, false, true, true);
		createSecotor_1(0, 1790, true, false, false, false);
	}
}

function createSecotor_1(x, y, h1, h2, h3, h4) // h1..4 -> hole 1, 2, 3, 4
{
	let lenSmall = g*0.0399;
	let saSmall = g*360 - lenSmall;
	let faSmall = saSmall + lenSmall * 2;

	let lenBig = g*0.097;
	let saBig = g*360 - lenBig;
	let faBig = saBig + lenBig * 2;

	let w = 20;

	if(h1)
	{
		walls[generateID()] = new classes.Wall(-199500 + x, -200 + y, 200000, 200000 + w, saSmall, faSmall);
		walls[generateID()] = new classes.Wall(-199500 + x, 200 + y, 200000, 200000 + w, saSmall, faSmall);
	}
	else
	{
		walls[generateID()] = new classes.Wall(-199500 + x, 0 + y, 200000, 200000 + w, saBig, faBig);
	}

	saSmall += g*90; faSmall += g*90;
	saBig += g*90; faBig += g*90;
	if(h2)
	{
		walls[generateID()] = new classes.Wall(-200 + x, -199500 + y, 200000, 200000 + w, saSmall, faSmall);
		walls[generateID()] = new classes.Wall(200 + x, -199500 + y, 200000, 200000 + w, saSmall, faSmall);
	}
	else
	{
		walls[generateID()] = new classes.Wall(0 + x, -199500 + y, 200000, 200000 + w, saBig, faBig);
	}

	saSmall += g*90; faSmall += g*90;
	saBig += g*90; faBig += g*90;
	if(h3)
	{
		walls[generateID()] = new classes.Wall(199500 + x, -200 + y, 200000, 200000 + w, saSmall, faSmall);
		walls[generateID()] = new classes.Wall(199500 + x, 200 + y, 200000, 200000 + w, saSmall, faSmall);
	}
	else
	{
		walls[generateID()] = new classes.Wall(199500 + x, 0 + y, 200000, 200000 + w, saBig, faBig);
	}

	saSmall += g*90; faSmall += g*90;
	saBig += g*90; faBig += g*90;
	if(h4)
	{
		walls[generateID()] = new classes.Wall(-200 + x, 199500 + y, 200000, 200000 + w, saSmall, faSmall);
		walls[generateID()] = new classes.Wall(200 + x, 199500 + y, 200000, 200000 + w, saSmall, faSmall);
	}
	else
	{
		walls[generateID()] = new classes.Wall(0 + x, 199500 + y, 200000, 200000 + w, saBig, faBig);
	}

	// The corner circles
	walls[generateID()] = new classes.Wall(-425 + x, 425 + y, 110, 110+w, g*45, g*45 + g*180);
	walls[generateID()] = new classes.Wall(-425 + x, -425 + y, 110, 110+w, g*135, g*135 + g*180);
	walls[generateID()] = new classes.Wall(425 + x, -425 + y, 110, 110+w, g*225, g*225 + g*180);
	walls[generateID()] = new classes.Wall(425 + x, 425 + y, 110, 110+w, g*315, g*315 + g*180);

	let len = g*0.055;
	let sa = g*360 - len;
	let fa = sa + len * 2;
	if(h2)
	{
		walls[generateID()] = new classes.Wall(-199950 + x, 705 + y, 200000, 200000 + w, sa, fa);
		walls[generateID()] = new classes.Wall(-200070 + x, 705 + y, 200000, 200000 + w, sa, fa);
	}
	if(h4)
	{
		walls[generateID()] = new classes.Wall(-199950 + x, -705 + y, 200000, 200000 + w, sa, fa);
		walls[generateID()] = new classes.Wall(-200070 + x, -705 + y, 200000, 200000 + w, sa, fa);
	}

	sa += g*90;
	fa += g*90;
	if(h1)
	{
		walls[generateID()] = new classes.Wall(705 + x, -199950 + y, 200000, 200000 + w, sa, fa);
		walls[generateID()] = new classes.Wall(705 + x, -200070 + y, 200000, 200000 + w, sa, fa);
	}
	if(h3)
	{
		walls[generateID()] = new classes.Wall(-705 + x, -199950 + y, 200000, 200000 + w, sa, fa);
		walls[generateID()] = new classes.Wall(-705 + x, -200070 + y, 200000, 200000 + w, sa, fa);
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
