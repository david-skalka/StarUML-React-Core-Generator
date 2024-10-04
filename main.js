const fs = require("fs");
const { faker } = require("@faker-js/faker");
const { Case } = require('change-case-all');
const { modelSchema, classesSchema } = require('./joi-schemas.js');
const _csharp = require("./templates/api/_csharp.js");
const _star = require("./templates/_starHelpers");
const { CommandShell, CommandRm, CommandMkdir, CommandEjs } = require("./commands");

function validateDiagram() {

  const diagram = app.repository.select("@UMLModel").filter(x => x.stereotype && x.stereotype.name === "ReactCoreGen");


  if (diagram.length === 0) {
    return "Select a model";
  }

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






  return null;
}



function init() {

  app.commands.register(
    "react-core:generate",
    async (args) => {


      const _params = new Map();
      
      args.split(';').forEach((pair) => {
        const [key, value] = pair.split('=');
        _params.set(key, value);
      });

      
      var outputDir =  _params.get('output') ||  (await app.dialogs.showInputDialog("Enter output directory.")).returnValue;

      if(outputDir.endsWith('\\')){
        outputDir = outputDir.slice(0, -1)
      }

  
      if (!fs.existsSync(outputDir)) {
        app.dialogs.showInfoDialog("Output directory does not exist");
        return;
      }

      const validationResult = validateDiagram();

      if (validationResult) {
        app.dialogs.showInfoDialog(validationResult);
        return;
      }

      const diagram = app.repository.select("@UMLModel").find(x => x.stereotype && x.stereotype.name === "ReactCoreGen");
      
      const entities = app.repository.select("@UMLClass").filter(x => x.stereotype && x.stereotype.name === "Entity")
      const namespace = diagram.tags.find(x => x.name === "Namespace").value;


      const pipeline = new Map();
      pipeline.set('solution', [
        new CommandShell('dotnet new sln -n ' + namespace + ' -o "' + outputDir + '"'),
        new CommandShell('dotnet new react -f net6.0 -n ' + namespace + ' -o "' + outputDir + '\\Web"'),
        new CommandShell('npm i react-bootstrap', { cwd: outputDir + '\\Web\\ClientApp' }),
        new CommandShell('npm i react-datepicker', { cwd: outputDir + '\\Web\\ClientApp' }),
        new CommandShell('dotnet add package Microsoft.EntityFrameworkCore --version 6.0.27', { cwd: outputDir + '\\Web' }),
        new CommandShell('dotnet add package Microsoft.EntityFrameworkCore.Sqlite --version 6.0.27', { cwd: outputDir + '\\Web' }),
        new CommandShell('dotnet new nunit -f net6.0 -n ' + namespace + 'IntegrationTest -o "' + outputDir + '\\IntegrationTest"'),
        new CommandShell('dotnet add package Microsoft.AspNetCore.Mvc.Testing --version 6.0.27', { cwd: outputDir + '\\IntegrationTest' }),
        new CommandShell('dotnet add reference ../Web', { cwd: outputDir + '\\IntegrationTest' }),
        new CommandShell('dotnet sln ' + namespace + '.sln add Web IntegrationTest', { cwd: outputDir }),
        new CommandRm(outputDir + '\\IntegrationTest\\UnitTest1.cs'),
        new CommandRm(outputDir + '\\Web\\WeatherForecast.cs'),
        new CommandRm(outputDir + '\\Web\\Controllers\\WeatherForecastController.cs'),
        new CommandRm(outputDir + '\\Web\\Program.cs'),
        new CommandMkdir(outputDir + '\\IntegrationTest\\Seeders'),
        new CommandMkdir(outputDir + '\\Web\\Models'),
        new CommandMkdir(outputDir + '\\Web\\ApiModels'),
             new CommandEjs( '/templates/api/program.ejs', outputDir + `\\Web\\Program.cs`, { info: { namespace: namespace } }),
        new CommandEjs('/templates/api/custom-web-app-factory.ejs', outputDir + `\\IntegrationTest\\CustomWebApplicationFactory.cs`, { info: { namespace: namespace } }),
        new CommandEjs('/templates/api/iseeder.ejs', outputDir + `\\IntegrationTest\\ISeeder.cs`, { info: { namespace: namespace } }),
        new CommandRm( outputDir + `\\Web\\ClientApp\\src\\setupProxy.js`),
        new CommandRm( outputDir + `\\Web\\ClientApp\\src\\AppRoutes.js`),
        new CommandRm(outputDir + `\\Web\\ClientApp\\src\\components\\NavMenu.js`),

      ]).set('db-context', [
        new CommandEjs('/templates/api/db-context.ejs', outputDir + `\\Web\\ApplicationDbContext.cs`, { info: { namespace: namespace }, entities: entities })
      ]).set('seeder', [
        new CommandEjs('/templates/api/seeder.ejs', outputDir + `\\IntegrationTest\\Seeders\\DefaultSeeder.cs`, { count: 10, entities: entities, info: { namespace: namespace }, faker, _csharp })
      ]).set('setup-proxy', [
        new CommandEjs('/templates/react/setup-proxy.ejs', outputDir + `\\Web\\ClientApp\\src\\setupProxy.js`, { entities: entities, _case: Case })
      ]).set('app-routes', [
        new CommandEjs('/templates/react/app-routes.ejs', outputDir + `\\Web\\ClientApp\\src\\AppRoutes.js`, { entities: entities, _case: Case })
      ]).set('nav-menu', [
        new CommandEjs('/templates/react/nav-menu.ejs', outputDir + `\\Web\\ClientApp\\src\\components\\NavMenu.js`, { entities: entities, _case: Case })
      ]);

      entities.forEach(entity => {

        const entityCmds = [
          new CommandEjs('/templates/api/controller.ejs', outputDir + `\\Web\\Controllers\\${entity.name}Controller.cs`, { model: entity, info: { namespace: namespace }, _case: Case }),
          new CommandEjs('/templates/api/model.ejs', outputDir + `\\Web\\Models\\${entity.name}.cs`, { model: entity, info: { namespace: namespace + ".Models" }, _csharp, _star }),
          new CommandEjs('/templates/api/test.ejs', outputDir + `\\IntegrationTest\\${entity.name}Test.cs`, { model: entity, info: { namespace: namespace }, faker: faker }),
          new CommandEjs('/templates/react/ui.ejs', outputDir + `\\Web\\ClientApp\\src\\components\\Ui${entity.name}.jsx`, { model: entity, info: { namespace: namespace }, _case: Case }),
          new CommandEjs('/templates/react/modal.ejs', outputDir + `\\Web\\ClientApp\\src\\components\\Modal${entity.name}.jsx`, { model: entity, info: { namespace: namespace }, _case: Case, _star })

        ]

        entity.operations.forEach(operation =>

          entityCmds.push(...[
            new CommandEjs('/templates/api/api-model.ejs', outputDir + `\\Web\\ApiModels\\${operation.parameters.find(parameter => parameter.direction !== 'return').type.name}.cs`, { info: { namespace: namespace + ".ApiModels" }, model: operation.parameters.find(parameter => parameter.direction !== 'return').type, _csharp, _star }),
            new CommandEjs('/templates/api/api-model.ejs', outputDir + `\\Web\\ApiModels\\${operation.parameters.find(parameter => parameter.direction === 'return').type.name}.cs`, { info: { namespace: namespace + ".ApiModels" }, model: operation.parameters.find(parameter => parameter.direction === 'return').type, _csharp, _star }),
            new CommandEjs('/templates/react/operation.ejs', outputDir + `\\Web\\ClientApp\\src\\components\\Ui${entity.name + operation.name}.jsx`, { operation, info: { name: entity.name }, _case: Case, _star })
          ]
          ))

        pipeline.set('entity-' + entity.name, entityCmds)
      });

 


      const options = [{ text: '- all -', value: '.*' }].concat(Array.from(pipeline.keys().map((key, i) => { return { text: key, value: key } })))
      const parts = _params.get('parts') || (await app.dialogs.showSelectRadioDialog("Select part.", options)).returnValue;
        
      
      try {

        for (part of pipeline.keys().filter(x => x.match(parts))) {
          for (command of pipeline.get(part)) {
            command.execute();
          }
        }

        app.toast.info("Done");
      } catch (e) {
        console.error(e);
        app.dialogs.showAlertDialog(e.message)
      }


    },
    "Generate Project"
  );



}





exports.init = init;
