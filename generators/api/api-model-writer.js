const {primitiveTypes, defaultValues} = require("./_helpers");

class ApiModelWriter {
  constructor(model, info) {
    this.lines = [];
    this.model = model;
    this.info = info;
  }

  writeUsing() {
    this.lines.push("using System.ComponentModel.DataAnnotations;");
    this.lines.push("");
  }

  writeNamespace() {
    this.lines.push(`namespace ${this.info.namespace}`);
    this.lines.push("{");
  }

  writeClass() {
    this.lines.push(`    public class ${this.model.name}`);
    this.lines.push(`    {`);
  }

  writeProps() {
    

    for (let i = 0; i < this.model.attributes.length; i++) {
      const attr = this.model.attributes[i];

      const required = attr.tags.find(x => x.name == "Required").checked;
        if (required) this.lines.push(`        [Required]`);
        if(attr.type.stereotype.name==="Primitive"){
          this.lines.push(`        public ${primitiveTypes.get(attr.type.name)}${required ? "" : "?"} ${attr.name} { get; set; } ${required && defaultValues.has(attr.type.name) ? " = " + defaultValues.get(attr.type.name) + ";" : "" }`);
        } else {
          this.lines.push(`        public int${required ? "" : "?"} ${attr.name}Id { get; set; } ${required && defaultValues.has(attr.type.name) ? " = " + defaultValues.get(attr.type.name) + ";" : "" }`); 
        }


      this.lines.push(""
      );

    }
  }

  writeConclusion() {
    this.lines.push("    }");
    this.lines.push("}");
  }

  getData() {
    this.writeUsing();
    this.writeNamespace();
    this.writeClass();
    this.writeProps();
    this.writeConclusion();
    return this.lines.join("\n");
  }
}

module.exports = ApiModelWriter