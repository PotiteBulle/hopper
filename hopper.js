require('dotenv').config()
const fs = require('fs');
const Discord = require('discord.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const prefix = process.env.PREFIX || "!"  // met "!" comme prefix par défaut, si pas surchargé


// Charger les commandes depuis le dossier 'commands'
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// Événement déclenché une fois que le bot est prêt
client.once('ready', () => {
    console.log('Le bot est prêt !');

    // Vérifier si le bot a la permission de bannir des membres
    if (!client.guilds.cache.some(guild => guild.me.permissions.has('BAN_MEMBERS'))) {
        console.error('Le bot n\'a pas la permission de gérer les bannissements.');
        return;
    }

    // Lire la liste des utilisateurices à bannir depuis le fichier txt
    fs.readFile('./bannissements/usersToBan.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Failed to read usersToBan.txt:', err);
            return;
        }

        const userIds = data.trim().split('\n');

        // Parcourir chaque serveur Discord où le bot est présent
        client.guilds.cache.forEach(guild => {
            // Parcourir chaque identifiant d'utilisateurices dans la liste {#userToBans}
            userIds.forEach(userId => {
                // Vérifier si l'identifiant d'utilisateurices est valide
                if (!userId.match(/^\d+$/)) {
                    console.error(`Invalid user ID: ${userId}`);
                    return;
                }

                // Bannir les utilisateurices du serveur Discord avec la raison spécifiée
                guild.members.ban(userId.trim(), { reason: 'Demandes et participations aux partages de contenus interdits.' })
                    .then(user => console.log(`Banned user ${user.id} from server ${guild.name}`))
                    .catch(error => console.error(`Failed to ban user ${userId} from server ${guild.name}`, error));
            });
        });
    });
});

// Événement déclenché à la réception d'un message
client.on('message', message => {
    // Vérifier si le message ne commence pas par le préfixe du bot ou a été envoyé par un autre bot
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // Séparer le nom de la commande et ses arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Vérifier si la commande existe dans la collection de commandes
    if (!client.commands.has(commandName)) return;

    // Récupérer la commande correspondante depuis la collection
    const command = client.commands.get(commandName);

    try {
        // Exécuter la commande avec le message et les arguments
        command.execute(message, args);
    } catch (error) {
        // En cas d'erreur, afficher l'erreur dans la console
        console.error(error);
        // Envoyer un message d'erreur au canal Discord où la commande a été utilisée
        message.reply('Une erreur est survenue lors de l\'exécution de cette commande.');
    }
});

// Se connecter au serveur Discord en utilisant le token du bot
client.login(process.env.TOKEN);
