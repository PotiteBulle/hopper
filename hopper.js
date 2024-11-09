const fs = require('fs').promises;
const { Client, Intents } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MEMBERS]
});

client.once('ready', async () => {
    console.log('Le bot est prêt !');
    try {
        // Lire et valider les IDs des utilisateurs à bannir
        const data = await fs.readFile('./Bannissements/UsersToBan.txt', 'utf8');
        const userIds = data.trim().split('\n').map(id => id.trim()).filter(id => /^\d+$/.test(id));

        if (userIds.length === 0) {
            console.error("Aucun utilisateur valide à bannir trouvé dans UsersToBan.txt");
            return;
        }

        // Récupérer les IDs des serveurs depuis les variables d'environnement
        const serverIds = JSON.parse(process.env.SERVER_IDS);
        
        for (const serverId of serverIds) {
            const guild = client.guilds.cache.get(serverId);
            if (!guild) {
                console.error(`Serveur non trouvé avec l'ID : ${serverId}`);
                continue;
            }

            // Vérification des permissions de bannissement pour éviter des erreurs
            if (!guild.me.permissions.has('BAN_MEMBERS')) {
                console.error(`Permissions de bannissement manquantes pour le serveur ${guild.name}`);
                continue;
            }

            await Promise.all(userIds.map(async userId => {
                try {
                    await guild.members.ban(userId, { reason: '[HopperSystem] - Demandes et participations aux partages de contenus interdits.' });
                    console.log(`Utilisateur ${userId} banni du serveur ${guild.name}`);
                } catch (error) {
                    console.error(`Erreur en bannissant l'utilisateur ${userId} du serveur ${guild.name}`, error);
                }
            }));

            console.log(`Tous les utilisateurs ont été traités pour le serveur ${guild.name}`);
        }
    } catch (err) {
        console.error("Erreur de lecture du fichier ou des IDs de serveurs :", err);
    }
});

// Connexion au serveur Discord en utilisant le token du bot
client.login(process.env.TOKEN);