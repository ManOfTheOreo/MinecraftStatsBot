//FILL IN THE BLANKS HERE OR IT WONT WORK================================================
//I'm also asuming people know how to make config.json? I'm sorry, I'm new to this...
var mcIP = "";                         // Your MC server IP
var mcPort = 25565;                   // Your MC server port (default is 25565)
var pubChat = "";                    // Channel ID that will have the anouncements
var privChat = "";                  // Channel ID that will have bot startup msg
var adminID = "";                  // Your Discord user ID, or the server's admin
var onRole = "";                  // Your @Online role ID
//credit to u/lerokko for making code that I shamelessly stole===========================
const Discord = require("discord.js");
const client = new Discord.Client();
const config = require('./config.json');
const mcping = require('mc-ping-updated');
var on;
var status;
var list;

//Checks server status (every 5 seconds)
function update() {
  mcping(mcIP, mcPort, function(err, res) {
    if (err) {//server is off
      status = "Server Offline";
      client.user.setStatus('dnd');
      if(on){
        client.channels.get(pubChat).send("The Server Is Offline. Did You Break It " + adminID + "?");
      }
      on = false;
    } 
    else{//server is on
      //getting player list
      list = ""
      for(var x in res.players.sample){
        list += "\n>`"+res.players.sample[x].name+"`";          
      }
      //Yellow=Full Server
      if(res.players.online>=res.players.max){
        client.user.setStatus('idle')               
      }
      //Green=Online Server
      else{
        client.user.setStatus('online');
        if(!on){
          client.channels.get(pubChat).send("The Server Is " + onRole + "!");
        }
        if(res.players.online==1){
          status = ' 1 Online Player';
        }
        else{
          status = ' ' + res.players.online + ' Online Players';
        }
        on = true;
      }
    }
    client.user.setActivity(status, {type: 'PLAYING'})
  }, 3000);
}

//Bootup
client.on("ready", () => {
  console.log("I am ready!");
  client.channels.get(privChat).send("*taptaptap* is this thing on???")
  client.setInterval(update,5000);
});

//Ping/Pong
client.on("message", (message) => {
  if (message.content.startsWith(config.prefix+"ping")) {
    message.channel.send("pong!");
  }
});

//Check Who Is On
client.on("message", (message =>{
  if(message.content.toLowerCase().startsWith(config.prefix+"list")){
    if(on){
      let output = new Discord.RichEmbed()
      .setTitle("Currently Online:")
      .setDescription(list)
      .setColor(1)
      .setFooter(mcIP,message.guild.iconURL)
      message.channel.send(output)
    }
    else{
      message.channel.send(":x:**The Server Is Down**:x:")
    }
  }
}));

//Let People Turn On/Off Notification
client.on("message", (message=>{
  if(message.content.toLowerCase().startsWith(config.prefix+"notif")){
    var role = message.guild.roles.get(onRole.substring(3,onRole.length-1));
    let member = message.member;
    if((member.roles.has(role.id))){
      member.removeRole(role).catch(console.error);
      message.channel.send("You're no longer being notified!")
    }
    else{
      member.addRole(role).catch(console.error);
      message.channel.send("You're now being notified!")
    }
  }
}));
client.login(config.token);//Your bot's token