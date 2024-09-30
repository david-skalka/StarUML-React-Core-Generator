const fs = require("fs");
const beautify = require("json-beautify");
const { faker } = require("@faker-js/faker");
const { Case } = require('change-case-all');
const { modelSchema, classesSchema } = require('./joi-schemas.js');
const _csharp = require("./templates/api/_csharp.js");
const _deepCopy = require('./deep-copy.js');
const _star = require("./templates/_starHelpers");
const {  CommandShell, CommandRm, CommandMkdir, CommandEjs } = require("./commands");


function init() {

  app.commands.register(
    "react-core:generate",
    async () => {


      var diagram = app.selections.getSelectedModels()

      if (diagram.length === 0) {
        app.dialogs.showInfoDialog( "Select a model");
        return;
      }
    
      const validationResult = modelSchema.validate(diagram[0], {
        allowUnknown: true,
        abortEarly: false
      });
    
      if (validationResult.error) {
        app.dialogs.showInfoDialog("@UMLModel validation errors: " + validationResult.error.details.map(x => x.message).join('\n'));
        return;
      }
    
      var classes = app.repository.select("@UMLClass")
    
      const validationResultCls = classesSchema.validate(classes, {
        allowUnknown: true,
        abortEarly: false
      });
      
    
      if (validationResultCls.error) {
        app.dialogs.showInfoDialog("@UMLClass validation errors: " + validationResultCls.error.details.map(x => x.message).join('\n'));
      }
    
      const solutionPathConfiValue = app.preferences.get('react-core.solution-path');
      const solutionPath = solutionPathConfiValue.endsWith('\\') ? solutionPathConfiValue.slice(0, -1) : solutionPathConfiValue;

      if (!fs.existsSync(solutionPath)) {
        app.dialogs.showInfoDialog("Solution path does not exist");
      }


      const entities = app.repository.select("@UMLClass").filter(x => x.stereotype && x.stereotype.name === "Entity")
     
      const namespace = diagram[0].tags.find(x => x.name === "Namespace").value;


      const pipeline = new Map();
      pipeline.set('solution', [
        new CommandShell('dotnet new sln -n ' + namespace + ' -o "' + solutionPath + '"'),
        new CommandShell('dotnet new react -f net6.0 -n ' + namespace + ' -o "' + solutionPath + '\\Web"'),
        new CommandShell('npm i react-bootstrap', { cwd: solutionPath + '\\Web\\ClientApp' }),
        new CommandShell('npm i react-datepicker', { cwd: solutionPath + '\\Web\\ClientApp' }),
        new CommandShell('dotnet add package Microsoft.EntityFrameworkCore --version 6.0.27', { cwd: solutionPath + '\\Web' }),
        new CommandShell('dotnet add package Microsoft.EntityFrameworkCore.Sqlite --version 6.0.27', { cwd: solutionPath + '\\Web' }),
        new CommandShell('dotnet new nunit -f net6.0 -n ' + namespace + 'IntegrationTest -o "' + solutionPath + '\\IntegrationTest"'),
        new CommandShell('dotnet add package Microsoft.AspNetCore.Mvc.Testing --version 6.0.27', { cwd: solutionPath + '\\IntegrationTest' }),
        new CommandShell('dotnet add reference ../Web', { cwd: solutionPath + '\\IntegrationTest' }),
        new CommandShell('dotnet sln ' + namespace + '.sln add Web IntegrationTest', { cwd: solutionPath }),
        new CommandRm(solutionPath + '\\IntegrationTest\\UnitTest1.cs'),
        new CommandRm(solutionPath + '\\Web\\WeatherForecast.cs'),
        new CommandRm(solutionPath + '\\Web\\Controllers\\WeatherForecastController.cs'),
        new CommandRm(solutionPath + '\\Web\\Program.cs'),
        new CommandMkdir(solutionPath + '\\IntegrationTest\\Seeders'),
        new CommandMkdir(solutionPath + '\\Web\\Models'),
        new CommandMkdir(solutionPath + '\\Web\\ApiModels'),
        new CommandEjs('/templates/api/program.ejs', solutionPath + `\\Web\\Program.cs`, { info: { namespace: namespace } }),
        new CommandEjs('/templates/api/custom-web-app-factory.ejs', solutionPath + `\\IntegrationTest\\CustomWebApplicationFactory.cs`, { info: { namespace: namespace } }),
        new CommandEjs('/templates/api/iseeder.ejs', solutionPath + `\\IntegrationTest\\ISeeder.cs`, { info: { namespace: namespace } }),

      ]).set('db-context', [
        new CommandEjs('/templates/api/db-context.ejs', solutionPath + `\\Web\\ApplicationDbContext.cs`, { info: { namespace: namespace }, entities: entities })
      ]).set('seeder', [
        new CommandEjs('/templates/api/seeder.ejs', solutionPath + `\\IntegrationTest\\Seeders\\DefaultSeeder.cs`, { count: 10, entities: entities, info: { namespace: namespace }, faker, _csharp })
      ]).set('setup-proxy', [
        new CommandEjs('/templates/react/setup-proxy.ejs', solutionPath + `\\Web\\ClientApp\\src\\setupProxy.js`, { entities: entities, _case: Case })
      ]).set('app-routes', [
        new CommandEjs('/templates/react/app-routes.ejs', solutionPath + `\\Web\\ClientApp\\src\\AppRoutes.js`, { entities: entities, _case: Case })
      ]).set('nav-menu', [
        new CommandEjs('/templates/react/nav-menu.ejs', solutionPath + `\\Web\\ClientApp\\src\\components\\NavMenu.js`, { entities: entities, _case: Case })
      ]);

      entities.forEach(entity => {
        
        const entityCmds = [
          new CommandEjs('/templates/api/controller.ejs', solutionPath + `\\Web\\Controllers\\${entity.name}Controller.cs`, { model: entity, info: { namespace: namespace }, _case: Case }),
          new CommandEjs('/templates/api/model.ejs', solutionPath + `\\Web\\Models\\${entity.name}.cs`, { model: entity, info: { namespace: namespace + ".Models" }, _csharp, _star }),
          new CommandEjs('/templates/api/test.ejs', solutionPath + `\\IntegrationTest\\${entity.name}Test.cs`, { model: entity, info: { namespace: namespace }, faker: faker }),
          new CommandEjs('/templates/react/ui.ejs', solutionPath + `\\Web\\ClientApp\\src\\components\\Ui${entity.name}.jsx`, { model: entity, info: { namespace: namespace }, _case: Case }),
          new CommandEjs('/templates/react/modal.ejs', solutionPath + `\\Web\\ClientApp\\src\\components\\Modal${entity.name}.jsx`, { model: entity, info: { namespace: namespace }, _case: Case, _star })

        ]

        entity.operations.forEach(operation =>

          entityCmds.push(...[
            new CommandEjs('/templates/api/api-model.ejs', solutionPath + `\\Web\\ApiModels\\${operation.parameters.find(parameter => parameter.direction !== 'return').type.name}.cs`, { info: { namespace: namespace + ".ApiModels" }, model: operation.parameters.find(parameter => parameter.direction !== 'return').type, _csharp, _star }),
            new CommandEjs('/templates/api/api-model.ejs', solutionPath + `\\Web\\ApiModels\\${operation.parameters.find(parameter => parameter.direction === 'return').type.name}.cs`, { info: { namespace: namespace + ".ApiModels" }, model: operation.parameters.find(parameter => parameter.direction === 'return').type, _csharp, _star }),
            new CommandEjs('/templates/react/operation.ejs', solutionPath + `\\Web\\ClientApp\\src\\components\\Ui${entity.name + operation.name}.jsx`, { operation, info: { name: entity.name }, _case: Case, _star })
          ]
        ))
        
        pipeline.set('entity-' + entity.name, entityCmds)
      });

      
      const options = [{ text: '- all -' , value: '.*' }].concat(Array.from(pipeline.keys().map((key, i)=> { return { text: key, value:  key }})))
     
      const {buttonId, returnValue} = await app.dialogs.showSelectRadioDialog("Select part.", options)
      

      if (buttonId !== 'ok') {
        return;
      } 
     

      try {
    
        for (part of pipeline.keys().filter(x => x.match(returnValue))) {
          for (command of pipeline.get(part)) {
            await command.execute();
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


  app.commands.register(
    "react-core:export-metadata",
      (arg) => {  var cls = app.repository.select("@UMLClass")
      const clss = _deepCopy(cls, 20, 0, ['_parent']);
      fs.writeFileSync(arg, beautify(clss, null, 2, 100));
  },
    "Export metadata"
  );


}








exports.init = init;
