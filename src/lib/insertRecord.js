import formateVal from '~/lib/util/formateVal';
import global from '~/obj/global';

function getCols(obj) {
  return formateBracket(Object.keys(obj));
}

function getVals(obj) {
  return formateBracket(
    Object.keys(obj).map((k) => {
      const val = obj[k];
      return formateVal(val);
  }));
}

function formateBracket(list) {
  return '(' + list.join(',') + ')';
}

export default function inertData(connection, tb, objs) {
  return new Promise((resolve, reject) => {
    const values = objs.map((o) => getVals(o)).join(',');
    const sql = 'INSERT INTO ' + tb + getCols(objs[0]) + ' VALUES ' + values;
    connection.query(sql, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
}
