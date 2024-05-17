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
      
    
      const projectPath = getSolutionPath();
      const namespace = getNamespace();
      const pipeline =[
        { name: 'shell', cmd: 'dotnet new sln -n ' + namespace + ' -o "' + projectPath + '"' },
        { name: 'shell', cmd: 'dotnet new react -f net6.0 -n ' + namespace + ' -o "' + projectPath + '\\Web"'},
        { name: 'shell', cmd: 'npm i react-bootstrap', opt: { cwd: projectPath + '\\Web\\ClientApp' }},
        { name: 'shell', cmd: 'npm i react-datepicker', opt: { cwd: projectPath + '\\Web\\ClientApp' }},
        { name: 'shell', cmd: 'dotnet add package Microsoft.EntityFrameworkCore --version 6.0.27', opt: { cwd: projectPath + '\\Web' }},
        { name: 'shell', cmd: 'dotnet add package Microsoft.EntityFrameworkCore.Sqlite --version 6.0.27', opt: { cwd: projectPath + '\\Web' }},
        { name: 'shell', cmd: 'dotnet new nunit -f net6.0 -n ' + namespace + 'ApiTest -o "' + projectPath + '\\ApiTest"'},
        { name: 'shell', cmd: 'dotnet add package Microsoft.AspNetCore.Mvc.Testing --version 6.0.27', opt: { cwd: projectPath + '\\ApiTest' }},
        { name: 'shell', cmd: 'dotnet add reference ../Web', opt: { cwd: projectPath + '\\ApiTest' }},
        { name: 'shell', cmd: 'dotnet sln ' + namespace + '.sln add Web ApiTest', opt: { cwd: projectPath }},
        { name: 'rm', file: 'ApiTest\\UnitTest1.cs'},
        { name: 'rm', file: 'Web\\WeatherForecast.cs'},
        { name: 'rm', file: 'Web\\Controllers\\WeatherForecastController.cs'},
        { name: 'rm', file: 'Web\\Program.cs'},
        { name: 'mkdir', file: 'ApiTest\\Seeders'},
        { name: 'mkdir', file: 'Web\\Models'},
        { name: 'mkdir', file: 'Web\\ApiModels'},
        { name: 'ejs', src: '/templates/api/program.ejs', dest: `\\Web\\Program.cs`, vars: { info: { namespace } }},
        { name: 'ejs', src: '/templates/api/custom-web-app-factory.ejs', dest: `\\ApiTest\\CustomWebApplicationFactory.cs`, vars: { info: { namespace } }},
        { name: 'ejs', src: '/templates/api/iseeder.ejs', dest: `\\ApiTest\\ISeeder.cs`, vars: { info: { namespace } }},
      ]
      
    
      await run(pipeline)
    
    },
    "Generate Project"
  );

  app.commands.register(
    "react-core:generate-db-context",
    () => run([{ name: 'ejs', src: '/templates/api/db-context.ejs', dest: `\\Web\\ApplicationDbContext.cs`, vars: { info: { namespace: getNamespace() }, entities: getEntities() } }]),
    "Generate db-context"
  );

  app.commands.register(
    "react-core:generate-seeder",
    () => run([{ name: 'ejs', src: '/templates/api/seeder.ejs', dest: `\\ApiTest\\Seeders\\DefaultSeeder.cs`, vars: { count: 10, entities: getEntities(), info: { namespace: getNamespace() }, faker, _csharp } }]),
    "Generate Test seeder"
  );



  app.commands.register(
    "react-core:generate-setup-proxy",
    () => run([{ name: 'ejs', src: '/templates/react/setup-proxy.ejs', dest: `\\Web\\ClientApp\\src\\setupProxy.js`, vars: { entities: getEntities(), _case: Case } }]),
    "Generate setup proxy"
  );


  app.commands.register(
    "react-core:generate-app-routes",
    () => run([{ name: 'ejs', src: '/templates/react/app-routes.ejs', dest: `\\Web\\ClientApp\\src\\AppRoutes.js`, vars: { entities: getEntities(), _case: Case } }]),
    "Generate app routes"
  );

  app.commands.register(
    "react-core:generate-nav-menu",
    () => run([{ name: 'ejs', src: '/templates/react/nav-menu.ejs', dest: `\\Web\\ClientApp\\src\\components\\NavMenu.js`, vars: { entities: getEntities(), _case: Case } }]),
    "Generate nav menu"
  );

  app.commands.register(
    "react-core:generate-entity",
    async () => {


      var classes = getEntities();
      const { buttonId, returnValue } = await app.elementListPickerDialog.showDialog("Select a set of Class", classes);

      if (returnValue === null) throw new Error("No class selected");

      const model = returnValue;
      if (buttonId === "ok") {

        const namespace = getNamespace();
        const pipeline = [
          { name: 'ejs', src: '/templates/api/controller.ejs', dest:  `\\Web\\Controllers\\${model.name}Controller.cs`, vars: { model, info: { namespace }, _case: Case }},
          { name: 'ejs',src: '/templates/api/model.ejs', dest: `\\Web\\Models\\${model.name}.cs`, vars: { model, info: { namespace: namespace + ".Models" }, _csharp, _star }},
          { name: 'ejs',src: '/templates/api/test.ejs', dest: `\\ApiTest\\${model.name}Test.cs`,  vars: { model, info: { namespace }, faker: faker }},
          { name: 'ejs',src: '/templates/react/ui.ejs', dest: `\\Web\\ClientApp\\src\\components\\Ui${model.name}.jsx`, vars: { model, info: { namespace }, _case: Case }},
          { name: 'ejs',src: '/templates/react/modal.ejs', dest: `\\Web\\ClientApp\\src\\components\\Modal${model.name}.jsx`, vars: { model, info: { namespace }, _case: Case, _star }},
        ]
        
        
        for (operation of model.operations) {
          pipeline.push({name: 'ejs', src: '/templates/api/api-model.ejs', dest: `\\Web\\ApiModels\\${operation.parameters.find(parameter => parameter.direction !== 'return').type.name}.cs`, vars: { info: { namespace: namespace + ".ApiModels" }, model: operation.parameters.find(parameter => parameter.direction !== 'return').type, _csharp, _star }})
          pipeline.push({name: 'ejs', src: '/templates/api/api-model.ejs', dest: `\\Web\\ApiModels\\${operation.parameters.find(parameter => parameter.direction === 'return').type.name}.cs`, vars: { info: { namespace: namespace + ".ApiModels" }, model: operation.parameters.find(parameter => parameter.direction === 'return').type, _csharp, _star }})
          pipeline.push({ name: 'ejs', src:  '/templates/react/operation.ejs', dest:  `\\Web\\ClientApp\\src\\components\\Ui${model.name + operation.name}.jsx`, vars: { operation, info: { name: model.name }, _case: Case, _star }})
        }


        await run(pipeline)

      }

      
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


async function run(pipeline) {
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

  try {
    validate();


    for (command of pipeline) {
      const commandFn = pipelineCommands.get(command.name);
      if (commandFn) {
        await commandFn(command);
      }
    }

    app.toast.info("Done");

  } catch (e) {
    console.error(e);
    app.dialogs.showAlertDialog(e.message)
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
  var diagram = app.repository.select("@UMLModel");

  const validationResult = modelSchema.validate(diagram[0], {
    allowUnknown: true,
    abortEarly: false
  });

  if (validationResult.error) {
    throw new Error("@UMLModel validation errors: " + validationResult.error.details.map(x => x.message).join('\n'));
  }

  var classes = app.repository.select("@UMLClass")

  const validationResultCls = classesSchema.validate(classes, {
    allowUnknown: true,
    abortEarly: false
  });

  if (validationResultCls.error) {
    throw new Error("@UMLClass validation errors: " + validationResultCls.error.details.map(x => x.message).join('\n'));
  }

  if (!fs.existsSync(getSolutionPath())) {
    throw new Error("Solution path does not exist");
  }

}

function getNamespace() {
  var diagram = app.repository.select("@UMLModel");
  const umlModel = diagram.find(x => x.stereotype.name === "ReactCoreGen");
  return umlModel.tags.find(x => x.name === "Namespace").value;
}

function getEntities() {
  return app.repository.select("@UMLClass").filter(x => x.stereotype && x.stereotype.name === "Entity");
}




exports.init = init;
