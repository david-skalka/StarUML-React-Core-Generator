const fs = require("fs");
const ejs = require("ejs");
const { faker } = require("@faker-js/faker");
const beautify = require("json-beautify");
const { Case } = require('change-case-all');
const { modelSchema, classesSchema } = require('./joi-schemas.js');
const _deepCopy = require('./deep-copy.js');
const _csharp = require("./templates/api/_csharp.js");
const path = require("path");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const _star = require("./templates/_starHelpers");

function init() {


  

  app.commands.register(
    "react-core:generate-solution",
    async () => {
      
    const command = async ()=> {
      const projectPath = getSolutionPath();
      const namespace = getNamespace();
      const pipeline =[
        { name: 'shell', cmd: 'dotnet new sln -n ' + namespace + ' -o "' + projectPath + '"' },
        { name: 'shell', cmd: 'dotnet new react -f net6.0 -n ' + namespace + ' -o "' + projectPath + '\\Web"'},
        { name: 'shell', cmd: 'npm i react-bootstrap', opt: { cwd: projectPath + '\\Web\\ClientApp' }},
        { name: 'shell', cmd: 'npm i react-datepicker', opt: { cwd: projectPath + '\\Web\\ClientApp' }},
        { name: 'shell', cmd: 'dotnet add package Microsoft.EntityFrameworkCore --version 6.0.27', opt: { cwd: projectPath + '\\Web' }},
        { name: 'shell', cmd: 'dotnet add package Microsoft.EntityFrameworkCore.Sqlite --version 6.0.27', opt: { cwd: projectPath + '\\Web' }},
        { name: 'shell', cmd: 'dotnet new nunit -f net6.0 -n ' + namespace + 'IntegrationTest -o "' + projectPath + '\\IntegrationTest"'},
        { name: 'shell', cmd: 'dotnet add package Microsoft.AspNetCore.Mvc.Testing --version 6.0.27', opt: { cwd: projectPath + '\\IntegrationTest' }},
        { name: 'shell', cmd: 'dotnet add reference ../Web', opt: { cwd: projectPath + '\\IntegrationTest' }},
        { name: 'shell', cmd: 'dotnet sln ' + namespace + '.sln add Web IntegrationTest', opt: { cwd: projectPath }},
        { name: 'rm', file: 'IntegrationTest\\UnitTest1.cs'},
        { name: 'rm', file: 'Web\\WeatherForecast.cs'},
        { name: 'rm', file: 'Web\\Controllers\\WeatherForecastController.cs'},
        { name: 'rm', file: 'Web\\Program.cs'},
        { name: 'mkdir', file: 'IntegrationTest\\Seeders'},
        { name: 'mkdir', file: 'Web\\Models'},
        { name: 'mkdir', file: 'Web\\ApiModels'},
        { name: 'ejs', src: '/templates/api/program.ejs', dest: `\\Web\\Program.cs`, vars: { info: { namespace } }},
        { name: 'ejs', src: '/templates/api/custom-web-app-factory.ejs', dest: `\\IntegrationTest\\CustomWebApplicationFactory.cs`, vars: { info: { namespace } }},
        { name: 'ejs', src: '/templates/api/iseeder.ejs', dest: `\\IntegrationTest\\ISeeder.cs`, vars: { info: { namespace } }},
      ]
      await generate(pipeline)
    }
     
      
    
      await executeCommand(command)
    
    },
    "Generate Project"
  );

  app.commands.register(
    "react-core:generate-db-context",
    () => executeCommand(()=>generate([{ name: 'ejs', src: '/templates/api/db-context.ejs', dest: `\\Web\\ApplicationDbContext.cs`, vars: { info: { namespace: getNamespace() }, entities: getEntities() } }])),
    "Generate db-context"
  );

  app.commands.register(
    "react-core:generate-seeder",
    () => executeCommand(()=>generate([{ name: 'ejs', src: '/templates/api/seeder.ejs', dest: `\\IntegrationTest\\Seeders\\DefaultSeeder.cs`, vars: { count: 10, entities: getEntities(), info: { namespace: getNamespace() }, faker, _csharp } }])),
    "Generate Test seeder"
  );



  app.commands.register(
    "react-core:generate-setup-proxy",
    () => executeCommand(()=>generate([{ name: 'ejs', src: '/templates/react/setup-proxy.ejs', dest: `\\Web\\ClientApp\\src\\setupProxy.js`, vars: { entities: getEntities(), _case: Case } }])),
    "Generate setup proxy"
  );


  app.commands.register(
    "react-core:generate-app-routes",
    () => executeCommand(()=> generate([{ name: 'ejs', src: '/templates/react/app-routes.ejs', dest: `\\Web\\ClientApp\\src\\AppRoutes.js`, vars: { entities: getEntities(), _case: Case } }])),
    "Generate app routes"
  );

  app.commands.register(
    "react-core:generate-nav-menu",
    () => executeCommand(()=> generate([{ name: 'ejs', src: '/templates/react/nav-menu.ejs', dest: `\\Web\\ClientApp\\src\\components\\NavMenu.js`, vars: { entities: getEntities(), _case: Case } }])),
    "Generate nav menu"
  );

  app.commands.register(
    "react-core:generate-entity",
    async () => {

      const command = async ()=> {
      var classes = getEntities();
      const { buttonId, returnValue } = await app.elementListPickerDialog.showDialog("Select a set of Class", classes);

      if (returnValue === null) throw new Error("No class selected");

      const model = returnValue;
      if (buttonId === "ok") {

        const namespace = getNamespace();
        const pipeline = [
          { name: 'ejs', src: '/templates/api/controller.ejs', dest:  `\\Web\\Controllers\\${model.name}Controller.cs`, vars: { model, info: { namespace }, _case: Case }},
          { name: 'ejs',src: '/templates/api/model.ejs', dest: `\\Web\\Models\\${model.name}.cs`, vars: { model, info: { namespace: namespace + ".Models" }, _csharp, _star }},
          { name: 'ejs',src: '/templates/api/test.ejs', dest: `\\IntegrationTest\\${model.name}Test.cs`,  vars: { model, info: { namespace }, faker: faker }},
          { name: 'ejs',src: '/templates/react/ui.ejs', dest: `\\Web\\ClientApp\\src\\components\\Ui${model.name}.jsx`, vars: { model, info: { namespace }, _case: Case }},
          { name: 'ejs',src: '/templates/react/modal.ejs', dest: `\\Web\\ClientApp\\src\\components\\Modal${model.name}.jsx`, vars: { model, info: { namespace }, _case: Case, _star }},
        ]
        
        
        for (operation of model.operations) {
          pipeline.push({name: 'ejs', src: '/templates/api/api-model.ejs', dest: `\\Web\\ApiModels\\${operation.parameters.find(parameter => parameter.direction !== 'return').type.name}.cs`, vars: { info: { namespace: namespace + ".ApiModels" }, model: operation.parameters.find(parameter => parameter.direction !== 'return').type, _csharp, _star }})
          pipeline.push({name: 'ejs', src: '/templates/api/api-model.ejs', dest: `\\Web\\ApiModels\\${operation.parameters.find(parameter => parameter.direction === 'return').type.name}.cs`, vars: { info: { namespace: namespace + ".ApiModels" }, model: operation.parameters.find(parameter => parameter.direction === 'return').type, _csharp, _star }})
          pipeline.push({ name: 'ejs', src:  '/templates/react/operation.ejs', dest:  `\\Web\\ClientApp\\src\\components\\Ui${model.name + operation.name}.jsx`, vars: { operation, info: { name: model.name }, _case: Case, _star }})
        }

        

        await generate(pipeline)

      }
    }
    
    await executeCommand(command)
      
    },
    "Generate Entity"
  );


  app.commands.register(
    "react-core:export-metadata",
      (arg) => {  var cls = app.repository.select("@UMLClass")
      const clss = _deepCopy(cls, 20, 0, ['_parent']);
      fs.writeFileSync(arg, beautify(clss, null, 2, 100));
  },
    "Export metadata"
  );


}



