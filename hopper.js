const fs = require('fs');
const { Client, Intents, MessageEmbed } = require('discord.js');
require('dotenv').config(); // Charge les variables d'environnement depuis .env

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MEMBERS] });

client.once('ready', () => {
    console.log('Le bot est prêt !');

    // Lire la liste des utilisateurs à bannir depuis le fichier txt
    fs.readFile('./Bannissements/UsersToBan.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier UsersToBan.txt :', err);
            return;
        }

        const userIds = data.trim().split('\n').map(id => id.trim());

        const serverIds = JSON.parse(process.env.SERVER_IDS); // Convertir la chaîne JSON en tableau

        // Parcourir chaque serveur Discord où le bot est présent
        serverIds.forEach(serverId => {
            const guild = client.guilds.cache.get(serverId);
            if (!guild) {
                console.error(`Impossible de trouver le serveur avec l'ID ${serverId}`);
                return;
            }

            // Créer une promesse pour chaque bannissement
            const banPromises = userIds.map(userId => {
                // Vérifier si l'identifiant d'utilisateur est valide
                if (!userId.match(/^\d+$/)) {
                    console.error(`ID d'utilisateur invalide : ${userId}`);
                    return Promise.resolve();
                }

                // Bannir l'utilisateur du serveur Discord avec une raison spécifiée
                return guild.members.ban(userId, { reason: '[HopperSystem] - Demandes et participations aux partages de contenus interdits.' })
                    .then(() => console.log(`Utilisateur banni ${userId} du serveur ${guild.name}`))
                    .catch(error => console.error(`Impossible de bannir l'utilisateur ${userId} du serveur ${guild.name}`, error));
            });

            // Attendre que toutes les promesses de bannissement soient résolues
            Promise.all(banPromises)
                .then(() => {
                    console.log(`Tous les utilisateurs ont été bannis avec succès de ${guild.name}`);
                })
                .catch(console.error);
        });
    });
});

// Se connecter au serveur Discord en utilisant le token du bot
client.login(process.env.TOKEN);