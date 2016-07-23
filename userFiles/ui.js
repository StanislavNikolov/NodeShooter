var scoreboard = document.getElementById('scoreboard');
var messageboard = document.getElementById('messageboard');

function refreshScoreboard()
{
	scoreboard.style.visibility = 'visible';
	for(var i in users)
	{
		var row = document.getElementById('scoreboard-' + users[i].id);
		if(row == null)
			row = scoreboard.insertRow(scoreboard.rows.length);
		row.id = 'scoreboard-' + users[i].id;
		if(row.cells.length == 0)
		{
			row.insertCell(0);
			row.insertCell(1);
			row.insertCell(2);
		}
		row.cells[0].innerHTML = users[i].name;
		row.cells[1].innerHTML = '<center>' + users[i].kills + '<center>';
		row.cells[2].innerHTML = '<center>' + users[i].deaths + '<center>';
	}
}

function removeUserFromScoreboard(id)
{
	var row = document.getElementById('scoreboard-' + id);
	row.parentNode.removeChild(row);
}

function addMessageToMessageboard(msg)
{
	messageboard.style.visibility = 'visible';
	messageboard.innerHTML += msg + '<br>';
	messageboard.scrollTop = messageboard.scrollTopMax
}

var moveDpadPos = new Vector(0, 0)
var moveDpadRadius = 0;
var shootDpadPos = new Vector(0, 0)
var shootDpadRadius = 0;

var grabbedMoveDpad = false;
var grabbedShootDpad = false;

function reorganizeUI()
{
	if(touchDevice)
		minimap.style.right = (window.innerWidth - minimap.width) / 2;
	else
		minimap.style.right = '2%';
}

function resizeCanvas()
{
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	minimap.width = 0.2 * window.innerWidth;
	minimap.height = 0.2 * window.innerHeight;

	moveDpadPos = new Vector(canvas.width * 0.16, canvas.height * 0.7);
	moveDpadRadius = (canvas.width + canvas.height) / 2 * 0.13;

	shootDpadPos = new Vector(canvas.width * 0.84, canvas.height * 0.7);
	shootDpadRadius = (canvas.width + canvas.height) / 2 * 0.08;

	draw();
}

function renderOnscreenCotrollUI()
{
	context.save();
	context.lineWidth = 4;
	context.fillStyle = "black";
	context.strokeStyle = "black";

	// Move dpad
	context.beginPath();
	context.arc(moveDpadPos.x, moveDpadPos.y, moveDpadRadius, 0, Math.PI * 2);
	context.closePath();

	context.globalAlpha = 0.2;
	context.fill();

	context.globalAlpha = 1;
	context.stroke();

	// Shoot dpad
	context.beginPath();
	context.arc(shootDpadPos.x, shootDpadPos.y, shootDpadRadius, 0, Math.PI * 2);
	context.closePath();

	context.globalAlpha = 0.2;
	context.fill();

	context.globalAlpha = 1;
	context.stroke();

	context.restore();
}


function handleTouchStart(event)
{
	event.preventDefault();
	setDeviceTouchStatus(true);

	touchDevice = true;
	for(var i = 0;i < event.touches.length;++ i)
	{
		var t = event.touches[i];
		if(distance(t.pageX, t.pageY, moveDpadPos.x, moveDpadPos.y) < moveDpadRadius)
			grabbedMoveDpad = true;
		if(distance(t.pageX, t.pageY, shootDpadPos.x, shootDpadPos.y) < shootDpadRadius)
			grabbedShootDpad = true;
	}
}

function handleTouchMove(event)
{
	event.preventDefault();
	setDeviceTouchStatus(true);

	for(var i = 0;i < event.touches.length;++ i)
	{
		var t = event.touches[i];
		if(t.pageX < canvas.width / 2 && grabbedMoveDpad)
		{
			if(myself != null)
			{
				var dx = t.pageX - moveDpadPos.x;
				var dy = t.pageY - moveDpadPos.y;
				var angle = Math.atan2(dy, dx);
				if(angle < 0)
					angle = Math.PI + Math.PI - Math.abs(angle);
				console.log(angle);

				var ab = Math.PI / 180 * 22.5;
				var ae = Math.PI / 180 * 157.5;
				keys[40] = (angle > ab && angle < ae); // Down

				ab += Math.PI / 180 * 90;
				ae += Math.PI / 180 * 90;
				keys[37] = (angle > ab && angle < ae); // Left

				ab += Math.PI / 180 * 90;
				ae += Math.PI / 180 * 90;
				keys[38] = (angle > ab && angle < ae); // Up

				ab += Math.PI / 180 * 90;
				ae += Math.PI / 180 * 90;
				keys[39] = ((angle > ab && angle < ae) || angle < Math.PI / 180 * 67.5); // Right
			}
		}
		if(t.pageX > canvas.width / 2 && grabbedShootDpad)
		{
			if(myself != null)
			{
				var dx = t.pageX - shootDpadPos.x;
				var dy = t.pageY - shootDpadPos.y;
				var angle = Math.atan2(dy, dx);
				rotation = angle;
				var dist = distance(t.pageX, t.pageY, shootDpadPos.x, shootDpadPos.y);
				keys[32] = dist > shootDpadRadius; // the spacebar - lie sendShootRequest
			}
		}
	}
}

function handleTouchEnd(event)
{
	event.preventDefault();
	setDeviceTouchStatus(true);

	for(var i = 0;i < event.changedTouches.length;++ i)
	{
		var t = event.changedTouches[i];
		if(t.pageX < canvas.width / 2)
		{
			grabbedMoveDpad = false;
			keys[38] = false; // Up
			keys[40] = false; // Down
			keys[37] = false; // Left
			keys[39] = false; // Right
		}
		else
		{
			grabbedShootDpad = false;
			keys[32] = false;
		}
	}
}
