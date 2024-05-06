const primitivesTypes= new Map();
primitivesTypes.set('Integer', 'int');
primitivesTypes.set('Text', 'string');

const defaultValues= new Map().set("Text", `String.Empty`);

exports.primitiveTypes = primitivesTypes;
exports.defaultValues = defaultValues;