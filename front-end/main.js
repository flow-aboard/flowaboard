

import * as alaSQLSpace from './lib/alasql/dist/alasql.js';
import * as architecture from './data/architecture/architecture.js';

import * as ui from '../../ui/export.js'
import { Flow } from './ui/element-group/flow.js'
import { UI } from './data/architecture/ui.js'
import { Database } from './data/architecture/database.js'
var design = new architecture.Design()
//design.addProcess(new architecture.Process('js','Process','process'))

design.addProcess(new architecture.Process('js','Process','process',['ui'],['database']))
design.addOutput(new architecture.Output('outbound.rest','Outbound','outbound.rest',['process']))
design.addOutput(new architecture.Output('outbound.rest2','Outbound2','outbound.rest2',['process']))
setTimeout(function(){
    
    design.addOutput(new architecture.Output('outbound.rest3','Outbound3','outbound.rest3',['process']))
},2000)

// setTimeout(function(){
    
//     design.addOutput(new architecture.Output('outbound.rest4','Outbound4','outbound.rest4',['process']))
// },15000)
// design.addProcess(new architecture.Process('js','Process2','process2',['ui2'],['database2']))
// design.addOutput(new architecture.Output('outbound.rest','Outbound','outbound.rest2',['process2']))
// design.addOutput(new architecture.Output('outbound.rest','Google','outbound.rest3',['process2']))
// design.addOutput(new architecture.Output('outbound.rest','Facebook','outbound.rest4',['process2']))
// design.addOutput(new architecture.Output('outbound.rest','Twitter','outbound.rest5',['process2']))
// design.addInput(new architecture.Input('input.rest','Twitter','input.rest',['process2']))
const flow = Flow.getNewInstance();
document.body.appendChild(flow)
flow.value=design;
design.subscribe('change',(e)=>{
    flow.handleValueChange(e)
})
flow.activeWidth="60%"
flow.activeHeight="60%"

alasql("CREATE TABLE example1 (a INT, b INT)");

// alasql's data store for a table can be assigned directly
alasql.tables.example1.data = [
    {a:2,b:6},
    {a:3,b:4}
];

// ... or manipulated with normal SQL
alasql("INSERT INTO example1 VALUES (1,5)");

var res = alasql("SELECT * FROM example1 ORDER BY b DESC");

console.log(res); // [{a:2,b:6},{a:1,b:5},{a:3,b:4}]

alasql('CREATE localStorage DATABASE IF NOT EXISTS Atlas');
alasql('ATTACH localStorage DATABASE Atlas AS MyAtlas');
alasql('CREATE TABLE IF NOT EXISTS MyAtlas.City (city string, population number)');
alasql('SELECT * INTO MyAtlas.City FROM ?',[ [
        {city:'Vienna', population:1731000},
        {city:'Budapest', population:1728000}
] ]);
var res = alasql('SELECT * FROM MyAtlas.City');
console.log(res);



console.log(esprima)


//design.addInput(new architecture.Input('Inbound','Inbound','json',['process']))