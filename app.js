const fs = require("fs");
const dotenv = require("dotenv");
const config = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();

dotenv.config();

//https://discord.com/oauth2/authorize?client_id=850521147517960222&scope=bot&permissions=268435456

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("guildMemberAdd", (member) => {
    try {
        let randomColor = config.colors[Math.floor(Math.random() * config.colors.length)];
        console.log(randomColor);
        var role = member.guild.roles.cache.find((role) => role.id === randomColor.id);
        member.roles.add(role);
    } catch (e) {
        console.log(e);
    }
});

client.on("message", (msg) => {
    try {
        if (msg.content.startsWith("!colors add")) {
            let usersToAdd = [];
            console.log("Map size before: " + msg.mentions.roles.size);
            config.colors.forEach((element) => {
                msg.mentions.roles.map((value, key) => {
                    if (element.id === value.id) {
                        msg.mentions.roles.delete(key);
                    }
                });
            });
            console.log("Map size after dupe removal: " + msg.mentions.roles.size);
            msg.mentions.roles.map((value) => {
                console.log(`${value.name}, iD=${value.id}`);
                usersToAdd.push({
                    id: value.id,
                    name: value.name,
                });
            });

            // We should put this write into a function
            // also check for dupes and remove and dupes. before write
            config.colors = [...config.colors, ...usersToAdd];
            let data = JSON.stringify(config);
            fs.writeFileSync("config.json", data);
        }
        if (msg.content.startsWith("!colors list")) {
            let stringOfRoles = "";
            config.colors.map((value) => {
                stringOfRoles += `<@&${value.id}> `;
            });

            msg.reply("Current colors randomly assigned are: " + stringOfRoles);
        }

        if (msg.content.startsWith("!colors remove")) {
            let found = false;
            config.colors.forEach((configColor, index) => {
                msg.mentions.roles.forEach((mentionedColor, key) => {
                    if (mentionedColor.id === configColor.id) {
                        config.colors.splice(index, 1);
                        let data = JSON.stringify(config);
                        fs.writeFileSync("config.json", data);
                        return;
                    }
                });
                if (found) return;
            });
        }
    } catch (e) {
        console.log(e);
    }
});

client.login(process.env.TOKEN);
