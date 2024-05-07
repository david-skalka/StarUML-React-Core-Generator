const primitivesTypes= new Map();
primitivesTypes.set('Integer', 'int');
primitivesTypes.set('Text', 'string');
primitivesTypes.set('Decimal', 'decimal');
primitivesTypes.set('DateTime', 'DateTime');
primitivesTypes.set('Bool', 'bool');

const defaultValues= new Map().set("Text", `String.Empty`);

exports.primitiveTypes = primitivesTypes;
exports.defaultValues = defaultValues;