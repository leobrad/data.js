import formateVal from '~/lib/util/formateVal';

function generateWhere(tb, id) {
  if (id === undefined) {
    return '';
  } else {
    return ' WHERE ' + tb + '.id=' + id;
  }
}

function getTuple(obj) {
  return Object.keys(obj).filter(k => k !== 'id').map((k) => k + ' = ' + formateVal(obj[k])).join(',');
}

export default function updateData(connection, tb, obj) {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE ' + tb + ' SET ' + getTuple(obj) + generateWhere(tb, obj.id);
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
