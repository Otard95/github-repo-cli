const fs = require('fs');
const path = require('path');
const CreateRepo = require('./CreateRepo');

let args = process.argv.slice(2);

if (args.length > 0) {
  
  while (args.length > 0) {
    
    switch(args[0]) {
      
      case '-c':
      case '--config':
        args.shift();
        config(args.shift(), args);
        break;
        
      default:
        if (!args[0].startsWith('-')) args.shift();
        else console.log(`Unknown flag ${args.shift()}`);
      
    }
    
  }
  
} else {

  let create_repo = new CreateRepo();

  create_repo.run();

}

function config (task, ...params) {
  
  switch (task) {
    
    case 'auth':
      saveAuth(params[0][0], params[0][1]);
      break;
      
    case 'show':
      console.log(JSON.stringify(require('./user.json'), null, 2));
      break;
      
    case 'clear':
      clearAuth();
      break;
      
    default:
      console.log(`Invalid paramater:
       <--config | -c> <auth | show | clear> [<username> <password>]\n`);
       process.exit();
      
  }
  
}

function saveAuth(username, password) {
  
  console.log('Saving authentication credentials to local file...');

  let file = path.resolve(__dirname, 'user.json');
  let json_obj = { username: username, password: password };
  fs.writeFileSync(file, JSON.stringify(json_obj));
  
  console.log('Authentication credentials saved!');

}

function clearAuth() {

  console.log('Clearing authentication credentials from local file...');

  let file = path.resolve(__dirname, 'user.json');
  let json_obj = {};
  fs.writeFileSync(file, JSON.stringify(json_obj));

  console.log('Authentication credentials cleared!');

}
