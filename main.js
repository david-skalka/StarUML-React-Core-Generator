const fs = require("fs");
const ejs = require("ejs");
const { faker } = require("@faker-js/faker");
const beautify = require("json-beautify");
const { Case } = require('change-case-all');
const reactHelper = require("./templates/react/_helpers");
const { modelSchema, classesSchema } = require('./joi-schemas.js');
const _deepCopy = require('./deep-copy.js');
const { entityDependecySort, primitiveTypes, defaultValues } = require("./templates/api/_helpers");
const path = require("path");
const util = require('util');
const exec = util.promisify(require('child_process').exec);

function init() {


  app.commands.register(
    "react-core:generate-solution",
     () => executeCommand(solutionCommand),
    "Generate Project"
  );

  app.commands.register(
    "react-core:generate-db-context",
    () => executeCommand(dbContextCommand),
    "Generate db-context"
  );

  app.commands.register(
    "react-core:generate-seeder",
    () => executeCommand(seederCommand),
    "Generate Test seeder"
  );



  app.commands.register(
    "react-core:generate-setup-proxy",
    () => executeCommand(setupProxyCommand),
    "Generate setup proxy"
  );


  app.commands.register(
    "react-core:generate-app-routes",
    () => executeCommand(appRoutesCommand),
    "Generate app routes"
  );

  app.commands.register(
    "react-core:generate-nav-menu",
    () => executeCommand(navMenuCommand),
    "Generate nav menu"
  );

  app.commands.register(
    "react-core:generate-entity",
    () => executeCommand(entitiesCommand),
    "Generate Entity"
  );


  app.commands.register(
    "react-core:export-metadata",
    (arg) => executeCommand(exportMetadataCommand, arg),
    "Export metadata"
  );


}


async function executeCommand(task, arg) {

  try {
    validate();
    await task(arg);
  } catch (e) {
    app.dialogs.showAlertDialog(e.message)
  }

}




