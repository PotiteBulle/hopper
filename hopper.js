const fs = require('fs');
const Discord = require('discord.js');
require('dotenv').config(); // Charge les variables d'environnement depuis .env

const client = new Discord.Client();

client.once('ready', () => {
    console.log('Le bot est prêt !');

    // Lire la liste des utilisateurices à bannir depuis le fichier txt
    fs.readFile('./Bannissements/UsersToBan.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier UsersToBan.txt :', err);
            return;
        }

        const userIds = data.trim().split('\n').map(id => id.trim());

        const serverIds = JSON.parse(process.env.SERVER_IDS); // Convertir la chaîne JSON en tableau

        // Parcourir chaque serveur Discord où le bot est présent
        serverIds.forEach(serverId => {
            const guild = client.guilds.cache.find(guild => guild.id === serverId);
            if (!guild) {
                console.error(`Impossible de trouver le serveur avec l'ID ${serverId}`);
                return;
            }

            // Créer une promesse pour chaque bannissement
            const banPromises = userIds.map(userId => {
                // Vérifier si l'identifiant d'utilisateurices est valide
                if (!userId.match(/^\d+$/)) {
                    console.error(`ID d'utilisateur invalide : ${userId}`);
                    return Promise.resolve();
                }

                // Bannir l'utilisateurices du serveur Discord avec une raison spécifiée
                return guild.members.ban(userId, { reason: 'Demandes et participations aux partages de contenus interdits.' })
                    .then(user => console.log(`Utilisateurices banni ${user.id} du serveur ${guild.name}`))
                    .catch(error => console.error(`Impossible de bannir l'utilisateurices ${userId} du serveur ${guild.name}`, error));
            });

            // Attendre que toutes les promesses de bannissement soient résolues
            Promise.all(banPromises)
                .then(() => {
                    console.log(`Tous les utilisateurices ont été bannis avec succès de ${guild.name}`);
                })
                .catch(console.error);
        });
    });
});

// Se connecter au serveur Discord en utilisant le token du bot
client.login(process.env.TOKEN);