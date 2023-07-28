import global from '~/obj/global';

export default function deleteData(connection, tb, id) {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM ' + tb + ' WHERE id=' + id;
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
