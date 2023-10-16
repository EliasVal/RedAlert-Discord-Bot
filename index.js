import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
import fetch from 'node-fetch';

import 'dotenv/config';

let lastAlertId = -1;

const cities = (await (await fetch('https://www.tzevaadom.co.il/static/cities.json?v=5')).json()).cities;

const threats = {
  0: 'Red Alert',
  1: 'Hazardous Materials Incident',
  2: 'Suspected Terrorist infiltration',
  3: 'Earthquake',
  4: 'Suspected Tsunami',
  5: 'Hostile aircraft intrusion',
  6: 'Suspected Radiological incident',
  7: 'Non-conventional missile',
  8: 'Alert',
  9: 'Red Alert Drill',
};

import express from 'express';

const app = express();

import bodyParser from 'body-parser';

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', (req, res) => {
  res.send('Received, ' + Date.now());
});

const listener = app.listen(process.env.PORT, () => {
  console.log('Listening on PORT ' + listener.address().port);
});

function ping() {
  fetch(process.env.replURL);

  console.log('Pinged REPL');
}

setInterval(ping, 50000);

client.on('ready', () => {
  setInterval(async () => {
    const res = await fetch('https://api.tzevaadom.co.il/alerts-history/');

    let allAlerts;
    try {
      allAlerts = await res.json();
    } catch {
      allAlerts = [{ id: -1 }];
    }

    if (allAlerts[0].id != lastAlertId && allAlerts[0].id != -1) {
      if (lastAlertId != -1) {
        const alerts = allAlerts.filter((alert) => alert.id > lastAlertId);

        let msg = '';

        for (const alert of alerts) {
          for (const a of alert.alerts) {
            if (a.threat == 9) continue;
            if (a.isDrill) continue;

            msg += `${threats[a.threat]} - [${new Date(a.time * 1000).toLocaleTimeString('he-IL')}]:\n${a.cities
              .map((city) => cities[city].en)
              .join(', ')}\n\n`;
          }

          const c = await client.channels.fetch(process.env.ANNOUNCE_CHANNEL);

          const embed = new EmbedBuilder();
          embed.setColor('DarkRed');
          embed.setTitle('Sirens in Israel');
          embed.setDescription(msg);
          c.send({ embeds: [embed] });
        }
      }

      lastAlertId = allAlerts[0].id;
    }
  }, 2500);
});

client.login(process.env.TOKEN);

export {};
