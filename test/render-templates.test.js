const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
const { faker, en } = require("@faker-js/faker");
const ModelWriter = require("../generators/api/model-writer.js");
const ApiModelWriter = require("../generators/api/api-model-writer.js");
const { Case } = require('change-case-all');
const reactHelper = require("../generators/react/helpers");


describe("Render templates", () => {

  beforeEach(() => {
    this.diagram = JSON.parse(fs.readFileSync(`test/data/sample.json`));

    this.model = this.diagram.find(x => x.name === "Comment");
  });


  test("Controller", () => {
    ejs.renderFile(path.dirname(__dirname) + '/generators/api/controller.ejs', { model: this.model, info: { namespace: "ReactSample" }, _case: Case }, (err, data) => { console.log(data); expect(err).toBe(null); });

  });

  test("ModelWriter", () => {
    const efWriter = new ModelWriter(this.model, { namespace: "ReactSample.Models" });
    const data = efWriter.getData();
    console.log(data);
    expect(data).not.toBe(null)
  });

  test("ApiModelWriter", () => {
    const efWriter = new ApiModelWriter(this.model, { namespace: "ReactSample.ApiModels" });
    const data = efWriter.getData();
    console.log(data);
    expect(data).not.toBe(null)
  });


  test("Faker object initializer", () => {
    ejs.renderFile(path.dirname(__dirname) + '/generators/api/faker-object-initializer.ejs', { model: this.model, override: new Map(), faker: faker }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Seed", () => {
    ejs.renderFile(path.dirname(__dirname) + '/generators/api/seeder.ejs', { count: 10, entities: this.diagram.filter(x=>x.stereotype && x.stereotype.name==="Entity"), info: { namespace: "ReactSample" }, faker }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Test", () => {
    ejs.renderFile(path.dirname(__dirname) + '/generators/api/test.ejs', { model: this.model, info: { namespace: "ReactSample" }, faker }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Ui", () => {
    ejs.renderFile(path.dirname(__dirname) + '/generators/react/ui.ejs', { model: this.model, info: { namespace: "ReactSample" }, _case: Case }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Modal", () => {
    ejs.renderFile(path.dirname(__dirname) + '/generators/react/modal.ejs', { model: this.model, info: { namespace: "ReactSample" }, _case: Case, helper: reactHelper }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Operation", () => {
    ejs.renderFile(path.dirname(__dirname) + '/generators/react/operation.ejs', { operation: this.model.operations.find(x => x.name === "Summary"), info: { name: this.model.name }, _case: Case, helper: reactHelper }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("DbContext", () => {
    ejs.renderFile(path.dirname(__dirname) + '/generators/api/db-context.ejs', { info: { namespace: "ReactSample" }, _case: Case, entities: this.diagram.filter(x=>x.stereotype && x.stereotype.name==="Entity") }, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("Program", () => {
    ejs.renderFile(path.dirname(__dirname) + '/generators/api/program.ejs', { info: { namespace: "ReactSample" }}, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("CustomWebAppFactory", () => {
    ejs.renderFile(path.dirname(__dirname) + '/generators/api/custom-web-app-factory.ejs', { info: { namespace: "ReactSample" }}, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("ISeeder", () => {
    ejs.renderFile(path.dirname(__dirname) + '/generators/api/iseeder.ejs', { info: { namespace: "ReactSample" }}, (err, data) => { console.log(data); expect(err).toBe(null); });
  });


  test("AppRoutes", () => {
    const entities = this.diagram.filter(x=>x.stereotype && x.stereotype.name==="Entity");
    const _case = Case;

    const ttt = entities.map(model=>{return  { path: _case.kebab(model.name), name: model.name }}).concat(entities.flatMap(model=>model.operations.map(operation=> { return { path: _case.kebab(model.name) + '/' +  _case.kebab(operation.name), name: model.name + operation.name }} )))
    ejs.renderFile(path.dirname(__dirname) + '/generators/react/app-routes.ejs', { entities: this.diagram.filter(x=>x.stereotype && x.stereotype.name==="Entity"), _case: Case}, (err, data) => { console.log(data); expect(err).toBe(null); });
  });

  test("SetupProxy", () => {
    
    ejs.renderFile(path.dirname(__dirname) + '/generators/react/setup-proxy.ejs', { entities: this.diagram.filter(x=>x.stereotype && x.stereotype.name==="Entity"), _case: Case}, (err, data) => { console.log(data); expect(err).toBe(null); });
  });

  





});
