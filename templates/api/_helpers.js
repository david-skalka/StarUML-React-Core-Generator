const primitivesTypes= new Map();
primitivesTypes.set('Integer', 'int');
primitivesTypes.set('Text', 'string');
primitivesTypes.set('Decimal', 'decimal');
primitivesTypes.set('DateTime', 'DateTime');
primitivesTypes.set('Bool', 'bool');

const defaultValues= new Map().set("Text", `String.Empty`);

function entityDependecySort(entities){
    const entitiesDependencies = entities.map(entity=> { return  { entity: entity.name, deps: entity.attributes.filter(a=>a.type && a.type.stereotype && a.type.stereotype.name !== "Primitive").map(attr=>attr.name) }} );

    const imageDependencies = {};
    entitiesDependencies.forEach(entity => {
      imageDependencies[entity.entity] = entity.deps;
    });

    const sort = (names, obj, start, depth = 0) => {
      const processed = names.reduce((a, b, i) => {
        if (obj[b].every(Array.prototype.includes, a)) a.push(b)
        return a
      }, start)
      const nextNames = names.filter(n => !processed.includes(n)),
        goAgain = nextNames.length && depth <= names.length
      return goAgain ? sort(nextNames, obj, processed, depth + 1) : processed
    }

    const sortedEntitiesNames = sort(Object.keys(imageDependencies), imageDependencies, [])

    return sortedEntitiesNames.map(entityName=>entities.find(entity=>entity.name===entityName));
}


function getType(attr){
    let retD = attr.type.name;
    if(attr.type.stereotype.name==="Primitive"){
        retD = primitivesTypes.get(attr.type.name);
    } 

    const required = attr.tags.find(x => x.name == "Required").checked;
    if(required){
        return `${getTypes(attr)}?`;
    }
}


exports.primitiveTypes = primitivesTypes;
exports.getType = getType;
exports.entityDependecySort = entityDependecySort;
exports.defaultValues = defaultValues;