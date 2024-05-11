const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
const { faker} = require("@faker-js/faker");
const { Case } = require('change-case-all');
const reactHelper = require("../templates/react/_helpers");
const { entityDependecySort, primitiveTypes, defaultValues  } = require("../templates/api/_helpers");


describe("Render templates", () => {

  beforeEach(() => {
    this.diagram = JSON.parse(fs.readFileSync(`test/data/sample.json`));

    this.model = this.diagram.find(x => x.name === "Product");
  });


  test("Controller", () => {
    ejs.renderFile(path.dirname(__dirname) + '/templates/api/controller.ejs', { model: this.model, info: { namespace: "ReactSample" }, _case: Case }, (err, data) => { console.log(data); expect(err).toBe(null); });

  });

  test("Model", () => {
    ejs.renderFile(path.dirname(__dirname) + '/templates/api/model.ejs', { model: this.model, primitiveTypes, defaultValues, info: { namespace: "ReactSample" } }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });

  test("ApiModel", () => {
    ejs.renderFile(path.dirname(__dirname) + '/templates/api/api-model.ejs', { model: this.model, primitiveTypes, defaultValues, info: { namespace: "ReactSample" } }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Faker object initializer", () => {
    ejs.renderFile(path.dirname(__dirname) + '/templates/api/faker-object-initializer.ejs', { model: this.model, override: new Map(), faker: faker }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Seed", () => {
    ejs.renderFile(path.dirname(__dirname) + '/templates/api/seeder.ejs', { count: 10, entities: this.diagram.filter(x => x.stereotype && x.stereotype.name === "Entity"), info: { namespace: "ReactSample" }, faker, entityDependecySort }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Test", () => {
    ejs.renderFile(path.dirname(__dirname) + '/templates/api/test.ejs', { model: this.model, info: { namespace: "ReactSample" }, faker }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Ui", () => {
    ejs.renderFile(path.dirname(__dirname) + '/templates/react/ui.ejs', { model: this.model, info: { namespace: "ReactSample" }, _case: Case }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Modal", () => {
    ejs.renderFile(path.dirname(__dirname) + '/templates/react/modal.ejs', { model: this.model, info: { namespace: "ReactSample" }, _case: Case, helper: reactHelper }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Operation", () => {
    ejs.renderFile(path.dirname(__dirname) + '/templates/react/operation.ejs', { operation: this.model.operations.find(x => x.name === "Summary"), info: { name: this.model.name }, _case: Case, helper: reactHelper }, (err, data) => { console.log(data); expect(err).toBe(null); });
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
