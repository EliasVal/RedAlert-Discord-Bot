import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
import fetch from 'node-fetch';
import { readFileSync } from 'fs';

import 'dotenv/config';

let lastAlertId = -1;
let lastAlertAmount = 0;
let count = 0;
let lastMessage = null;

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

async function Announce() {
  if (count != 0 && count < 5) {
    count++;
    return;
  }

  // const allAlerts = JSON.parse(await readFileSync('./testing.json'));
  const res = await fetch('https://api.tzevaadom.co.il/alerts-history/');

  let allAlerts;

  if (res.ok) allAlerts = await res.json();
  else {
    allAlerts = [{ id: -1 }];
    // If API fails, wait a bit before retry
    count = 1;
  }
  if(lastAlertId == -1){
    lastAlertId = allAlerts[0].id;
    lastAlertAmount = allAlerts[0].alerts.length
  }
  if (allAlerts[0].id >= lastAlertId && allAlerts[0].id != -1) {
      const alerts = allAlerts.filter((alert) => alert.id >= lastAlertId).reverse();
      for (const alert of alerts) {
        let msg = '';
        for (const a of alert.alerts) {
          if (a.threat == 9) continue;
          if (a.isDrill) continue;

          msg += `${threats[a.threat]} - [${new Date(a.time * 1000).toLocaleTimeString('he-IL', {
            timeZone: 'Israel',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}]:\n${a.cities.map((city) => cities[city].en).join(', ')}\n\n`;
        }

        if (msg == '') continue;

        const c = await client.channels.fetch(process.env.ANNOUNCE_CHANNEL);
        const embed = new EmbedBuilder();
        embed.setColor('DarkRed');
        embed.setTitle("Sirens in Israel");
        embed.setDescription(msg);
        if(alert.id == lastAlertId && lastMessage != null){
          if(alert.alerts.length > lastAlertAmount){
            lastMessage.edit({ embeds: [embed] })
          }
        }else{
          lastMessage = await c.send({ embeds: [embed] });
        }
        if(alert.id >= lastAlertId){
          lastAlertId = alert.id;
          lastAlertAmount = alert.alerts.length;
        }
      }
    }

  setTimeout(Announce, 2000);
}

client.on('ready', Announce);
client.login(process.env.TOKEN);
export {};
