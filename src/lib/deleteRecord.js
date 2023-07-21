import global from '~/obj/global';

const {
  datajs: {
    connection,
  },
} = global;

export default function deleteData(table, id) {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM ' + table + ' WHERE id=' + id;
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
