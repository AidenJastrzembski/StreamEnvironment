require('dotenv').config('.env');
const fs = require('fs');

const databaseFile = 'userDatabase.json';

let userDatabase = loadDatabase(databaseFile);

function loadDatabase(databaseFile) {
    try {
        const data = fs.readFileSync(databaseFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error loading database (${databaseFile}):`, error.message);
        return {};
    }
}

function saveDatabase(databaseFile, database) {
    fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
}

function updateTicketCount(userId, member) {
    const rolesToTicketCount = {
        [process.env.DISTIER3]: 150,
        [process.env.DISTIER2]: 100,
        [process.env.DISTIER1]: 50,
        [process.env.TWITCHTIER3]: 150,
        [process.env.TWITCHTIER2]: 100,
        [process.env.TWITCHTIER1]: 50,
    };

    let ticketCount = 100;

    Object.keys(rolesToTicketCount).forEach(role => {
        if (member.roles.cache.has(role)) {
            ticketCount += rolesToTicketCount[role];
        }
    });

    userDatabase[userId] = {
        ...userDatabase[userId],
        ticketCount: ticketCount
    };

    saveDatabase(databaseFile, userDatabase);
}

function updatePoints(userId, amount = 0) {

    let currentPoints = getPoints(userId);


    userDatabase[userId] = {
        ...userDatabase[userId],
        pointCount: currentPoints + amount
    };

    saveDatabase(databaseFile, userDatabase);
}


function getTicketCount(userId) {
    return userDatabase[userId]?.ticketCount || 100;
}


function getPoints(userId) {
    const user = userDatabase[userId];
    return user.pointCount || 100;
}
module.exports = { updateTicketCount, getTicketCount, updatePoints, getPoints };
