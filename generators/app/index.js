/* eslint-disable */
'use strict';

const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');


module.exports = class extends Generator {
  constructor(args, options) {
    super(args, options);
    this.option('rax', {
      alias: 'r',
      value: 'rax',
      type: String,
      desc: 'create rax component contains each index and css file'
    })
  }
  initializing() {
    try {
      this.username = process.env.USER || process.env.USERPROFILE.split(require('path').sep)[2]
    } catch (e) {
      this.username = ''
    }
  }

  prompting() {
    if (this.options.rax) {
      this.log(
        yosay(`Welcome to the ${chalk.red('rax-component')} generator!`)
      );

      const prompts = [{
        type: 'input',
        name: 'name',
        message: 'Set your component name',
        validate: name => {
          if (!name) {
            return 'Project name cannot be empty'
          }
          if (!/\w+/.test(name)) {
            return 'Project name should only consist of 0~9, a~z, A~Z, _, .'
          }

          if (!fs.existsSync(this.destinationPath(name))) {
            return true;
          }

          if (fs.statSync(this.destinationPath(name)).isDirectory()) {
            return 'Project already exist'
          }

          return true
        }
      }];

      return this.prompt(prompts).then(answers => {
        this.answers = answers;
        this.obj = { answers: this.answers };
      });
    } else {
      this.log(
        yosay(`Welcome to the ${chalk.red('rax-page')} generator!`)
      );

      const prompts = [
        {
          type: 'input',
          name: 'name',
          message: 'Your project name',
          validate: name => {
            if (!name) {
              return 'Project name cannot be empty'
            }

            if (!/\w+/.test(name)) {
              return 'Project name should only consist of 0~9, a~z, A~Z, _, .'
            }

            if (!fs.existsSync(this.destinationPath(name))) {
              return true;
            }

            if (fs.statSync(this.destinationPath(name)).isDirectory()) {
              return 'Project already exist'
            }
            return true
          }
        },
        {
          type: 'input',
          name: 'description',
          message: 'Your project description',
          default: ''
        },
        {
          type: 'input',
          name: 'keywords',
          message: 'Your project keywords',
          default: ''
        },
        {
          type: 'input',
          name: 'username',
          message: 'Your name',
          default: this.username
        },
        {
          type: 'list',
          name: 'registry',
          message: 'Which registry would you use?',
          choices: [
            'https://registry.npm.taobao.org',
            'https://registry.npmjs.org'
          ]
        }
      ];

      return this.prompt(prompts).then(answers => {
        // To access props later use this.props.someAnswer;
        const keywords = answers.keywords;
        this.answers = answers;
        this.obj = { answers: this.answers };
      });
    }

  }

  configuring(answers) {

    const done = this.async()
    fs.exists(this.destinationPath(this.answers.name), exists => {
      if (exists && fs.statSync(this.destinationPath(this.answers.name)).isDirectory()) {
        this.log.error('Directory [' + this.answers.name + '] exists')
        process.exit(1)
      }
      this.destinationRoot(path.join(this.destinationRoot(), this.answers.name))
      done()
    })
  }


  writing() {
    if (this.options.rax) {
      this.fs.copyTpl(this.templatePath('page/index.js'), this.destinationPath('index.js'), this.obj)

    } else {
      this.fs.copy(this.templatePath('app/public', '*'), this.destinationPath('public'))
      this.fs.copy(this.templatePath('app/src', '*'), this.destinationPath('src'));
      this.fs.copy(this.templatePath('app/__tests__', '*'), this.destinationPath('__tests__'));

      this.fs.copy(this.templatePath('app/babel.config.js'), this.destinationPath('babel.config.js'))
      this.fs.copy(this.templatePath('app/eslintignore'), this.destinationPath('.eslintignore'))
      this.fs.copy(this.templatePath('app/gitignore'), this.destinationPath('.gitignore'))
      this.fs.copy(this.templatePath('app/eslintrc'), this.destinationPath('.eslintrc'))
      this.fs.copy(this.templatePath('app/LICENSE'), this.destinationPath('LICENSE'))
      this.fs.copyTpl(this.templatePath('app/package.json_vm'), this.destinationPath('package.json'), this.obj)

      this.fs.copyTpl(this.templatePath('app/README.md'), this.destinationPath('README.md'), this.obj)
    }
  }

  install() {
    if (this.options.rax) {

    } else {
      this.npmInstall(undefined, {
        registry: this.answers.registry
      })
    }

  }

  end() {
    if (this.options.rax) {
      this.log.ok('Rax Component ' + this.answers.name + ' generated!!!')
    } else {
      this.log.ok('Project ' + this.answers.name + ' generated!!!')
      this.spawnCommand('npm', ['run', 'test'])
    }

  }
};
