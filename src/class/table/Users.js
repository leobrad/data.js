import Table from '~/class/Table';
import options from '~/obj/options';

class Users extends Table {
  constructor() {
    super('user', options);
  }
}

export default Users;
