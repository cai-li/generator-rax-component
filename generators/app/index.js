/* eslint-disable */
'use strict';

const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');


module.exports = class extends Generator {
  initializing() {
    try {
      this.username = process.env.USER || process.env.USERPROFILE.split(require('path').sep)[2]
    } catch (e) {
      this.username = ''
    }
  }

  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(`Welcome to the rad ${chalk.red('generator-typescript-jest-sdk')} generator!`)
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

          const fs = require('fs')
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
      this.obj = {answers: this.answers};

    });
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
    const _ = require('lodash')

    this.fs.copy(this.templatePath('public', '*'), this.destinationPath('public'))
    this.fs.copy(this.templatePath('src', '*'), this.destinationPath('src'));
    this.fs.copy(this.templatePath('__tests__', '*'), this.destinationPath('__tests__'));

    this.fs.copy(this.templatePath('babel.config.js'), this.destinationPath('babel.config.js'))

    this.fs.copy(this.templatePath('gitignore'), this.destinationPath('.gitignore'))
    this.fs.copy(this.templatePath('eslintrc'), this.destinationPath('.eslintrc'))
    this.fs.copy(this.templatePath('LICENSE'), this.destinationPath('LICENSE'))
    this.fs.copyTpl(this.templatePath('package.json_vm'), this.destinationPath('package.json'), this.obj)


    this.fs.copyTpl(this.templatePath('README.md'), this.destinationPath('README.md'), this.obj)

  }

  install() {
    this.npmInstall(undefined, {
      registry: this.answers.registry
    })
  }

  end() {
    this.log.ok('Project ' + this.answers.name + ' generated!!!')
    this.spawnCommand('npm', ['run', 'test'])
  }
};
