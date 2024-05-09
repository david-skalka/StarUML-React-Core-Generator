const fs = require("fs");
const ejs = require("ejs");
const { faker, en } = require("@faker-js/faker");
const beautify = require("json-beautify");
const { Case } = require('change-case-all');
const reactHelper = require("./generators/react/_helpers");
const { modelSchema, classesSchema } = require('./joi-schemas.js');
const ChildProcess = require("child_process");
const _deepCopy = require('./deep-copy.js');
const { entityDependecySort, primitiveTypes, defaultValues } = require("./generators/api/_helpers");
const path = require("path");

function init() {


  app.commands.register(
    "react-core:generate-solution",
    () => commandExecutor(generatSolution),
    "Generate Project"
  );

  app.commands.register(
    "react-core:generate-db-context",
    () => commandExecutor(generateDbContext),
    "Generate db-context"
  );

  app.commands.register(
    "react-core:generate-seeder",
    () => commandExecutor(generateSeeder),
    "Generate Test seeder"
  );



  app.commands.register(
    "react-core:generate-setup-proxy",
    () => commandExecutor(generateSetupProxy),
    "Generate setup proxy"
  );


  app.commands.register(
    "react-core:generate-app-routes",
    () => commandExecutor(generateAppRoutes),
    "Generate app routes"
  );

  app.commands.register(
    "react-core:generate-nav-menu",
    () => commandExecutor(generateNavMenu),
    "Generate nav menu"
  );

  app.commands.register(
    "react-core:generate-entity",
    () => commandExecutor(generateEntity),
    "Generate Entity"
  );


  app.commands.register(
    "react-core:export-metadata",
    (arg) => commandExecutor(exportMetadata, arg),
    "Export metadata"
  );


}


async function commandExecutor(task, arg) {

  try {
    validate();
    await task(arg);
  } catch (e) {
    app.dialogs.showAlertDialog(e.message)
  }

}




