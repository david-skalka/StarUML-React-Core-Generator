
const { Case } = require('change-case-all');
function getDefaultValues(attributes){
    
    const defaultValuesType = new Map().set('Integer', '0').set('Text', '""')

    const values = attributes.map(x=>{
        
        if(x.type.stereotype.name==='Primitive'){
            const required = x.tags.find(x => x.name == "Required").checked;
            return Case.camel(x.name) + ': ' + defaultValuesType.get(x.type.name);
        } else {
            return Case.camel(x.name) + 'Id: -1'
        }
    });

    return values.join(', ');
}

exports.getDefaultValues = getDefaultValues;