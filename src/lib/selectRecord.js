import global from '~/obj/global';

const {
  datajs: {
    connection,
  }
} = global;

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

export default function selectData(table, section, filters) {
  return new Promise((resolve, reject) => {
    let sql;
    if (filters === undefined) {
      sql = 'SELECT * from ' + table + getLimit(section);
    } else {
      sql = 'SELECT ' + filters.join(',') + ' from ' + table + getLimit(section);
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