async function generateFile(src, dest, varBag, writer) {
  const rendered = await ejs.renderFile(src, varBag);
  const projectPath = getProjectPath();
  writer(path.join(projectPath, dest), rendered);
  app.toast.info("Generated " + dest);
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

function getProjectPath() {
  const tmp = app.preferences.get('react-core.project-path');
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


async function generateEntity() {

  var classes = getEntities();
  const { buttonId, returnValue } = await app.elementListPickerDialog.showDialog("Select a set of Class", classes);
  
  if(returnValue === null) throw new Error("No class selected");

  const model = returnValue;
  if (buttonId === "ok") {

    const namespace = getNamespace();

      await generateFile(__dirname + '/generators/api/controller.ejs', `\\Web\\Controllers\\${model.name}Controller.cs`, { model, info: { namespace }, _case: Case }, confirmWriteFileSync);
      await generateFile(__dirname + '/generators/api/model.ejs', `\\Web\\Models\\${model.name}.cs`, { model, info: { namespace: namespace + ".Models" }, primitiveTypes, defaultValues }, confirmWriteFileSync);
      await generateFile(__dirname + '/generators/api/test.ejs', `\\ApiTest\\${model.name}Test.cs`, { model, info: { namespace }, faker: faker }, confirmWriteFileSync);
      await generateFile(__dirname + '/generators/react/ui.ejs', `\\Web\\ClientApp\\src\\components\\Ui${model.name}.jsx`, { model, info: { namespace }, _case: Case }, confirmWriteFileSync)
      await generateFile(__dirname + '/generators/react/modal.ejs', `\\Web\\ClientApp\\src\\components\\Modal${model.name}.jsx`, { model, info: { namespace }, _case: Case, helper: reactHelper }, confirmWriteFileSync)


      for (operation of model.operations) {
        await generateFile(__dirname + '/generators/api/api-model.ejs', `\\Web\\ApiModels\\${operation.parameters.find(parameter => parameter.direction !== 'return').type.name}.cs`, { info: { namespace: namespace + ".ApiModels" }, model: operation.parameters.find(parameter => parameter.direction !== 'return').type, primitiveTypes, defaultValues }, confirmWriteFileSync)
        await generateFile(__dirname + '/generators/api/api-model.ejs', `\\Web\\ApiModels\\${operation.parameters.find(parameter => parameter.direction === 'return').type.name}.cs`, { info: { namespace: namespace + ".ApiModels" }, model: operation.parameters.find(parameter => parameter.direction === 'return').type, primitiveTypes, defaultValues }, confirmWriteFileSync)
        await generateFile(__dirname + '/generators/react/operation.ejs', `\\Web\\ClientApp\\src\\components\\Ui${model.name + operation.name}.jsx`, { operation, info: { name: model.name }, _case: Case, helper: reactHelper }, confirmWriteFileSync)
      }

    


  }


}


async function generatSolution() {

  const projectPath = getProjectPath();
  const namespace = getNamespace();
  const fileWriter = confirmWriteFileSync

  ChildProcess.execSync('dotnet new sln -n ' + namespace + ' -o "' + projectPath + '"',);
  ChildProcess.execSync('dotnet new react -n ' + namespace + ' -o "' + projectPath + '\\Web"',);
  ChildProcess.execSync('npm i react-bootstrap', { cwd: projectPath + '\\Web\\ClientApp' });
  ChildProcess.execSync('npm i react-datepicker', { cwd: projectPath + '\\Web\\ClientApp' });
  ChildProcess.execSync('dotnet add package Microsoft.EntityFrameworkCore --version 6.0.27', { cwd: projectPath + '\\Web' });
  ChildProcess.execSync('dotnet add package Microsoft.EntityFrameworkCore.Sqlite --version 6.0.27', { cwd: projectPath + '\\Web' });
  ChildProcess.execSync('dotnet new nunit -f net6.0 -n ' + namespace + 'ApiTest -o "' + projectPath + '\\ApiTest"',);
  ChildProcess.execSync('dotnet add package Microsoft.AspNetCore.Mvc.Testing --version 6.0.27', { cwd: projectPath + '\\ApiTest' });
  ChildProcess.execSync('dotnet add reference ../Web', { cwd: projectPath + '\\ApiTest' });
  ChildProcess.execSync('dotnet sln ' + namespace + '.sln add Web ApiTest', { cwd: projectPath });

  ['ApiTest\\UnitTest1.cs', 'Web\\WeatherForecast.cs', 'Web\\Controllers\\WeatherForecastController.cs', 'Web\\Program.cs'].forEach(x => fs.unlinkSync(projectPath + '\\' + x));
  ['ApiTest\\Seeders', 'Web\\Models', 'Web\\ApiModels'].forEach(x => fs.mkdirSync(projectPath + '\\' + x));

  await generateFile(__dirname + '/generators/api/program.ejs', `\\Web\\Program.cs`, { info: { namespace } }, fileWriter)
  await generateFile(__dirname + '/generators/api/custom-web-app-factory.ejs', `\\ApiTest\\CustomWebApplicationFactory.cs`, { info: { namespace } }, fileWriter)
  await generateFile(__dirname + '/generators/api/iseeder.ejs', `\\ApiTest\\ISeeder.cs`, { info: { namespace } }, fileWriter)


}



async function generateSeeder() {
  await generateFile(__dirname + '/generators/api/seeder.ejs', `\\ApiTest\\Seeders\\DefaultSeeder.cs`, { count: 10, entities: getEntities(), info: { namespace: getNamespace() }, faker, entityDependecySort }, confirmWriteFileSync)
}


async function generateDbContext() {
  await generateFile(__dirname + '/generators/api/db-context.ejs', `\\Web\\ApplicationDbContext.cs`, { info: { namespace: getNamespace() }, entities: getEntities() }, confirmWriteFileSync)
}

async function generateSetupProxy() {
  await generateFile(__dirname + '/generators/react/setup-proxy.ejs', `\\Web\\ClientApp\\src\\setupProxy.js`, { entities: getEntities(), _case: Case }, confirmWriteFileSync)
}


async function generateAppRoutes() {
  await generateFile(__dirname + '/generators/react/app-routes.ejs', `\\Web\\ClientApp\\src\\AppRoutes.js`, { entities: getEntities(), _case: Case }, confirmWriteFileSync)
}


async function generateNavMenu() {
  await generateFile(__dirname + '/generators/react/nav-menu.ejs', `\\Web\\ClientApp\\src\\components\\NavMenu.js`, { entities: getEntities(), _case: Case }, confirmWriteFileSync)
}


function exportMetadata(path) {
  var cls = app.repository.select("@UMLClass")
  const clss = _deepCopy(cls, 20, 0, ['_parent']);
  fs.writeFileSync(path, beautify(clss, null, 2, 100));
}


exports.init = init;
