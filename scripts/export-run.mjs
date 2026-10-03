import fs from 'node:fs';import {compareScenario,csv} from '../web/model.js';
fs.mkdirSync('outputs',{recursive:true});for(const r of compareScenario()){fs.writeFileSync(`outputs/${r.strategy}-disturbance.csv`,csv(r.history));console.log(`${r.strategy}: IAE=${r.iae.toFixed(3)}, peak=${r.peak.toFixed(3)} (new normalized model)`);}