async function executeCommand(fn) {

  const validationResult = validate();
  if(validationResult!==null){
    app.dialogs.showInfoDialog(validationResult)
    return;
  }

  try {
    
    await fn();
    app.toast.info("Done");
  } catch (e) {
    console.error(e);
    app.dialogs.showAlertDialog(e.message)
  }
}


async function generate(pipeline) {
  const pipelineCommands = new Map();

  pipelineCommands.set('ejs', async (item)=>{
    app.toast.info("Template: " + item.dest);
    const rendered = await ejs.renderFile(path.join(__dirname, item.src), item.vars);
    const projectPath = getSolutionPath();
    confirmWriteFileSync(path.join(projectPath, item.dest), rendered);
  });

  pipelineCommands.set('shell', async (item)=>{ 
    app.toast.info("Shell: " + item.cmd);
    await exec(item.cmd, item.opt);
   });

  pipelineCommands.set('rm', (item)=> fs.unlinkSync(path.join( getSolutionPath() ,item.file)));
  pipelineCommands.set('mkdir', (item)=> fs.mkdirSync(path.join( getSolutionPath() ,item.file)));

  for (command of pipeline) {
    const commandFn = pipelineCommands.get(command.name);
    if (commandFn) {
      await commandFn(command);
    }
  }

}




function confirmWriteFileSync(path, data) {
  if (fs.existsSync(path)) {
    var buttonId = app.dialogs.showConfirmDialog("Are you sure to " + path, "overwrite")

    if (buttonId !== 'ok') {
      return;
    }
  }
  fs.writeFileSync(path, data);
}



function getSolutionPath() {
  const tmp = app.preferences.get('react-core.solution-path');
  return tmp.endsWith('\\') ? tmp.slice(0, -1) : tmp;
}


function validate() {
  
  var diagram = app.selections.getSelectedModels()

  if(diagram.length === 0) return "Select a model";

  const validationResult = modelSchema.validate(diagram[0], {
    allowUnknown: true,
    abortEarly: false
  });

  if (validationResult.error) {
    return "@UMLModel validation errors: " + validationResult.error.details.map(x => x.message).join('\n');
  }

  var classes = app.repository.select("@UMLClass")

  const validationResultCls = classesSchema.validate(classes, {
    allowUnknown: true,
    abortEarly: false
  });

  if (validationResultCls.error) {
    return "@UMLClass validation errors: " + validationResultCls.error.details.map(x => x.message).join('\n');
  }

  if (!fs.existsSync(getSolutionPath())) {
    return "Solution path does not exist";
  }

  return null;

}

function getNamespace() {
  var diagram = app.selections.getSelectedModels()
  return diagram[0].tags.find(x => x.name === "Namespace").value;
}

function getEntities() {
  return app.repository.select("@UMLClass").filter(x => x.stereotype && x.stereotype.name === "Entity");
}




exports.init = init;
