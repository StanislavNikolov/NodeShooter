var scoreboard = document.getElementById('scoreboard');

function refreshScoreboard()
{
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
