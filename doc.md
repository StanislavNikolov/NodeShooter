Communication
====
The first 8 bits of every packet should be used to identify it's purpose. They are referred here as *pid*.
Send by the server:  
PID | Simple explanation  
0 ->	Request for name. Can be send multiple times.  
1 ->	New user has joined.  
 * The second byte is N, the lenght of the new user's name.
 * The next N bytes are the name. UTF-8 and shit **TODO**
 * ...
2 ->	New wall
5 -> 	Connection Complete
