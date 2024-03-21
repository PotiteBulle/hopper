const fs = require('fs');
const Discord = require('discord.js');

// Importer le token du bot et l'identifiant du serveur depuis le fichier de configuration
const { token, serverId } = require('./security/config.json');

// Créer une instance du client Discord
const client = new Discord.Client();

// Événement déclenché une fois que le bot est prêt
client.once('ready', () => {
    console.log('Bot is ready.');

    // Récupérer le serveur Discord à partir de son identifiant
    const guild = client.guilds.cache.get(serverId);
    if (!guild) {
        console.error('Server not found.');
        return;
    }

    // Lire la liste des utilisateurices à bannir depuis le fichier txt
    fs.readFile('./bannissements/usersToBan.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Failed to read usersToBan.txt:', err);
            return;
        }

        // Séparer les identifiants des utilisateurs en utilisant des sauts de ligne comme délimiteurs
        const userIds = data.trim().split('\n');

        // Parcourir chaque identifiant d'utilisateurices
        userIds.forEach(userId => {
            // Bannir l'utilisateurices du serveur Discord avec la raison spécifiée
            guild.members.ban(userId.trim(), { reason: 'Demandes et participations aux partages de contenus interdits.' })
                .then(user => console.log(`Banned user: ${user.username}`))
                .catch(error => console.error(`Failed to ban user: ${userId}`, error));
        });
    });
});

// Se connecter au serveur Discord en utilisant le token du bot
client.login(token);
