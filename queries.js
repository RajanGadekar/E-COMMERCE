var create=function(tname,obj){
    var sql=`CREATE TABLE `+tname+`
    (${tname}_id int primary key AUTO_INCREMENT`;

    objkeys=Object.keys(obj);
    console.log(objkeys);
    for(i=0;i<objkeys.length;i++){
        sql+=` ,${objkeys[i]} text`;
    }
    sql+=`)`
    return sql;
}
var insert=function(tname,obj){
    var sql=`INSERT INTO `+tname+` (`;
    objkeys=Object.keys(obj);
    for(let i=0;i<objkeys.length;i++){
        if(i!=0)
            sql+=`,${objkeys[i]}`;
        else
            sql+=`${objkeys[i]}`;
    }
    sql+=`) VALUES (`;

    objvalues=Object.values(obj);
    for(i=0;i<objvalues.length;i++){
        if(i!=0)
           sql+=`,'${objvalues[i]}'`;
        else
           sql+=` '${objvalues[i]}'`;
    }
    sql+=')';
    return sql;
}
    var select=function(tname){
        var sql=`   SELECT *FROM ${tname}`;
        return sql;
    }
module.exports={create,insert,select}