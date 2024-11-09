const fs = require('fs').promises;
const { Client, Intents } = require('discord.js');
require('dotenv').config();

// Vérification des variables d'environnement essentielles
if (!process.env.TOKEN || !process.env.SERVER_IDS) {
    console.error("Les variables d'environnement TOKEN ou SERVER_IDS sont manquantes.");
    process.exit(1);
}

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MEMBERS]
});

// Fonction pour lire et valider les IDs d'utilisateurs à partir du fichier
async function getUserIdsToBan(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return data
            .split('\n')
            .map(id => id.trim())
            .filter(id => /^\d+$/.test(id)); // Filtre uniquement les IDs numériques valides
    } catch (err) {
        console.error("Erreur de lecture du fichier d'utilisateurs à bannir :", err);
        return [];
    }
}

// Fonction de bannissement des utilisateurs pour un serveur donné
async function banUsersFromGuild(guild, userIds) {
    if (!guild.me.permissions.has('BAN_MEMBERS')) {
        console.warn(`Permissions de bannissement manquantes pour le serveur ${guild.name}`);
        return;
    }

    const results = await Promise.allSettled(userIds.map(async userId => {
        try {
            await guild.members.ban(userId, { reason: '[HopperSystem] - Demandes et participations aux partages de contenus interdits.' });
            console.log(`Utilisateur ${userId} banni du serveur ${guild.name}`);
        } catch (error) {
            console.error(`Erreur en bannissant l'utilisateur ${userId} du serveur ${guild.name}`, error);
        }
    }));

    console.log(`Traitement terminé pour le serveur ${guild.name}. Résumé :`);
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            console.log(`- ${userIds[index]} : Banni avec succès`);
        } else {
            console.warn(`- ${userIds[index]} : Échec du bannissement`);
        }
    });
}

client.once('ready', async () => {
    console.log('Le bot est prêt !');
    
    // Lecture et validation des IDs d'utilisateurs à bannir
    const userIds = await getUserIdsToBan('./Bannissements/UsersToBan.txt');
    if (userIds.length === 0) {
        console.warn("Aucun utilisateur valide à bannir trouvé dans UsersToBan.txt");
        return;
    }

    // Récupération et traitement des IDs des serveurs
    const serverIds = JSON.parse(process.env.SERVER_IDS);
    for (const serverId of serverIds) {
        const guild = client.guilds.cache.get(serverId);
        if (!guild) {
            console.warn(`Serveur non trouvé avec l'ID : ${serverId}`);
            continue;
        }

        await banUsersFromGuild(guild, userIds);
    }
});

// Connexion au serveur Discord en utilisant le token du bot
client.login(process.env.TOKEN);