async function generateTemplete(src, dest, varBag, writer) {
  app.toast.info("Generating " + dest);
  const rendered = await ejs.renderFile(src, varBag);
  const projectPath = getSolutionPath();
  writer(path.join(projectPath, dest), rendered);
  
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

async function execShell(cmd, options) {
  app.toast.info("Executing " + cmd);
  await exec(cmd, options);
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

}

function getNamespace() {
  var diagram = app.repository.select("@UMLModel");
  const umlModel = diagram.find(x => x.stereotype.name === "ReactCoreGen");
  return umlModel.tags.find(x => x.name === "Namespace").value;
}

function getEntities() {
  return app.repository.select("@UMLClass").filter(x => x.stereotype && x.stereotype.name === "Entity");
}


 const entitiesCommand   = async() => {

  var classes = getEntities();
  const { buttonId, returnValue } = await app.elementListPickerDialog.showDialog("Select a set of Class", classes);
  
  if(returnValue === null) throw new Error("No class selected");

  const model = returnValue;
  if (buttonId === "ok") {

    const namespace = getNamespace();

      await generateTemplete(__dirname + '/templates/api/controller.ejs', `\\Web\\Controllers\\${model.name}Controller.cs`, { model, info: { namespace }, _case: Case }, confirmWriteFileSync);
      await generateTemplete(__dirname + '/templates/api/model.ejs', `\\Web\\Models\\${model.name}.cs`, { model, info: { namespace: namespace + ".Models" }, primitiveTypes, defaultValues }, confirmWriteFileSync);
      await generateTemplete(__dirname + '/templates/api/test.ejs', `\\ApiTest\\${model.name}Test.cs`, { model, info: { namespace }, faker: faker }, confirmWriteFileSync);
      await generateTemplete(__dirname + '/templates/react/ui.ejs', `\\Web\\ClientApp\\src\\components\\Ui${model.name}.jsx`, { model, info: { namespace }, _case: Case }, confirmWriteFileSync)
      await generateTemplete(__dirname + '/templates/react/modal.ejs', `\\Web\\ClientApp\\src\\components\\Modal${model.name}.jsx`, { model, info: { namespace }, _case: Case, helper: reactHelper }, confirmWriteFileSync)


      for (operation of model.operations) {
        await generateTemplete(__dirname + '/templates/api/api-model.ejs', `\\Web\\ApiModels\\${operation.parameters.find(parameter => parameter.direction !== 'return').type.name}.cs`, { info: { namespace: namespace + ".ApiModels" }, model: operation.parameters.find(parameter => parameter.direction !== 'return').type, primitiveTypes, defaultValues }, confirmWriteFileSync)
        await generateTemplete(__dirname + '/templates/api/api-model.ejs', `\\Web\\ApiModels\\${operation.parameters.find(parameter => parameter.direction === 'return').type.name}.cs`, { info: { namespace: namespace + ".ApiModels" }, model: operation.parameters.find(parameter => parameter.direction === 'return').type, primitiveTypes, defaultValues }, confirmWriteFileSync)
        await generateTemplete(__dirname + '/templates/react/operation.ejs', `\\Web\\ClientApp\\src\\components\\Ui${model.name + operation.name}.jsx`, { operation, info: { name: model.name }, _case: Case, helper: reactHelper }, confirmWriteFileSync)
      }

    


  }


}


const solutionCommand = async () => {

  const projectPath = getSolutionPath();
  const namespace = getNamespace();
  const fileWriter = confirmWriteFileSync

  await execShell('dotnet new sln -n ' + namespace + ' -o "' + projectPath + '"',);
  await execShell('dotnet new react -f net6.0 -n ' + namespace + ' -o "' + projectPath + '\\Web"',);
  await execShell('npm i react-bootstrap', { cwd: projectPath + '\\Web\\ClientApp' });
  await execShell('npm i react-datepicker', { cwd: projectPath + '\\Web\\ClientApp' });
  await execShell('dotnet add package Microsoft.EntityFrameworkCore --version 6.0.27', { cwd: projectPath + '\\Web' });
  await execShell('dotnet add package Microsoft.EntityFrameworkCore.Sqlite --version 6.0.27', { cwd: projectPath + '\\Web' });
  await execShell('dotnet new nunit -f net6.0 -n ' + namespace + 'ApiTest -o "' + projectPath + '\\ApiTest"',);
  await execShell('dotnet add package Microsoft.AspNetCore.Mvc.Testing --version 6.0.27', { cwd: projectPath + '\\ApiTest' });
  await execShell('dotnet add reference ../Web', { cwd: projectPath + '\\ApiTest' });
  await execShell('dotnet sln ' + namespace + '.sln add Web ApiTest', { cwd: projectPath });

  ['ApiTest\\UnitTest1.cs', 'Web\\WeatherForecast.cs', 'Web\\Controllers\\WeatherForecastController.cs', 'Web\\Program.cs'].forEach(x => fs.unlinkSync(projectPath + '\\' + x));
  ['ApiTest\\Seeders', 'Web\\Models', 'Web\\ApiModels'].forEach(x => fs.mkdirSync(projectPath + '\\' + x));

  await generateTemplete(__dirname + '/templates/api/program.ejs', `\\Web\\Program.cs`, { info: { namespace } }, fileWriter)
  await generateTemplete(__dirname + '/templates/api/custom-web-app-factory.ejs', `\\ApiTest\\CustomWebApplicationFactory.cs`, { info: { namespace } }, fileWriter)
  await generateTemplete(__dirname + '/templates/api/iseeder.ejs', `\\ApiTest\\ISeeder.cs`, { info: { namespace } }, fileWriter)

  app.toast.info("Project generated successfully");

}



const seederCommand = async ()  => {
  await generateTemplete(__dirname + '/templates/api/seeder.ejs', `\\ApiTest\\Seeders\\DefaultSeeder.cs`, { count: 10, entities: getEntities(), info: { namespace: getNamespace() }, faker, entityDependecySort }, confirmWriteFileSync)
}


const dbContextCommand = async  () => {
  await generateTemplete(__dirname + '/templates/api/db-context.ejs', `\\Web\\ApplicationDbContext.cs`, { info: { namespace: getNamespace() }, entities: getEntities() }, confirmWriteFileSync)
}

const setupProxyCommand = async () => {
  await generateTemplete(__dirname + '/templates/react/setup-proxy.ejs', `\\Web\\ClientApp\\src\\setupProxy.js`, { entities: getEntities(), _case: Case }, confirmWriteFileSync)
}


const appRoutesCommand = async ()  =>{
  await generateTemplete(__dirname + '/templates/react/app-routes.ejs', `\\Web\\ClientApp\\src\\AppRoutes.js`, { entities: getEntities(), _case: Case }, confirmWriteFileSync)
}


const  navMenuCommand = async () => {
  await generateTemplete(__dirname + '/templates/react/nav-menu.ejs', `\\Web\\ClientApp\\src\\components\\NavMenu.js`, { entities: getEntities(), _case: Case }, confirmWriteFileSync)
}


const exportMetadataCommand = (path) => {
  var cls = app.repository.select("@UMLClass")
  const clss = _deepCopy(cls, 20, 0, ['_parent']);
  fs.writeFileSync(path, beautify(clss, null, 2, 100));
}


exports.init = init;
