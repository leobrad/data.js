function getLimit(section) {
  if (section !== undefined) {
    const limit = section.filter((e) => e !== undefined).map((k, i) => {
      switch (i) {
        case 0:
          return section[0];
        case 1:
          return section[1] - section[0] + 1;
      }
    }).join(',');
    if (limit !== '') {
      return ' LIMIT ' + limit;
    } else {
      return '';
    }
  } else {
    return '';
  }
}

function selectRecordInMysql(connection, tb, section, filters) {
  return new Promise((resolve, reject) => {
    let sql;
    if (filters === undefined) {
      sql = 'SELECT * from ' + tb + getLimit(section);
    } else {
      sql = 'SELECT ' + filters.join(',') + ' from ' + tb + getLimit(section);
    }
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

function selectRecordInPostgresql(connection, tb, section, filters) {
  return connection.then((conn) => {
    let sql;
    if (filters === undefined) {
      sql = 'SELECT * from ' + tb + getLimit(section);
    } else {
      sql = 'SELECT ' + filters.join(',') + ' from ' + tb + getLimit(section);
    }
    return conn.query(sql).then((res) => res.rows);
  });
}

export default function selectRecord(type, connection, tb, section, filters) {
  if (type === 'mysql') {
    return selectRecordInMysql(connection, tb, section, filters);
  } else {
    return selectRecordInPostgresql(connection, tb, section, filters);
  }
}
