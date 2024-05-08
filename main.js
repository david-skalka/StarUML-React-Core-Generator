const fs = require("fs");
const ejs = require("ejs");
const ModelWriter = require("./generators/api/model-writer.js");
const ApiModelWriter = require("./generators/api/api-model-writer.js");
const { faker, en } = require("@faker-js/faker");
const beautify = require("json-beautify");
const { Case } = require('change-case-all');
const reactHelper = require("./generators/react/_helpers");
const { modelSchema, classesSchema } = require('./joi-schemas.js');
const ChildProcess = require("child_process");
const _deepCopy = require('./deep-copy.js');
const { entityDependecySort  } = require("./generators/api/_helpers");

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
    ()=> commandExecutor(exportMetadata),
    "Export metadata"
  );


}


async function commandExecutor(task, arg) {

  try{
    validate();
    await task(arg);
  } catch(e) {
    app.dialogs.showAlertDialog(e.message)
  }

}




async function copyEjs(src, dest, varBag, writer) {
  const rendered = await ejs.renderFile(src, varBag);
  writer(dest, rendered);
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


function validate(){
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


async function generateEntity() {


  var classes = app.repository.select("@UMLClass").filter(x => x.stereotype && x.stereotype.name === "Entity")
  const { buttonId, returnValue } = await app.elementListPickerDialog.showDialog("Select a set of Class", classes);

  const fileWriter = confirmWriteFileSync

  const model = returnValue;
  if (buttonId === "ok") {

    const projectPath = getProjectPath();
    const namespace = getNamespace();

    if (buttonId === 'ok') {

      var options = [
        { text: "Api Controller", value: 1, factory: async () => await copyEjs(__dirname + '/generators/api/controller.ejs', projectPath + `\\Web\\Controllers\\${model.name}Controller.cs`, { model, info: { namespace }, _case: Case }, fileWriter)},
        { text: "Api Model", value: 2, factory: () => Promise.resolve(fileWriter(projectPath + `\\Web\\Models\\${model.name}.cs`, new ModelWriter(model, { namespace: namespace + ".Models" }).getData())) },
        { text: "Api Test", value: 4, factory: async () => await copyEjs(__dirname + '/generators/api/test.ejs', projectPath + `\\ApiTest\\${model.name}Test.cs`, { model, info: { namespace }, faker: faker }, fileWriter)},
        { text: "React ui", value: 5, factory: async () => await copyEjs(__dirname + '/generators/react/ui.ejs', projectPath + `\\Web\\ClientApp\\src\\components\\Ui${model.name}.jsx`, { model, info: { namespace }, _case: Case }, fileWriter)},
        { text: "React modal", value: 6, factory: async () => await copyEjs(__dirname + '/generators/react/modal.ejs', projectPath + `\\Web\\ClientApp\\src\\components\\Modal${model.name}.jsx`, { model, info: { namespace }, _case: Case, helper: reactHelper }, fileWriter) }
      ];
      let indexer = options.length+1;
      model.operations.forEach(operation => {
        indexer++;
        options.push({ text: "(o. " + operation.name + ") Api input model", value: indexer, factory: () => Promise.resolve(fileWriter(projectPath + `\\Web\\ApiModels\\${operation.parameters.find(parameter => parameter.direction !== 'return').type.name}.cs`, new ApiModelWriter(operation.parameters.find(parameter => parameter.direction !== 'return').type, { namespace: namespace + ".ApiModels" }).getData())) })
        options.push({ text: "(o. " + operation.name + ") Api output model", value: indexer + 1, factory: () => Promise.resolve(fileWriter(projectPath + `\\Web\\ApiModels\\${operation.parameters.find(parameter => parameter.direction === 'return').type.name}.cs`, new ApiModelWriter(operation.parameters.find(parameter => parameter.direction === 'return').type, { namespace: namespace + ".ApiModels" }).getData())) })
        options.push({ text: "(o. " + operation.name + ") React operation", value: indexer + 2, factory: async () => await copyEjs(__dirname + '/generators/react/operation.ejs', projectPath + `\\Web\\ClientApp\\src\\components\\Ui${model.name + operation.name}.jsx`, { operation, info: { name: model.name }, _case: Case, helper: reactHelper }, fileWriter) });
      });

      while (true) {
        const { buttonId, returnValue } = await app.dialogs.showSelectRadioDialog("Select operation.", options);

        if (buttonId !== 'ok') {
          break;
        }
        const option = options.find(x => x.value === parseInt(returnValue));
        await option.factory()
        app.toast.info(option.text +  " generated");
      }

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

  ['ApiTest\\UnitTest1.cs', 'Web\\WeatherForecast.cs', 'Web\\Controllers\\WeatherForecastController.cs', 'Web\\Program.cs'].forEach(x =>fs.unlinkSync( projectPath + '\\' + x));
  ['ApiTest\\Seeders', 'Web\\Models', 'Web\\ApiModels'].forEach(x => fs.mkdirSync(projectPath + '\\' + x));

  await copyEjs(__dirname + '/generators/api/program.ejs', projectPath + `\\Web\\Program.cs`, { info: { namespace }}, fileWriter)
  await copyEjs(__dirname + '/generators/api/custom-web-app-factory.ejs', projectPath + `\\ApiTest\\CustomWebApplicationFactory.cs`, { info: { namespace } }, fileWriter)
  await copyEjs(__dirname + '/generators/api/iseeder.ejs', projectPath + `\\ApiTest\\ISeeder.cs`, { info: { namespace } }, fileWriter)

  app.toast.info("Solution generated");

}



async function generateSeeder() {
  const projectPath = getProjectPath();
  const namespace = getNamespace();
  const entities = app.repository.select("@UMLClass").filter(x => x.stereotype && x.stereotype.name === "Entity")
  await copyEjs(__dirname + '/generators/api/seeder.ejs', projectPath + `\\ApiTest\\Seeders\\DefaultSeeder.cs`, { count: 10, entities, info: { namespace }, faker, entityDependecySort }, confirmWriteFileSync)
  app.toast.info("Seeder generated");
}


async function generateDbContext() {
  const namespace = getNamespace();
  const projectPath = getProjectPath();
  await copyEjs(__dirname + '/generators/api/db-context.ejs', projectPath + `\\Web\\ApplicationDbContext.cs`, { info: { namespace }, entities: app.repository.select("@UMLClass").filter(x => x.stereotype && x.stereotype.name === "Entity") }, confirmWriteFileSync)
  app.toast.info("DbContext generated");
}

async function generateSetupProxy() {
  const projectPath = getProjectPath();
  await copyEjs(__dirname + '/generators/react/setup-proxy.ejs', projectPath + `\\Web\\ClientApp\\src\\setupProxy.js`, { entities: app.repository.select("@UMLClass").filter(x => x.stereotype && x.stereotype.name === "Entity"), _case: Case  }, confirmWriteFileSync)
  app.toast.info("setupProxy generated");
}


async function generateAppRoutes() {
  const projectPath = getProjectPath();
  await copyEjs(__dirname + '/generators/react/app-routes.ejs', projectPath + `\\Web\\ClientApp\\src\\AppRoutes.js`, { entities: app.repository.select("@UMLClass").filter(x => x.stereotype && x.stereotype.name === "Entity"), _case: Case  }, confirmWriteFileSync)
  app.toast.info("AppRoutes generated");
}


async function generateNavMenu() {
  const projectPath = getProjectPath();
  await copyEjs(__dirname + '/generators/react/nav-menu.ejs', projectPath + `\\Web\\ClientApp\\src\\components\\NavMenu.js`, { entities: app.repository.select("@UMLClass").filter(x => x.stereotype && x.stereotype.name === "Entity"), _case: Case  }, confirmWriteFileSync)
  app.toast.info("NavMenu generated");
}


function exportMetadata(path) {
  var cls = app.repository.select("@UMLClass")
  const clss = _deepCopy(cls, 20, 0, ['_parent']);
  fs.writeFileSync(path, beautify(clss, null, 2, 100));
}


exports.init = init;
