/* TO-DO
- Make it so that you can only have one bet active at a time (adding to a bet is okay but making a bet on both is not)
- Make it so that you cannot press the buttons more than once
- Private stream chat when not streaming through streamstart and streamend commands
- Stream overlay...
    - Live predictions
    - Stream chat
    - Overlay Image
    - Stream Alerts
- Make it so that only I can use certain commands (streamstart, streamend, prediction, endprediction)
*/

require('dotenv').config({ path: '.env' });
const { Client, IntentsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { updateTicketCount, getTicketCount, getPoints, updatePoints } = require('./database-logic');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
})

const pollVotes = {
    option1: 0,
    option2: 0,
};

const userBets = {};

client.on('ready', (c) => {
    console.log(`${c.user.tag} is online.`)
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'prediction') {
        const title = interaction.options.getString('title');
        const option1 = interaction.options.getString('option1');
        const option2 = interaction.options.getString('option2');

        const row = new ActionRowBuilder();
        row.addComponents(
            new ButtonBuilder().setLabel(option1).setStyle(ButtonStyle.Primary).setCustomId('o1'),
            new ButtonBuilder().setLabel(option2).setStyle(ButtonStyle.Danger).setCustomId('o2')
        );

        await interaction.reply({
            content: title,
            components: [row],
        });
    }

    if (interaction.commandName === 'ticketcount') {
        const userID = interaction.user.id;
        updateTicketCount(userID, interaction.member);
        await interaction.reply( {content: `You have ${getTicketCount(userID)} tickets!`, ephemeral: true});

    }
    if (interaction.commandName === 'bet') {
        const option = interaction.options.getString('option');
        const amount = interaction.options.getInteger('amount');

        const userID = interaction.user.id;
        const userPoints = getPoints(userID);
        if (amount > userPoints || amount <= 0) {
            return await interaction.reply({ content: 'Invalid bet amount.', ephemeral: true });
        }

        updatePoints(userID, -amount);

        // Track the user's bet
        if (!userBets[userID]) {
            userBets[userID] = {};
        }
        if (!userBets[userID][option]) {
            userBets[userID][option] = 0;
        }
        userBets[userID][option] += amount;

        await interaction.reply({ content: `${interaction.user} bet ${amount} points on ${option}!`});
    }

    if (interaction.commandName === 'endprediction') {
        const winnerValue = interaction.options.getString('winner');
        const choices = [
            { name: 'Option 1', value: 'option1' },
            { name: 'Option 2', value: 'option2' },
        ];
        const winnerLabel = choices.find(choice => choice.value === winnerValue)?.name;
        let extraPoints = 0;

        const totalOption1Bets = Object.values(userBets).reduce((sum, user) => sum + (user.option1 || 0), 0);
        const totalOption2Bets = Object.values(userBets).reduce((sum, user) => sum + (user.option2 || 0), 0);

        const winningOption = totalOption1Bets > totalOption2Bets ? 'option1' : 'option2';
        if(totalOption1Bets >= totalOption2Bets) {
            extraPoints = totalOption1Bets/totalOption2Bets;
        } else {
            extraPoints = totalOption2Bets/totalOption1Bets;
        }
        for (const userID in userBets) {
            if (userBets[userID][winningOption]) {
                updatePoints(userID, userBets[userID] * extraPoints);
            }
        }

        await interaction.reply({content: `The winner is ${winnerLabel}!\n
        Option 1: ${pollVotes.option1} votes.\n
        Option 2: ${pollVotes.option2} votes.`});

        for (const userID of Object.keys(userBets)) {
            delete userBets[userID];
        }
    }
    if (interaction.commandName === 'pointcount') {
        const userID = interaction.user.id;
        updatePoints(userID);
        await interaction.reply( {content: `You have ${getPoints(userID)} points!`, ephemeral: true});
    }
    if (interaction.commandName === 'startstream') {
        
    }
    if (interaction.commandName === 'endstream') {

    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) {
        //for future commands
    }
    if (interaction.customId === 'o1') {
        pollVotes.option1++;
        await interaction.reply({ content: 'You pressed button 1', ephemeral: true });
    } else if (interaction.customId === 'o2') {
        pollVotes.option2++;
        await interaction.reply({ content: 'You pressed button 2', ephemeral: true });
    }
})

client.on('messageCreate', async (message) => {
    if (message.guildId === process.env.STREAM_CHAT) {
        updatePoints(message.author.id, 5);
    }
});

client.login(process.env.TOKEN);