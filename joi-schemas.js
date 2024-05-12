const Joi = require('joi');


const stereotype = (name, tags) => Joi.object({
  stereotype: Joi.object({ name: Joi.string().equal(name) }),
  tags: Joi.custom((value, helper) => {
    const expected = tags.filter(r => !value.some(v => v.name === r));
    return expected.length !== 0 ? helper.message("{#label} names must includes: " + expected) : true
  })
});

const fieldSchema = stereotype('Field', ['Description']);


const entitySchema = stereotype('Entity', ['Plural']).append({
  attributes: Joi.array().items(fieldSchema).custom((value, helper) => value.filter(x => x.isID).length === 1 ? true : helper.message("{#label} must have one isID")),
  operations: Joi.array().items(
    stereotype('Operation', ['Plural']).append({
      parameters: Joi.array().items(Joi.object({
        type: Joi.object({
          attributes: Joi.array().items(fieldSchema)
        })

      }))
    })
  )

})


const classesSchema =Joi.array().items(Joi.alternatives().conditional(Joi.object({ stereotype: Joi.object({name: 'Entity'}) }), {
  then: entitySchema,
  otherwise: Joi.any()
}));

const modelSchema = stereotype('ReactCoreGen', ['Namespace'])



exports.classesSchema = classesSchema;
exports.modelSchema = modelSchema;