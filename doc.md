Communication
====
The first 8 bits of every packet should be used to identify it's purpose. They are referred here as *pid*.
Send by the server:  
PID | Simple explanation  
0 ->	Request for name. Can be send multiple times.  
1 ->	New user has joined.  
 * The second byte is N, the lenght of the new user's name.
 * The next N bytes are the name. UTF-8 and shit **TODO**
 * The last 4 bytes are unique id of the following packet that contains the ingame player entity info.
10 ->	Player entity info.
 * The first 4 bytes after the pid ('10' in this case) should match an id sent by a packet with pid '1'.
