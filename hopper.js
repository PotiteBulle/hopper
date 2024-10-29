const fs = require('fs').promises;
const { Client, Intents } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MEMBERS]
});

client.once('ready', async () => {
    console.log('Le bot est prêt !');

    try {
        // Lire la liste des utilisateurs à bannir depuis le fichier txt
        const data = await fs.readFile('./Bannissements/UsersToBan.txt', 'utf8');
        const userIds = data.trim().split('\n').map(id => id.trim()).filter(Boolean);

        // Lire et convertir les IDs de serveurs depuis les variables d'environnement
        const serverIds = JSON.parse(process.env.SERVER_IDS);

        // Parcourir chaque serveur Discord où le bot est présent
        for (const serverId of serverIds) {
            const guild = client.guilds.cache.get(serverId);
            if (!guild) {
                console.error(`Serveur non trouvé avec l'ID : ${serverId}`);
                continue;
            }

            for (const userId of userIds) {
                if (!/^\d+$/.test(userId)) {
                    console.error(`ID d'utilisateur invalide : ${userId}`);
                    continue;
                }

                try {
                    await guild.members.ban(userId, { reason: '[HopperSystem] - Demandes et participations aux partages de contenus interdits.' });
                    console.log(`Utilisateur banni ${userId} du serveur ${guild.name}`);
                } catch (error) {
                    console.error(`Impossible de bannir l'utilisateur ${userId} du serveur ${guild.name}`, error);
                }
            }

            console.log(`Tous les utilisateurs ont été traités pour le serveur ${guild.name}`);
        }
    } catch (err) {
        console.error('Erreur lors de la lecture du fichier UsersToBan.txt ou de l\'ID de serveurs :', err);
    }
});

// Connexion au serveur Discord en utilisant le token du bot
client.login(process.env.TOKEN);