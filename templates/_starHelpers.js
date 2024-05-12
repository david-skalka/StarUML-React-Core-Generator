function attrIsNullable(attr){
  return attr.multiplicity.startsWith('0');
}

exports.attrIsNullable = attrIsNullable;