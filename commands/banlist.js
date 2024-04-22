const fs = require('fs'); // Importer le module 'fs' (file system) pour lire et écrire des fichiers

module.exports = {
    name: 'banlist', // Nom de la commande
    description: 'Génère un fichier texte contenant la liste des utilisateurices bannis.', // Description de la commande
    execute(message, args) { // Fonction d'exécution de la commande
        // Vérifier que l'utilisateurice a la permission de gérer les bannissements
        if (!message.guild.me.hasPermission('BAN_MEMBERS')) {
            return message.reply('Je n\'ai pas la permission de gérer les bannissements.');
        }

        // Récupérer la liste des utilisateurices bannis sur le serveur
        message.guild.fetchBans().then(bans => {
            // Convertir la liste des bannissements en une chaîne de caractères avec motif
            const banList = bans.map(ban => `${ban.user.tag} (${ban.user.id}) - Motif : ${ban.reason}`).join('\n');

            // Écrire la liste des bannissements dans un fichier texte
            fs.writeFile('bans.txt', banList, (err) => {
                if (err) {
                    console.error(err);
                    return message.reply('Une erreur est survenue lors de la génération du fichier.');
                }

                // Envoyer le fichier texte contenant la liste des bannissements
                message.channel.send({ files: ['bans.txt'] });
            });
        }).catch(error => {
            console.error(error);
            message.reply('Une erreur est survenue lors de la récupération de la liste des bannissements.');
        });
    },
};
