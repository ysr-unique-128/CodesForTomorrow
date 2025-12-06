const toJSON = (value)=> {
    try{
        console.log(value);
        if(!value) return {};

        if(typeof value==='object') return value;

        return JSON.parse(value);
    }
    catch(error){
        return {};
    }
};

export {
    toJSON
}