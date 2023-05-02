import { Worker, waitOnSigint } from 'blocktank-worker2';
import {BlocktankDatabase} from 'blocktank-worker2'
import {LightningWorkerImplementation} from './3_api/LightningWorkerImplementation';
import { Config } from './1_config/Config';
import dbConfig from './mikro-orm.config'

const config = Config.get()

async function main() {
  
  const worker = new Worker(new LightningWorkerImplementation(), {
    name: config.workerName,
    port: config.workerPort,
    grapeUrl: config.grapeUrl
  })
  try {
    await BlocktankDatabase.connect(dbConfig)
    await worker.start()
    console.log(`Worker "${worker.config.name}" started. Ctrl+C to stop.`)
    await waitOnSigint()
  } finally {
    console.log(`Stopping worker...`)
    await worker.stop()
    await BlocktankDatabase.close()
  }
}

main()



// const privates = [
//   'constructor'
// ]

// class Lightning extends Worker {
//   public ln: any;
//   constructor (config: GrapeServerConfig) {
//     super({
//       name: 'svc:ln',
//       port: config.port,
//       db_url: 'mongodb://0.0.0.0:27017'
//     })
//     const lnConfig = this._getLnConfig();
//     // let lnConfig = {}
//     // if(config?.ln_nodes){
//     //   lnConfig.ln_nodes = config.ln_nodes
//     //   lnConfig.events ? lnConfig.events : {
//     //     htlc_forward_event: [],
//     //     channel_acceptor: [],
//     //     peer_events: [],
//     //   }
//     // } else {
//     //   lnConfig = this._getLnConfig()
//     // }

//     this.ln = new NodeMan(
//       {
//         nodes: lnConfig.ln_nodes,
//         events: {
//           htlc_forward_event: lnConfig.htlc_forward_event,
//           channel_acceptor: lnConfig.channel_acceptor,
//           peer_events: lnConfig.peer_events
//         }
//       })

//     this.ln.on('broadcast', ({ svc, method, args, cb }: any) => {
//       this.call({
//         service: svc,
//         method: method,
//         args: args
//       }, cb)
//     });
//   }

//   _getLnConfig(){
//     try{
//       return JSON.parse(fs.readFileSync(path.resolve(__dirname,'../config/worker.config.json'),{encoding:"utf8"}))
//     } catch(err){
//       console.log(err) 
//       throw new Error("FAILED_TO_LOAD_CONFIG")
//     }
//   }

//   start () {
//     this.ln.start(() => {
//       Object.getOwnPropertyNames(Object.getPrototypeOf(this.ln))
//         .filter((n) => !privates.includes(n.toLowerCase()))
//         .forEach((n) => {
//           this[n] = this._handler.bind(this, n)
//         })
//     })
//   }

//   _handler (action, config, arg1, arg2) {
//     let cb, args
//     if (arg2) {
//       cb = arg2
//       args = arg1
//     } else {
//       cb = arg1
//       args = config
//     }
//     if (!args || !Array.isArray(args)) {
//       args = [args]
//     } else if (args.length === 1) {
//       args = [args[0]]
//     }
//     this.ln.callAction(action,config,args,cb)
//   }
// }

// module.exports = Lightning
