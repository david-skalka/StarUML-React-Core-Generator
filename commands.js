
const path = require("path");
const util = require('util');
const execSync = util.promisify(require('child_process').execSync);
const ejs = require("ejs");
const fs = require("fs");


class CommandShell {
    constructor(cmd, opt) {
      this.cmd = cmd;
      this.opt = opt;
    }
  
  
    async execute() {
      app.toast.info("Shell: " + this.cmd);
      execSync(this.cmd, this.opt);
    }
  }
  
  
  class CommandRm {
    constructor(file) {
      this.file = file;
    }
    execute() {
      fs.unlinkSync(this.file);
    }
  }
  
  
  class CommandMkdir {
    constructor(file) {
      this.file = file;
    }
    execute() {
      fs.mkdirSync(this.file);
    }
  }
  
  
  class CommandEjs {
    constructor(src, dest, vars) {
      this.src = src;
      this.dest = dest;
      this.vars = vars;
    }
  
  
  
    async execute() {
      app.toast.info("Template: " + this.dest);
      const templatePath = path.join(__dirname, this.src);
      const template = fs.readFileSync(templatePath, 'utf8');
      const rendered = ejs.render(template, this.vars, { filename: templatePath });

      
  
      if (fs.existsSync(this.dest)) {
        var buttonId = app.dialogs.showConfirmDialog("Are you sure to " + this.dest, "overwrite")
    
        if (buttonId !== 'ok') {
          return;
        }
      }
      fs.writeFileSync(this.dest, rendered);
  
  
    }
  }
  

  exports.CommandShell = CommandShell;
  exports.CommandRm = CommandRm;
  exports.CommandMkdir = CommandMkdir;
  exports.CommandEjs = CommandEjs;
  