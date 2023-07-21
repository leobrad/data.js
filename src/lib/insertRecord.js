import formateVal from '~/lib/util/formateVal';
import global from '~/obj/global';

const {
  datajs: {
    connection,
  },
} = global;

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

export default function inertData(table, obj) {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO ' + table + getCols(obj) + ' VALUES ' + getVals(obj);
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
