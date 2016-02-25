Communication
====
The first 8 bits of every packet are used to identify it's purpose. They are referred here as *pid*. As it is easy to see, the first two digits in decimal are the 'category' of that packed.  

00 - authentication  
01 - users  
02 - bullets  
03 - map related, walls for example  
04 - information boards  

Send by the server:  
001 - request for a [new] name  
002 - start game, connection complete  

011 - user joined  
012 - user disconnected  
013 - basic player info  
014 - player died  
015 - player respawned  

021 - add bullet  
022 - remove bullet  
023 - basic bullet info  

031 - add wall  

041 - new message  
042 - update scoreboard  
