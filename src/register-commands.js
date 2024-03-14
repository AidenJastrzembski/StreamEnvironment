require('dotenv').config({ path: '.env'});
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'prediction',
        description: 'Create a prediction for Stream',
        options: [
            {
                name: 'title',
                description: 'Title of the prediction.',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: 'option1',
                description: 'Option for button 1',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: 'option2',
                description: 'Option for button 2',
                type: ApplicationCommandOptionType.String,
                required: true,
            }
        ]
    },
    {
        name: 'ticketcount',
        description: 'Update and Display your current Ticket Count.',
    },
    {
        name: 'pointcount',
        description: 'Update and Display your current point Count.',
    },
    {
        name: 'bet',
        description: 'Bet tickets on a prediction option.',
        options: [
            {
                name: 'option',
                description: 'Prediction option to bet on.',
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    { name: 'Option 1', value: 'option1' },
                    { name: 'Option 2', value: 'option2' },
                ],
            },
            {
                name: 'amount',
                description: 'Number of tickets to bet.',
                type: ApplicationCommandOptionType.Integer,
                required: true,
            },
        ],
    },
    {
        name: 'endprediction',
        description: 'Declare the winner of a prediction.',
        options: [
            {
                name: 'winner',
                description: 'The winning option.',
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    { name: 'Option 1', value: 'option1' },
                    { name: 'Option 2', value: 'option2' },
                ],
            },
        ],
    },
    {
        name: 'startstream',
        description: 'Starts all stream related functions.',
    },
    {
        name: 'endstream',
        description: 'Ends all stream related functions.',
    }
];

const rest = new REST({ version: '10'}).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registering Commands...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands}
        )
        console.log('Commands registered Successfully!');
    }
    catch (error) {
        console.log(`There was an error: ${error}`);
    }
})();