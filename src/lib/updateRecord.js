import formateVal from '~/lib/util/formateVal';
import global from '~/obj/global';

const {
  datajs: {
    connection,
  },
} = global;

function generateWhere(table, id) {
  if (id === undefined) {
    return '';
  } else {
    return ' WHERE ' + table + '.id=' + id;
  }
}

function getTuple(obj) {
  return Object.keys(obj).filter(k => k !== 'id').map((k) => k + ' = ' + formateVal(obj[k])).join(',');
}

export default function updateData(table, obj) {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE ' + table + ' SET ' + getTuple(obj) + generateWhere(table, obj.id);
    connection.query(sql, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      }
    );
  });
}
