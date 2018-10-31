const request  = require('request');
const readline = require('readline');
const fs       = require('fs');
const path     = require('path');
const Question = require('./Question');
const user     = require('./user.json');
const ignoretemplates = require('./gitignoretemplates.json').templates;

class CreateRepo {
  
  constructor () {
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: ' > '
    });
    this.rl = rl;
    
    this.rl.stdoutMuted = false;

    const cwd = process.cwd();
    const sugested_name = cwd.substr(cwd.lastIndexOf('\\') + 1, cwd.length);

    this.questions = [
      new Question('name', `Repository name (${sugested_name})*:`, sugested_name),
      new Question('description', 'Desctiption:', null, true),
      new Question('license_template', `License (e.g. MIT):`, null, true, ['MIT']),
      new Question('gitignore_template', `Gitignore (None):`, null, true, ignoretemplates)
    ];

    if (!user.username && !user.password) {
      this.questions.unshift(
        new Question('username', 'Username*:'),
        new Question('password', 'Password*:', null, false, undefined, true),
        new Question('save', 'Save auth locally? (y/n):', 'n', false, ['y', 'n'])
      );
    }

    this.question_index = 0;
    
    this.rl._writeToOutput = function _writeToOutput(stringToWrite) {
      if (rl.stdoutMuted && stringToWrite.length === 1)
        rl.output.write("*");
      else if (rl.stdoutMuted && stringToWrite.length > 1) {
        let str = stringToWrite.substr(0, 3) + new Array(stringToWrite.length - 2).join('*');
        rl.output.write(str);
      } else
        rl.output.write(stringToWrite);
    };

  }
  
  run () {
    
    console.log(`\nFields makrked with '*' are required.\n`);

    console.log(this.questions[this.question_index].query);
    
    this.rl.prompt();

    this.rl.on('line', input => {

      this.rl.stdoutMuted = false;

      if (this.questions[this.question_index].verityAnswer(input)) {
        this.question_index++;
      } else {
        console.log('\nInvalid answer, try again...');
        console.log(this.questions[this.question_index].query);
        this.rl.prompt();
        this.rl.stdoutMuted = this.questions[this.question_index].hide_input;
        return;
      }

      if (this.question_index >= this.questions.length) {

        console.log('Parisng answers...');

        let data = this.processAnswers();
        let username = user.username || data.username;
        let password = user.password || data.password;
        let save = data.save || false;
        save = save === 'y';

        delete data.username;
        delete data.password;
        delete data.save;

        if (save) this.saveAuth(username, password);

        console.log('\nCreating repository...\n\n');
        
        request({
          uri: 'https://api.github.com/user/repos',
          auth: {
            username,
            password
          },
          headers: {
            'User-Agent': 'request'
          },
          method: 'POST',
          json: data
        }, (err, res, body) => {

          if (err) {
            console.log('An error accured while trying to create the repository...', JSON.stringify(err, null, 2));
          } else if (res.statusCode != 201) {
            console.log('Could not create the repository.', JSON.stringify(body, null, 2));
          } else {
            console.log('Repository was created successfully!');
            console.log('Clone your repository with:\n', `https: ${body.clone_url}\n`, `ssh: ${body.ssh_url}\n`);
          }

          this.rl.close();
          process.exit(0);

        });

      } else {
        console.log(this.questions[this.question_index].query);
        this.rl.prompt();
        this.rl.stdoutMuted = this.questions[this.question_index].hide_input;
      }

    })
    .on('close', () => {
      this.rl.close();
      process.exit(0);
    });

  }
  
  processAnswers() {
    let json_data = {};
    
    this.questions.forEach(q => {
      if (q.answer)
        json_data[q.property_name] = q.answer;
    });

    return json_data;
  }
  
  saveAuth(username, password) {

    console.log('Saving authentication credentials to local file...');

    let file = path.resolve(__dirname, 'user.json');
    fs.writeFileSync(file, JSON.stringify({ username, password }));

    console.log('Authentication credentials saved!');

  }
  
}

module.exports = CreateRepo;
