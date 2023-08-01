import Table from '~/class/Table';
import postgresqlOptions from '~/obj/postgresqlOptions';

class PostgresqlUsers extends Table {
  constructor() {
    super('user', postgresqlOptions);
  }
}

export default PostgresqlUsers;
