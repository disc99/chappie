var Botkit = require('botkit');

const BOT_NAME = 'chappie';
const commands = {
  'help': ['help'],
  'greet': ['hello','hi'],
  'profile': ['profile'],
  'manipulate': ['manipulate']
}

if (!process.env.token) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

const controller = Botkit.slackbot({
 debug: false
});

controller.spawn({
  token: process.env.token
}).startRTM((err) => {
  if (err) {
    throw new Error(err);
  }
});

controller.hears(commands.help,['direct_message','direct_mention','mention'], (bot,message) => {
    const usage = [`${BOT_NAME}のできること`];
    usage.push(`\`@${BOT_NAME} ${commands.help}\`: できること`)
    usage.push(`\`@${BOT_NAME} ${commands.greet}\`: あいさつ`)
    usage.push(`\`@${BOT_NAME} ${commands.profile}\`: ${BOT_NAME}を詳しく知る`)
    usage.push(`\`@${BOT_NAME} ${commands.manipulate}\`: ${BOT_NAME}を操る:skull:`)
    bot.reply(message, usage.join('\n'));
});

controller.hears(commands.greet,['direct_message','direct_mention','mention'], (bot,message) => {
    bot.reply(message,"Bow-wow!");
});

controller.hears(commands.profile,['direct_message','direct_mention','mention'], (bot,message) => {
    bot.startConversation(message, function(err, convo) {
        const questions = {
          'q': 'ぼくの何が知りたい？',
          'commands': {
              'info': 'ぼくは誰？',
              'house': 'すんでいるところの情報',
              'more': 'さらに詳しく'
          }
        }
        const q = [questions.q].concat(Object.keys(questions.commands).map(cmd => `\`${cmd}\`: ${questions.commands[cmd]}`)).join('\n');
        convo.ask(q, [
            {
                pattern: 'info',
                callback: function(response,convo) {
                    convo.say(`ぼくはチャウチャウの${BOT_NAME} :sparkles:`);
                    convo.say('https://ja.wikipedia.org/wiki/%E3%83%81%E3%83%A3%E3%82%A6%E3%83%BB%E3%83%81%E3%83%A3%E3%82%A6');
                    convo.say('みんなのサポートをするからぼくにも話しかけてね :notes:');
                    convo.next();
                }
            },
            {
                pattern: 'house',
                callback: function(response,convo) {
                  convo.say('ぼくの住んでいるところの情報だよ:house:');
                    const env = JSON.stringify(process.env, null , '\t');
                    convo.say(`\`\`\`\n${env}\n\`\`\``);
                    convo.next();
                }
            },
            {
                pattern: 'more',
                callback: function(response,convo) {
                    convo.say('ここをみてね :eyes:');
                    convo.say('https://github.com/disc99/chappie');
                    convo.next();
                }
            },
            {
                default: true,
                callback: function(response,convo) {
                    convo.repeat();
                    convo.next();
                }
            }
        ]);
    });
});

controller.hears(commands.manipulate, ['direct_message','direct_mention','mention'], (bot,message) => {
    bot.startConversation(message, function(err, convo) {
        convo.ask("実行するコマンドは？", function(response, convo) {
            const code = response.text;
            convo.ask(`実行してもいい？\n\`\`\`\n${code}\n\`\`\``, [
                {
                    pattern: bot.utterances.yes,
                    callback: function(response,convo) {
                        convo.say('実行結果は...');
                        try {
                            convo.say(`\`\`\`\n${eval(code)}\n\`\`\``)
                        } catch (e) {
                          convo.say(`\`\`\`\n${e}\n\`\`\``)
                        }
                        convo.next();
                    }
                },
                {
                    pattern: bot.utterances.no,
                    callback: function(response,convo) {
                        convo.say('おっけー');
                        convo.next();
                    }
                },
                {
                    default: true,
                    callback: function(response,convo) {
                        convo.repeat();
                        convo.next();
                    }
                }
            ]);
            convo.next();
        });
    });
});
