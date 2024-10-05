const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
const { faker} = require("@faker-js/faker");
const { Case } = require('change-case-all');
const _csharp = require("../templates/api/_csharp");
const _star = require("../templates/_starHelpers");


describe("Render templates", () => {

  beforeEach(() => {
    this.diagram = JSON.parse(fs.readFileSync(`test/data/sample.json`));

    
  });


  test("Controller", () => {
    const model = this.diagram.find(x => x.name === "Comment");
    ejs.renderFile(path.dirname(__dirname) + '/templates/api/controller.ejs', { model, info: { namespace: "ReactSample" }, _case: Case }, (err, data) => { console.log(data); expect(err).toBe(null); });

  });

  test("Model", () => {
    const model = this.diagram.find(x => x.name === "Comment");
    ejs.renderFile(path.dirname(__dirname) + '/templates/api/model.ejs', { model, _csharp, _star, info: { namespace: "ReactSample" } }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });

  test("ApiModel", () => {
    const model = this.diagram.find(x => x.name === "Comment");
    ejs.renderFile(path.dirname(__dirname) + '/templates/api/api-model.ejs', { model, _csharp, _star, info: { namespace: "ReactSample" } }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Faker object initializer", () => {
    const model = this.diagram.find(x => x.name === "Comment");
    ejs.renderFile(path.dirname(__dirname) + '/templates/api/faker-object-initializer.ejs', { model, override: new Map(), faker: faker }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Seed", () => {
    ejs.renderFile(path.dirname(__dirname) + '/templates/api/seeder.ejs', { count: 10, entities: this.diagram.filter(x => x.stereotype && x.stereotype.name === "Entity"), info: { namespace: "ReactSample" }, faker, _csharp }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Test", () => {
    const model = this.diagram.find(x => x.name === "Comment");
    ejs.renderFile(path.dirname(__dirname) + '/templates/api/test.ejs', { model, info: { namespace: "ReactSample" }, faker }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Ui", () => {
    const model = this.diagram.find(x => x.name === "Comment");
    ejs.renderFile(path.dirname(__dirname) + '/templates/react/ui.ejs', { model, info: { namespace: "ReactSample" }, _case: Case }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Modal", () => {
    const model = this.diagram.find(x => x.name === "Comment");
    ejs.renderFile(path.dirname(__dirname) + '/templates/react/modal.ejs', { model, info: { namespace: "ReactSample" }, _case: Case, _star }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Operation", () => {
    const model = this.diagram.find(x => x.name === "Comment");
    ejs.renderFile(path.dirname(__dirname) + '/templates/react/operation.ejs', { operation: model.operations.find(x => x.name === "Summary"), info: { name: model.name }, _case: Case, _star  }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("DbContext", () => {
    ejs.renderFile(path.dirname(__dirname) + '/templates/api/db-context.ejs', { info: { namespace: "ReactSample" }, _case: Case, entities: this.diagram.filter(x => x.stereotype && x.stereotype.name === "Entity") }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Program", () => {
    ejs.renderFile(path.dirname(__dirname) + '/templates/api/program.ejs', { info: { namespace: "ReactSample" } }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("CustomWebAppFactory", () => {
    ejs.renderFile(path.dirname(__dirname) + '/templates/api/custom-web-app-factory.ejs', { info: { namespace: "ReactSample" } }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("ISeeder", () => {
    ejs.renderFile(path.dirname(__dirname) + '/templates/api/iseeder.ejs', { info: { namespace: "ReactSample" } }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });

  test("SetupProxy", () => {

    ejs.renderFile(path.dirname(__dirname) + '/templates/react/setup-proxy.ejs', { entities: this.diagram.filter(x => x.stereotype && x.stereotype.name === "Entity"), _case: Case }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });

  test("AppRoutes", () => {
    ejs.renderFile(path.dirname(__dirname) + '/templates/react/app-routes.ejs', { entities: this.diagram.filter(x => x.stereotype && x.stereotype.name === "Entity"), _case: Case }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });

  test("NavMenu", () => {
    ejs.renderFile(path.dirname(__dirname) + '/templates/react/nav-menu.ejs', { entities: this.diagram.filter(x => x.stereotype && x.stereotype.name === "Entity"), _case: Case }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });










});
